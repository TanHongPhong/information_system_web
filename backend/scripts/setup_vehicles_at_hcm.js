// Script để setup xe ở HCM
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupVehiclesAtHCM() {
  try {
    console.log('🚚 Setting up vehicles at HCM...\n');

    // 1. Lấy các công ty có route HCM → Cần Thơ
    console.log('1️⃣ Finding companies with HCM → Cần Thơ routes:');
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
        AND r.origin_region = 'HCM'
        AND r.destination_region = 'Cần Thơ'
      ORDER BY lc.company_id;
    `);
    console.log(`   Found ${companies.rows.length} companies:`);
    companies.rows.forEach(c => {
      console.log(`   - ${c.company_name} (route_id: ${c.route_id})`);
    });

    if (companies.rows.length === 0) {
      console.log('   ⚠️ No companies with HCM → Cần Thơ routes found!');
      return;
    }

    // 2. Lấy một số xe từ mỗi công ty (xe có status = AVAILABLE và chưa ở HCM)
    console.log('\n2️⃣ Finding available vehicles for each company:');
    for (const company of companies.rows) {
      const vehicles = await pool.query(`
        SELECT 
          v.vehicle_id,
          v.license_plate,
          v.current_location,
          get_region_from_address(v.current_location) as vehicle_region,
          v.status
        FROM "Vehicles" v
        WHERE v.company_id = $1
          AND v.status = 'AVAILABLE'
          AND get_region_from_address(v.current_location) != 'HCM'
        ORDER BY v.vehicle_id
        LIMIT 2;
      `, [company.company_id]);

      console.log(`   ${company.company_name}: Found ${vehicles.rows.length} available vehicles (not at HCM)`);
      
      for (const vehicle of vehicles.rows) {
        // 3. Gán route HCM → Cần Thơ cho xe
        console.log(`   - Setting up ${vehicle.license_plate}...`);
        
        // Kiểm tra xem đã có VehicleRoutes chưa
        const routeCheck = await pool.query(`
          SELECT route_id
          FROM "Routes"
          WHERE company_id = $1
            AND origin_region = 'HCM'
            AND destination_region = 'Cần Thơ'
            AND is_active = TRUE
          LIMIT 1
        `, [company.company_id]);

        if (routeCheck.rows.length > 0) {
          const routeId = routeCheck.rows[0].route_id;
          
          // Tạo hoặc update VehicleRoutes
          await pool.query(`
            INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (vehicle_id, route_id) 
            DO UPDATE SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
          `, [vehicle.vehicle_id, routeId]);
          console.log(`     ✅ Route HCM → Cần Thơ assigned`);
        }

        // 4. Cập nhật vị trí xe thành "HCM" hoặc "TP.HCM"
        await pool.query(`
          UPDATE "Vehicles"
          SET current_location = 'TP.HCM',
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $1;
        `, [vehicle.vehicle_id]);
        console.log(`     ✅ Location updated to TP.HCM`);
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
      WHERE get_region_from_address(v.current_location) = 'HCM'
        AND r.origin_region = 'HCM'
        AND r.destination_region = 'Cần Thơ'
      ORDER BY lc.company_name, v.license_plate;
    `);
    console.log(`   Found ${verify.rows.length} vehicles at HCM with route to Cần Thơ:`);
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

setupVehiclesAtHCM();

