// Script để fix customer_id cho TẤT CẢ orders và transactions
// Điền customer_id từ các nguồn khác nhau

import pool from '../src/config/db.js';

async function fixAllCustomerIds() {
  try {
    console.log('🔄 Bắt đầu fix customer_id cho TẤT CẢ orders và transactions...\n');

    // 1. Kiểm tra số lượng records thiếu customer_id
    const statsBefore = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM "CargoOrders" WHERE customer_id IS NULL) as orders_without_customer,
        (SELECT COUNT(*) FROM "Transactions" WHERE customer_id IS NULL) as transactions_without_customer
    `);
    
    console.log('📊 Thống kê trước khi fix:');
    console.log(`   Orders thiếu customer_id: ${statsBefore.rows[0].orders_without_customer}`);
    console.log(`   Transactions thiếu customer_id: ${statsBefore.rows[0].transactions_without_customer}\n`);

    // 2. Tìm customer_id phổ biến nhất từ các records đã có
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
      console.log(`📊 Customer_id phổ biến nhất: ${defaultCustomerId} (${topCustomer.rows[0].count} records)\n`);
    } else {
      console.log('⚠️  Không tìm thấy customer_id nào trong database!');
      console.log('💡 Cần tạo customer trước hoặc update thủ công.\n');
    }

    // 3. Update orders từ transactions (nếu transaction có customer_id)
    console.log('🔄 Bước 1: Update orders từ transactions...');
    const updateOrdersFromTransactions = await pool.query(`
      UPDATE "CargoOrders" co
      SET customer_id = (
        SELECT t.customer_id 
        FROM "Transactions" t 
        WHERE t.order_id = co.order_id 
          AND t.customer_id IS NOT NULL 
        LIMIT 1
      ),
      updated_at = CURRENT_TIMESTAMP
      WHERE co.customer_id IS NULL
        AND EXISTS (
          SELECT 1 FROM "Transactions" t 
          WHERE t.order_id = co.order_id 
            AND t.customer_id IS NOT NULL
        )
      RETURNING co.order_id, co.customer_id
    `);
    console.log(`✅ Đã update ${updateOrdersFromTransactions.rowCount} orders từ transactions\n`);

    // 4. Update transactions từ orders (nếu order có customer_id)
    console.log('🔄 Bước 2: Update transactions từ orders...');
    const updateTransactionsFromOrders = await pool.query(`
      UPDATE "Transactions" t
      SET customer_id = co.customer_id,
          updated_at = CURRENT_TIMESTAMP
      FROM "CargoOrders" co
      WHERE t.order_id = co.order_id
        AND t.customer_id IS NULL
        AND co.customer_id IS NOT NULL
      RETURNING t.transaction_id, t.order_id, t.customer_id
    `);
    console.log(`✅ Đã update ${updateTransactionsFromOrders.rowCount} transactions từ orders\n`);

    // 5. Nếu vẫn còn records thiếu customer_id và có defaultCustomerId, dùng default
    if (defaultCustomerId) {
      console.log('🔄 Bước 3: Update các records còn lại với customer_id phổ biến nhất...');
      
      // Update orders
      const updateOrdersDefault = await pool.query(`
        UPDATE "CargoOrders"
        SET customer_id = $1::uuid,
            updated_at = CURRENT_TIMESTAMP
        WHERE customer_id IS NULL
        RETURNING order_id, customer_id
      `, [defaultCustomerId]);
      console.log(`✅ Đã update ${updateOrdersDefault.rowCount} orders với default customer_id\n`);

      // Update transactions
      const updateTransactionsDefault = await pool.query(`
        UPDATE "Transactions"
        SET customer_id = $1::uuid,
            updated_at = CURRENT_TIMESTAMP
        WHERE customer_id IS NULL
        RETURNING transaction_id, order_id, customer_id
      `, [defaultCustomerId]);
      console.log(`✅ Đã update ${updateTransactionsDefault.rowCount} transactions với default customer_id\n`);
    }

    // 6. Kiểm tra kết quả cuối cùng
    const statsAfter = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM "CargoOrders" WHERE customer_id IS NULL) as orders_without_customer,
        (SELECT COUNT(*) FROM "Transactions" WHERE customer_id IS NULL) as transactions_without_customer,
        (SELECT COUNT(*) FROM "CargoOrders" WHERE customer_id IS NOT NULL) as orders_with_customer,
        (SELECT COUNT(*) FROM "Transactions" WHERE customer_id IS NOT NULL) as transactions_with_customer
    `);

    const stats = statsAfter.rows[0];
    console.log('📊 Thống kê sau khi fix:');
    console.log(`   Orders có customer_id: ${stats.orders_with_customer}`);
    console.log(`   Orders thiếu customer_id: ${stats.orders_without_customer}`);
    console.log(`   Transactions có customer_id: ${stats.transactions_with_customer}`);
    console.log(`   Transactions thiếu customer_id: ${stats.transactions_without_customer}\n`);

    // 7. Hiển thị một số records đã được update
    if (parseInt(stats.orders_with_customer) > 0) {
      console.log('📋 Một số orders đã có customer_id:');
      const sampleOrders = await pool.query(`
        SELECT 
          order_id,
          customer_id,
          status,
          created_at
        FROM "CargoOrders"
        WHERE customer_id IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 5
      `);
      sampleOrders.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. Order ${row.order_id} - Customer: ${row.customer_id} - Status: ${row.status}`);
      });
      console.log('');
    }

    if (parseInt(stats.transactions_with_customer) > 0) {
      console.log('📋 Một số transactions đã có customer_id:');
      const sampleTransactions = await pool.query(`
        SELECT 
          transaction_id,
          order_id,
          customer_id,
          payment_status,
          created_at
        FROM "Transactions"
        WHERE customer_id IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 5
      `);
      sampleTransactions.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. Transaction ${row.transaction_id} - Order ${row.order_id} - Customer: ${row.customer_id} - Status: ${row.payment_status}`);
      });
      console.log('');
    }

    // 8. Thống kê theo customer
    const statsByCustomer = await pool.query(`
      SELECT 
        customer_id,
        COUNT(*) as transaction_count
      FROM "Transactions"
      WHERE customer_id IS NOT NULL
      GROUP BY customer_id
      ORDER BY transaction_count DESC
      LIMIT 5
    `);

    if (statsByCustomer.rows.length > 0) {
      console.log('📊 Thống kê transactions theo customer (top 5):');
      statsByCustomer.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. Customer ${row.customer_id}: ${row.transaction_count} transactions`);
      });
      console.log('');
    }

    if (parseInt(stats.orders_without_customer) === 0 && parseInt(stats.transactions_without_customer) === 0) {
      console.log('✅ TẤT CẢ orders và transactions đã có customer_id!');
    } else {
      console.log('⚠️  Vẫn còn một số records chưa có customer_id.');
      console.log('💡 Có thể cần update thủ công hoặc kiểm tra lại data source.');
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
fixAllCustomerIds()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

