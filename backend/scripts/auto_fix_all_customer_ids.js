// Script để tự động fix customer_id cho tất cả orders và transactions
// Tìm customer_id phổ biến nhất và gán cho các orders/transactions thiếu customer_id

import pool from '../src/config/db.js';

async function autoFixAllCustomerIds() {
  try {
    console.log('🔄 Tự động fix customer_id cho tất cả orders và transactions...\n');

    // 1) Tìm customer_id phổ biến nhất (có nhiều orders/transactions nhất)
    const topCustomer = await pool.query(`
      SELECT 
        customer_id,
        COUNT(*) as count
      FROM (
        SELECT customer_id FROM "CargoOrders" WHERE customer_id IS NOT NULL
        UNION ALL
        SELECT customer_id FROM "Transactions" WHERE customer_id IS NOT NULL
      ) combined
      GROUP BY customer_id
      ORDER BY count DESC
      LIMIT 1
    `);

    let defaultCustomerId = null;
    if (topCustomer.rows.length > 0 && topCustomer.rows[0].customer_id) {
      defaultCustomerId = topCustomer.rows[0].customer_id;
      console.log(`📊 Customer_id phổ biến nhất: ${defaultCustomerId} (${topCustomer.rows[0].count} records)`);
    } else {
      console.log('⚠️  Không tìm thấy customer_id nào trong database!');
      console.log('💡 Vui lòng chạy script manual_update_customer_id.js để update thủ công.');
      return;
    }

    // 2) Update orders không có customer_id
    const updateOrders = await pool.query(`
      UPDATE "CargoOrders"
      SET customer_id = $1::uuid,
          updated_at = CURRENT_TIMESTAMP
      WHERE customer_id IS NULL
      RETURNING order_id, customer_id
    `, [defaultCustomerId]);

    console.log(`✅ Đã update ${updateOrders.rowCount} orders với customer_id ${defaultCustomerId}`);

    // 3) Update transactions không có customer_id (từ orders)
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

    console.log(`✅ Đã update ${updateTransactions.rowCount} transactions từ orders`);

    // 4) Kiểm tra kết quả cuối cùng
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

    if (parseInt(stats.transactions_without_customer) === 0 && parseInt(stats.orders_without_customer) === 0) {
      console.log('\n✅ Tất cả orders và transactions đã có customer_id!');
    } else {
      console.log('\n⚠️  Vẫn còn một số records chưa có customer_id.');
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
autoFixAllCustomerIds()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

