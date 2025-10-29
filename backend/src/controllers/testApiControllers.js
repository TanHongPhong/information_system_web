// backend/src/controllers/testApiControllers.js
import pool from "../config/db.js";

/** GET /api/test - Test API connection */
export const getData = async (req, res) => {
  try {
    // Check connection string first
    const connectionString = process.env.PSQLDB_CONNECTIONSTRING;
    const isPlaceholder = !connectionString || 
      connectionString === "postgresql://user:password@host:port/database" ||
      connectionString.includes("user:password") ||
      connectionString.includes("host:port");
    
    if (isPlaceholder) {
      return res.status(503).json({
        message: "API is running but database not configured",
        database: "Not connected",
        status: "configuration_required",
        error: "PSQLDB_CONNECTIONSTRING chưa được cấu hình",
        hint: "Vui lòng cập nhật PSQLDB_CONNECTIONSTRING trong file backend/.env",
        help: {
          neon: "https://console.neon.tech",
          format: "postgresql://username:password@host:port/database"
        }
      });
    }
    
    // Test database connection
    const { rows } = await pool.query("SELECT NOW() as current_time");
    res.json({ 
      message: "API is working! ✅", 
      database: "Connected to PostgreSQL",
      timestamp: rows[0].current_time,
      status: "healthy"
    });
  } catch (err) {
    console.error("Database connection error:", err);
    
    // Provide detailed error message based on error type
    let errorMessage = "Database connection failed";
    let errorDetails = {};
    let statusCode = 500;
    
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      errorMessage = "Cannot connect to database server";
      errorDetails = {
        hint: "Kiểm tra PSQLDB_CONNECTIONSTRING trong .env và đảm bảo database server đang chạy",
        possible_causes: [
          "Connection string sai hoặc không đầy đủ",
          "Database server không chạy",
          "Host/port không đúng",
          "Network/firewall đang chặn"
        ]
      };
      statusCode = 503; // Service Unavailable
    } else if (err.code === "28P01" || err.message.includes("password") || err.message.includes("authentication")) {
      errorMessage = "Database authentication failed";
      errorDetails = {
        hint: "Kiểm tra username/password trong PSQLDB_CONNECTIONSTRING",
        possible_causes: [
          "Username sai",
          "Password sai",
          "User không có quyền truy cập database"
        ]
      };
    } else if (err.code === "3D000" || err.message.includes("does not exist")) {
      errorMessage = "Database does not exist";
      errorDetails = {
        hint: "Kiểm tra tên database trong PSQLDB_CONNECTIONSTRING",
        possible_causes: [
          "Tên database sai",
          "Database chưa được tạo",
          "Tên database có khoảng trắng/special chars"
        ]
      };
    } else if (err.message.includes("invalid") || err.message.includes("connection")) {
      errorMessage = "Invalid connection string";
      errorDetails = {
        hint: "PSQLDB_CONNECTIONSTRING có vẻ không hợp lệ",
        format: "postgresql://username:password@host:port/database",
        example: "postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"
      };
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: errorDetails,
      message: err.message,
      code: err.code || "UNKNOWN"
    });
  }
};

/** GET /api/transport-companies */
export const getCompanies = async (req, res) => {
  try {
    // Check connection string first
    const connectionString = process.env.PSQLDB_CONNECTIONSTRING;
    const isPlaceholder = !connectionString || 
      connectionString === "postgresql://user:password@host:port/database" ||
      connectionString.includes("user:password") ||
      connectionString.includes("host:port");
    
    if (isPlaceholder) {
      return res.status(503).json({
        error: "Database not configured",
        message: "PSQLDB_CONNECTIONSTRING chưa được cấu hình",
        hint: "Vui lòng cập nhật PSQLDB_CONNECTIONSTRING trong file backend/.env",
        help: {
          neon: "https://console.neon.tech",
          format: "postgresql://username:password@host:port/database"
        }
      });
    }

    // Check if table exists first
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'LogisticsCompany'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(503).json({
          error: "Database tables not found",
          message: "Bảng LogisticsCompany chưa được tạo",
          hint: "Vui lòng chạy database migrations trước",
          help: {
            migration_file: "backend/migrations/005_create_logistics_company_tables.sql",
            steps: [
              "1. Kết nối đến database",
              "2. Chạy file: backend/migrations/005_create_logistics_company_tables.sql",
              "3. Chạy file: backend/migrations/002_create_vehicles_table.sql (nếu chưa có)"
            ]
          }
        });
      }
    } catch (checkErr) {
      // If check fails, might be connection issue
      return res.status(500).json({
        error: "Database connection failed",
        message: checkErr.message,
        hint: "Kiểm tra database connection và đảm bảo PSQLDB_CONNECTIONSTRING đã được cấu hình"
      });
    }

    const {
      q = "",
      area = "",
      vehicle_type = "",
      min_rating = null,
      max_cost_per_km = null,
    } = req.query;

    // Full query with proper joins for areas and rates
    const { rows } = await pool.query(
      `
      SELECT
        lc.company_id,
        lc.company_name AS name,
        COALESCE(lc.address, '') AS address,
        COALESCE(lc.phone, '') AS phone,
        COALESCE(lc.rating, 0) AS rating,
        COALESCE(
          (SELECT json_agg(DISTINCT ca.area)
           FROM "CompanyAreas" ca
           WHERE ca.company_id = lc.company_id
             AND ($2 = '' OR ca.area ILIKE '%'||$2||'%')),
          '[]'::json
        ) AS areas,
        COALESCE(
          (SELECT json_agg(
                    json_build_object(
                      'vehicle_type', cr.vehicle_type,
                      'cost_per_km', cr.cost_per_km
                    )
                    ORDER BY cr.vehicle_type)
           FROM "CompanyRates" cr
           WHERE cr.company_id = lc.company_id
             AND ($3 = '' OR cr.vehicle_type ILIKE '%'||$3||'%')
             AND ($5::numeric IS NULL OR (cr.cost_per_km IS NOT NULL AND cr.cost_per_km <= $5::numeric))),
          '[]'::json
        ) AS rates
      FROM "LogisticsCompany" lc
      WHERE lc.status = 'ACTIVE'
        AND ($1 = '' OR lc.company_name ILIKE '%'||$1||'%' OR lc.address ILIKE '%'||$1||'%')
        AND ($4::numeric IS NULL OR COALESCE(lc.rating, 0) >= $4::numeric)
      ORDER BY lc.rating DESC NULLS LAST, lc.company_name ASC
      LIMIT 50;
      `,
      [q, area, vehicle_type, min_rating, max_cost_per_km]
    );

    res.json(rows || []);
  } catch (err) {
    console.error("=== GET /api/transport-companies ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err.detail);
    console.error("Error hint:", err.hint);
    console.error("Full error:", err);
    
    // Provide detailed error response
    let errorMessage = "Server error";
    let errorDetails = {
      hint: "Kiểm tra database connection và migrations đã được chạy chưa"
    };
    let statusCode = 500;
    
    if (err.message.includes("does not exist") || err.message.includes("relation") || err.code === "42P01") {
      errorMessage = "Database table not found";
      errorDetails = {
        hint: "Bảng LogisticsCompany chưa được tạo. Cần chạy migrations:",
        migrations: [
          "backend/migrations/005_create_logistics_company_tables.sql",
          "backend/migrations/002_create_vehicles_table.sql"
        ]
      };
      statusCode = 503;
    } else if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      errorMessage = "Cannot connect to database";
      errorDetails = {
        hint: "Kiểm tra PSQLDB_CONNECTIONSTRING trong .env",
        check: [
          "Connection string đúng chưa?",
          "Database server đang chạy không?",
          "Network/firewall có chặn không?"
        ]
      };
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      message: err.message,
      details: errorDetails,
      code: err.code || "UNKNOWN"
    });
  }
};

/** GET /api/transport-companies/:id */
export const getCompanyById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Invalid id" });

    const { rows } = await pool.query(
      `
      SELECT
        lc.company_id,
        lc.company_name AS name,
        COALESCE(lc.address, '') AS address,
        lc.phone,
        COALESCE(lc.email, '') as email,
        lc.rating,
        COALESCE(lc.description, '') as description,
        COALESCE(lc.status, 'ACTIVE') as status,
        COALESCE(lc.has_cold, false) as has_cold,
        COALESCE(lc.has_dangerous_goods, false) as has_dangerous_goods,
        COALESCE(lc.has_loading_dock, false) as has_loading_dock,
        COALESCE(lc.has_insurance, false) as has_insurance,
        COALESCE((SELECT json_agg(DISTINCT ca.area)
                  FROM "CompanyAreas" ca
                  WHERE ca.company_id = lc.company_id), '[]'::json) AS areas,
        COALESCE((SELECT json_agg(json_build_object('vehicle_type', cr.vehicle_type, 'cost_per_km', cr.cost_per_km)
                  ORDER BY cr.vehicle_type)
                  FROM "CompanyRates" cr
                  WHERE cr.company_id = lc.company_id), '[]'::json) AS rates
      FROM "LogisticsCompany" lc
      WHERE lc.company_id = $1;
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/** GET /api/transport-companies/:id/vehicles */
export const getVehiclesByCompany = async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (!Number.isInteger(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const { status = "" } = req.query;

    const { rows } = await pool.query(
      `
      SELECT
        v.vehicle_id,
        v.company_id,
        v.license_plate,
        v.vehicle_type,
        v.capacity_ton,
        v.driver_name,
        v.driver_phone,
        v.status,
        v.current_location,
        v.created_at,
        v.updated_at,
        lc.company_name
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      WHERE v.company_id = $1
        AND ($2 = '' OR v.status = $2)
      ORDER BY v.vehicle_type ASC, v.license_plate ASC;
      `,
      [companyId, status]
    );

    res.json(rows);
  } catch (err) {
    console.error("=== GET /api/transport-companies/:id/vehicles ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      details: err.detail,
      hint: err.hint,
    });
  }
};

/** GET /api/cargo-orders */
export const getCargoOrders = async (req, res) => {
  try {
    const { company_id, status, order_id } = req.query;

    let query = `
      SELECT
        co.order_id,
        co.company_id,
        co.vehicle_id,
        co.cargo_name,
        co.cargo_type,
        co.weight_kg,
        co.volume_m3,
        co.value_vnd,
        co.require_cold,
        co.require_danger,
        co.require_loading,
        co.require_insurance,
        co.pickup_address,
        co.dropoff_address,
        co.pickup_time,
        co.note,
        co.status,
        co.created_at,
        co.updated_at,
        lc.company_name,
        v.license_plate,
        v.vehicle_type
      FROM "CargoOrders" co
      LEFT JOIN "LogisticsCompany" lc ON co.company_id = lc.company_id
      LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (order_id) {
      query += ` AND co.order_id = $${paramCount}`;
      params.push(Number(order_id));
      paramCount++;
    }

    if (company_id) {
      query += ` AND co.company_id = $${paramCount}`;
      params.push(Number(company_id));
      paramCount++;
    }

    if (status) {
      query += ` AND co.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY co.created_at DESC LIMIT 100;`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("=== GET /api/cargo-orders ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/** POST /api/transactions */
export const createTransaction = async (req, res) => {
  try {
    const {
      order_id,
      company_id,
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

    const { rows } = await pool.query(
      `
      INSERT INTO "Transactions" (
        order_id, company_id, amount, payment_method, payment_status,
        transaction_code, note, gateway_response, paid_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $5 = 'SUCCESS' THEN CURRENT_TIMESTAMP ELSE NULL END)
      RETURNING transaction_id, order_id, company_id, amount, payment_method, payment_status, transaction_code, created_at;
      `,
      [
        Number(order_id),
        Number(company_id),
        Number(amount),
        payment_method,
        payment_status,
        transaction_code || null,
        note || null,
        gateway_response ? JSON.stringify(gateway_response) : null,
      ]
    );

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
    const { order_id, company_id, payment_status } = req.query;

    let query = `
      SELECT
        t.transaction_id,
        t.order_id,
        t.company_id,
        t.amount,
        t.payment_method,
        t.payment_status,
        t.transaction_code,
        t.paid_at,
        t.created_at,
        t.updated_at,
        t.note,
        co.cargo_name,
        lc.company_name
      FROM "Transactions" t
      LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
      LEFT JOIN "LogisticsCompany" lc ON t.company_id = lc.company_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (order_id) {
      query += ` AND t.order_id = $${paramCount}`;
      params.push(Number(order_id));
      paramCount++;
    }

    if (company_id) {
      query += ` AND t.company_id = $${paramCount}`;
      params.push(Number(company_id));
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

/** POST /api/sepay/webhook */
export const sepayWebhook = async (req, res) => {
  try {
    console.log("=== WEBHOOK RECEIVED FROM SEPAY ===");
    console.log("Time:", new Date().toISOString());
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    
    // Log raw body trước khi parse
    let rawBody = req.body;
    if (Buffer.isBuffer(rawBody)) {
      rawBody = rawBody.toString('utf8');
      console.log("Raw Body (Buffer):", rawBody);
    }
    console.log("Parsed Body:", JSON.stringify(req.body, null, 2));
    console.log("Body Type:", typeof req.body);
    console.log("Body is Array?", Array.isArray(req.body));
    console.log("Body Keys:", Object.keys(req.body || {}));
    
    // Import Sepay config để verify signature (nếu cần)
    const { verifyWebhookSignature } = await import("../config/sepay.js");
    
    // Parse payload - thử nhiều cách
    let payload = {};
    
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
    
    // Verify webhook signature (nếu có)
    if (signature) {
      const isValid = verifyWebhookSignature(payload, signature, timestamp);
      if (!isValid) {
        console.error("⚠️  Invalid webhook signature!");
        return res.status(401).json({ error: "Invalid signature" });
      }
      console.log("✅ Webhook signature verified");
    } else {
      console.log("⚠️  No signature provided, skipping verification");
    }
    
    // Sepay có thể gửi payload với format khác, thử parse nhiều format
    let order_id, company_id, amount, transaction_code, payment_method = "vietqr";
    
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
      // Format có thể: "GMD00000000 0024" hoặc "GMD-000000000024" hoặc "GMD00000024"
      const contentText = payload.content || payload.description || "";
      
      // Ưu tiên: Tìm pattern "GMD... XXXXX" (có số sau space) - đây là order_id thực
      const trailingMatch = contentText.match(/GMD-?\d+\s+(\d{1,6})\b/i);
      if (trailingMatch && trailingMatch[1]) {
        order_id = parseInt(trailingMatch[1], 10);
        console.log(`✅ Extracted order_id from trailing number: ${order_id} (from "${contentText}")`);
      } 
      // Fallback: Tìm pattern "GMD-XXXXXXXX" hoặc "GMDXXXXXXXX" (parse từ số sau GMD)
      else {
        const gmdMatch = contentText.match(/GMD-?(\d{4,12})\b/i);
        if (gmdMatch && gmdMatch[1]) {
          // Parse từ số sau GMD, loại bỏ leading zeros
          order_id = parseInt(gmdMatch[1], 10);
          console.log(`✅ Extracted order_id from GMD code: ${order_id} (from "${contentText}")`);
        } else {
          console.warn("⚠️  Could not extract order_id from content/description:", contentText);
          // Thử tìm số bất kỳ trong chuỗi nếu không có GMD
          const anyNumberMatch = contentText.match(/\b(\d{1,6})\b/);
          if (anyNumberMatch) {
            const candidate = parseInt(anyNumberMatch[1], 10);
            if (candidate > 0 && candidate < 1000000) { // Hợp lý cho order_id
              order_id = candidate;
              console.log(`⚠️  Using fallback number as order_id: ${order_id} (from "${contentText}")`);
            }
          }
        }
      }
    }
    // Format 5: Fallback - thử các field phổ biến
    else {
      order_id = payload.order_id || payload.orderId || payload.order_code || payload.orderCode || payload.id;
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

    // Get company_id from order if not provided in webhook
    if (!company_id) {
      const orderResult = await pool.query(
        `SELECT company_id FROM "CargoOrders" WHERE order_id = $1`,
        [Number(order_id)]
      );
      if (orderResult.rows.length > 0) {
        company_id = orderResult.rows[0].company_id;
        console.log("📦 Found company_id from order:", company_id);
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

    // Upsert transaction as SUCCESS
    const insertSql = `
      INSERT INTO "Transactions" (
        order_id, company_id, amount, payment_method, payment_status, transaction_code, paid_at, gateway_response
      ) VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, $7)
      ON CONFLICT (transaction_code) DO UPDATE SET 
        payment_status='SUCCESS', 
        paid_at=COALESCE($6, CURRENT_TIMESTAMP),
        gateway_response=$7,
        updated_at=CURRENT_TIMESTAMP
      RETURNING transaction_id, order_id, payment_status, paid_at;
    `;
    const result = await pool.query(insertSql, [
      Number(order_id), 
      company_id ? Number(company_id) : null, 
      Number(amount), 
      payment_method, 
      transaction_code || `SEPAY-${Date.now()}`,
      paidAtTimestamp || new Date().toISOString(), // Dùng transactionDate nếu có
      JSON.stringify(payload) // Lưu raw payload để debug
    ]);
    
    console.log("✅ Transaction saved:", result.rows[0]);

    // Update order status if exists
    const updateResult = await pool.query(
      `UPDATE "CargoOrders" 
       SET status = CASE 
         WHEN status = 'DRAFT' THEN 'SUBMITTED'
         WHEN status = 'SUBMITTED' THEN 'CONFIRMED'
         ELSE status
       END,
       updated_at = CURRENT_TIMESTAMP 
       WHERE order_id = $1`, 
      [Number(order_id)]
    );
    console.log("📦 Order updated:", updateResult.rowCount, "rows");

    // Response với 200 OK để Sepay biết đã nhận được
    res.status(200).json({ 
      ok: true, 
      success: true,
      transaction_id: result.rows[0]?.transaction_id,
      message: "Webhook processed successfully"
    });
  } catch (err) {
    console.error("❌ === POST /api/sepay/webhook ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    // Vẫn trả về 200 để Sepay không retry nhiều lần
    // (hoặc trả về 500 nếu muốn Sepay retry)
    res.status(500).json({ 
      error: "Server error", 
      message: err.message,
      ok: false
    });
  }
};

/** POST /api/cargo-orders */
export const createCargoOrder = async (req, res) => {
  try {
    const {
      company_id,
      vehicle_id,
      cargo_name,
      cargo_type,
      weight_kg,
      volume_m3,
      value_vnd,
      require_cold,
      require_danger,
      require_loading,
      require_insurance,
      pickup_address,
      dropoff_address,
      pickup_time,
      note,
    } = req.body;

    // Validate required fields
    if (!company_id || !cargo_name || !pickup_address || !dropoff_address) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["company_id", "cargo_name", "pickup_address", "dropoff_address"],
      });
    }

    // Map cargo_type to require flags if not provided
    const reqCold = require_cold || cargo_type === "food" || cargo_type === "cold";
    const reqDanger = require_danger || cargo_type === "dangerous";
    const reqLoading = require_loading || cargo_type === "oversize";
    const reqInsurance = require_insurance;

    const { rows } = await pool.query(
      `
      INSERT INTO "CargoOrders" (
        company_id, vehicle_id, cargo_name, cargo_type,
        weight_kg, volume_m3, value_vnd,
        require_cold, require_danger, require_loading, require_insurance,
        pickup_address, dropoff_address, pickup_time, note, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'DRAFT')
      RETURNING order_id, company_id, vehicle_id, cargo_name, cargo_type, status, created_at;
      `,
      [
        Number(company_id),
        vehicle_id ? Number(vehicle_id) : null,
        cargo_name,
        cargo_type || null,
        weight_kg ? Number(weight_kg) : null,
        volume_m3 ? Number(volume_m3) : null,
        value_vnd ? Number(value_vnd) : null,
        reqCold || false,
        reqDanger || false,
        reqLoading || false,
        reqInsurance || false,
        pickup_address,
        dropoff_address,
        pickup_time || null,
        note || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Đơn hàng đã được tạo thành công",
      data: rows[0],
    });
  } catch (err) {
    console.error("=== POST /api/cargo-orders ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err.detail);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      details: err.detail,
      hint: err.hint,
    });
  }
};