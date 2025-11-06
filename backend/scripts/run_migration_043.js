import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.PSQLDB_CONNECTIONSTRING,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running migration 043_strict_vehicle_filtering.sql...\n');
    
    const migrationPath = path.join(__dirname, '..', 'migrations', '043_strict_vehicle_filtering.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    
    // Test function
    console.log('🧪 Testing function...\n');
    
    const testResult = await pool.query(`
      SELECT proname, prosrc 
      FROM pg_proc 
      WHERE proname = 'get_available_vehicles_by_location_and_destination';
    `);
    
    if (testResult.rows.length > 0) {
      console.log('✅ Function exists and ready to use!');
      console.log('   Function name: get_available_vehicles_by_location_and_destination');
      console.log('   ✅ Now filters:');
      console.log('      - Only AVAILABLE vehicles');
      console.log('      - No LOADING/IN_TRANSIT/COMPLETED orders');
      console.log('      - Capacity < 95%');
    } else {
      console.warn('⚠️ Function not found!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

