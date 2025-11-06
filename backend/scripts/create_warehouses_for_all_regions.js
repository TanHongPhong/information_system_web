// Script để tạo warehouse cho tất cả các region
import pool from '../src/config/db.js';
import dotenv from 'dotenv';

dotenv.config();

async function createWarehousesForAllRegions() {
  try {
    console.log('🏭 Creating warehouses for all regions...\n');

    const warehouses = [
      {
        name: 'Kho trung tâm TP.HCM',
        address: '123 Nguyễn Huệ, P. Bến Nghé, Q1, TP.HCM',
        region: 'HCM'
      },
      {
        name: 'Kho Cần Thơ',
        address: '456 Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều, Cần Thơ',
        region: 'Cần Thơ'
      },
      {
        name: 'Kho Hà Nội',
        address: '789 Hoàn Kiếm, P. Hàng Trống, Q. Hoàn Kiếm, Hà Nội',
        region: 'Hà Nội'
      },
      {
        name: 'Kho Đà Nẵng',
        address: '321 Trần Phú, P. Hải Châu, Q. Hải Châu, Đà Nẵng',
        region: 'Đà Nẵng'
      },
      {
        name: 'Kho Hải Phòng',
        address: '654 Lạch Tray, P. Đằng Giang, Q. Ngô Quyền, Hải Phòng',
        region: 'Hải Phòng'
      }
    ];

    // Lấy company_id đầu tiên (hoặc có thể tạo cho tất cả công ty)
    const companies = await pool.query(`
      SELECT company_id, company_name
      FROM "LogisticsCompany"
      WHERE status = 'ACTIVE'
      ORDER BY company_id
      LIMIT 1;
    `);

    if (companies.rows.length === 0) {
      console.log('❌ No active companies found');
      return;
    }

    const companyId = companies.rows[0].company_id;
    console.log(`Using company_id: ${companyId} (${companies.rows[0].company_name})\n`);

    for (const wh of warehouses) {
      // Kiểm tra xem đã có warehouse cho region này chưa
      const existing = await pool.query(`
        SELECT warehouse_id
        FROM "Warehouses"
        WHERE status = 'ACTIVE'
          AND (
            get_region_from_address(address) = $1
            OR get_region_from_address(warehouse_name) = $1
            OR warehouse_name ILIKE '%' || $1 || '%'
            OR address ILIKE '%' || $1 || '%'
          )
        LIMIT 1;
      `, [wh.region]);

      if (existing.rows.length > 0) {
        console.log(`✅ Warehouse for ${wh.region} already exists (ID: ${existing.rows[0].warehouse_id})`);
        continue;
      }

      // Tạo warehouse mới
      const result = await pool.query(`
        INSERT INTO "Warehouses" (
          company_id,
          warehouse_name,
          address,
          phone,
          total_capacity_m3,
          available_capacity_m3,
          dock_count,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING warehouse_id, warehouse_name, address;
      `, [
        companyId,
        wh.name,
        wh.address,
        '0901234567',
        10000.00,
        7500.00,
        6,
        'ACTIVE'
      ]);

      console.log(`✅ Created warehouse: ${result.rows[0].warehouse_name} (ID: ${result.rows[0].warehouse_id})`);
      console.log(`   Address: ${result.rows[0].address}`);
      console.log(`   Region: ${wh.region}\n`);
    }

    // Verify
    console.log('📊 Verification:');
    const verify = await pool.query(`
      SELECT 
        w.warehouse_name,
        w.address,
        get_region_from_address(w.address) as region,
        w.status
      FROM "Warehouses" w
      WHERE w.status = 'ACTIVE'
      ORDER BY get_region_from_address(w.address), w.warehouse_name;
    `);

    console.log(`Found ${verify.rows.length} active warehouses:`);
    verify.rows.forEach(w => {
      console.log(`   - ${w.warehouse_name}: ${w.address} (region: ${w.region || 'UNKNOWN'})`);
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

createWarehousesForAllRegions();

