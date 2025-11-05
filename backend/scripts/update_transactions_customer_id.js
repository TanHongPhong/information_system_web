// Script để update customer_id cho các transactions cũ
// Lấy customer_id từ CargoOrders để fill vào Transactions

import pool from '../src/config/db.js';

async function updateTransactionsCustomerId() {
  try {
    console.log('🔄 Bắt đầu update customer_id cho transactions...\n');

    // 1) Kiểm tra số lượng transactions chưa có customer_id
    const checkBefore = await pool.query(`
      SELECT COUNT(*) as count
      FROM "Transactions" t
      WHERE t.customer_id IS NULL
    `);
    const beforeCount = parseInt(checkBefore.rows[0].count);
    console.log(`📊 Transactions chưa có customer_id: ${beforeCount}`);

    // 2) Kiểm tra số lượng transactions có thể update được
    const checkCanUpdate = await pool.query(`
      SELECT COUNT(*) as count
      FROM "Transactions" t
      INNER JOIN "CargoOrders" co ON t.order_id = co.order_id
      WHERE t.customer_id IS NULL
        AND co.customer_id IS NOT NULL
    `);
    const canUpdateCount = parseInt(checkCanUpdate.rows[0].count);
    console.log(`📊 Transactions có thể update: ${canUpdateCount}\n`);

    if (canUpdateCount === 0) {
      console.log('✅ Không có transactions nào cần update!');
      return;
    }

    // 3) Update customer_id từ CargoOrders
    const updateResult = await pool.query(`
      UPDATE "Transactions" t
      SET customer_id = co.customer_id,
          updated_at = CURRENT_TIMESTAMP
      FROM "CargoOrders" co
      WHERE t.order_id = co.order_id
        AND t.customer_id IS NULL
        AND co.customer_id IS NOT NULL
      RETURNING t.transaction_id, t.order_id, t.customer_id
    `);

    const updatedCount = updateResult.rowCount;
    console.log(`✅ Đã update ${updatedCount} transactions!\n`);

    // 4) Kiểm tra kết quả sau khi update
    const checkAfter = await pool.query(`
      SELECT COUNT(*) as count
      FROM "Transactions" t
      WHERE t.customer_id IS NULL
    `);
    const afterCount = parseInt(checkAfter.rows[0].count);
    console.log(`📊 Transactions chưa có customer_id (sau update): ${afterCount}`);

    // 5) Hiển thị một số transactions đã được update
    if (updatedCount > 0) {
      console.log('\n📋 Một số transactions đã được update:');
      const sampleResult = await pool.query(`
        SELECT 
          t.transaction_id,
          t.order_id,
          t.customer_id,
          t.payment_status,
          t.created_at,
          co.cargo_name
        FROM "Transactions" t
        LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
        WHERE t.customer_id IS NOT NULL
        ORDER BY t.updated_at DESC
        LIMIT 10
      `);
      
      sampleResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Transaction ${row.transaction_id} - Order ${row.order_id} - Customer: ${row.customer_id}`);
      });
    }

    // 6) Thống kê theo customer
    const statsByCustomer = await pool.query(`
      SELECT 
        t.customer_id,
        COUNT(*) as transaction_count
      FROM "Transactions" t
      WHERE t.customer_id IS NOT NULL
      GROUP BY t.customer_id
      ORDER BY transaction_count DESC
      LIMIT 10
    `);

    if (statsByCustomer.rows.length > 0) {
      console.log('\n📊 Thống kê transactions theo customer:');
      statsByCustomer.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Customer ${row.customer_id}: ${row.transaction_count} transactions`);
      });
    }

    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi khi update transactions:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy script
updateTransactionsCustomerId()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

