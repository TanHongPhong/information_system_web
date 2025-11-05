// Script để tạo tài khoản warehouse với password đã hash
// Chạy: node scripts/create_warehouse_accounts.js

import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.PSQLDB_CONNECTIONSTRING,
});

const warehouseAccounts = [
  { 
    name: 'Nguyễn Văn Kho', 
    phone: '0901111111', 
    email: 'warehouse1@warehouse.com', 
    password: 'warehouse123',
    warehouse_id: 1 // Kho đầu tiên
  },
  { 
    name: 'Trần Thị Kho', 
    phone: '0902222222', 
    email: 'warehouse2@warehouse.com', 
    password: 'warehouse123',
    warehouse_id: 1
  },
  { 
    name: 'Lê Văn Kho', 
    phone: '0903333333', 
    email: 'warehouse3@warehouse.com', 
    password: 'warehouse123',
    warehouse_id: 2 // Kho thứ hai
  },
  { 
    name: 'Phạm Thị Kho VT', 
    phone: '0904444444', 
    email: 'kho1@vtlogistics.com', 
    password: 'warehouse123',
    warehouse_id: 1 // VT Logistics warehouse
  },
  { 
    name: 'Hoàng Văn Kho Gemadept', 
    phone: '0905555555', 
    email: 'kho1@gemadept.com', 
    password: 'warehouse123',
    warehouse_id: 2 // Gemadept warehouse
  },
];

async function createWarehouseAccounts() {
  try {
    console.log('🔐 Đang tạo tài khoản warehouse...\n');

    // Đảm bảo role 'warehouse' được chấp nhận
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'transport_company', 'driver', 'warehouse'));
    `);
    console.log('✅ Đã cập nhật role check để cho phép "warehouse"\n');

    for (const account of warehouseAccounts) {
      try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(account.password, saltRounds);

        // Insert vào users table
        const result = await pool.query(`
          INSERT INTO users (name, phone, email, password, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'warehouse', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO UPDATE
          SET name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              password = EXCLUDED.password,
              role = 'warehouse',
              updated_at = CURRENT_TIMESTAMP
          RETURNING id, email, name;
        `, [account.name, account.phone, account.email, hashedPassword]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          console.log(`✅ Tạo thành công: ${user.email} (${user.name})`);
          console.log(`   Password: ${account.password}`);
          console.log(`   Warehouse ID: ${account.warehouse_id || 'N/A'}\n`);
        }
      } catch (err) {
        console.error(`❌ Lỗi khi tạo tài khoản ${account.email}:`, err.message);
      }
    }

    console.log('\n📋 Tóm tắt tài khoản warehouse:');
    console.log('================================');
    warehouseAccounts.forEach((acc, idx) => {
      console.log(`${idx + 1}. ${acc.email} / ${acc.password}`);
    });
    console.log('\n✅ Hoàn thành!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
}

createWarehouseAccounts();


