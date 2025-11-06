// Script để chạy migration 036
import pool from '../src/config/db.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration036() {
  try {
    console.log('🚀 Running migration 036...\n');

    const migrationPath = path.join(__dirname, '../migrations/036_fix_vehicle_filter_by_origin_region.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing migration SQL...');
    await pool.query(migrationSQL);

    console.log('✅ Migration 036 completed successfully!\n');

    // Verify function exists
    const check = await pool.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'get_available_vehicles_by_location_and_destination';
    `);
    
    if (check.rows.length > 0) {
      console.log('✅ Function get_available_vehicles_by_location_and_destination created!');
    } else {
      console.log('❌ Function not found after migration!');
    }

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration036();

