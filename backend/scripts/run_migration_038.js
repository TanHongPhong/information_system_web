// Script để chạy migration 038_add_order_loading_tracking.sql
import pool from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Running migration 038_add_order_loading_tracking.sql...\n');

    // Đọc file migration
    const migrationPath = path.join(__dirname, '../migrations/038_add_order_loading_tracking.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Chạy migration
    await pool.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify: Kiểm tra xem cột đã được thêm chưa
    const checkQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'CargoOrders'
        AND column_name IN ('is_loaded', 'loaded_at')
      ORDER BY column_name;
    `;
    
    const result = await pool.query(checkQuery);
    
    if (result.rows.length === 0) {
      console.log('⚠️ Warning: Columns is_loaded and loaded_at not found. Migration may have failed.');
    } else {
      console.log('📊 Verification:');
      result.rows.forEach(row => {
        console.log(`   ✅ ${row.column_name}: ${row.data_type} (default: ${row.column_default || 'NULL'})`);
      });
    }

    console.log('\n✅ Setup completed!');

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

