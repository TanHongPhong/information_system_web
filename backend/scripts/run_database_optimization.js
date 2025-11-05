// Script để chạy migration tối ưu database
import pool from '../src/config/db.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runOptimization() {
  try {
    console.log('🔄 Bắt đầu tối ưu database...\n');

    // Đọc file migration
    const migrationPath = join(__dirname, '../migrations/025_optimize_database.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    // Chạy migration
    console.log('📝 Đang chạy migration 025_optimize_database.sql...\n');
    await pool.query(migrationSQL);

    console.log('\n✅ Tối ưu database hoàn thành!');
    
    // Kiểm tra kết quả
    console.log('\n📊 Kiểm tra kết quả:\n');
    
    // Kiểm tra indexes
    const indexes = await pool.query(`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('Transactions', 'CargoOrders')
      ORDER BY tablename, indexname
    `);
    
    console.log(`📊 Tổng số indexes: ${indexes.rows.length}`);
    console.log('\n📋 Danh sách indexes mới:');
    indexes.rows.forEach((row, index) => {
      if (row.indexname.includes('customer') || row.indexname.includes('status')) {
        console.log(`  ${index + 1}. ${row.tablename}.${row.indexname}`);
      }
    });

    // Kiểm tra views
    const views = await pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name LIKE 'v_%'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Tổng số views: ${views.rows.length}`);
    views.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });

    // Kiểm tra triggers
    const triggers = await pool.query(`
      SELECT 
        trigger_name,
        event_object_table as table_name
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND event_object_table IN ('Transactions', 'CargoOrders')
      ORDER BY event_object_table, trigger_name
    `);
    
    console.log(`\n📊 Tổng số triggers: ${triggers.rows.length}`);
    triggers.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}.${row.trigger_name}`);
    });

    // Kiểm tra constraints
    const constraints = await pool.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('Transactions', 'CargoOrders')
        AND tc.constraint_type = 'CHECK'
      ORDER BY tc.table_name, tc.constraint_name
    `);
    
    console.log(`\n📊 Tổng số check constraints: ${constraints.rows.length}`);
    constraints.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}.${row.constraint_name}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi tối ưu database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Chạy script
runOptimization()
  .then(() => {
    console.log('\n✅ Script hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script thất bại:', error);
    process.exit(1);
  });

