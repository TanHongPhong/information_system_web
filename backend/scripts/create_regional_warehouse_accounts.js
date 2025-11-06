// Script để tạo tài khoản warehouse theo khu vực với password đã hash
// Chạy: node scripts/create_regional_warehouse_accounts.js

import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.PSQLDB_CONNECTIONSTRING,
});

async function createRegionalWarehouseAccounts() {
  try {
    console.log('🔐 Đang tạo tài khoản warehouse theo khu vực...\n');

    // Lấy danh sách warehouse từ database
    const warehousesResult = await pool.query(`
      SELECT warehouse_id, warehouse_name, address
      FROM "Warehouses"
      WHERE company_id IS NULL
        AND warehouse_name IN ('Kho HCM', 'Kho Cần Thơ', 'Kho Đà Nẵng', 'Kho Hà Nội')
      ORDER BY 
        CASE warehouse_name
          WHEN 'Kho HCM' THEN 1
          WHEN 'Kho Cần Thơ' THEN 2
          WHEN 'Kho Đà Nẵng' THEN 3
          WHEN 'Kho Hà Nội' THEN 4
        END
    `);

    if (warehousesResult.rows.length === 0) {
      console.error('❌ Không tìm thấy warehouse nào. Vui lòng chạy migration 039 trước!');
      await pool.end();
      return;
    }

    console.log(`✅ Tìm thấy ${warehousesResult.rows.length} warehouse:\n`);
    warehousesResult.rows.forEach(w => {
      console.log(`   - ${w.warehouse_name} (ID: ${w.warehouse_id})`);
    });
    console.log('');

    // Đảm bảo role 'warehouse' được chấp nhận
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('user', 'transport_company', 'driver', 'warehouse'));
    `);
    console.log('✅ Đã cập nhật role check để cho phép "warehouse"\n');

    // Tạo tài khoản cho mỗi warehouse
    const warehouseAccounts = [];
    
    for (const warehouse of warehousesResult.rows) {
      let email, name, phone;
      
      // Tạo email và name dựa trên warehouse_name
      if (warehouse.warehouse_name === 'Kho HCM') {
        email = 'kho.hcm@warehouse.com';
        name = 'Nguyễn Văn HCM';
        phone = '0901111111';
      } else if (warehouse.warehouse_name === 'Kho Cần Thơ') {
        email = 'kho.cantho@warehouse.com';
        name = 'Trần Thị Cần Thơ';
        phone = '0902222222';
      } else if (warehouse.warehouse_name === 'Kho Đà Nẵng') {
        email = 'kho.danang@warehouse.com';
        name = 'Lê Văn Đà Nẵng';
        phone = '0903333333';
      } else if (warehouse.warehouse_name === 'Kho Hà Nội') {
        email = 'kho.hanoi@warehouse.com';
        name = 'Phạm Thị Hà Nội';
        phone = '0904444444';
      } else {
        // Skip nếu không match
        continue;
      }
      
      warehouseAccounts.push({
        email,
        name,
        phone,
        password: 'warehouse123',
        warehouse_id: warehouse.warehouse_id,
        warehouse_name: warehouse.warehouse_name
      });
    }

    // Hash password và insert vào database
    for (const account of warehouseAccounts) {
      try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(account.password, saltRounds);

        // Insert vào users table với warehouse_id
        const result = await pool.query(`
          INSERT INTO users (name, phone, email, password, role, warehouse_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'warehouse', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO UPDATE
          SET name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              password = EXCLUDED.password,
              role = 'warehouse',
              warehouse_id = EXCLUDED.warehouse_id,
              updated_at = CURRENT_TIMESTAMP
          RETURNING id, email, name, warehouse_id;
        `, [account.name, account.phone, account.email, hashedPassword, account.warehouse_id]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          console.log(`✅ Tạo thành công: ${user.email} (${user.name})`);
          console.log(`   Warehouse: ${account.warehouse_name} (ID: ${user.warehouse_id})`);
          console.log(`   Password: ${account.password}\n`);
        }
      } catch (err) {
        console.error(`❌ Lỗi khi tạo tài khoản ${account.email}:`, err.message);
      }
    }

    console.log('\n📋 Tóm tắt tài khoản warehouse:');
    console.log('================================');
    warehouseAccounts.forEach((acc, idx) => {
      console.log(`${idx + 1}. ${acc.email} / ${acc.password}`);
      console.log(`   → ${acc.warehouse_name} (ID: ${acc.warehouse_id})\n`);
    });
    
    console.log('✅ Hoàn thành!');
    console.log('\n📝 Lưu ý:');
    console.log('   - Mỗi tài khoản warehouse chỉ có thể xem đơn hàng của warehouse của mình');
    console.log('   - Đơn hàng được filter tự động dựa trên warehouse_id của user');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
}

createRegionalWarehouseAccounts();

