// Script để kiểm tra và tạo function get_warehouse_hcm_info nếu chưa có
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndCreateFunction() {
  try {
    console.log('🔍 Checking get_warehouse_hcm_info function...\n');

    // Kiểm tra function có tồn tại không
    const check = await pool.query(`
      SELECT proname 
      FROM pg_proc 
      WHERE proname = 'get_warehouse_hcm_info';
    `);

    if (check.rows.length > 0) {
      console.log('✅ Function exists');
      
      // Test function
      try {
        const result = await pool.query(`SELECT * FROM get_warehouse_hcm_info()`);
        console.log('✅ Function works:', result.rows[0]);
      } catch (err) {
        console.log('❌ Function error:', err.message);
        
        // Tạo lại function
        console.log('\n🔄 Recreating function...');
        await pool.query(`
          CREATE OR REPLACE FUNCTION get_warehouse_hcm_info()
          RETURNS TABLE (
            warehouse_name VARCHAR(255),
            address TEXT,
            full_address VARCHAR(255)
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
              COALESCE(w.warehouse_name, 'Kho HCM')::VARCHAR(255),
              COALESCE(w.address, '123 Đường ABC, Quận 1, TP. Hồ Chí Minh')::TEXT,
              COALESCE(w.warehouse_name || ' - ' || w.address, 'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh')::VARCHAR(255)
            FROM "Warehouses" w
            WHERE w.status = 'ACTIVE'
              AND (w.warehouse_name ILIKE '%HCM%' OR w.warehouse_name ILIKE '%Hồ Chí Minh%' OR w.address ILIKE '%HCM%' OR w.address ILIKE '%Hồ Chí Minh%')
            ORDER BY w.warehouse_id
            LIMIT 1;
            
            IF NOT FOUND THEN
              RETURN QUERY
              SELECT 
                'Kho HCM'::VARCHAR(255),
                '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::TEXT,
                'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::VARCHAR(255);
            END IF;
          END;
          $$ LANGUAGE plpgsql;
        `);
        console.log('✅ Function recreated');
        
        // Test lại
        const result2 = await pool.query(`SELECT * FROM get_warehouse_hcm_info()`);
        console.log('✅ Function now works:', result2.rows[0]);
      }
    } else {
      console.log('❌ Function does NOT exist');
      console.log('\n🔄 Creating function...');
      
      await pool.query(`
        CREATE OR REPLACE FUNCTION get_warehouse_hcm_info()
        RETURNS TABLE (
          warehouse_name VARCHAR(255),
          address TEXT,
          full_address VARCHAR(255)
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            COALESCE(w.warehouse_name, 'Kho HCM')::VARCHAR(255),
            COALESCE(w.address, '123 Đường ABC, Quận 1, TP. Hồ Chí Minh')::TEXT,
            COALESCE(w.warehouse_name || ' - ' || w.address, 'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh')::VARCHAR(255)
          FROM "Warehouses" w
          WHERE w.status = 'ACTIVE'
            AND (w.warehouse_name ILIKE '%HCM%' OR w.warehouse_name ILIKE '%Hồ Chí Minh%' OR w.address ILIKE '%HCM%' OR w.address ILIKE '%Hồ Chí Minh%')
          ORDER BY w.warehouse_id
          LIMIT 1;
          
          IF NOT FOUND THEN
            RETURN QUERY
            SELECT 
              'Kho HCM'::VARCHAR(255),
              '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::TEXT,
              'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::VARCHAR(255);
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('✅ Function created');
      
      // Test
      const result = await pool.query(`SELECT * FROM get_warehouse_hcm_info()`);
      console.log('✅ Function works:', result.rows[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAndCreateFunction();

