// backend/src/controllers/paymentControllers.js
import pool from "../config/db.js";

/** POST /api/sepay/webhook */
export const sepayWebhook = async (req, res) => {
  const requestId = `webhook-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  
  // Khai báo biến ở scope ngoài để dùng trong catch block
  let payload = {};
  let order_id, company_id, amount, transaction_code, payment_method;
  
  try {
    console.log(`\n=== WEBHOOK RECEIVED FROM SEPAY [${requestId}] ===`);
    console.log("Time:", new Date().toISOString());
    console.log("IP:", req.ip || req.connection.remoteAddress);
    console.log("User-Agent:", req.headers['user-agent'] || 'N/A');
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    
    // Log raw body trước khi parse
    let rawBody = req.rawBody || req.body;
    if (Buffer.isBuffer(rawBody)) {
      rawBody = rawBody.toString('utf8');
      console.log("Raw Body (Buffer):", rawBody);
    } else if (typeof rawBody === 'string') {
      console.log("Raw Body (String):", rawBody);
    }
    console.log("Parsed Body:", JSON.stringify(req.body, null, 2));
    console.log("Body Type:", typeof req.body);
    console.log("Body is Array?", Array.isArray(req.body));
    console.log("Body Keys:", Object.keys(req.body || {}));
    
    // Import Sepay config để verify signature (nếu cần)
    const { verifyWebhookSignature } = await import("../config/sepay.js");
    
    // Parse payload - thử nhiều cách
    
    // Cách 1: Body là object
    if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
      payload = req.body;
    }
    // Cách 2: Body là string
    else if (typeof req.body === 'string') {
      try {
        payload = JSON.parse(req.body);
      } catch {
        // Nếu không parse được, thử parse như query string
        payload = { raw: req.body };
      }
    }
    // Cách 3: Body là Buffer (đã parse ở middleware)
    else if (Buffer.isBuffer(req.body)) {
      try {
        payload = JSON.parse(req.body.toString('utf8'));
      } catch {
        payload = { raw: req.body.toString('utf8') };
      }
    }
    // Cách 4: Body rỗng - có thể data ở query params hoặc headers
    else {
      payload = req.body || req.query || {};
      console.log("⚠️  Body rỗng, thử lấy từ query params:", req.query);
    }
    
    // Nếu vẫn rỗng, log để debug
    if (!payload || Object.keys(payload).length === 0) {
      console.error("⚠️  PAYLOAD RỖNG - Kiểm tra:");
      console.error("   Content-Type:", req.headers['content-type']);
      console.error("   Method:", req.method);
      console.error("   URL:", req.url);
      console.error("   Query:", req.query);
      
      // Trả về hướng dẫn để debug
      return res.status(400).json({
        error: "Empty payload",
        message: "Webhook body is empty. Sepay may be sending data in a different format.",
        debug: {
          contentType: req.headers['content-type'],
          method: req.method,
          hasBody: !!req.body,
          bodyType: typeof req.body,
          bodyKeys: Object.keys(req.body || {}),
          query: req.query,
          headers: Object.keys(req.headers)
        },
        hint: "Kiểm tra Sepay Dashboard để xem format payload Sepay gửi. Có thể cần thêm parser cho format khác."
      });
    }
    const signature = req.headers["x-sepay-signature"] || req.headers["sepay-signature"] || "";
    const timestamp = req.headers["x-sepay-timestamp"] || req.headers["timestamp"] || "";
    const authHeader = req.headers["authorization"] || req.headers["Authorization"] || "";
    
    // Verify webhook signature/API key (nếu có)
    // Ưu tiên kiểm tra Authorization header với format "Apikey <KEY>"
    if (authHeader) {
      const isValid = verifyWebhookSignature(payload, signature, timestamp, authHeader);
      if (!isValid) {
        console.error("⚠️  Invalid webhook API key in Authorization header!");
        return res.status(401).json({ error: "Invalid API key" });
      }
      console.log("✅ Webhook API key verified via Authorization header");
    } else if (signature) {
      // Fallback: Verify signature nếu không có Authorization header
      const isValid = verifyWebhookSignature(payload, signature, timestamp);
      if (!isValid) {
        console.error("⚠️  Invalid webhook signature!");
        return res.status(401).json({ error: "Invalid signature" });
      }
      console.log("✅ Webhook signature verified");
    } else {
      console.log("⚠️  No signature/API key provided, skipping verification");
    }
    
    // Sepay có thể gửi payload với format khác, thử parse nhiều format
    // Khởi tạo giá trị mặc định
    order_id = undefined;
    company_id = undefined;
    amount = undefined;
    transaction_code = undefined;
    payment_method = "vietqr";
    
    // Format 1: Direct fields
    if (payload.order_id) {
      order_id = payload.order_id;
      company_id = payload.company_id;
      amount = payload.amount;
      transaction_code = payload.transaction_code || payload.transactionCode || payload.trans_id || payload.transaction_id;
    } 
    // Format 2: Nested data
    else if (payload.data) {
      const data = payload.data;
      order_id = data.order_id || data.orderId;
      company_id = data.company_id || data.companyId;
      amount = data.amount;
      transaction_code = data.transaction_code || data.transactionCode || data.trans_id;
    }
    // Format 3: Sepay standard format
    else if (payload.transaction) {
      const trans = payload.transaction;
      order_id = trans.order_id || trans.orderId || trans.orderCode || payload.order_id;
      company_id = trans.company_id || payload.company_id;
      amount = trans.amount || trans.totalAmount || payload.amount;
      transaction_code = trans.transaction_code || trans.transactionCode || trans.id || payload.transaction_code;
      payment_method = trans.payment_method || trans.method || payload.payment_method || "vietqr";
    }
    // Format 4: Sepay BankAPI format (format thực tế từ Sepay webhook)
    else if (payload.transferAmount && payload.referenceCode) {
      // Format: { transferAmount, referenceCode, content/description, gateway, transactionDate }
      amount = payload.transferAmount;
      transaction_code = payload.referenceCode || payload.id?.toString();
      payment_method = payload.gateway?.toLowerCase() || "vietqr";
      
      // Parse order_id từ content hoặc description
      // Format có thể: 
      // - "GMD000000009842" -> extract "9842"
      // - "GMD00000000 0024" -> extract "0024"
      // - "GMD-000000000024" -> extract "0024"
      // - "GMD1234" -> extract "1234"
      const contentText = payload.content || payload.description || "";
      
      console.log(`🔍 Parsing order_id from content: "${contentText}"`);
      
      // Ưu tiên 1: Tìm pattern "GMD" + bất kỳ số nào + lấy 4 số cuối
      // Ví dụ: "GMD000000009842" -> lấy 4 số cuối "9842"
      // Pattern: GMD (optional -) (any digits) - lấy 4 số cuối
      const gmdAnyNumber = contentText.match(/GMD-?(\d+)/i);
      if (gmdAnyNumber && gmdAnyNumber[1]) {
        const allDigits = gmdAnyNumber[1];
        // Lấy 4 số cuối
        if (allDigits.length >= 4) {
          const code = allDigits.slice(-4);
          console.log(`🔍 Found GMD with numbers "${allDigits}", extracted last 4 digits: "${code}"`);
          // Kiểm tra trong database
          try {
            const codeCheck = await pool.query(
              `SELECT order_id, company_id FROM "CargoOrders" WHERE order_id = $1 LIMIT 1`,
              [code]
            );
            if (codeCheck.rows.length > 0) {
              order_id = codeCheck.rows[0].order_id;
              if (!company_id) {
                company_id = codeCheck.rows[0].company_id;
              }
              console.log(`✅ Found order_id: ${order_id} (from GMD pattern "${contentText}")`);
            } else {
              console.log(`⚠️  Code "${code}" not found in database, trying other patterns...`);
            }
          } catch (err) {
            console.warn("⚠️  Error checking GMD code:", err.message);
          }
        }
      }
      
      // Ưu tiên 2: Nếu không tìm được từ GMD pattern, thử pattern cụ thể hơn
      if (!order_id) {
        const gmdPattern = contentText.match(/GMD-?0*(\d{4})(?:\D|$)/i);
        if (gmdPattern && gmdPattern[1]) {
          const code = gmdPattern[1];
          console.log(`🔍 Found GMD pattern (alternative), extracted code: "${code}"`);
          try {
            const codeCheck = await pool.query(
              `SELECT order_id, company_id FROM "CargoOrders" WHERE order_id = $1 LIMIT 1`,
              [code]
            );
            if (codeCheck.rows.length > 0) {
              order_id = codeCheck.rows[0].order_id;
              if (!company_id) {
                company_id = codeCheck.rows[0].company_id;
              }
              console.log(`✅ Found order_id: ${order_id} (from GMD alternative pattern "${contentText}")`);
            }
          } catch (err) {
            console.warn("⚠️  Error checking GMD alternative code:", err.message);
          }
        }
      }
      
      // Ưu tiên 3: Nếu chưa tìm được, thử tìm bất kỳ mã 4 số nào trong content
      if (!order_id) {
        // Tìm tất cả các mã 4 số (không có chữ số trước và sau)
        const allFourDigits = contentText.match(/\b(\d{4})\b/g);
        if (allFourDigits && allFourDigits.length > 0) {
          console.log(`🔍 Found multiple 4-digit codes:`, allFourDigits);
          // Thử từng mã 4 số (từ cuối lên, vì order_id thường ở cuối)
          for (let i = allFourDigits.length - 1; i >= 0; i--) {
            const code = allFourDigits[i];
            console.log(`🔍 Checking code "${code}" in database...`);
            try {
              const codeCheck = await pool.query(
                `SELECT order_id, company_id FROM "CargoOrders" WHERE order_id = $1 LIMIT 1`,
                [code]
              );
              if (codeCheck.rows.length > 0) {
                order_id = codeCheck.rows[0].order_id;
                if (!company_id) {
                  company_id = codeCheck.rows[0].company_id;
                }
                console.log(`✅ Found order_id: ${order_id} (from code "${code}" in "${contentText}")`);
                break;
              } else {
                console.log(`⚠️  Code "${code}" not found in database`);
              }
            } catch (err) {
              console.warn(`⚠️  Error checking code "${code}":`, err.message);
            }
          }
        }
      }
      
      // Nếu vẫn chưa tìm được, log để debug
      if (!order_id) {
        console.warn(`⚠️  Could not extract order_id from content: "${contentText}"`);
        console.warn(`   Available patterns tried: GMD pattern, GMD number pattern, 4-digit codes`);
        console.warn(`   Content length: ${contentText.length}, Content preview: "${contentText.substring(0, 100)}"`);
      }
    }
    // Format 5: Fallback - thử các field phổ biến
    else {
      // Nếu order_id là số, convert sang string 4 chữ số
      const rawOrderId = payload.order_id || payload.orderId || payload.order_code || payload.orderCode || payload.id;
      if (rawOrderId) {
        // Nếu là số, format thành 4 chữ số
        if (typeof rawOrderId === 'number' || /^\d+$/.test(rawOrderId)) {
          order_id = String(rawOrderId).padStart(4, '0').substring(0, 4);
        } else {
          order_id = rawOrderId;
        }
      }
      company_id = payload.company_id || payload.companyId;
      amount = payload.amount || payload.totalAmount || payload.total_amount || payload.transferAmount;
      transaction_code = payload.transaction_code || payload.transactionCode || payload.transaction_id || payload.trans_id || payload.referenceCode || payload.id;
      payment_method = payload.payment_method || payload.method || payload.paymentMethod || payload.gateway?.toLowerCase() || "vietqr";
    }

    console.log("📋 Parsed values:", { order_id, company_id, amount, transaction_code, payment_method });

    // Validate required fields
    if (!order_id || !amount) {
      console.error("❌ Missing required fields:", { 
        order_id: !!order_id, 
        amount: !!amount,
        payload_keys: Object.keys(payload),
        payload_sample: JSON.stringify(payload).substring(0, 500)
      });
      
      // Trả về response chi tiết để debug
      return res.status(400).json({ 
        error: "Missing required fields", 
        message: "order_id and amount are required",
        received: payload,
        debug: {
          payloadType: typeof payload,
          payloadKeys: Object.keys(payload || {}),
          payloadPreview: JSON.stringify(payload).substring(0, 500),
          contentType: req.headers['content-type'],
          bodyType: typeof req.body,
          allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('content') || h.toLowerCase().includes('sepay'))
        },
        hint: "Kiểm tra Sepay Dashboard để xem format payload. Có thể cần thêm parser cho format đặc biệt của Sepay."
      });
    }

    // Get company_id and customer_id from order if not provided in webhook
    let customer_id = null;
    if (!company_id) {
      const orderResult = await pool.query(
        `SELECT company_id, customer_id FROM "CargoOrders" WHERE order_id = $1`,
        [order_id]  // order_id giờ là VARCHAR(4), không cần Number()
      );
      if (orderResult.rows.length > 0) {
        company_id = orderResult.rows[0].company_id;
        customer_id = orderResult.rows[0].customer_id;
        console.log("📦 Found company_id from order:", company_id);
        if (customer_id) {
          console.log("👤 Found customer_id from order:", customer_id);
        }
      }
    } else {
      // Nếu đã có company_id, chỉ cần lấy customer_id
      const orderResult = await pool.query(
        `SELECT customer_id FROM "CargoOrders" WHERE order_id = $1`,
        [order_id]  // VARCHAR(4)
      );
      if (orderResult.rows.length > 0) {
        customer_id = orderResult.rows[0].customer_id;
        if (customer_id) {
          console.log("👤 Found customer_id from order:", customer_id);
        }
      }
    }

    // Parse transaction date nếu có (format: "2025-10-29 23:07:00")
    let paidAtTimestamp = null;
    if (payload.transactionDate) {
      try {
        // Format: "2025-10-29 23:07:00" -> ISO string
        const dateStr = payload.transactionDate.replace(' ', 'T');
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          paidAtTimestamp = parsedDate.toISOString();
          console.log("📅 Parsed transaction date:", paidAtTimestamp);
        }
      } catch (err) {
        console.warn("⚠️  Could not parse transactionDate:", err.message);
      }
    }

    // Đảm bảo customer_id được lấy từ order nếu chưa có
    if (!customer_id && order_id) {
      const orderCheck = await pool.query(
        `SELECT customer_id FROM "CargoOrders" WHERE order_id = $1`,
        [order_id]
      );
      if (orderCheck.rows.length > 0 && orderCheck.rows[0].customer_id) {
        customer_id = orderCheck.rows[0].customer_id;
        console.log("👤 Updated customer_id from order:", customer_id);
      }
    }

    // Đảm bảo có đủ thông tin để insert
    if (!order_id) {
      console.error("❌ Cannot insert transaction: order_id is missing");
      return res.status(400).json({ 
        error: "Missing order_id",
        message: "Cannot process transaction without order_id",
        received: { order_id, company_id, amount, transaction_code }
      });
    }

    if (!company_id) {
      console.error("❌ Cannot insert transaction: company_id is missing");
      return res.status(400).json({ 
        error: "Missing company_id",
        message: "Cannot process transaction without company_id",
        received: { order_id, company_id, amount, transaction_code }
      });
    }

    // Đảm bảo transaction_code không null (cần cho ON CONFLICT)
    const finalTransactionCode = transaction_code || `SEPAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.log("💾 Inserting transaction with data:", {
      order_id,
      company_id,
      customer_id: customer_id || 'NULL',
      amount,
      payment_method: payment_method || 'vietqr',
      transaction_code: finalTransactionCode,
      paid_at: paidAtTimestamp || 'CURRENT_TIMESTAMP'
    });

    // Upsert transaction as SUCCESS (với customer_id)
    // payment_status phải là 'SUCCESS' (theo constraint: PENDING, SUCCESS, FAILED, CANCELLED)
    // Nếu transaction_code là NULL, không dùng ON CONFLICT
    let insertSql;
    let insertParams;
    
    if (finalTransactionCode) {
      // Có transaction_code, dùng ON CONFLICT
      insertSql = `
        INSERT INTO "Transactions" (
          order_id, company_id, customer_id, amount, payment_method, payment_status, transaction_code, paid_at, gateway_response
        ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6, $7, $8)
        ON CONFLICT (transaction_code) DO UPDATE SET 
          payment_status='SUCCESS', 
          customer_id=COALESCE($3, "Transactions".customer_id, (
            SELECT customer_id FROM "CargoOrders" WHERE order_id = $1 LIMIT 1
          )),
          paid_at=COALESCE($7, CURRENT_TIMESTAMP),
          gateway_response=$8,
          updated_at=CURRENT_TIMESTAMP
        RETURNING transaction_id, order_id, customer_id, payment_status, paid_at, transaction_code;
      `;
      insertParams = [
        order_id,  // $1: VARCHAR(4)
        Number(company_id),  // $2
        customer_id ? String(customer_id).trim() : null,  // $3 - Đảm bảo là string UUID
        Number(amount),  // $4
        payment_method || 'vietqr',  // $5: payment_method
        finalTransactionCode,  // $6: transaction_code
        paidAtTimestamp || new Date().toISOString(),  // $7: paid_at
        JSON.stringify(payload)  // $8: gateway_response
      ];
    } else {
      // Không có transaction_code, insert bình thường
      insertSql = `
        INSERT INTO "Transactions" (
          order_id, company_id, customer_id, amount, payment_method, payment_status, paid_at, gateway_response
        ) VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6, $7)
        RETURNING transaction_id, order_id, customer_id, payment_status, paid_at, transaction_code;
      `;
      insertParams = [
        order_id,  // $1: VARCHAR(4)
        Number(company_id),  // $2
        customer_id ? String(customer_id).trim() : null,  // $3 - Đảm bảo là string UUID
        Number(amount),  // $4
        payment_method || 'vietqr',  // $5: payment_method
        paidAtTimestamp || new Date().toISOString(),  // $6: paid_at
        JSON.stringify(payload)  // $7: gateway_response
      ];
    }

    let result;
    try {
      result = await pool.query(insertSql, insertParams);
      console.log("✅ Transaction saved successfully:", result.rows[0]);
      
      if (!result.rows || result.rows.length === 0) {
        console.error("❌ Transaction insert returned no rows!");
        throw new Error("Transaction insert failed: no rows returned");
      }
    } catch (dbError) {
      console.error("❌ Database error when inserting transaction:", dbError.message);
      console.error("❌ Error details:", dbError.detail);
      console.error("❌ Error code:", dbError.code);
      console.error("❌ Insert params:", insertParams);
      throw dbError; // Re-throw để catch block bên ngoài xử lý
    }

    // Update order status if exists - chỉ confirm khi thanh toán thành công
    // Update đơn hàng từ PENDING_PAYMENT sang PAID sau khi thanh toán thành công
    const updateResult = await pool.query(
      `UPDATE "CargoOrders" 
       SET status = 'PAID',
       updated_at = CURRENT_TIMESTAMP 
       WHERE order_id = $1
         AND status = 'PENDING_PAYMENT'`, 
      [order_id]  // VARCHAR(4)
    );
    
    if (updateResult.rowCount > 0) {
      console.log("📦 Order updated:", updateResult.rowCount, "rows");
      // Lấy status mới để log
      const orderStatus = await pool.query(
        `SELECT status FROM "CargoOrders" WHERE order_id = $1`,
        [order_id]  // VARCHAR(4)
      );
      if (orderStatus.rows.length > 0) {
        console.log("   Status mới:", orderStatus.rows[0].status);
      }
    } else {
      console.log("⚠️  Không tìm thấy đơn hàng hoặc đơn hàng đã có status khác");
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Webhook processed successfully in ${processingTime}ms [${requestId}]`);
    
    // Response với 200 OK để Sepay biết đã nhận được
    res.status(200).json({ 
      ok: true, 
      success: true,
      transaction_id: result.rows[0]?.transaction_id,
      message: "Webhook processed successfully",
      request_id: requestId
    });
  } catch (err) {
    const processingTime = Date.now() - startTime;
    console.error(`\n❌ === POST /api/sepay/webhook ERROR [${requestId}] ===`);
    console.error("Processing time:", processingTime, "ms");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error code:", err.code);
    console.error("Error detail:", err.detail);
    console.error("Error hint:", err.hint);
    
    // Log full error context
    console.error("Error context:", {
      order_id: typeof order_id !== 'undefined' ? order_id : 'NOT_SET',
      company_id: typeof company_id !== 'undefined' ? company_id : 'NOT_SET',
      amount: typeof amount !== 'undefined' ? amount : 'NOT_SET',
      transaction_code: typeof transaction_code !== 'undefined' ? transaction_code : 'NOT_SET',
      payload_keys: payload ? Object.keys(payload) : 'NO_PAYLOAD',
      request_id: requestId
    });
    
    // Phân loại lỗi để quyết định có retry hay không
    // Lỗi validation (400) -> không retry
    // Lỗi database/network (500) -> có thể retry
    const isValidationError = err.code === '23505' || // Unique constraint violation
                              err.code === '23503' || // Foreign key violation
                              err.message.includes('Missing required fields') ||
                              err.message.includes('Invalid');
    
    const statusCode = isValidationError ? 400 : 500;
    
    // Trả về response phù hợp
    // 400: Lỗi validation, không cần retry
    // 500: Lỗi server, Sepay có thể retry
    res.status(statusCode).json({ 
      ok: false,
      error: isValidationError ? "Validation error" : "Server error", 
      message: err.message,
      detail: err.detail,
      hint: err.hint,
      request_id: requestId
    });
  }
};

