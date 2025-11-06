// Script để test filter xe theo vị trí
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testVehicleFilter() {
  try {
    console.log('🧪 Testing vehicle filter...\n');

    // 1. Kiểm tra xem có xe nào ở Cần Thơ không
    console.log('1️⃣ Checking vehicles at Cần Thơ:');
    const vehiclesAtCanTho = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status
      FROM "Vehicles" v
      WHERE get_region_from_address(v.current_location) = 'Cần Thơ'
         OR v.current_location ILIKE '%Cần Thơ%'
      LIMIT 10;
    `);
    console.log(`   Found ${vehiclesAtCanTho.rows.length} vehicles at Cần Thơ:`);
    vehiclesAtCanTho.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region}, status: ${v.status})`);
    });

    // 2. Kiểm tra function có tồn tại không
    console.log('\n2️⃣ Checking if function exists:');
    const functionCheck = await pool.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'get_available_vehicles_by_location_and_destination';
    `);
    if (functionCheck.rows.length > 0) {
      console.log('   ✅ Function exists');
    } else {
      console.log('   ❌ Function does NOT exist - need to run migration 036');
    }

    // 3. Test function với company_id = 1, origin = Cần Thơ, destination = HCM
    console.log('\n3️⃣ Testing function (if exists):');
    if (functionCheck.rows.length > 0) {
      try {
        const result = await pool.query(`
          SELECT * FROM get_available_vehicles_by_location_and_destination(1, 'Cần Thơ', 'HCM');
        `);
        console.log(`   Found ${result.rows.length} vehicles using function:`);
        result.rows.forEach(v => {
          console.log(`   - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region})`);
        });
      } catch (err) {
        console.log(`   ❌ Error calling function: ${err.message}`);
      }
    }

    // 4. Kiểm tra routes từ Cần Thơ đến HCM
    console.log('\n4️⃣ Checking routes from Cần Thơ to HCM:');
    const routes = await pool.query(`
      SELECT 
        r.route_id,
        r.route_name,
        r.origin_region,
        r.destination_region,
        r.company_id,
        lc.company_name
      FROM "Routes" r
      INNER JOIN "LogisticsCompany" lc ON r.company_id = lc.company_id
      WHERE r.is_active = TRUE
        AND (
          (r.origin_region = 'Cần Thơ' AND r.destination_region = 'HCM')
          OR (r.origin_region = 'HCM' AND r.destination_region = 'Cần Thơ')
        )
      LIMIT 10;
    `);
    console.log(`   Found ${routes.rows.length} routes:`);
    routes.rows.forEach(r => {
      console.log(`   - ${r.company_name}: ${r.origin_region} → ${r.destination_region}`);
    });

    // 5. Kiểm tra VehicleRoutes
    console.log('\n5️⃣ Checking vehicle routes:');
    const vehicleRoutes = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        r.origin_region,
        r.destination_region,
        r.route_name
      FROM "Vehicles" v
      INNER JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      INNER JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      WHERE get_region_from_address(v.current_location) = 'Cần Thơ'
         OR v.current_location ILIKE '%Cần Thơ%'
      LIMIT 10;
    `);
    console.log(`   Found ${vehicleRoutes.rows.length} vehicles with routes:`);
    vehicleRoutes.rows.forEach(vr => {
      console.log(`   - ${vr.license_plate}: ${vr.vehicle_region} → Route: ${vr.origin_region} → ${vr.destination_region}`);
    });

    // 6. Test query giống API
    console.log('\n6️⃣ Testing API query logic:');
    const apiQueryResult = await pool.query(`
      SELECT
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        r.route_id,
        r.route_name,
        r.origin_region,
        r.destination_region
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      WHERE v.company_id = 1
        AND v.status = 'AVAILABLE'
        AND (
          get_region_from_address(v.current_location) = 'Cần Thơ'
          OR (v.current_location IS NULL AND EXISTS(
            SELECT 1 FROM "VehicleRoutes" vr3
            INNER JOIN "Routes" r3 ON vr3.route_id = r3.route_id
            WHERE vr3.vehicle_id = v.vehicle_id
              AND vr3.is_active = TRUE
              AND r3.is_active = TRUE
              AND r3.origin_region = 'Cần Thơ'
              AND r3.destination_region = 'HCM'
          ))
          OR (v.current_location IS NOT NULL AND v.current_location ILIKE '%Cần Thơ%')
        )
        AND EXISTS(
          SELECT 1 FROM "VehicleRoutes" vr2
          INNER JOIN "Routes" r2 ON vr2.route_id = r2.route_id
          WHERE vr2.vehicle_id = v.vehicle_id
            AND vr2.is_active = TRUE
            AND r2.is_active = TRUE
            AND (
              (r2.origin_region = 'Cần Thơ' AND r2.destination_region = 'HCM')
              OR (r2.origin_region = 'HCM' AND r2.destination_region = 'Cần Thơ')
            )
        )
        AND NOT EXISTS(
          SELECT 1 FROM "CargoOrders" co
          WHERE co.vehicle_id = v.vehicle_id
            AND co.status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
        )
      ORDER BY v.license_plate;
    `);
    console.log(`   Found ${apiQueryResult.rows.length} vehicles using API query logic:`);
    apiQueryResult.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region})`);
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

testVehicleFilter();

