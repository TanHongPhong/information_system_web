/**
 * Script để chạy các migration SQL
 * Usage: node scripts/run_migrations.js [migration_file]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  console.log(`📄 Reading migration: ${migrationFile}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log(`🚀 Running migration: ${migrationFile}`);
    await pool.query(sql);
    console.log(`✅ Migration completed: ${migrationFile}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`);
    console.error(error.message);
    process.exit(1);
  }
}

async function runAllMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📦 Found ${files.length} migration files`);
  
  for (const file of files) {
    await runMigration(file);
  }
  
  console.log(`\n✅ All migrations completed!`);
  await pool.end();
}

// Main
const migrationFile = process.argv[2];

if (migrationFile) {
  runMigration(migrationFile).then(() => {
    pool.end();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
} else {
  console.log('Usage: node scripts/run_migrations.js [migration_file]');
  console.log('Example: node scripts/run_migrations.js 044_add_declared_value_to_cargo_orders.sql');
  console.log('\nOr run all migrations:');
  runAllMigrations();
}

