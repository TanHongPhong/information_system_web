// Script để tạo các tài khoản driver với password đã hash
// Usage: node scripts/create_driver_accounts.js

import pool from '../src/config/db.js';
import bcrypt from 'bcrypt';

const drivers = [
  { name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@driver.com', password: 'driver123' },
  { name: 'Trần Thị B', phone: '0902345678', email: 'tranthib@driver.com', password: 'driver123' },
  { name: 'Lê Văn C', phone: '0903456789', email: 'levanc@driver.com', password: 'driver123' },
  { name: 'Phạm Thị D', phone: '0904567890', email: 'phamthid@driver.com', password: 'driver123' },
  { name: 'Hoàng Văn E', phone: '0905678901', email: 'hoangvane@driver.com', password: 'driver123' },
  { name: 'Nguyễn Thị F', phone: '0906789012', email: 'nguyenthif@driver.com', password: 'driver123' },
  { name: 'Võ Văn G', phone: '0907890123', email: 'vovang@driver.com', password: 'driver123' },
  { name: 'Đặng Văn H', phone: '0908901234', email: 'dangvanh@driver.com', password: 'driver123' },
  { name: 'Bùi Thị I', phone: '0909012345', email: 'buithii@driver.com', password: 'driver123' },
  { name: 'Phan Văn J', phone: '0900123456', email: 'phanvanj@driver.com', password: 'driver123' },
  { name: 'Tân Hồng Phong', phone: '0394254331', email: 'tanhongphong30@gmail.com', password: 'driver123' },
];

async function createDriverAccounts() {
  try {
    console.log('🔄 Đang tạo các tài khoản driver...\n');

    // Cập nhật role check để cho phép 'driver'
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'transport_company', 'driver'));
    `);
    console.log('✅ Đã cập nhật role check\n');

    for (const driver of drivers) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(driver.password, 10);

        // Insert hoặc update user
        const result = await pool.query(`
          INSERT INTO users (name, phone, email, password, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (email) DO UPDATE
          SET name = EXCLUDED.name,
              phone = EXCLUDED.phone,
              password = EXCLUDED.password,
              role = 'driver',
              updated_at = CURRENT_TIMESTAMP
          RETURNING id, email, name;
        `, [driver.name, driver.phone, driver.email, hashedPassword]);

        console.log(`✅ Created/Updated: ${driver.name} (${driver.email}) - Password: ${driver.password}`);
      } catch (err) {
        console.error(`❌ Error creating ${driver.email}:`, err.message);
      }
    }

    console.log('\n✅ Hoàn thành tạo tài khoản driver!');
    console.log('\n📝 Danh sách tài khoản:');
    console.log('Email: [email] | Password: driver123');
    console.log('\n💡 Chạy migration 027 để link drivers với vehicles');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDriverAccounts();


