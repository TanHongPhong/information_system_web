import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.PSQLDB_CONNECTIONSTRING,
});

async function testStrictFiltering() {
  try {
    console.log('🧪 Testing strict vehicle filtering...\n');
    
    // Test 1: Lấy company ID đầu tiên (VT Logistics)
    const companyResult = await pool.query(`
      SELECT company_id, company_name 
      FROM "LogisticsCompany" 
      WHERE company_name ILIKE '%VT%' OR company_name ILIKE '%Logistics%'
      LIMIT 1
    `);
    
    if (companyResult.rows.length === 0) {
      console.log('⚠️ No company found. Using company_id = 1');
      await testWithCompany(1);
    } else {
      const companyId = companyResult.rows[0].company_id;
      const companyName = companyResult.rows[0].company_name;
      console.log(`✅ Found company: ${companyName} (ID: ${companyId})\n`);
      await testWithCompany(companyId);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

async function testWithCompany(companyId) {
  // Test với HCM -> Cần Thơ
  console.log('📋 Test: HCM -> Cần Thơ');
  console.log('   Origin (điểm đi): HCM');
  console.log('   Destination (điểm đến): Cần Thơ');
  console.log('   Expected: Only AVAILABLE vehicles at HCM, no LOADING/IN_TRANSIT orders, capacity < 95%\n');
  
  const result = await pool.query(`
    SELECT * FROM get_available_vehicles_by_location_and_destination($1, $2, $3)
  `, [companyId, 'HCM', 'Cần Thơ']);
  
  console.log(`   Found ${result.rows.length} vehicles:\n`);
  if (result.rows.length > 0) {
    for (const v of result.rows) {
      console.log(`   ✅ ${v.license_plate}`);
      console.log(`      Status: ${v.status}`);
      console.log(`      Location: ${v.current_location || 'NULL'}`);
      console.log(`      Region: ${v.vehicle_region || 'UNKNOWN'}`);
      console.log(`      Route: ${v.route_name || 'N/A'}`);
      
      // Kiểm tra orders của xe này
      const ordersResult = await pool.query(`
        SELECT 
          order_id,
          status,
          weight_kg,
          (SELECT SUM(weight_kg) FROM "CargoOrders" WHERE vehicle_id = $1 AND status IN ('ACCEPTED', 'LOADING', 'IN_TRANSIT')) / 1000.0 as total_weight_ton
        FROM "CargoOrders"
        WHERE vehicle_id = $1
          AND status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
        LIMIT 5
      `, [v.vehicle_id]);
      
      if (ordersResult.rows.length > 0) {
        console.log(`      ⚠️ WARNING: Vehicle has active orders (should be filtered out):`);
        ordersResult.rows.forEach(o => {
          console.log(`         - Order ${o.order_id}: ${o.status}, ${o.weight_kg}kg`);
        });
      } else {
        // Tính capacity
        const capacityCheck = await pool.query(`
          SELECT 
            v.capacity_ton,
            COALESCE(SUM(co.weight_kg), 0) / 1000.0 as total_weight_ton,
            (COALESCE(SUM(co.weight_kg), 0) / 1000.0 / v.capacity_ton * 100) as load_percent
          FROM "Vehicles" v
          LEFT JOIN "CargoOrders" co ON co.vehicle_id = v.vehicle_id 
            AND co.status IN ('ACCEPTED', 'LOADING', 'IN_TRANSIT')
          WHERE v.vehicle_id = $1
          GROUP BY v.vehicle_id, v.capacity_ton
        `, [v.vehicle_id]);
        
        if (capacityCheck.rows.length > 0) {
          const cap = capacityCheck.rows[0];
          const loadPercent = parseFloat(cap.load_percent) || 0;
          console.log(`      Capacity: ${cap.capacity_ton} tons`);
          console.log(`      Current load: ${cap.total_weight_ton || 0} tons (${loadPercent.toFixed(1)}%)`);
          
          if (loadPercent >= 95) {
            console.log(`      ⚠️ WARNING: Vehicle is fully loaded (${loadPercent.toFixed(1)}%), should be filtered out!`);
          }
        }
      }
      console.log('');
    }
  } else {
    console.log('   ⚠️ No vehicles found!');
    
    // Debug: Kiểm tra tất cả xe trong company
    console.log('\n   🔍 Debug: Checking all vehicles in company...');
    const allVehicles = await pool.query(`
      SELECT 
        v.vehicle_id,
        v.license_plate,
        v.status,
        v.current_location,
        get_region_from_address(v.current_location) as vehicle_region,
        (SELECT COUNT(*) FROM "CargoOrders" co WHERE co.vehicle_id = v.vehicle_id AND co.status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')) as active_orders_count,
        (SELECT COALESCE(SUM(co.weight_kg), 0) / 1000.0 / v.capacity_ton * 100 FROM "CargoOrders" co WHERE co.vehicle_id = v.vehicle_id AND co.status IN ('ACCEPTED', 'LOADING', 'IN_TRANSIT')) as load_percent
      FROM "Vehicles" v
      WHERE v.company_id = $1
        AND get_region_from_address(v.current_location) = 'HCM'
      ORDER BY v.license_plate
      LIMIT 10
    `, [companyId]);
    
    console.log(`   Found ${allVehicles.rows.length} vehicles at HCM:`);
    allVehicles.rows.forEach((v, idx) => {
      console.log(`   ${idx + 1}. ${v.license_plate}: status=${v.status}, active_orders=${v.active_orders_count}, load=${v.load_percent || 0}%`);
    });
  }
}

testStrictFiltering();

