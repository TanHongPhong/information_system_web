// Script để fix customer_id cho transactions và orders thiếu customer_id
// Tìm customer_id từ các nguồn khác nhau và cập nhật

import pool from '../src/config/db.js';

async function fixMissingCustomerIds() {
  try {
    console.log('🔄 Bắt đầu fix customer_id cho transactions và orders...\n');

    // 1) Tìm các orders không có customer_id nhưng có transactions
    const ordersWithoutCustomer = await pool.query(`
      SELECT DISTINCT
        co.order_id,
        co.customer_id as order_customer_id,
        co.created_at,
        t.transaction_id,
        t.customer_id as transaction_customer_id
      FROM "CargoOrders" co
      LEFT JOIN "Transactions" t ON co.order_id = t.order_id
      WHERE co.customer_id IS NULL
      ORDER BY co.created_at DESC
    `);

    console.log(`📊 Orders không có customer_id: ${ordersWithoutCustomer.rows.length}`);

    if (ordersWithoutCustomer.rows.length > 0) {
      console.log('\n📋 Chi tiết:');
      ordersWithoutCustomer.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Order ${row.order_id} - Transaction ${row.transaction_id || 'N/A'} - Transaction customer: ${row.transaction_customer_id || 'NULL'}`);
      });
    }

    // 2) Tìm customer_id từ transactions của cùng order (nếu có nhiều transactions)
    const transactionsWithCustomer = await pool.query(`
      SELECT 
        t.order_id,
        t.customer_id,
        COUNT(*) as transaction_count
      FROM "Transactions" t
      WHERE t.customer_id IS NOT NULL
      GROUP BY t.order_id, t.customer_id
      ORDER BY transaction_count DESC
    `);

    console.log(`\n📊 Orders có transactions với customer_id: ${transactionsWithCustomer.rows.length}`);
    
    // 3) Update orders từ transactions có customer_id
    let updatedOrders = 0;
    for (const row of transactionsWithCustomer.rows) {
      const updateOrder = await pool.query(`
        UPDATE "CargoOrders"
        SET customer_id = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE order_id = $2
          AND customer_id IS NULL
        RETURNING order_id
      `, [row.customer_id, row.order_id]);
      
      if (updateOrder.rowCount > 0) {
        updatedOrders += updateOrder.rowCount;
        console.log(`✅ Updated order ${row.order_id} with customer_id ${row.customer_id}`);
      }
    }

    // 4) Sau khi update orders, update lại transactions
    const updateTransactions = await pool.query(`
      UPDATE "Transactions" t
      SET customer_id = co.customer_id,
          updated_at = CURRENT_TIMESTAMP
      FROM "CargoOrders" co
      WHERE t.order_id = co.order_id
        AND t.customer_id IS NULL
        AND co.customer_id IS NOT NULL
      RETURNING t.transaction_id, t.order_id, t.customer_id
    `);

    console.log(`\n✅ Đã update ${updateTransactions.rowCount} transactions từ orders!`);

    // 5) Kiểm tra kết quả cuối cùng
    const finalCheck = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM "Transactions" WHERE customer_id IS NULL) as transactions_without_customer,
        (SELECT COUNT(*) FROM "CargoOrders" WHERE customer_id IS NULL) as orders_without_customer,
        (SELECT COUNT(*) FROM "Transactions" WHERE customer_id IS NOT NULL) as transactions_with_customer,
        (SELECT COUNT(*) FROM "CargoOrders" WHERE customer_id IS NOT NULL) as orders_with_customer
    `);

    const stats = finalCheck.rows[0];
    console.log('\n📊 Thống kê cuối cùng:');
    console.log(`  Transactions có customer_id: ${stats.transactions_with_customer}`);
    console.log(`  Transactions không có customer_id: ${stats.transactions_without_customer}`);
    console.log(`  Orders có customer_id: ${stats.orders_with_customer}`);
    console.log(`  Orders không có customer_id: ${stats.orders_without_customer}`);

    // 6) Hiển thị các transactions vẫn còn thiếu customer_id
    if (parseInt(stats.transactions_without_customer) > 0) {
      console.log('\n⚠️  Các transactions vẫn còn thiếu customer_id:');
      const remaining = await pool.query(`
        SELECT 
          t.transaction_id,
          t.order_id,
          t.payment_status,
          co.customer_id as order_customer_id,
          co.status as order_status
        FROM "Transactions" t
        LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
        WHERE t.customer_id IS NULL
        ORDER BY t.created_at DESC
      `);

      remaining.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Transaction ${row.transaction_id} - Order ${row.order_id} - Order customer: ${row.order_customer_id || 'NULL'}`);
      });

      console.log('\n💡 Gợi ý: Các transactions này cần được cập nhật thủ công vì orders tương ứng cũng không có customer_id.');
    }

    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy script
fixMissingCustomerIds()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

