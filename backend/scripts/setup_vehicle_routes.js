// Script Node.js để setup routes cho xe
// Chạy: node scripts/setup_vehicle_routes.js

import pool from '../src/config/db.js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupVehicleRoutes() {
  try {
    console.log('🚀 Bắt đầu setup routes cho xe...\n');

    // Đọc file migration SQL
    const migrationPath = join(__dirname, '../migrations/034_setup_vehicle_routes_complete.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    // Chạy migration
    console.log('📝 Đang chạy migration...');
    await pool.query(sql);
    
    console.log('\n✅ Hoàn tất setup routes!\n');
    
    // Kiểm tra kết quả
    console.log('📊 Thống kê:');
    
    const routesCount = await pool.query('SELECT COUNT(*) as count FROM "Routes" WHERE is_active = TRUE');
    console.log(`   - Routes: ${routesCount.rows[0].count}`);
    
    const vehiclesWithRoutes = await pool.query('SELECT COUNT(DISTINCT vehicle_id) as count FROM "VehicleRoutes" WHERE is_active = TRUE');
    console.log(`   - Xe đã được gán route: ${vehiclesWithRoutes.rows[0].count}`);
    
    const warehouseCount = await pool.query(`
      SELECT COUNT(*) as count 
      FROM "Warehouses" 
      WHERE status = 'ACTIVE'
        AND (
          warehouse_name ILIKE '%HCM%' 
          OR warehouse_name ILIKE '%Hồ Chí Minh%'
          OR address ILIKE '%HCM%'
          OR address ILIKE '%Hồ Chí Minh%'
        )
    `);
    console.log(`   - Warehouse HCM: ${warehouseCount.rows[0].count}\n`);
    
    // Hiển thị danh sách xe và route
    console.log('🚛 Danh sách xe và route của chúng:');
    const vehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.driver_name,
        lc.company_name,
        r.route_name,
        r.origin_region,
        r.destination_region
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      ORDER BY lc.company_name, v.license_plate
      LIMIT 20
    `);
    
    vehicles.rows.forEach(vehicle => {
      if (vehicle.route_name) {
        console.log(`   - ${vehicle.license_plate} (${vehicle.driver_name || 'Chưa phân công'}) - ${vehicle.company_name} - ${vehicle.route_name}`);
      } else {
        console.log(`   - ${vehicle.license_plate} (${vehicle.driver_name || 'Chưa phân công'}) - ${vehicle.company_name} - Chưa có route`);
      }
    });
    
    console.log('\n✅ Setup hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupVehicleRoutes();

