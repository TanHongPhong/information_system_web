// backend/src/controllers/testControllers.js
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

