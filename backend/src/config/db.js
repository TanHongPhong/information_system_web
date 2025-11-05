import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Validate database connection string
const connectionString = process.env.PSQLDB_CONNECTIONSTRING;

// Check if connection string is placeholder or invalid
const isPlaceholder = !connectionString || 
  connectionString === "postgresql://user:password@host:port/database" ||
  connectionString.includes("user:password") ||
  connectionString.includes("host:port");

if (isPlaceholder) {
  console.error("");
  console.error("❌ ==========================================");
  console.error("❌ DATABASE CONNECTION STRING CHƯA ĐƯỢC CẤU HÌNH!");
  console.error("❌ ==========================================");
  console.error("");
  console.error("📝 Vui lòng cập nhật PSQLDB_CONNECTIONSTRING trong file backend/.env");
  console.error("");
  console.error("💡 CÁCH LẤY CONNECTION STRING:");
  console.error("");
  console.error("Nếu dùng Neon (Khuyến nghị):");
  console.error("   1. Truy cập: https://console.neon.tech");
  console.error("   2. Đăng nhập và chọn project");
  console.error("   3. Copy Connection String");
  console.error("   4. Paste vào backend/.env");
  console.error("");
  console.error("Nếu dùng PostgreSQL local:");
  console.error("   Format: postgresql://postgres:password@localhost:5432/database_name");
  console.error("");
  console.error("⚠️  Backend vẫn chạy nhưng KHÔNG THỂ kết nối database!");
  console.error("");
}

// Tạo pool ngay cả khi connection string chưa đúng để tránh crash
// Lỗi sẽ được xử lý ở query level
const pool = new Pool({
  connectionString: connectionString || "postgresql://invalid",
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000, // Tăng từ 5s lên 30s để tránh timeout
  allowExitOnIdle: true,
  // Thêm keepalive để duy trì kết nối
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Event handlers
pool.on("connect", (client) => {
  console.log("✅ Database connection established");
});

pool.on("error", (err, client) => {
  console.error("❌ Database pool error:", err.message);
  
  // Provide helpful error messages
  if (err.code === "ECONNREFUSED") {
    console.error("⚠️  Không thể kết nối database server. Kiểm tra:");
    console.error("   1. PSQLDB_CONNECTIONSTRING đúng chưa?");
    console.error("   2. Database server có đang chạy không?");
    console.error("   3. Host/Port có đúng không?");
  } else if (err.code === "28P01" || err.message.includes("password")) {
    console.error("⚠️  Lỗi xác thực. Kiểm tra:");
    console.error("   1. Username/password trong connection string đúng chưa?");
  } else if (err.code === "3D000" || err.message.includes("does not exist")) {
    console.error("⚠️  Database không tồn tại. Kiểm tra:");
    console.error("   1. Tên database trong connection string đúng chưa?");
  } else if (isPlaceholder) {
    console.error("⚠️  Connection string chưa được cấu hình!");
  }
});

// Test connection on startup (async, không block)
if (!isPlaceholder) {
  pool.query("SELECT NOW() as test")
    .then(() => {
      console.log("✅ Database connection test: SUCCESS");
    })
    .catch((err) => {
      console.error("❌ Database connection test: FAILED");
      console.error("   Error:", err.message);
      
      // Cung cấp thông báo chi tiết hơn cho các lỗi phổ biến
      if (err.message.includes("timeout") || err.message.includes("ETIMEDOUT")) {
        console.error("⚠️  Connection timeout - Có thể do:");
        console.error("   1. Database server chậm hoặc không phản hồi");
        console.error("   2. Network connection không ổn định");
        console.error("   3. Connection string không đúng (host/port)");
        console.error("   4. Firewall chặn kết nối");
      } else if (err.message.includes("ECONNREFUSED")) {
        console.error("⚠️  Connection refused - Database server không chấp nhận kết nối");
        console.error("   Kiểm tra host/port trong PSQLDB_CONNECTIONSTRING");
      } else if (!err.message.includes("invalid")) {
        console.error("💡 Kiểm tra lại PSQLDB_CONNECTIONSTRING trong .env");
      }
    });
} else {
  console.error("⚠️  Bỏ qua connection test vì connection string chưa được cấu hình");
}

export default pool;
