// Script để kiểm tra và cập nhật vị trí xe
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndUpdateVehicleLocations() {
  try {
    console.log('🔍 Checking vehicle locations...\n');

    // 1. Xem tất cả xe và vị trí của chúng
    console.log('1️⃣ All vehicles and their locations:');
    const allVehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        v.company_id,
        lc.company_name
      FROM "Vehicles" v
      LEFT JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      ORDER BY v.company_id, v.vehicle_id
      LIMIT 20;
    `);
    console.log(`   Found ${allVehicles.rows.length} vehicles:`);
    allVehicles.rows.forEach(v => {
      console.log(`   - ${v.license_plate} (Company: ${v.company_name}): ${v.current_location || 'NULL'} (region: ${v.vehicle_region || 'UNKNOWN'}, status: ${v.status})`);
    });

    // 2. Xem các region có trong LocationMapping
    console.log('\n2️⃣ Available regions in LocationMapping:');
    const regions = await pool.query(`
      SELECT DISTINCT region 
      FROM "LocationMapping" 
      ORDER BY region;
    `);
    console.log(`   Available regions: ${regions.rows.map(r => r.region).join(', ')}`);

    // 3. Tìm xe có route đến Cần Thơ và cập nhật vị trí
    console.log('\n3️⃣ Finding vehicles with routes to/from Cần Thơ:');
    const vehiclesWithCanThoRoutes = await pool.query(`
      SELECT DISTINCT
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        v.company_id,
        r.origin_region,
        r.destination_region,
        r.route_name
      FROM "Vehicles" v
      INNER JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      INNER JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      WHERE (r.origin_region = 'Cần Thơ' OR r.destination_region = 'Cần Thơ')
      ORDER BY v.vehicle_id;
    `);
    console.log(`   Found ${vehiclesWithCanThoRoutes.rows.length} vehicles with Cần Thơ routes:`);
    vehiclesWithCanThoRoutes.rows.forEach(v => {
      console.log(`   - ${v.license_plate}: Route ${v.origin_region} → ${v.destination_region}, Current: ${v.current_location || 'NULL'}`);
    });

    // 4. Cập nhật vị trí xe có route từ Cần Thơ thành "Cần Thơ"
    console.log('\n4️⃣ Updating vehicle locations to Cần Thơ (if they have route from Cần Thơ):');
    const updateResult = await pool.query(`
      UPDATE "Vehicles" v
      SET current_location = 'Cần Thơ',
          updated_at = CURRENT_TIMESTAMP
      WHERE EXISTS(
        SELECT 1 FROM "VehicleRoutes" vr
        INNER JOIN "Routes" r ON vr.route_id = r.route_id
        WHERE vr.vehicle_id = v.vehicle_id
          AND vr.is_active = TRUE
          AND r.is_active = TRUE
          AND r.origin_region = 'Cần Thơ'
          AND r.destination_region = 'HCM'
      )
      AND (v.current_location IS NULL OR v.current_location = '' OR v.current_location != 'Cần Thơ')
      RETURNING v.vehicle_id, v.license_plate, v.current_location;
    `);
    console.log(`   Updated ${updateResult.rows.length} vehicles:`);
    updateResult.rows.forEach(v => {
      console.log(`   ✅ ${v.license_plate}: ${v.current_location}`);
    });

    // 5. Kiểm tra lại sau khi cập nhật
    console.log('\n5️⃣ Re-checking vehicles at Cần Thơ:');
    const vehiclesAtCanTho = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        lc.company_name
      FROM "Vehicles" v
      LEFT JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      WHERE get_region_from_address(v.current_location) = 'Cần Thơ'
         OR v.current_location ILIKE '%Cần Thơ%'
      ORDER BY v.company_id;
    `);
    console.log(`   Found ${vehiclesAtCanTho.rows.length} vehicles at Cần Thơ:`);
    vehiclesAtCanTho.rows.forEach(v => {
      console.log(`   - ${v.license_plate} (${v.company_name}): ${v.current_location} (region: ${v.vehicle_region})`);
    });

    console.log('\n✅ Check completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAndUpdateVehicleLocations();

