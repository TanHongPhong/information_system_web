// Script để kiểm tra xe 51C-11111
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkVehicle51C() {
  try {
    console.log('🔍 Checking vehicle 51C-11111...\n');

    const vehicle = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        v.status,
        v.company_id
      FROM "Vehicles" v
      WHERE v.license_plate = '51C-11111';
    `);

    if (vehicle.rows.length === 0) {
      console.log('❌ Vehicle not found');
      return;
    }

    const v = vehicle.rows[0];
    console.log(`Vehicle: ${v.license_plate}`);
    console.log(`Location: ${v.current_location}`);
    console.log(`Region: ${v.vehicle_region}`);
    console.log(`Status: ${v.status}`);
    console.log(`Company ID: ${v.company_id}\n`);

    // Kiểm tra routes
    const routes = await pool.query(`
      SELECT 
        r.route_id,
        r.origin_region,
        r.destination_region,
        r.is_active,
        vr.is_active as vr_active
      FROM "VehicleRoutes" vr
      INNER JOIN "Routes" r ON vr.route_id = r.route_id
      WHERE vr.vehicle_id = $1;
    `, [v.vehicle_id]);
    
    console.log(`Routes (${routes.rows.length}):`);
    routes.rows.forEach(r => {
      console.log(`  - ${r.origin_region} → ${r.destination_region} (route_active: ${r.is_active}, vr_active: ${r.vr_active})`);
    });

    // Kiểm tra đơn hàng active
    const orders = await pool.query(`
      SELECT 
        order_id,
        status,
        vehicle_id
      FROM "CargoOrders"
      WHERE vehicle_id = $1
        AND status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED');
    `, [v.vehicle_id]);
    
    console.log(`\nActive orders (${orders.rows.length}):`);
    orders.rows.forEach(o => {
      console.log(`  - Order ${o.order_id}: ${o.status}`);
    });

    // Test function
    console.log('\nTesting function:');
    const test = await pool.query(`
      SELECT * FROM get_available_vehicles_by_location_and_destination($1, 'Cần Thơ', 'HCM');
    `, [v.company_id]);
    
    console.log(`Found ${test.rows.length} vehicles:`);
    test.rows.forEach(t => {
      console.log(`  - ${t.license_plate}: ${t.current_location} (region: ${t.vehicle_region})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkVehicle51C();

