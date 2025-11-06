// Script để test logic filter xe
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testVehicleFilterLogic() {
  try {
    console.log('🧪 Testing vehicle filter logic...\n');

    // Test case 1: Điểm đi = HCM, Điểm đến = Cần Thơ
    console.log('1️⃣ Test: Điểm đi = HCM, Điểm đến = Cần Thơ');
    console.log('   → Expected: Chỉ hiển thị xe ở HCM có route đến Cần Thơ\n');
    
    const test1 = await pool.query(`
      SELECT * FROM get_available_vehicles_by_location_and_destination(1, 'HCM', 'Cần Thơ');
    `);
    
    console.log(`   Found ${test1.rows.length} vehicles:`);
    test1.rows.forEach(v => {
      const location = v.current_location || 'NULL';
      const region = v.vehicle_region || 'UNKNOWN';
      console.log(`   - ${v.license_plate}: ${location} (region: ${region})`);
      if (region !== 'HCM' && region !== 'UNKNOWN') {
        console.log(`     ⚠️ WARNING: Vehicle region is ${region}, expected HCM!`);
      }
    });

    // Test case 2: Điểm đi = Cần Thơ, Điểm đến = HCM
    console.log('\n2️⃣ Test: Điểm đi = Cần Thơ, Điểm đến = HCM');
    console.log('   → Expected: Chỉ hiển thị xe ở Cần Thơ có route đến HCM\n');
    
    const test2 = await pool.query(`
      SELECT * FROM get_available_vehicles_by_location_and_destination(1, 'Cần Thơ', 'HCM');
    `);
    
    console.log(`   Found ${test2.rows.length} vehicles:`);
    test2.rows.forEach(v => {
      const location = v.current_location || 'NULL';
      const region = v.vehicle_region || 'UNKNOWN';
      console.log(`   - ${v.license_plate}: ${location} (region: ${region})`);
      if (region !== 'Cần Thơ' && region !== 'UNKNOWN') {
        console.log(`     ⚠️ WARNING: Vehicle region is ${region}, expected Cần Thơ!`);
      }
    });

    // Test case 3: Kiểm tra tất cả xe và vị trí của chúng
    console.log('\n3️⃣ All vehicles and their locations:');
    const allVehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        v.company_id
      FROM "Vehicles" v
      WHERE v.company_id = 1
      ORDER BY v.vehicle_id;
    `);
    
    console.log(`   Found ${allVehicles.rows.length} vehicles:`);
    allVehicles.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: ${v.current_location || 'NULL'} (region: ${v.vehicle_region || 'UNKNOWN'}, status: ${v.status})`);
    });

    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testVehicleFilterLogic();

