# Script để chạy tất cả migrations theo thứ tự

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

async function runAllMigrations() {
  try {
    console.log('🔄 Running all database migrations...\n');
    
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically (001, 002, ...)
    
    console.log(`Found ${files.length} migration files\n`);
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      console.log(`📄 Running: ${file}`);
      
      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
        console.log(`   ✅ ${file} completed\n`);
      } catch (err) {
        // Ignore errors for migrations that already ran
        if (err.message.includes('already exists') || 
            err.message.includes('duplicate') ||
            err.message.includes('does not exist')) {
          console.log(`   ⚠️  ${file} skipped (already applied or not applicable)\n`);
        } else {
          console.error(`   ❌ ${file} failed:`, err.message);
          throw err;
        }
      }
    }
    
    console.log('✅ All migrations completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAllMigrations();

