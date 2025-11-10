// Script kiểm tra regions trong database
import pool from '../src/config/db.js';

async function checkRegions() {
  try {
    console.log('🔍 Kiểm tra regions trong database...\n');

    // 1. Kiểm tra Routes
    console.log('1️⃣ Kiểm tra Routes:');
    const routesResult = await pool.query(`
      SELECT DISTINCT origin_region as region
      FROM "Routes"
      WHERE is_active = TRUE
      UNION
      SELECT DISTINCT destination_region as region
      FROM "Routes"
      WHERE is_active = TRUE
      ORDER BY region ASC
    `);
    console.log(`   Tìm thấy ${routesResult.rows.length} regions từ Routes:`);
    routesResult.rows.forEach(r => console.log(`   - ${r.region}`));

    // 2. Kiểm tra CompanyAreas
    console.log('\n2️⃣ Kiểm tra CompanyAreas:');
    const areasResult = await pool.query(`
      SELECT DISTINCT area as region
      FROM "CompanyAreas"
      ORDER BY area ASC
    `);
    console.log(`   Tìm thấy ${areasResult.rows.length} regions từ CompanyAreas:`);
    areasResult.rows.forEach(r => console.log(`   - ${r.region}`));

    // 3. Kiểm tra migration 055 đã chạy chưa
    console.log('\n3️⃣ Kiểm tra CompanyAreas có dữ liệu:');
    const countResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM "CompanyAreas"
    `);
    const count = parseInt(countResult.rows[0].count);
    console.log(`   Tổng số records trong CompanyAreas: ${count}`);
    
    if (count === 0) {
      console.log('\n⚠️  WARNING: CompanyAreas trống!');
      console.log('   Cần chạy migration 055: backend/migrations/055_add_company_areas_4_regions.sql');
    } else {
      console.log('   ✅ CompanyAreas có dữ liệu');
    }

    // 4. Tổng hợp
    const allRegions = [
      ...new Set([
        ...routesResult.rows.map(r => r.region),
        ...areasResult.rows.map(r => r.region),
        'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'HCM'
      ])
    ].sort();

    console.log('\n📋 Tổng hợp tất cả regions:');
    allRegions.forEach(r => console.log(`   - ${r}`));

    console.log('\n✅ Kiểm tra hoàn tất!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

checkRegions();

