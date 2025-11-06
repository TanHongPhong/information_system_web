// Script để cập nhật vị trí xe dựa trên route
// Chạy: node scripts/update_vehicle_locations.js

import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateVehicleLocations() {
  try {
    console.log('🚀 Bắt đầu cập nhật vị trí xe...\n');

    // Lấy tất cả xe chưa có vị trí hoặc vị trí rỗng
    const vehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.current_location,
        r.origin_region
      FROM "Vehicles" v
      LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      WHERE (v.current_location IS NULL OR v.current_location = '')
        AND r.origin_region IS NOT NULL
    `);

    console.log(`📋 Tìm thấy ${vehicles.rows.length} xe cần cập nhật vị trí\n`);

    for (const vehicle of vehicles.rows) {
      await pool.query(`
        UPDATE "Vehicles"
        SET current_location = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = $2
      `, [vehicle.origin_region, vehicle.vehicle_id]);
      
      console.log(`✅ Đã cập nhật vị trí cho xe ${vehicle.vehicle_id}: ${vehicle.origin_region}`);
    }

    console.log('\n✅ Hoàn tất cập nhật vị trí xe!');

    // Hiển thị thống kê
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE current_location IS NOT NULL AND current_location != '') as with_location,
        COUNT(*) FILTER (WHERE current_location IS NULL OR current_location = '') as without_location,
        COUNT(*) as total
      FROM "Vehicles"
    `);

    const statsRow = stats.rows[0];
    console.log('\n📊 Thống kê:');
    console.log(`   - Xe có vị trí: ${statsRow.with_location}`);
    console.log(`   - Xe chưa có vị trí: ${statsRow.without_location}`);
    console.log(`   - Tổng: ${statsRow.total}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateVehicleLocations();

