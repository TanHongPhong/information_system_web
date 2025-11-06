// Script để debug function chi tiết
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugFunctionDetailed() {
  try {
    console.log('🔍 Debugging function in detail...\n');

    // Test với xe cụ thể: 51C-11111 ở Cần Thơ
    const vehicleId = await pool.query(`
      SELECT vehicle_id FROM "Vehicles" WHERE license_plate = '51C-11111';
    `);
    
    if (vehicleId.rows.length === 0) {
      console.log('❌ Vehicle not found');
      return;
    }

    const vId = vehicleId.rows[0].vehicle_id;
    console.log(`Testing with vehicle_id = ${vId} (51C-11111)\n`);

    // 1. Kiểm tra vị trí xe
    console.log('1️⃣ Vehicle location:');
    const location = await pool.query(`
      SELECT 
        current_location,
        get_region_from_address(current_location) as vehicle_region
      FROM "Vehicles"
      WHERE vehicle_id = $1;
    `, [vId]);
    console.log(`   Location: "${location.rows[0].current_location}"`);
    console.log(`   Region: ${location.rows[0].vehicle_region}`);
    console.log(`   Match with 'Cần Thơ': ${location.rows[0].vehicle_region === 'Cần Thơ' ? 'YES' : 'NO'}`);

    // 2. Kiểm tra routes
    console.log('\n2️⃣ Vehicle routes:');
    const routes = await pool.query(`
      SELECT 
        r.route_id,
        r.origin_region,
        r.destination_region,
        r.is_active,
        vr.is_active as vr_active
      FROM "VehicleRoutes" vr
      INNER JOIN "Routes" r ON vr.route_id = r.route_id
      WHERE vr.vehicle_id = $1
        AND vr.is_active = TRUE;
    `, [vId]);
    
    console.log(`   Found ${routes.rows.length} active routes:`);
    routes.rows.forEach(r => {
      const hasRoute = (r.origin_region === 'Cần Thơ' && r.destination_region === 'HCM') ||
                       (r.origin_region === 'HCM' && r.destination_region === 'Cần Thơ');
      console.log(`   - ${r.origin_region} → ${r.destination_region} (route_active: ${r.is_active}, vr_active: ${r.vr_active}) ${hasRoute ? '✅' : ''}`);
    });

    // 3. Kiểm tra điều kiện EXISTS
    console.log('\n3️⃣ Checking EXISTS condition:');
    const existsCheck = await pool.query(`
      SELECT EXISTS(
        SELECT 1 FROM "VehicleRoutes" vr2
        INNER JOIN "Routes" r2 ON vr2.route_id = r2.route_id
        WHERE vr2.vehicle_id = $1
          AND vr2.is_active = TRUE
          AND r2.is_active = TRUE
          AND (
            (r2.origin_region = 'Cần Thơ' AND r2.destination_region = 'HCM')
            OR (r2.origin_region = 'HCM' AND r2.destination_region = 'Cần Thơ')
          )
      ) as has_route;
    `, [vId]);
    console.log(`   Has route Cần Thơ ↔ HCM: ${existsCheck.rows[0].has_route}`);

    // 4. Kiểm tra điều kiện vị trí
    console.log('\n4️⃣ Checking location condition:');
    const locationCheck = await pool.query(`
      SELECT 
        get_region_from_address(current_location) = 'Cần Thơ' as matches_origin,
        current_location IS NULL as is_null,
        current_location = '' as is_empty,
        get_region_from_address(current_location) = 'UNKNOWN' as is_unknown
      FROM "Vehicles"
      WHERE vehicle_id = $1;
    `, [vId]);
    const loc = locationCheck.rows[0];
    console.log(`   Matches origin (Cần Thơ): ${loc.matches_origin}`);
    console.log(`   Is NULL: ${loc.is_null}`);
    console.log(`   Is empty: ${loc.is_empty}`);
    console.log(`   Is UNKNOWN: ${loc.is_unknown}`);

    // 5. Test full query như trong function
    console.log('\n5️⃣ Testing full query (like in function):');
    const fullQuery = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      WHERE v.company_id = 1
        AND v.status = 'AVAILABLE'
        AND (
          get_region_from_address(v.current_location) = 'Cần Thơ'
          OR (
            (v.current_location IS NULL OR v.current_location = '' OR get_region_from_address(v.current_location) = 'UNKNOWN')
            AND EXISTS(
              SELECT 1 FROM "VehicleRoutes" vr_check
              INNER JOIN "Routes" r_check ON vr_check.route_id = r_check.route_id
              WHERE vr_check.vehicle_id = v.vehicle_id
                AND vr_check.is_active = TRUE
                AND r_check.is_active = TRUE
                AND r_check.origin_region = 'Cần Thơ'
                AND r_check.destination_region = 'HCM'
            )
          )
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
        );
    `);
    
    console.log(`   Found ${fullQuery.rows.length} vehicles:`);
    fullQuery.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: ${v.current_location} (region: ${v.vehicle_region})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

debugFunctionDetailed();

