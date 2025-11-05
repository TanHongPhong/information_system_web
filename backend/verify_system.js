/**
 * Script đơn giản để verify hệ thống PENDING_PAYMENT hoạt động
 * Chạy: node backend/verify_system.js
 */

import pool from "./src/config/db.js";

async function verify() {
  console.log("🔍 Kiểm tra hệ thống PENDING_PAYMENT...\n");

  try {
    // 1. Kiểm tra constraint
    console.log("1️⃣  Kiểm tra constraint...");
    const constraints = await pool.query(`
      SELECT constraint_name, check_clause 
      FROM information_schema.check_constraints 
      WHERE table_name = 'CargoOrders'
        AND check_clause LIKE '%status%'
    `);

    if (constraints.rows.length === 0) {
      console.log("❌ Không tìm thấy constraint cho status!");
      return;
    }

    const hasPendingPayment = constraints.rows.some(c => 
      c.check_clause.includes("PENDING_PAYMENT")
    );

    if (hasPendingPayment) {
      console.log("✅ Constraint đã có PENDING_PAYMENT");
      console.log(`   Constraint: ${constraints.rows[0].constraint_name}`);
    } else {
      console.log("❌ Constraint chưa có PENDING_PAYMENT!");
      console.log("   Vui lòng chạy migration: backend/migrations/013_add_pending_payment_status.sql");
      return;
    }

    // 2. Test tạo đơn hàng
    console.log("\n2️⃣  Test tạo đơn hàng với PENDING_PAYMENT...");
    const company = await pool.query(`SELECT company_id FROM "LogisticsCompany" LIMIT 1`);
    const user = await pool.query(`SELECT id FROM users LIMIT 1`);

    if (company.rows.length === 0) {
      console.log("⚠️  Không có công ty để test");
      return;
    }

    const testOrder = await pool.query(`
      INSERT INTO "CargoOrders" (
        company_id, customer_id, cargo_name, pickup_address, dropoff_address, status
      )
      VALUES ($1, $2, 'Test Verify', 'Test Pickup', 'Test Dropoff', 'PENDING_PAYMENT')
      RETURNING order_id, status
    `, [company.rows[0].company_id, user.rows.length > 0 ? user.rows[0].id : null]);

    if (testOrder.rows[0].status === 'PENDING_PAYMENT') {
      console.log(`✅ Đã tạo đơn hàng test: Order #${testOrder.rows[0].order_id} với status PENDING_PAYMENT`);
    } else {
      console.log(`❌ Đơn hàng có status sai: ${testOrder.rows[0].status}`);
    }

    // 3. Test cleanup
    console.log("\n3️⃣  Test cleanup function...");
    const cleanupResult = await pool.query(`SELECT cleanup_pending_payment_orders()`);
    console.log(`✅ Cleanup function hoạt động (đã xóa ${cleanupResult.rows[0].cleanup_pending_payment_orders} đơn hàng)`);

    // 4. Xóa đơn hàng test
    await pool.query(`DELETE FROM "CargoOrders" WHERE order_id = $1`, [testOrder.rows[0].order_id]);
    console.log("✅ Đã xóa đơn hàng test\n");

    console.log("🎉 TẤT CẢ KIỂM TRA ĐỀU PASS!");
    console.log("✅ Hệ thống sẵn sàng hoạt động!");

  } catch (err) {
    console.error("❌ LỖI:", err.message);
    if (err.message.includes("PENDING_PAYMENT")) {
      console.error("\n💡 Vui lòng chạy migration:");
      console.error("   backend/migrations/013_add_pending_payment_status.sql");
    }
  } finally {
    await pool.end();
  }
}

verify();

