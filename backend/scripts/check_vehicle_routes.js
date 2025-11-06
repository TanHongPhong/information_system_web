// Script để kiểm tra routes của xe
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkVehicleRoutes() {
  try {
    console.log('🔍 Checking vehicle routes...\n');

    // Kiểm tra xe ở Cần Thơ
    console.log('1️⃣ Vehicles at Cần Thơ:');
    const canThoVehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        v.company_id,
        lc.company_name
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      WHERE get_region_from_address(v.current_location) = 'Cần Thơ'
        AND v.status = 'AVAILABLE'
      ORDER BY v.company_id, v.vehicle_id;
    `);
    
    console.log(`   Found ${canThoVehicles.rows.length} vehicles:`);
    for (const vehicle of canThoVehicles.rows) {
      console.log(`   - ${vehicle.license_plate} (${vehicle.company_name}): ${vehicle.current_location}`);
      
      // Kiểm tra routes của xe này
      const routes = await pool.query(`
        SELECT 
          r.route_id,
          r.route_name,
          r.origin_region,
          r.destination_region,
          vr.is_active as vr_active,
          r.is_active as route_active
        FROM "VehicleRoutes" vr
        INNER JOIN "Routes" r ON vr.route_id = r.route_id
        WHERE vr.vehicle_id = $1
          AND vr.is_active = TRUE
          AND r.is_active = TRUE
        ORDER BY r.origin_region;
      `, [vehicle.vehicle_id]);
      
      console.log(`     Routes (${routes.rows.length}):`);
      routes.rows.forEach(r => {
        console.log(`       - ${r.origin_region} → ${r.destination_region} (route_id: ${r.route_id})`);
      });
    }

    // Test function với company_id = 1
    console.log('\n2️⃣ Testing function with company_id = 1, origin = Cần Thơ, dest = HCM:');
    const test = await pool.query(`
      SELECT * FROM get_available_vehicles_by_location_and_destination(1, 'Cần Thơ', 'HCM');
    `);
    
    console.log(`   Found ${test.rows.length} vehicles:`);
    test.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region})`);
    });

    // Kiểm tra route Cần Thơ → HCM có tồn tại không
    console.log('\n3️⃣ Checking routes Cần Thơ → HCM for company_id = 1:');
    const routesCheck = await pool.query(`
      SELECT 
        r.route_id,
        r.route_name,
        r.origin_region,
        r.destination_region,
        r.is_active
      FROM "Routes" r
      WHERE r.company_id = 1
        AND r.origin_region = 'Cần Thơ'
        AND r.destination_region = 'HCM'
        AND r.is_active = TRUE;
    `);
    
    console.log(`   Found ${routesCheck.rows.length} routes:`);
    routesCheck.rows.forEach(r => {
      console.log(`   - Route ID: ${r.route_id}, ${r.origin_region} → ${r.destination_region}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkVehicleRoutes();

