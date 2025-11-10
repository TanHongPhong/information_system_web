// Script để tạo đơn hàng cho user cụ thể
import pool from '../src/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const TARGET_USER_ID = 'b3615512-e0d4-4633-a74b-96273ed22662';
const TARGET_EMAIL = 'tanhongphong30@gmail.com';
const NUM_ORDERS = 15;

const hanoiAddresses = [
  '10 Phố Hoàn Kiếm, Hoàn Kiếm, Hà Nội',
  '25 Phố Bà Triệu, Hai Bà Trưng, Hà Nội',
  '30 Phố Cầu Giấy, Cầu Giấy, Hà Nội',
  '50 Phố Đống Đa, Đống Đa, Hà Nội',
  '75 Phố Thanh Xuân, Thanh Xuân, Hà Nội'
];

const hcmAddresses = [
  '15 Đường Nguyễn Huệ, Quận 1, TP.HCM',
  '20 Đường Lê Lợi, Quận 1, TP.HCM',
  '35 Đường Võ Văn Tần, Quận 3, TP.HCM',
  '60 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
  '85 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM'
];

const cargoNames = ['Điện tử', 'Thực phẩm', 'Quần áo', 'Nội thất', 'Tài liệu', 'Máy móc', 'Hóa chất', 'Đồ gia dụng', 'Vật liệu xây dựng', 'Thiết bị y tế'];
const cargoTypes = ['Điện tử', 'Thực phẩm', 'Quần áo', 'Nội thất', 'Tài liệu', 'Máy móc', 'Hóa chất'];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createOrders() {
  try {
    console.log('🔍 Checking user...');
    
    // Kiểm tra user
    const userCheck = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [TARGET_USER_ID]);
    if (userCheck.rows.length === 0) {
      throw new Error(`User ${TARGET_USER_ID} not found!`);
    }
    console.log(`✅ Found user: ${userCheck.rows[0].email} (${userCheck.rows[0].name})`);

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

    // Lấy danh sách xe của VT Logistics
    const vehiclesResult = await pool.query(`
      SELECT DISTINCT v.vehicle_id
      FROM "Vehicles" v
      LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
      WHERE v.company_id = $1
        AND v.status IN ('AVAILABLE', 'IN_USE')
        AND (vr.vehicle_id IS NOT NULL OR v.current_location IS NOT NULL)
      ORDER BY v.vehicle_id
      LIMIT 50
    `, [vtCompanyId]);

    if (vehiclesResult.rows.length === 0) {
      throw new Error('No vehicles found for VT Logistics!');
    }

    const vehicleIds = vehiclesResult.rows.map(r => r.vehicle_id);
    console.log(`✅ Found ${vehicleIds.length} vehicles`);

    // Lấy order_counter
    const counterResult = await pool.query(`
      SELECT COALESCE(MAX(CAST(order_id AS INTEGER)), 1000) as max_id
      FROM "CargoOrders"
      WHERE order_id ~ '^[0-9]{4}$'
    `);
    
    let orderCounter = (counterResult.rows[0]?.max_id || 1000) + 1;
    console.log(`✅ Starting order counter from: ${orderCounter}`);

    console.log(`\n📦 Creating ${NUM_ORDERS} orders...\n`);

    let createdOrders = 0;
    let createdTransactions = 0;

    for (let i = 1; i <= NUM_ORDERS; i++) {
      // Chọn xe ngẫu nhiên
      const selectedVehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];

      // Chọn route (70% Hà Nội ↔ HCM)
      let pickupAddress, dropoffAddress;
      if (Math.random() < 0.7) {
        // Route Hà Nội ↔ HCM
        if (Math.random() < 0.5) {
          pickupAddress = randomElement(hanoiAddresses);
          dropoffAddress = randomElement(hcmAddresses);
        } else {
          pickupAddress = randomElement(hcmAddresses);
          dropoffAddress = randomElement(hanoiAddresses);
        }
      } else {
        // Route khác
        if (Math.random() < 0.5) {
          pickupAddress = randomElement(hanoiAddresses);
          dropoffAddress = randomElement(hanoiAddresses);
        } else {
          pickupAddress = randomElement(hcmAddresses);
          dropoffAddress = randomElement(hcmAddresses);
        }
      }

      // Random cargo info
      const cargoName = randomElement(cargoNames);
      const cargoType = randomElement(cargoTypes);
      const weightKg = randomInt(100, 5100);
      const volumeM3 = (randomInt(1, 20) / 10).toFixed(1);
      const valueVnd = randomInt(1000000, 51000000);
      const declaredValueVnd = Math.round(valueVnd * (0.8 + Math.random() * 0.4));

      // Chọn status
      const rand = Math.random();
      let status;
      if (rand < 0.3) status = 'PAID';
      else if (rand < 0.5) status = 'ACCEPTED';
      else if (rand < 0.65) status = 'LOADING';
      else if (rand < 0.8) status = 'IN_TRANSIT';
      else if (rand < 0.9) status = 'WAREHOUSE_RECEIVED';
      else status = 'COMPLETED';

      // Tạo order_id và order_code
      const orderId = String(orderCounter).padStart(4, '0');
      const orderCode = `DH${orderId}`;

      // Tính toán thời gian
      const daysAgo = i * 2;
      const pickupTime = new Date();
      pickupTime.setDate(pickupTime.getDate() - daysAgo);
      pickupTime.setHours(pickupTime.getHours() + randomInt(0, 48));

      const deliveryTime = new Date(pickupTime);
      deliveryTime.setHours(deliveryTime.getHours() + 24);

      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const updatedAt = new Date(createdAt);
      updatedAt.setHours(updatedAt.getHours() + randomInt(0, 48));

      // Priority
      const priorityRand = Math.random();
      const priority = priorityRand < 0.1 ? 'HIGH' : (priorityRand < 0.3 ? 'URGENT' : 'NORMAL');

      // Insert order
      const orderResult = await pool.query(`
        INSERT INTO "CargoOrders" (
          order_id, order_code, company_id, vehicle_id, customer_id,
          cargo_name, cargo_type, weight_kg, volume_m3, value_vnd, declared_value_vnd,
          require_cold, require_danger, require_loading, require_insurance,
          pickup_address, dropoff_address,
          pickup_time, estimated_delivery_time,
          priority, note, contact_name, contact_phone, recipient_name, recipient_phone,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
        RETURNING order_id, order_code, status
      `, [
        orderId,
        orderCode,
        vtCompanyId,
        selectedVehicleId,
        TARGET_USER_ID,
        cargoName,
        cargoType,
        weightKg,
        parseFloat(volumeM3),
        valueVnd,
        declaredValueVnd,
        cargoType === 'Thực phẩm',
        cargoType === 'Hóa chất',
        weightKg > 2000,
        declaredValueVnd > 10000000,
        pickupAddress,
        dropoffAddress,
        pickupTime,
        deliveryTime,
        priority,
        `Đơn hàng test cho ${TARGET_EMAIL} - Order #${i}`,
        `Người gửi ${i}`,
        `+849${String(randomInt(10000000, 99999999)).padStart(9, '0')}`,
        `Người nhận ${i}`,
        `+849${String(randomInt(20000000, 99999999)).padStart(9, '0')}`,
        status,
        createdAt,
        updatedAt
      ]);

      createdOrders++;
      orderCounter++;

      // Tạo transaction nếu cần
      if (['PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'COMPLETED'].includes(status)) {
        const paymentMethods = ['bank_transfer', 'vietqr', 'credit_card'];
        const paymentMethod = randomElement(paymentMethods);
        const transactionCode = `TXN${String(randomInt(100000, 999999)).padStart(6, '0')}`;

        await pool.query(`
          INSERT INTO "Transactions" (
            customer_id, order_id, company_id, amount, payment_method, payment_status,
            transaction_code, paid_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          TARGET_USER_ID,
          orderId,
          vtCompanyId,
          valueVnd,
          paymentMethod,
          'SUCCESS',
          transactionCode,
          createdAt,
          createdAt,
          updatedAt
        ]);

        createdTransactions++;
        console.log(`  ✅ Order ${orderCode} (${status}) - Transaction: ${transactionCode}`);
      } else {
        console.log(`  ✅ Order ${orderCode} (${status})`);
      }
    }

    console.log(`\n🎉 === ORDERS CREATED SUCCESSFULLY ===`);
    console.log(`📦 Total orders: ${createdOrders}`);
    console.log(`💰 Total transactions: ${createdTransactions}`);
    console.log(`👤 User: ${TARGET_EMAIL} (${TARGET_USER_ID})`);
    console.log(`🏢 Company: VT Logistics (ID: ${vtCompanyId})`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createOrders();

