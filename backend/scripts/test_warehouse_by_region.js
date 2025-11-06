// Script để test API warehouse by region
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function testWarehouseByRegion() {
  try {
    console.log('🧪 Testing warehouse by region API...\n');

    const regions = ['HCM', 'Cần Thơ', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng'];

    for (const region of regions) {
      console.log(`📍 Testing region: ${region}`);
      
      const result = await pool.query(`
        SELECT 
          w.warehouse_id,
          w.warehouse_name,
          w.address,
          COALESCE(w.warehouse_name || ' - ' || w.address, w.warehouse_name) as full_address,
          get_region_from_address(w.address) as warehouse_region,
          get_region_from_address(w.warehouse_name) as name_region
        FROM "Warehouses" w
        WHERE w.status = 'ACTIVE'
          AND (
            get_region_from_address(w.address) = $1
            OR get_region_from_address(w.warehouse_name) = $1
            OR w.warehouse_name ILIKE '%' || $1 || '%'
            OR w.address ILIKE '%' || $1 || '%'
          )
        ORDER BY 
          CASE 
            WHEN get_region_from_address(w.address) = $1 THEN 1
            WHEN get_region_from_address(w.warehouse_name) = $1 THEN 2
            ELSE 3
          END,
          w.warehouse_id
        LIMIT 1;
      `, [region]);

      if (result.rows.length > 0) {
        const w = result.rows[0];
        console.log(`   ✅ Found: ${w.warehouse_name}`);
        console.log(`      Address: ${w.address}`);
        console.log(`      Full: ${w.full_address}`);
        console.log(`      Region: ${w.warehouse_region || w.name_region || region}`);
      } else {
        console.log(`   ⚠️ Not found, will use default`);
      }
      console.log('');
    }

    console.log('✅ Test completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testWarehouseByRegion();

