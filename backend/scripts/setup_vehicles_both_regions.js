// Script để setup xe ở cả HCM và Cần Thơ
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupVehiclesBothRegions() {
  try {
    console.log('🚚 Setting up vehicles at both HCM and Cần Thơ...\n');

    // Lấy tất cả công ty có route HCM ↔ Cần Thơ
    const companies = await pool.query(`
      SELECT DISTINCT 
        lc.company_id,
        lc.company_name
      FROM "LogisticsCompany" lc
      INNER JOIN "Routes" r ON lc.company_id = r.company_id
      WHERE r.is_active = TRUE
        AND (
          (r.origin_region = 'HCM' AND r.destination_region = 'Cần Thơ')
          OR (r.origin_region = 'Cần Thơ' AND r.destination_region = 'HCM')
        )
      ORDER BY lc.company_id;
    `);

    console.log(`Found ${companies.rows.length} companies\n`);

    for (const company of companies.rows) {
      console.log(`📦 Setting up ${company.company_name}...`);
      
      // Lấy route IDs
      const routes = await pool.query(`
        SELECT route_id, origin_region, destination_region
        FROM "Routes"
        WHERE company_id = $1
          AND is_active = TRUE
          AND (
            (origin_region = 'HCM' AND destination_region = 'Cần Thơ')
            OR (origin_region = 'Cần Thơ' AND destination_region = 'HCM')
          )
        ORDER BY origin_region;
      `, [company.company_id]);

      const hcmRoute = routes.rows.find(r => r.origin_region === 'HCM');
      const canThoRoute = routes.rows.find(r => r.origin_region === 'Cần Thơ');

      if (!hcmRoute || !canThoRoute) {
        console.log(`   ⚠️ Missing routes for ${company.company_name}`);
        continue;
      }

      // Lấy xe available
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
        ORDER BY v.vehicle_id;
      `, [company.company_id]);

      console.log(`   Found ${vehicles.rows.length} available vehicles`);

      // Chia đôi: một nửa ở HCM, một nửa ở Cần Thơ
      const half = Math.ceil(vehicles.rows.length / 2);
      const hcmVehicles = vehicles.rows.slice(0, half);
      const canThoVehicles = vehicles.rows.slice(half);

      // Setup xe ở HCM
      console.log(`   Setting up ${hcmVehicles.length} vehicles at HCM...`);
      for (const vehicle of hcmVehicles) {
        // Gán route HCM → Cần Thơ
        await pool.query(`
          INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active)
          VALUES ($1, $2, TRUE)
          ON CONFLICT (vehicle_id, route_id) 
          DO UPDATE SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
        `, [vehicle.vehicle_id, hcmRoute.route_id]);
        
        // Cập nhật vị trí
        await pool.query(`
          UPDATE "Vehicles"
          SET current_location = 'TP.HCM',
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $1;
        `, [vehicle.vehicle_id]);
        console.log(`     ✅ ${vehicle.license_plate} → HCM`);
      }

      // Setup xe ở Cần Thơ
      console.log(`   Setting up ${canThoVehicles.length} vehicles at Cần Thơ...`);
      for (const vehicle of canThoVehicles) {
        // Gán route Cần Thơ → HCM
        await pool.query(`
          INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active)
          VALUES ($1, $2, TRUE)
          ON CONFLICT (vehicle_id, route_id) 
          DO UPDATE SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
        `, [vehicle.vehicle_id, canThoRoute.route_id]);
        
        // Cập nhật vị trí
        await pool.query(`
          UPDATE "Vehicles"
          SET current_location = 'Cần Thơ',
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $1;
        `, [vehicle.vehicle_id]);
        console.log(`     ✅ ${vehicle.license_plate} → Cần Thơ`);
      }

      console.log('');
    }

    // Verify
    console.log('✅ Verification:');
    const verify = await pool.query(`
      SELECT 
        get_region_from_address(v.current_location) as vehicle_region,
        COUNT(*) as count
      FROM "Vehicles" v
      WHERE v.status = 'AVAILABLE'
        AND get_region_from_address(v.current_location) IN ('HCM', 'Cần Thơ')
      GROUP BY get_region_from_address(v.current_location)
      ORDER BY vehicle_region;
    `);
    
    verify.rows.forEach(v => {
      console.log(`   - ${v.vehicle_region}: ${v.count} vehicles`);
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

setupVehiclesBothRegions();

