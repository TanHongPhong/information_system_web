// Script để cập nhật status cho warehouse operations
import pool from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function updateOperationsStatus() {
  try {
    console.log('🔍 === UPDATING WAREHOUSE OPERATIONS STATUS ===\n');

    // Cập nhật IN operations với NULL/empty status
    const result1 = await pool.query(`
      UPDATE "WarehouseOperations"
      SET status = 'PENDING',
          updated_at = NOW()
      WHERE operation_type = 'IN'
        AND (status IS NULL OR status = '')
      RETURNING operation_id
    `);
    console.log(`✅ Updated ${result1.rowCount} IN operations with NULL/empty status to PENDING`);

    // Cập nhật OUT operations với NULL/empty/IN_PROGRESS status
    const result2 = await pool.query(`
      UPDATE "WarehouseOperations"
      SET status = 'PENDING',
          updated_at = NOW()
      WHERE operation_type = 'OUT'
        AND (status IS NULL OR status = '' OR status = 'IN_PROGRESS')
      RETURNING operation_id
    `);
    console.log(`✅ Updated ${result2.rowCount} OUT operations with NULL/empty/IN_PROGRESS status to PENDING`);

    // Đảm bảo actual_time được set cho các operations COMPLETED
    const result3 = await pool.query(`
      UPDATE "WarehouseOperations"
      SET actual_time = COALESCE(actual_time, created_at, NOW()),
          updated_at = NOW()
      WHERE status = 'COMPLETED'
        AND actual_time IS NULL
      RETURNING operation_id
    `);
    console.log(`✅ Updated ${result3.rowCount} COMPLETED operations with NULL actual_time`);

    // Thống kê
    console.log('\n📊 === STATUS SUMMARY ===\n');

    const stats = await pool.query(`
      SELECT 
        operation_type,
        status,
        COUNT(*) as count
      FROM "WarehouseOperations"
      GROUP BY operation_type, status
      ORDER BY operation_type, status
    `);

    console.log('IN Operations:');
    const inPending = stats.rows.find(r => r.operation_type === 'IN' && r.status === 'PENDING');
    const inProgress = stats.rows.find(r => r.operation_type === 'IN' && r.status === 'IN_PROGRESS');
    const inCompleted = stats.rows.find(r => r.operation_type === 'IN' && r.status === 'COMPLETED');
    console.log(`  - PENDING (INCOMING): ${inPending?.count || 0}`);
    console.log(`  - IN_PROGRESS (STORED): ${inProgress?.count || 0}`);
    console.log(`  - COMPLETED (STORED): ${inCompleted?.count || 0}`);

    console.log('\nOUT Operations:');
    const outPending = stats.rows.find(r => r.operation_type === 'OUT' && r.status === 'PENDING');
    const outCompleted = stats.rows.find(r => r.operation_type === 'OUT' && r.status === 'COMPLETED');
    console.log(`  - PENDING (OUTGOING): ${outPending?.count || 0}`);
    console.log(`  - COMPLETED (SHIPPED): ${outCompleted?.count || 0}`);

    console.log('\n✅ === UPDATE COMPLETED ===');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateOperationsStatus();

