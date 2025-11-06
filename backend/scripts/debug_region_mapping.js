// Script để debug region mapping
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugRegionMapping() {
  try {
    console.log('🔍 Debugging region mapping...\n');

    // Test get_region_from_address với các giá trị khác nhau
    const testCases = [
      'Cần Thơ',
      'TP.HCM',
      'HCM',
      'TP.Hồ Chí Minh',
      'Hồ Chí Minh'
    ];

    console.log('1️⃣ Testing get_region_from_address:');
    for (const testCase of testCases) {
      const result = await pool.query(`
        SELECT get_region_from_address($1) as region;
      `, [testCase]);
      console.log(`   "${testCase}" → ${result.rows[0].region}`);
    }

    // Kiểm tra LocationMapping
    console.log('\n2️⃣ LocationMapping entries:');
    const mappings = await pool.query(`
      SELECT * FROM "LocationMapping"
      ORDER BY priority DESC, address_keyword;
    `);
    console.log(`   Found ${mappings.rows.length} mappings:`);
    mappings.rows.slice(0, 20).forEach(m => {
      console.log(`   - ${m.address_keyword} → ${m.region} (priority: ${m.priority})`);
    });

    // Test với xe thật
    console.log('\n3️⃣ Testing with actual vehicles:');
    const vehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region
      FROM "Vehicles" v
      WHERE v.current_location IS NOT NULL
      ORDER BY v.vehicle_id
      LIMIT 10;
    `);
    
    vehicles.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: "${v.current_location}" → ${v.vehicle_region}`);
    });

    // Test function với debug
    console.log('\n4️⃣ Testing function with debug query:');
    const debugQuery = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        CASE 
          WHEN get_region_from_address(v.current_location) = 'Cần Thơ' THEN 'MATCH'
          ELSE 'NO MATCH'
        END as match_status
      FROM "Vehicles" v
      WHERE v.company_id = 1
        AND v.status = 'AVAILABLE'
        AND v.current_location IS NOT NULL
      ORDER BY v.vehicle_id;
    `);
    
    console.log(`   Found ${debugQuery.rows.length} vehicles:`);
    debugQuery.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: "${v.current_location}" → ${v.vehicle_region} (${v.match_status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

debugRegionMapping();

