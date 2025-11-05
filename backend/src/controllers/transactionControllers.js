// backend/src/controllers/transactionControllers.js
import pool from "../config/db.js";

/** POST /api/transactions */
export const createTransaction = async (req, res) => {
  try {
    const {
      order_id,
      company_id,
      customer_id,
      amount,
      payment_method,
      payment_status = "PENDING",
      transaction_code,
      note,
      gateway_response,
    } = req.body;

    // Validate required fields
    if (!order_id || !company_id || !amount || !payment_method) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["order_id", "company_id", "amount", "payment_method"],
      });
    }

    // Đảm bảo order_id đúng format VARCHAR(4) - string 4 chữ số
    let formattedOrderId = order_id;
    if (typeof order_id === 'number' || /^\d+$/.test(String(order_id))) {
      formattedOrderId = String(order_id).padStart(4, '0').substring(0, 4);
    } else {
      formattedOrderId = String(order_id).substring(0, 4);
    }

    console.log("💳 createTransaction - Received data:", {
      order_id: order_id,
      formattedOrderId: formattedOrderId,
      customer_id: customer_id,
      company_id: company_id,
      amount: amount
    });

    // Lấy customer_id từ order nếu không được cung cấp HOẶC nếu được cung cấp nhưng muốn đảm bảo đúng
    let finalCustomerId = customer_id;
    
    // Luôn kiểm tra customer_id từ order để đảm bảo đúng
    const orderResult = await pool.query(
      `SELECT customer_id FROM "CargoOrders" WHERE order_id = $1`,
      [formattedOrderId]  // VARCHAR(4)
    );
    
    if (orderResult.rows.length > 0) {
      const orderCustomerId = orderResult.rows[0].customer_id;
      console.log("💳 createTransaction - Order customer_id from DB:", orderCustomerId);
      
      // Ưu tiên dùng customer_id từ request, nhưng nếu không có thì dùng từ order
      if (!finalCustomerId && orderCustomerId) {
        finalCustomerId = orderCustomerId;
        console.log("✅ createTransaction - Using customer_id from order:", finalCustomerId);
      } else if (finalCustomerId && orderCustomerId && finalCustomerId !== orderCustomerId) {
        console.warn("⚠️ createTransaction - customer_id mismatch! Request:", finalCustomerId, "Order:", orderCustomerId);
        // Vẫn dùng customer_id từ request nếu có, nhưng log warning
      } else if (finalCustomerId) {
        console.log("✅ createTransaction - Using customer_id from request:", finalCustomerId);
      }
    } else {
      console.warn("⚠️ createTransaction - Order not found for order_id:", formattedOrderId);
    }

    if (!finalCustomerId) {
      console.warn("⚠️ createTransaction - No customer_id available! Will save as NULL");
    }

    const insertParams = [
      formattedOrderId,  // VARCHAR(4) - đã format
      Number(company_id),
        finalCustomerId ? String(finalCustomerId).trim() : null, // Đảm bảo là string UUID
      Number(amount),
      payment_method,
      payment_status,
      transaction_code || null,
      note || null,
      gateway_response ? JSON.stringify(gateway_response) : null,
    ];

    console.log("💳 createTransaction - Insert params:", {
      order_id: insertParams[0],
      company_id: insertParams[1],
      customer_id: insertParams[2],
      amount: insertParams[3],
      payment_method: insertParams[4],
      payment_status: insertParams[5]
    });

    const { rows } = await pool.query(
      `
      INSERT INTO "Transactions" (
        order_id, company_id, customer_id, amount, payment_method, payment_status,
        transaction_code, note, gateway_response, paid_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $6 = 'SUCCESS' THEN CURRENT_TIMESTAMP ELSE NULL END)
      RETURNING transaction_id, order_id, company_id, customer_id, amount, payment_method, payment_status, transaction_code, created_at;
      `,
      insertParams
    );

    console.log("✅ createTransaction - Transaction saved:", {
      transaction_id: rows[0].transaction_id,
      order_id: rows[0].order_id,
      customer_id: rows[0].customer_id,
      payment_status: rows[0].payment_status
    });

    res.status(201).json({
      success: true,
      message: "Giao dịch đã được tạo thành công",
      data: rows[0],
    });
  } catch (err) {
    console.error("=== POST /api/transactions ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error details:", err.detail);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      details: err.detail,
      hint: err.hint,
    });
  }
};

/** GET /api/transactions */
export const getTransactions = async (req, res) => {
  try {
    const { order_id, company_id, customer_id, payment_status } = req.query;

    let query = `
      SELECT
        t.transaction_id,
        t.order_id,
        t.company_id,
        t.customer_id,
        t.amount,
        t.payment_method,
        t.payment_status,
        t.transaction_code,
        t.paid_at,
        t.refund_amount,
        t.refunded_at,
        t.refund_reason,
        t.created_at,
        t.updated_at,
        t.note,
        co.cargo_name,
        co.order_code,
        lc.company_name,
        u.id as customer_user_id,
        u.email as customer_email,
        u.name as customer_name,
        u.phone as customer_phone
      FROM "Transactions" t
      LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
      LEFT JOIN "LogisticsCompany" lc ON t.company_id = lc.company_id
      LEFT JOIN users u ON t.customer_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (order_id) {
      query += ` AND t.order_id = $${paramCount}`;
      params.push(order_id);  // VARCHAR(4)
      paramCount++;
    }

    if (company_id) {
      query += ` AND t.company_id = $${paramCount}`;
      params.push(Number(company_id));
      paramCount++;
    }

    if (customer_id) {
      console.log("getTransactions - Filtering by customer_id:", customer_id, "Type:", typeof customer_id);
      // Đảm bảo customer_id được cast thành UUID để so sánh đúng
      query += ` AND t.customer_id = $${paramCount}::uuid`;
      params.push(String(customer_id).trim()); // Đảm bảo là string và trim
      paramCount++;
    }

    if (payment_status) {
      query += ` AND t.payment_status = $${paramCount}`;
      params.push(payment_status);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT 100;`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("=== GET /api/transactions ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

