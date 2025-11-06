// Script để setup xe ở Cần Thơ
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupCanThoVehicles() {
  try {
    console.log('🚚 Setting up vehicles at Cần Thơ...\n');

    // 1. Lấy các công ty có route Cần Thơ → HCM
    console.log('1️⃣ Finding companies with Cần Thơ → HCM routes:');
    const companies = await pool.query(`
      SELECT DISTINCT 
        lc.company_id,
        lc.company_name,
        r.route_id,
        r.origin_region,
        r.destination_region
      FROM "LogisticsCompany" lc
      INNER JOIN "Routes" r ON lc.company_id = r.company_id
      WHERE r.is_active = TRUE
        AND r.origin_region = 'Cần Thơ'
        AND r.destination_region = 'HCM'
      ORDER BY lc.company_id;
    `);
    console.log(`   Found ${companies.rows.length} companies:`);
    companies.rows.forEach(c => {
      console.log(`   - ${c.company_name} (route_id: ${c.route_id})`);
    });

    if (companies.rows.length === 0) {
      console.log('   ⚠️ No companies with Cần Thơ → HCM routes found!');
      return;
    }

    // 2. Lấy một số xe từ mỗi công ty (xe có status = AVAILABLE)
    console.log('\n2️⃣ Finding available vehicles for each company:');
    for (const company of companies.rows) {
      const vehicles = await pool.query(`
        SELECT 
          v.vehicle_id,
          v.license_plate,
          v.current_location,
          v.status
        FROM "Vehicles" v
        WHERE v.company_id = $1
          AND v.status = 'AVAILABLE'
        ORDER BY v.vehicle_id
        LIMIT 2;
      `, [company.company_id]);

      console.log(`   ${company.company_name}: Found ${vehicles.rows.length} available vehicles`);
      
      for (const vehicle of vehicles.rows) {
        // 3. Gán route cho xe
        console.log(`   - Assigning route to ${vehicle.license_plate}...`);
        
        // Kiểm tra xem đã có VehicleRoutes chưa
        const existingVR = await pool.query(`
          SELECT vr.vehicle_route_id
          FROM "VehicleRoutes" vr
          WHERE vr.vehicle_id = $1
            AND vr.route_id = $2
        `, [vehicle.vehicle_id, company.route_id]);

        if (existingVR.rows.length === 0) {
          // Tạo VehicleRoutes mới
          await pool.query(`
            INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (vehicle_id, route_id) 
            DO UPDATE SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
          `, [vehicle.vehicle_id, company.route_id]);
          console.log(`     ✅ Route assigned`);
        } else {
          // Update existing
          await pool.query(`
            UPDATE "VehicleRoutes"
            SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE vehicle_id = $1 AND route_id = $2;
          `, [vehicle.vehicle_id, company.route_id]);
          console.log(`     ✅ Route updated`);
        }

        // 4. Cập nhật vị trí xe thành "Cần Thơ"
        await pool.query(`
          UPDATE "Vehicles"
          SET current_location = 'Cần Thơ',
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $1;
        `, [vehicle.vehicle_id]);
        console.log(`     ✅ Location updated to Cần Thơ`);
      }
    }

    // 5. Verify kết quả
    console.log('\n3️⃣ Verifying results:');
    const verify = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        lc.company_name,
        r.route_name,
        r.origin_region,
        r.destination_region
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      INNER JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      INNER JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      WHERE get_region_from_address(v.current_location) = 'Cần Thơ'
        AND r.origin_region = 'Cần Thơ'
        AND r.destination_region = 'HCM'
      ORDER BY lc.company_name, v.license_plate;
    `);
    console.log(`   Found ${verify.rows.length} vehicles at Cần Thơ with route to HCM:`);
    verify.rows.forEach(v => {
      console.log(`   ✅ ${v.license_plate} (${v.company_name}): ${v.current_location} → Route: ${v.origin_region} → ${v.destination_region}`);
    });

    console.log('\n✅ Setup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupCanThoVehicles();

