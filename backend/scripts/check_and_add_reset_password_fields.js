// Script để kiểm tra và thêm các cột reset password nếu chưa tồn tại
import pool from "../src/config/db.js";

async function checkAndAddColumns() {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    // Kiểm tra và thêm cột cho users table
    const checkUsers = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'reset_token'
    `);

    if (checkUsers.rows.length === 0) {
      console.log("Thêm cột reset_token vào bảng users...");
      await client.query(`ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)`);
      console.log("✅ Đã thêm reset_token vào users");
    } else {
      console.log("✅ Cột reset_token đã tồn tại trong users");
    }

    const checkUsersExpiry = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'reset_token_expiry'
    `);

    if (checkUsersExpiry.rows.length === 0) {
      console.log("Thêm cột reset_token_expiry vào bảng users...");
      await client.query(`ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP`);
      console.log("✅ Đã thêm reset_token_expiry vào users");
    } else {
      console.log("✅ Cột reset_token_expiry đã tồn tại trong users");
    }

    // Kiểm tra và thêm cột cho TransportCompanyAdmin table
    const checkAdminTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'TransportCompanyAdmin'
    `);

    if (checkAdminTable.rows.length > 0) {
      const checkAdmin = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'TransportCompanyAdmin' 
        AND column_name = 'reset_token'
      `);

      if (checkAdmin.rows.length === 0) {
        console.log("Thêm cột reset_token vào bảng TransportCompanyAdmin...");
        await client.query(`ALTER TABLE "TransportCompanyAdmin" ADD COLUMN reset_token VARCHAR(255)`);
        console.log("✅ Đã thêm reset_token vào TransportCompanyAdmin");
      } else {
        console.log("✅ Cột reset_token đã tồn tại trong TransportCompanyAdmin");
      }

      const checkAdminExpiry = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'TransportCompanyAdmin' 
        AND column_name = 'reset_token_expiry'
      `);

      if (checkAdminExpiry.rows.length === 0) {
        console.log("Thêm cột reset_token_expiry vào bảng TransportCompanyAdmin...");
        await client.query(`ALTER TABLE "TransportCompanyAdmin" ADD COLUMN reset_token_expiry TIMESTAMP`);
        console.log("✅ Đã thêm reset_token_expiry vào TransportCompanyAdmin");
      } else {
        console.log("✅ Cột reset_token_expiry đã tồn tại trong TransportCompanyAdmin");
      }
    } else {
      console.log("⚠️ Bảng TransportCompanyAdmin chưa tồn tại, bỏ qua...");
    }

    // Tạo indexes nếu chưa có
    try {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL`);
      console.log("✅ Đã tạo index cho users.reset_token");
    } catch (e) {
      if (!e.message.includes("already exists")) {
        throw e;
      }
    }

    if (checkAdminTable.rows.length > 0) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS idx_transport_company_admin_reset_token ON "TransportCompanyAdmin"(reset_token) WHERE reset_token IS NOT NULL`);
        console.log("✅ Đã tạo index cho TransportCompanyAdmin.reset_token");
      } catch (e) {
        if (!e.message.includes("already exists")) {
          throw e;
        }
      }
    }

    await client.query("COMMIT");
    console.log("\n✅ Hoàn tất! Tất cả các cột đã được kiểm tra và thêm.");
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Lỗi:", error);
    throw error;
  } finally {
    client.release();
  }
}

checkAndAddColumns()
  .then(() => {
    console.log("\n✨ Script hoàn thành!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script thất bại:", error);
    process.exit(1);
  });

