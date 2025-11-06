// Script để test filter xe cho tất cả công ty
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAllCompaniesVehicles() {
  try {
    console.log('🧪 Testing vehicle filter for all companies...\n');

    // Lấy tất cả công ty
    const companies = await pool.query(`
      SELECT company_id, company_name
      FROM "LogisticsCompany"
      WHERE status = 'ACTIVE'
      ORDER BY company_id;
    `);

    console.log(`Found ${companies.rows.length} companies\n`);

    for (const company of companies.rows) {
      console.log(`📦 Testing ${company.company_name} (ID: ${company.company_id}):`);
      
      // Test 1: HCM → Cần Thơ
      const test1 = await pool.query(`
        SELECT * FROM get_available_vehicles_by_location_and_destination($1, 'HCM', 'Cần Thơ');
      `, [company.company_id]);
      
      console.log(`   HCM → Cần Thơ: ${test1.rows.length} vehicles`);
      test1.rows.forEach(v => {
        console.log(`     - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region})`);
        if (v.vehicle_region !== 'HCM' && v.vehicle_region !== 'UNKNOWN') {
          console.log(`       ⚠️ WARNING: Expected HCM, got ${v.vehicle_region}`);
        }
      });

      // Test 2: Cần Thơ → HCM
      const test2 = await pool.query(`
        SELECT * FROM get_available_vehicles_by_location_and_destination($1, 'Cần Thơ', 'HCM');
      `, [company.company_id]);
      
      console.log(`   Cần Thơ → HCM: ${test2.rows.length} vehicles`);
      test2.rows.forEach(v => {
        console.log(`     - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region})`);
        if (v.vehicle_region !== 'Cần Thơ' && v.vehicle_region !== 'UNKNOWN') {
          console.log(`       ⚠️ WARNING: Expected Cần Thơ, got ${v.vehicle_region}`);
        }
      });

      console.log('');
    }

    console.log('✅ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testAllCompaniesVehicles();

