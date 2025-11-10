// Script để setup warehouses và operations
import pool from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const NUM_OPERATIONS = 30;  // Tạo 30 đơn xuất nhập chủ yếu ở Hà Nội

async function setupWarehouses() {
  try {
    console.log('🔍 Checking VT Logistics...');
    
    // Lấy VT Logistics company_id
    const companyResult = await pool.query(
      'SELECT company_id FROM "LogisticsCompany" WHERE company_name = $1',
      ['VT Logistics']
    );
    
    if (companyResult.rows.length === 0) {
      throw new Error('VT Logistics company not found!');
    }
    
    const vtCompanyId = companyResult.rows[0].company_id;
    console.log(`✅ Found VT Logistics (ID: ${vtCompanyId})`);

    console.log('\n📦 === SETTING UP WAREHOUSES ===\n');

    // ===== 1. CẬP NHẬT/CẬP NHẬT TÊN KHO HÀNG =====
    
    const warehouses = [
      {
        name: 'Kho Hà Nội - VT Logistics',
        address: '100 Đường Láng, Đống Đa, Hà Nội',
        phone: '+842437654321',
        lat: 21.0285,
        lng: 105.8542,
        capacity: 50000,
        available: 35000,
        docks: 20,
        searchTerms: ['hà nội', 'hanoi']
      },
      {
        name: 'Kho HCM - VT Logistics',
        address: '200 Đường Cộng Hòa, Tân Bình, TP.HCM',
        phone: '+842887654321',
        lat: 10.8231,
        lng: 106.6297,
        capacity: 60000,
        available: 40000,
        docks: 25,
        searchTerms: ['hcm', 'hồ chí minh', 'tp.hcm']
      },
      {
        name: 'Kho Đà Nẵng - VT Logistics',
        address: '300 Đường Trần Phú, Hải Châu, Đà Nẵng',
        phone: '+842365432109',
        lat: 16.0544,
        lng: 108.2022,
        capacity: 40000,
        available: 28000,
        docks: 18,
        searchTerms: ['đà nẵng', 'da nang']
      },
      {
        name: 'Kho Cần Thơ - VT Logistics',
        address: '400 Đường Nguyễn Thái Học, Ninh Kiều, Cần Thơ',
        phone: '+842922345678',
        lat: 10.0452,
        lng: 105.7469,
        capacity: 45000,
        available: 32000,
        docks: 22,
        searchTerms: ['cần thơ', 'can tho']
      }
    ];

    const warehouseIds = {};

    for (const wh of warehouses) {
      // Tìm warehouse hiện có
      const searchConditions = wh.searchTerms.map(term => 
        `(warehouse_name ILIKE '%${term}%' OR address ILIKE '%${term}%')`
      ).join(' OR ');

      const findResult = await pool.query(`
        SELECT warehouse_id FROM "Warehouses"
        WHERE company_id = $1 AND (${searchConditions})
        LIMIT 1
      `, [vtCompanyId]);

      let warehouseId;

      if (findResult.rows.length > 0) {
        warehouseId = findResult.rows[0].warehouse_id;
        await pool.query(`
          UPDATE "Warehouses"
          SET warehouse_name = $1, address = $2, phone = $3,
              latitude = $4, longitude = $5, updated_at = NOW()
          WHERE warehouse_id = $6
        `, [wh.name, wh.address, wh.phone, wh.lat, wh.lng, warehouseId]);
        console.log(`✅ Updated: ${wh.name} (ID: ${warehouseId})`);
      } else {
        const insertResult = await pool.query(`
          INSERT INTO "Warehouses" (
            company_id, warehouse_name, address, phone, latitude, longitude,
            total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', NOW(), NOW())
          RETURNING warehouse_id
        `, [vtCompanyId, wh.name, wh.address, wh.phone, wh.lat, wh.lng, 
            wh.capacity, wh.available, wh.docks]);
        warehouseId = insertResult.rows[0].warehouse_id;
        console.log(`✅ Created: ${wh.name} (ID: ${warehouseId})`);
      }

      warehouseIds[wh.name] = warehouseId;
    }

    // ===== 2. TẠO TÀI KHOẢN KHO HÀNG =====
    
    console.log('\n👤 === CREATING WAREHOUSE ACCOUNTS ===\n');

    const warehouseAccounts = [
      {
        email: 'kho.hanoi@warehouse.com',
        name: 'Quản lý Kho Hà Nội',
        phone: '+84901234567',
        warehouseId: warehouseIds['Kho Hà Nội - VT Logistics']
      },
      {
        email: 'kho.hcm@warehouse.com',
        name: 'Quản lý Kho HCM',
        phone: '+84901234568',
        warehouseId: warehouseIds['Kho HCM - VT Logistics']
      },
      {
        email: 'kho.danang@warehouse.com',
        name: 'Quản lý Kho Đà Nẵng',
        phone: '+84901234569',
        warehouseId: warehouseIds['Kho Đà Nẵng - VT Logistics']
      },
      {
        email: 'kho.cantho@warehouse.com',
        name: 'Quản lý Kho Cần Thơ',
        phone: '+84901234570',
        warehouseId: warehouseIds['Kho Cần Thơ - VT Logistics']
      }
    ];

    const passwordHash = await bcrypt.hash('123456', 10);

    for (const account of warehouseAccounts) {
      const checkResult = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [account.email]
      );

      if (checkResult.rows.length > 0) {
        await pool.query(`
          UPDATE users
          SET warehouse_id = $1, name = $2, phone = $3, updated_at = NOW()
          WHERE email = $4
        `, [account.warehouseId, account.name, account.phone, account.email]);
        console.log(`✅ Updated account: ${account.email}`);
      } else {
        await pool.query(`
          INSERT INTO users (id, name, phone, email, password, role, warehouse_id, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, 'warehouse', $5, NOW(), NOW())
        `, [account.name, account.phone, account.email, passwordHash, account.warehouseId]);
        console.log(`✅ Created account: ${account.email}`);
      }
    }

    // ===== 3. TẠO ĐƠN XUẤT NHẬP CHỦ YẾU Ở HÀ NỘI =====
    
    console.log('\n📋 === CREATING WAREHOUSE OPERATIONS ===\n');

    // Lấy danh sách order_id
    const ordersResult = await pool.query(`
      SELECT order_id
      FROM "CargoOrders"
      WHERE company_id = $1
        AND status IN ('PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED')
      ORDER BY created_at DESC
      LIMIT 100
    `, [vtCompanyId]);

    const orderIds = ordersResult.rows.map(r => r.order_id);
    console.log(`✅ Found ${orderIds.length} orders`);

    if (orderIds.length === 0) {
      console.warn('⚠️  No orders found! Operations will be created with random order_ids (may fail foreign key constraint)');
    }

    let createdOps = 0;
    const hanoiWarehouseId = warehouseIds['Kho Hà Nội - VT Logistics'];
    const hcmWarehouseId = warehouseIds['Kho HCM - VT Logistics'];
    const danangWarehouseId = warehouseIds['Kho Đà Nẵng - VT Logistics'];
    const canthoWarehouseId = warehouseIds['Kho Cần Thơ - VT Logistics'];

    for (let i = 1; i <= NUM_OPERATIONS; i++) {
      const selectedOrderId = orderIds.length > 0 
        ? orderIds[Math.floor(Math.random() * orderIds.length)]
        : String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');

      // 80% operations ở Hà Nội
      if (Math.random() < 0.8) {
        const operationType = Math.random() < 0.6 ? 'IN' : 'OUT';
        const statusRand = Math.random();
        const status = statusRand < 0.3 ? 'PENDING' : (statusRand < 0.7 ? 'IN_PROGRESS' : 'COMPLETED');
        const tempCategory = Math.random() < 0.7 ? 'Thường' : (Math.random() < 0.9 ? 'Mát' : 'Lạnh');
        const dockNumber = 'D' + (Math.floor(Math.random() * 20) + 1);

        const scheduledTime = new Date();
        scheduledTime.setDate(scheduledTime.getDate() - i);
        scheduledTime.setHours(scheduledTime.getHours() + Math.floor(Math.random() * 24));

        const actualTime = status === 'COMPLETED' ? scheduledTime : null;

        await pool.query(`
          INSERT INTO "WarehouseOperations" (
            order_id, warehouse_id, operation_type, quantity_pallets, weight_kg, volume_m3,
            dock_number, carrier_vehicle, temperature_category, status,
            scheduled_time, actual_time, created_at, updated_at, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `, [
          selectedOrderId,
          hanoiWarehouseId,
          operationType,
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 5000) + 100,
          (Math.floor(Math.random() * 20) + 1) / 10,
          dockNumber,
          'Xe ' + String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0'),
          tempCategory,
          status,
          scheduledTime,
          actualTime,
          new Date(scheduledTime.getTime() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)),
          scheduledTime,
          `Đơn xuất nhập kho Hà Nội - Operation #${i}`
        ]);

        createdOps++;
        if (i % 5 === 0) {
          console.log(`  ✅ Created ${i} operations...`);
        }
      } else {
        // 20% ở các kho khác
        const warehouses = [
          { id: hcmWarehouseId, name: 'HCM' },
          { id: danangWarehouseId, name: 'Đà Nẵng' },
          { id: canthoWarehouseId, name: 'Cần Thơ' }
        ];
        const selectedWh = warehouses[Math.floor(Math.random() * warehouses.length)];
        const operationType = Math.random() < 0.5 ? 'IN' : 'OUT';
        const dockNumber = 'D' + (Math.floor(Math.random() * 25) + 1);

        const scheduledTime = new Date();
        scheduledTime.setDate(scheduledTime.getDate() - i);

        await pool.query(`
          INSERT INTO "WarehouseOperations" (
            order_id, warehouse_id, operation_type, quantity_pallets, weight_kg, volume_m3,
            dock_number, carrier_vehicle, temperature_category, status,
            scheduled_time, actual_time, created_at, updated_at, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'COMPLETED', $10, $10, $10, $10, $11)
        `, [
          selectedOrderId,
          selectedWh.id,
          operationType,
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 5000) + 100,
          (Math.floor(Math.random() * 20) + 1) / 10,
          dockNumber,
          'Xe ' + String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0'),
          'Thường',
          scheduledTime,
          `Đơn xuất nhập kho ${selectedWh.name}`
        ]);

        createdOps++;
      }
    }

    console.log(`\n🎉 === SETUP COMPLETED ===`);
    console.log(`\n📦 Warehouses:`);
    for (const [name, id] of Object.entries(warehouseIds)) {
      const whResult = await pool.query('SELECT address FROM "Warehouses" WHERE warehouse_id = $1', [id]);
      console.log(`  - ${name} (ID: ${id})`);
      console.log(`    Address: ${whResult.rows[0].address}`);
    }
    console.log(`\n👤 Warehouse Accounts (Password: 123456):`);
    warehouseAccounts.forEach(acc => {
      console.log(`  - ${acc.email} (${acc.name})`);
    });
    console.log(`\n📋 Operations created: ${createdOps} (80% in Hanoi)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupWarehouses();

