// Script để tạo tài khoản quản lý và gắn với công ty
import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// Load .env từ thư mục backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Validate connection string
const connectionString = process.env.PSQLDB_CONNECTIONSTRING;

if (!connectionString || 
    connectionString === "postgresql://user:password@host:port/database" ||
    connectionString.includes("user:password") ||
    connectionString.includes("host:port")) {
  console.error("");
  console.error("❌ ==========================================");
  console.error("❌ DATABASE CONNECTION STRING CHƯA ĐƯỢC CẤU HÌNH!");
  console.error("❌ ==========================================");
  console.error("");
  console.error("📝 Vui lòng cập nhật PSQLDB_CONNECTIONSTRING trong file backend/.env");
  process.exit(1);
}

// Tạo pool với connection timeout dài hơn
const pool = new Pool({
  connectionString: connectionString,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Tăng timeout lên 10 giây
});

// Test connection trước
const testConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Kết nối database thành công!");
    return true;
  } catch (error) {
    console.error("❌ Không thể kết nối database:", error.message);
    console.error("💡 Kiểm tra lại PSQLDB_CONNECTIONSTRING trong backend/.env");
    return false;
  }
};

const createAdminUser = async () => {
  try {
    // Test connection trước
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }

    // Lấy 3 công ty đầu tiên
    const companyResult = await pool.query(
      `SELECT company_id, company_name 
       FROM "LogisticsCompany" 
       ORDER BY company_id 
       LIMIT 3`
    );

    if (companyResult.rows.length === 0) {
      console.error("⚠️  Không tìm thấy công ty nào trong database. Vui lòng tạo công ty trước.");
      process.exit(1);
    }

    if (companyResult.rows.length < 3) {
      console.warn(`⚠️  Chỉ tìm thấy ${companyResult.rows.length} công ty. Sẽ tạo tài khoản cho các công ty có sẵn.`);
    }

    console.log(`📦 Tìm thấy ${companyResult.rows.length} công ty\n`);

    // Định nghĩa 3 tài khoản admin
    const adminAccounts = [
      {
        email: "admin@vtlogistics.com",
        password: "admin123",
        name: "Admin VT Logistics",
        phone: "0901111111"
      },
      {
        email: "admin@gemadept.com",
        password: "admin123",
        name: "Admin Gemadept",
        phone: "0902222222"
      },
      {
        email: "admin@transimex.com",
        password: "admin123",
        name: "Admin Transimex",
        phone: "0903333333"
      }
    ];

    const createdAccounts = [];

    // Tạo tài khoản cho từng công ty
    for (let i = 0; i < companyResult.rows.length && i < adminAccounts.length; i++) {
      const company = companyResult.rows[i];
      const admin = adminAccounts[i];
      
      const company_id = company.company_id;
      const company_name = company.company_name;
      
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Kiểm tra xem email đã tồn tại trong TransportCompanyAdmin chưa
      const adminCheck = await pool.query(
        `SELECT admin_id FROM "TransportCompanyAdmin" WHERE email = $1`,
        [admin.email]
      );

      if (adminCheck.rows.length > 0) {
        // Cập nhật tài khoản admin hiện có
        await pool.query(
          `UPDATE "TransportCompanyAdmin" 
           SET company_id = $1, password = $2, name = $3, phone = $4, is_active = TRUE
           WHERE admin_id = $5`,
          [
            company_id,
            hashedPassword,
            admin.name,
            admin.phone,
            adminCheck.rows[0].admin_id
          ]
        );
        console.log(`✅ Đã cập nhật: ${admin.email} → ${company_name} (ID: ${company_id})`);
      } else {
        // Tạo tài khoản admin mới trong bảng TransportCompanyAdmin
        const result = await pool.query(
          `INSERT INTO "TransportCompanyAdmin" (company_id, name, phone, email, password)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING admin_id, email, company_id`,
          [
            company_id,
            admin.name,
            admin.phone,
            admin.email,
            hashedPassword,
          ]
        );
        console.log(`✅ Đã tạo mới: ${admin.email} → ${company_name} (ID: ${company_id})`);
      }

      createdAccounts.push({
        company_name,
        company_id,
        email: admin.email,
        password: admin.password
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 TỔNG HỢP TÀI KHOẢN ADMIN ĐÃ TẠO:");
    console.log("=".repeat(60));
    createdAccounts.forEach((acc, index) => {
      console.log(`\n${index + 1}. ${acc.company_name} (ID: ${acc.company_id})`);
      console.log(`   Email: ${acc.email}`);
      console.log(`   Password: ${acc.password}`);
    });
    console.log("\n" + "=".repeat(60));
    console.log("✅ Hoàn tất tạo tài khoản!");

    // Đóng pool
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo tài khoản quản lý:", error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`);
    }
    
    // Đóng pool
    await pool.end().catch(() => {});
    process.exit(1);
  }
};

// Chạy script
createAdminUser();

