import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.PSQLDB_CONNECTIONSTRING,
});

async function testVehicleFilter() {
  try {
    console.log('🧪 Testing vehicle filter by origin_region...\n');
    
    // Test 1: Lấy company ID đầu tiên (VT Logistics)
    const companyResult = await pool.query(`
      SELECT company_id, company_name 
      FROM "LogisticsCompany" 
      WHERE company_name ILIKE '%VT%' OR company_name ILIKE '%Logistics%'
      LIMIT 1
    `);
    
    if (companyResult.rows.length === 0) {
      console.log('⚠️ No company found. Using company_id = 1');
      await testWithCompany(1);
    } else {
      const companyId = companyResult.rows[0].company_id;
      const companyName = companyResult.rows[0].company_name;
      console.log(`✅ Found company: ${companyName} (ID: ${companyId})\n`);
      await testWithCompany(companyId);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

async function testWithCompany(companyId) {
  // Test với HCM -> Cần Thơ
  console.log('📋 Test 1: HCM -> Cần Thơ');
  console.log('   Origin (điểm đi): HCM');
  console.log('   Destination (điểm đến): Cần Thơ');
  console.log('   Expected: Only vehicles currently at HCM\n');
  
  const result1 = await pool.query(`
    SELECT * FROM get_available_vehicles_by_location_and_destination($1, $2, $3)
  `, [companyId, 'HCM', 'Cần Thơ']);
  
  console.log(`   Found ${result1.rows.length} vehicles:`);
  if (result1.rows.length > 0) {
    result1.rows.forEach((v, idx) => {
      console.log(`   ${idx + 1}. ${v.license_plate}`);
      console.log(`      Status: ${v.status}`);
      console.log(`      Location: ${v.current_location || 'NULL'}`);
      console.log(`      Region: ${v.vehicle_region || 'UNKNOWN'}`);
      console.log(`      Route: ${v.route_name || 'N/A'}`);
    });
  } else {
    console.log('   ⚠️ No vehicles found!');
  }
  console.log('');
  
  // Test với Cần Thơ -> HCM
  console.log('📋 Test 2: Cần Thơ -> HCM');
  console.log('   Origin (điểm đi): Cần Thơ');
  console.log('   Destination (điểm đến): HCM');
  console.log('   Expected: Only vehicles currently at Cần Thơ\n');
  
  const result2 = await pool.query(`
    SELECT * FROM get_available_vehicles_by_location_and_destination($1, $2, $3)
  `, [companyId, 'Cần Thơ', 'HCM']);
  
  console.log(`   Found ${result2.rows.length} vehicles:`);
  if (result2.rows.length > 0) {
    result2.rows.forEach((v, idx) => {
      console.log(`   ${idx + 1}. ${v.license_plate}`);
      console.log(`      Status: ${v.status}`);
      console.log(`      Location: ${v.current_location || 'NULL'}`);
      console.log(`      Region: ${v.vehicle_region || 'UNKNOWN'}`);
      console.log(`      Route: ${v.route_name || 'N/A'}`);
    });
  } else {
    console.log('   ⚠️ No vehicles found!');
  }
  console.log('');
  
  // Debug: Kiểm tra tất cả xe trong company
  console.log('📋 Debug: All vehicles in company');
  const allVehicles = await pool.query(`
    SELECT 
      v.vehicle_id,
      v.license_plate,
      v.status,
      v.current_location,
      get_region_from_address(v.current_location) as vehicle_region,
      COUNT(vr.route_id) as route_count
    FROM "Vehicles" v
    LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
    WHERE v.company_id = $1
    GROUP BY v.vehicle_id, v.license_plate, v.status, v.current_location
    ORDER BY v.license_plate
    LIMIT 20
  `, [companyId]);
  
  console.log(`   Total vehicles checked: ${allVehicles.rows.length}`);
  allVehicles.rows.forEach((v, idx) => {
    console.log(`   ${idx + 1}. ${v.license_plate}: status=${v.status}, location="${v.current_location || 'NULL'}", region="${v.vehicle_region || 'UNKNOWN'}", routes=${v.route_count}`);
  });
}

testVehicleFilter();

