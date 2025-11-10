// Script để cập nhật password cho tất cả tài khoản thành "123456"
import pool from '../src/config/db.js';
import bcrypt from 'bcrypt';

const NEW_PASSWORD = '123456';

async function updateAllPasswords() {
  try {
    console.log('🔐 Starting password update process...');
    console.log(`📝 New password: ${NEW_PASSWORD}`);
    
    // Hash password mới
    console.log('⏳ Hashing password...');
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log('✅ Password hashed successfully');
    console.log(`🔑 Hash: ${hashedPassword}`);
    
    // Verify hash
    const verifyResult = await bcrypt.compare(NEW_PASSWORD, hashedPassword);
    if (!verifyResult) {
      throw new Error('Password hash verification failed!');
    }
    console.log('✅ Hash verification: PASSED');
    
    // Cập nhật password cho users table
    console.log('\n📊 Updating users table...');
    const usersResult = await pool.query(
      `UPDATE users 
       SET password = $1, updated_at = NOW() 
       WHERE email IS NOT NULL`,
      [hashedPassword]
    );
    console.log(`✅ Updated ${usersResult.rowCount} user passwords`);
    
    // Cập nhật password cho TransportCompanyAdmin table
    console.log('\n📊 Updating TransportCompanyAdmin table...');
    const adminResult = await pool.query(
      `UPDATE "TransportCompanyAdmin" 
       SET password = $1, updated_at = NOW() 
       WHERE email IS NOT NULL`,
      [hashedPassword]
    );
    console.log(`✅ Updated ${adminResult.rowCount} admin passwords`);
    
    console.log('\n🎉 === PASSWORD UPDATE COMPLETED ===');
    console.log(`📝 Total users updated: ${usersResult.rowCount}`);
    console.log(`📝 Total admins updated: ${adminResult.rowCount}`);
    console.log(`\n🔑 All passwords have been set to: ${NEW_PASSWORD}`);
    console.log('\n📋 Sample accounts to test:');
    console.log('   - admin@vtlogistics.com / 123456');
    console.log('   - customer1@example.com / 123456');
    console.log('   - driver1@vtlogistics.com / 123456');
    console.log('   - warehouse1@vtlogistics.com / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    process.exit(1);
  }
}

updateAllPasswords();

