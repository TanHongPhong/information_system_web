// Script để update customer_id thủ công cho transactions và orders
// Usage: node scripts/manual_update_customer_id.js <order_id> <customer_id>

import pool from '../src/config/db.js';

async function manualUpdateCustomerId(orderId, customerId) {
  try {
    if (!orderId || !customerId) {
      console.log('❌ Usage: node scripts/manual_update_customer_id.js <order_id> <customer_id>');
      console.log('   Example: node scripts/manual_update_customer_id.js 9008 89db2755-40c9-4200-8c64-84dd46ced9d2');
      process.exit(1);
    }

    // Validate customer_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(customerId)) {
      console.log('❌ Invalid customer_id format. Must be UUID.');
      process.exit(1);
    }

    // Format order_id
    const formattedOrderId = String(orderId).padStart(4, '0').substring(0, 4);

    console.log(`🔄 Updating customer_id for order ${formattedOrderId}...\n`);

    // 1) Update order
    const updateOrder = await pool.query(`
      UPDATE "CargoOrders"
      SET customer_id = $1::uuid,
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $2
      RETURNING order_id, customer_id
    `, [customerId, formattedOrderId]);

    if (updateOrder.rowCount === 0) {
      console.log(`❌ Order ${formattedOrderId} not found!`);
      process.exit(1);
    }

    console.log(`✅ Updated order ${formattedOrderId} with customer_id ${customerId}`);

    // 2) Update transactions
    const updateTransactions = await pool.query(`
      UPDATE "Transactions"
      SET customer_id = $1::uuid,
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $2
      RETURNING transaction_id, order_id, customer_id
    `, [customerId, formattedOrderId]);

    console.log(`✅ Updated ${updateTransactions.rowCount} transactions for order ${formattedOrderId}`);

    if (updateTransactions.rows.length > 0) {
      console.log('\n📋 Updated transactions:');
      updateTransactions.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Transaction ${row.transaction_id} - Customer: ${row.customer_id}`);
      });
    }

    console.log('\n✅ Hoàn thành!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Lấy arguments từ command line
const args = process.argv.slice(2);
const orderId = args[0];
const customerId = args[1];

// Chạy script
manualUpdateCustomerId(orderId, customerId)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

