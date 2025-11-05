// Script để kiểm tra chi tiết các transactions chưa có customer_id

import pool from '../src/config/db.js';

async function checkTransactionsCustomerId() {
  try {
    console.log('🔍 Kiểm tra transactions chưa có customer_id...\n');

    // 1) Kiểm tra tất cả transactions chưa có customer_id
    const transactionsWithoutCustomer = await pool.query(`
      SELECT 
        t.transaction_id,
        t.order_id,
        t.company_id,
        t.customer_id,
        t.payment_status,
        t.created_at,
        co.customer_id as order_customer_id,
        co.order_id as order_exists
      FROM "Transactions" t
      LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
      WHERE t.customer_id IS NULL
      ORDER BY t.created_at DESC
    `);

    console.log(`📊 Tổng số transactions chưa có customer_id: ${transactionsWithoutCustomer.rows.length}\n`);

    if (transactionsWithoutCustomer.rows.length > 0) {
      console.log('📋 Chi tiết các transactions:');
      transactionsWithoutCustomer.rows.forEach((row, index) => {
        console.log(`\n  ${index + 1}. Transaction ID: ${row.transaction_id}`);
        console.log(`     Order ID: ${row.order_id} (type: ${typeof row.order_id})`);
        console.log(`     Company ID: ${row.company_id}`);
        console.log(`     Payment Status: ${row.payment_status}`);
        console.log(`     Created At: ${row.created_at}`);
        console.log(`     Order exists: ${row.order_exists ? 'YES' : 'NO'}`);
        console.log(`     Order customer_id: ${row.order_customer_id || 'NULL'}`);
        
        if (row.order_exists && row.order_customer_id) {
          console.log(`     ⚠️  Có thể update từ order!`);
        } else if (!row.order_exists) {
          console.log(`     ❌ Order không tồn tại!`);
        } else if (row.order_exists && !row.order_customer_id) {
          console.log(`     ⚠️  Order tồn tại nhưng không có customer_id!`);
        }
      });
    }

    // 2) Kiểm tra tất cả orders và transactions để so sánh
    console.log('\n\n🔍 Kiểm tra tất cả orders và transactions để so sánh...\n');
    
    const allOrders = await pool.query(`
      SELECT 
        order_id,
        customer_id,
        company_id,
        status
      FROM "CargoOrders"
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log(`📊 20 orders gần nhất:`);
    allOrders.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Order ${row.order_id} - Customer: ${row.customer_id || 'NULL'} - Status: ${row.status}`);
    });

    const allTransactions = await pool.query(`
      SELECT 
        transaction_id,
        order_id,
        customer_id,
        company_id,
        payment_status
      FROM "Transactions"
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log(`\n📊 20 transactions gần nhất:`);
    allTransactions.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. Transaction ${row.transaction_id} - Order ${row.order_id} - Customer: ${row.customer_id || 'NULL'} - Status: ${row.payment_status}`);
    });

    // 3) Thử tìm orders có customer_id nhưng transactions không có
    console.log('\n\n🔍 Tìm orders có customer_id nhưng transactions không có...\n');
    
    const mismatch = await pool.query(`
      SELECT 
        t.transaction_id,
        t.order_id,
        t.customer_id as transaction_customer_id,
        co.customer_id as order_customer_id,
        co.status as order_status
      FROM "Transactions" t
      INNER JOIN "CargoOrders" co ON t.order_id = co.order_id
      WHERE t.customer_id IS NULL
        AND co.customer_id IS NOT NULL
    `);

    if (mismatch.rows.length > 0) {
      console.log(`✅ Tìm thấy ${mismatch.rows.length} transactions có thể update:`);
      mismatch.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Transaction ${row.transaction_id} - Order ${row.order_id} - Order customer: ${row.order_customer_id}`);
      });
    } else {
      console.log('❌ Không tìm thấy transactions nào có thể update từ orders.');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy script
checkTransactionsCustomerId()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

