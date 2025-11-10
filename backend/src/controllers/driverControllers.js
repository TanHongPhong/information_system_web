// backend/src/controllers/driverControllers.js
import pool from "../config/db.js";
import { validateAndNormalizePhone } from "../utils/phone.js";

/**
 * GET /api/driver/vehicle-info
 * Lấy thông tin xe và đơn hàng của driver dựa trên email/phone
 * Ưu tiên tìm qua bảng Drivers (liên kết user_id với vehicle_id)
 * Nếu không tìm thấy, fallback về match với driver_phone/driver_name trong Vehicles
 * Nếu vẫn không tìm thấy, tự động tạo liên kết với vehicle đầu tiên có thể
 */
export const getDriverVehicleInfo = async (req, res) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Need either email or phone to identify driver",
      });
    }

    let vehicleResult;
    let vehicle = null;
    let user_id = null;

    // Bước 1: Tìm user_id từ email hoặc phone
    if (email || phone) {
      const userQuery = `
        SELECT id, email, phone, name, role
        FROM users
        WHERE (
      `;
      const userParams = [];
      const userConditions = [];
      let paramCount = 1;

      if (email) {
        userConditions.push(`email = $${paramCount}`);
        userParams.push(email.trim());
        paramCount++;
      }

      if (phone) {
        userConditions.push(`(phone = $${paramCount} OR phone LIKE $${paramCount + 1})`);
        userParams.push(phone.trim());
        userParams.push(`%${phone.trim()}%`);
        paramCount += 2;
      }

      if (userConditions.length > 0) {
        const finalUserQuery = userQuery + userConditions.join(" OR ") + `) LIMIT 1;`;
        console.log("Looking up user with:", { email, phone });
        const userResult = await pool.query(finalUserQuery, userParams);
        
        if (userResult.rows.length > 0) {
          user_id = userResult.rows[0].id;
          console.log("✅ Found user_id:", user_id, "Email:", userResult.rows[0].email, "Phone:", userResult.rows[0].phone);
        } else {
          console.log("❌ User not found with email:", email, "phone:", phone);
        }
      }
    }

    // CÁCH 1: Tìm qua bảng Drivers (liên kết user_id với vehicle_id)
    // Match bằng user_id (UUID) hoặc bằng phone/email
    if (user_id || email || phone) {
      let driverQuery = `
        SELECT 
          v.vehicle_id,
          v.company_id,
          v.license_plate,
          v.vehicle_type,
          v.capacity_ton,
          v.driver_name,
          v.driver_phone,
          v.status,
          v.current_location,
          v.created_at,
          v.updated_at,
          lc.company_name,
          d.driver_id,
          d.full_name as driver_full_name
        FROM "Drivers" d
        INNER JOIN "Vehicles" v ON d.vehicle_id = v.vehicle_id
        LEFT JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
        WHERE (
      `;
      
      const driverParams = [];
      const driverConditions = [];
      let paramCount = 1;

      // Match bằng user_id (UUID)
      if (user_id) {
        driverConditions.push(`d.user_id = $${paramCount}::uuid`);
        driverParams.push(user_id);
        paramCount++;
      }

      // Match bằng phone (normalize phone để so sánh)
      // Đảm bảo tất cả so sánh đều là string (VARCHAR)
      if (phone) {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        driverConditions.push(`(
          REGEXP_REPLACE(COALESCE(d.phone::text, ''), '[^0-9]', '', 'g') = $${paramCount}
          OR REGEXP_REPLACE(COALESCE(d.phone::text, ''), '[^0-9]', '', 'g') LIKE $${paramCount + 1}
          OR d.phone::text = $${paramCount + 2}
          OR d.phone::text LIKE $${paramCount + 3}
        )`);
        driverParams.push(cleanPhone);
        driverParams.push(`%${cleanPhone}%`);
        driverParams.push(phone.trim());
        driverParams.push(`%${phone.trim()}%`);
        paramCount += 4;
      }

      // Match bằng email
      if (email) {
        driverConditions.push(`d.email = $${paramCount}`);
        driverParams.push(email.trim());
        paramCount++;
      }

      if (driverConditions.length > 0) {
        driverQuery += driverConditions.join(" OR ") + `) LIMIT 1;`;
        
        vehicleResult = await pool.query(driverQuery, driverParams);
        
        if (vehicleResult.rows.length > 0) {
          vehicle = vehicleResult.rows[0];
          console.log("✅ Found vehicle via Drivers table:", vehicle.vehicle_id, vehicle.license_plate);
        } else {
          console.log("❌ No vehicle found via Drivers table for:", { email, phone, user_id });
        }
      }
    }

    // CÁCH 2: Nếu không tìm thấy qua Drivers, tìm qua Vehicles trực tiếp
    if (!vehicle) {
      let vehicleQuery = `
        SELECT 
          v.vehicle_id,
          v.company_id,
          v.license_plate,
          v.vehicle_type,
          v.capacity_ton,
          v.driver_name,
          v.driver_phone,
          v.status,
          v.current_location,
          v.created_at,
          v.updated_at,
          lc.company_name
        FROM "Vehicles" v
        LEFT JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
        WHERE (
      `;
      const vehicleParams = [];
      const conditions = [];
      let paramCount = 1;

      // Match driver bằng phone (chính xác hoặc chứa số)
      // Xử lý cả scientific notation (9.01E+08) và format thường
      if (phone) {
        const cleanPhone = phone.trim().replace(/\D/g, '');
        
        // Tạo nhiều format để match:
        // 1. Phone dạng số thuần (0394254331)
        // 2. Phone dạng scientific notation (9.01E+08 = 901234567)
        // 3. Phone với format khác (0901234567, 901234567, etc.)
        const phoneVariants = [
          phone.trim(),
          cleanPhone,
          `0${cleanPhone}`,
          cleanPhone.substring(1), // Bỏ số 0 đầu
        ];
        
        // Tạo điều kiện match với nhiều format
        // Đảm bảo tất cả so sánh đều là string (VARCHAR) - cast driver_phone về text
        const phoneConditions = [];
        phoneVariants.forEach((variant, idx) => {
          phoneConditions.push(`(
            REGEXP_REPLACE(COALESCE(v.driver_phone::text, ''), '[^0-9]', '', 'g') = $${paramCount + idx * 4}
            OR REGEXP_REPLACE(COALESCE(v.driver_phone::text, ''), '[^0-9]', '', 'g') LIKE $${paramCount + idx * 4 + 1}
            OR v.driver_phone::text = $${paramCount + idx * 4 + 2}
            OR v.driver_phone::text LIKE $${paramCount + idx * 4 + 3}
          )`);
          
          const variantClean = variant.replace(/\D/g, '');
          vehicleParams.push(variantClean);
          vehicleParams.push(`%${variantClean}%`);
          vehicleParams.push(variant);
          vehicleParams.push(`%${variant}%`);
        });
        
        conditions.push(`(${phoneConditions.join(' OR ')})`);
        paramCount += phoneVariants.length * 4;
      }

      // Match với email qua driver_name (nếu có)
      if (email) {
        conditions.push(`(v.driver_name ILIKE $${paramCount})`);
        vehicleParams.push(`%${email.trim()}%`);
        paramCount++;
      }

      // Nếu không có điều kiện nào, trả về lỗi
      if (conditions.length === 0) {
        return res.status(400).json({
          error: "Missing required parameters",
          message: "Need either email or phone to identify driver",
        });
      }

      vehicleQuery += conditions.join(" OR ");
      vehicleQuery += `) LIMIT 1;`;

      vehicleResult = await pool.query(vehicleQuery, vehicleParams);

      if (vehicleResult.rows.length > 0) {
        vehicle = vehicleResult.rows[0];
        console.log("✅ Found vehicle via Vehicles table:", vehicle.vehicle_id, vehicle.license_plate);
        
        // Tự động tạo record trong Drivers nếu tìm thấy vehicle qua Vehicles
        if (user_id && vehicle) {
          try {
            const userInfo = await pool.query(`SELECT id, name, phone, email FROM users WHERE id = $1`, [user_id]);
            if (userInfo.rows.length > 0) {
              const user = userInfo.rows[0];
              
              // Validate và normalize phone trước khi insert/update
              let validatedPhone = null;
              if (user.phone) {
                const { valid, normalized } = validateAndNormalizePhone(user.phone);
                if (valid) {
                  validatedPhone = normalized;
                } else {
                  console.warn(`⚠️ Invalid phone from user ${user_id}: ${user.phone}, using null`);
                }
              }
              
              // Kiểm tra xem đã có record với user_id này chưa
              const existingDriver = await pool.query(`
                SELECT driver_id FROM "Drivers" WHERE user_id = $1::uuid LIMIT 1
              `, [user_id]);
              
              if (existingDriver.rows.length > 0) {
                // Update existing driver
                await pool.query(`
                  UPDATE "Drivers"
                  SET vehicle_id = $1,
                      company_id = $2,
                      full_name = $3,
                      phone = $4,
                      email = $5,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE user_id = $6::uuid
                `, [
                  vehicle.vehicle_id,
                  vehicle.company_id,
                  user.name,
                  validatedPhone,
                  user.email,
                  user_id
                ]);
              } else {
                // Insert new driver
                await pool.query(`
                  INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, status)
                  VALUES ($1::uuid, $2, $3, $4, $5, $6, 'ACTIVE')
                `, [
                  user_id,
                  vehicle.company_id,
                  vehicle.vehicle_id,
                  user.name,
                  validatedPhone,
                  user.email
                ]);
              }
              console.log(`✅ Auto-linked driver ${user_id} to vehicle ${vehicle.vehicle_id}`);
            }
          } catch (linkErr) {
            console.error("Error auto-linking driver to vehicle:", linkErr);
            console.error("Link error stack:", linkErr.stack);
            // Không throw error, tiếp tục với vehicle đã tìm thấy
          }
        }
      }
    }

    // CÁCH 3: Nếu vẫn không tìm thấy và có user_id, tự động gán vehicle đầu tiên có thể
    if (!vehicle && user_id) {
      try {
        console.log("Attempting auto-assignment for user_id:", user_id);
        
        // Tìm vehicle đầu tiên có thể (ưu tiên vehicle chưa có driver)
        const availableVehicleQuery = `
          SELECT 
            v.vehicle_id,
            v.company_id,
            v.license_plate,
            v.vehicle_type,
            v.capacity_ton,
            v.driver_name,
            v.driver_phone,
            v.status,
            v.current_location,
            v.created_at,
            v.updated_at,
            lc.company_name
          FROM "Vehicles" v
          LEFT JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
          WHERE v.vehicle_id NOT IN (
            SELECT DISTINCT vehicle_id 
            FROM "Drivers" 
            WHERE vehicle_id IS NOT NULL AND user_id IS NOT NULL
          )
          OR (v.driver_phone IS NULL OR v.driver_phone = '')
          ORDER BY 
            CASE WHEN v.vehicle_id NOT IN (SELECT DISTINCT vehicle_id FROM "Drivers" WHERE vehicle_id IS NOT NULL) THEN 0 ELSE 1 END,
            v.vehicle_id ASC
          LIMIT 1;
        `;

        const availableVehicleResult = await pool.query(availableVehicleQuery);
        console.log("Available vehicles found:", availableVehicleResult.rows.length);

        if (availableVehicleResult.rows.length > 0) {
          vehicle = availableVehicleResult.rows[0];
          console.log("Selected vehicle for auto-assignment:", vehicle.vehicle_id);
          
          // Lấy thông tin user
          const userInfo = await pool.query(`SELECT id, name, phone, email FROM users WHERE id = $1`, [user_id]);
          
          if (userInfo.rows.length > 0) {
            const user = userInfo.rows[0];
            console.log("User info for auto-assignment:", user.email, user.phone);
            
            // Validate và normalize phone trước khi insert/update
            let validatedPhone = null;
            if (user.phone) {
              const { valid, normalized } = validateAndNormalizePhone(user.phone);
              if (valid) {
                validatedPhone = normalized;
              } else {
                console.warn(`⚠️ Invalid phone from user ${user_id}: ${user.phone}, using null`);
              }
            }
            
            // Tạo record trong Drivers
            // Kiểm tra xem đã có record với user_id này chưa
            const existingDriver = await pool.query(`
              SELECT driver_id, vehicle_id FROM "Drivers" WHERE user_id = $1::uuid LIMIT 1
            `, [user_id]);
            
            let driverInsertResult;
            if (existingDriver.rows.length > 0) {
              // Update existing driver
              driverInsertResult = await pool.query(`
                UPDATE "Drivers"
                SET vehicle_id = $1,
                    company_id = $2,
                    full_name = $3,
                    phone = $4,
                    email = $5,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $6::uuid
                RETURNING driver_id;
              `, [
                vehicle.vehicle_id,
                vehicle.company_id,
                user.name,
                validatedPhone,
                user.email,
                user_id
              ]);
            } else {
              // Insert new driver
              driverInsertResult = await pool.query(`
                INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, status)
                VALUES ($1::uuid, $2, $3, $4, $5, $6, 'ACTIVE')
                RETURNING driver_id;
              `, [
                user_id,
                vehicle.company_id,
                vehicle.vehicle_id,
                user.name,
                validatedPhone,
                user.email
              ]);
            }
            console.log("Driver record created/updated:", driverInsertResult.rows[0]?.driver_id);

            // Cập nhật Vehicles.driver_phone và driver_name
            // Validate phone trước khi update
            let validatedDriverPhone = null;
            if (user.phone) {
              const { valid, normalized } = validateAndNormalizePhone(user.phone);
              if (valid) {
                validatedDriverPhone = normalized;
              } else {
                console.warn(`⚠️ Invalid phone from user ${user_id}: ${user.phone}, skipping driver_phone update`);
              }
            }
            
            const vehicleUpdateResult = await pool.query(`
              UPDATE "Vehicles"
              SET driver_phone = $1,
                  driver_name = $2,
                  updated_at = CURRENT_TIMESTAMP
              WHERE vehicle_id = $3
              RETURNING vehicle_id, license_plate;
            `, [validatedDriverPhone, user.name, vehicle.vehicle_id]);
            console.log("Vehicle updated:", vehicleUpdateResult.rows[0]);

            console.log(`✅ Auto-assigned vehicle ${vehicle.vehicle_id} (${vehicle.license_plate}) to driver ${user_id} (${user.email})`);
          } else {
            console.error("User not found for auto-assignment:", user_id);
          }
        } else {
          console.log("No available vehicles found for auto-assignment");
        }
      } catch (autoAssignErr) {
        console.error("Error auto-assigning vehicle:", autoAssignErr);
        console.error("Error stack:", autoAssignErr.stack);
        // Tiếp tục để trả về lỗi 404 nếu không thể tự động gán
      }
    }

    // Kiểm tra nếu vẫn không tìm thấy vehicle
    if (!vehicle) {
      console.log("Driver vehicle lookup - Email:", email, "Phone:", phone, "User ID:", user_id);
      console.log("No vehicle found and auto-assignment failed");
      
      return res.status(404).json({
        error: "Vehicle not found",
        message: "No vehicle assigned to this driver. Please contact administrator to assign a vehicle to your account.",
        debug: {
          email,
          phone,
          user_id: user_id || "not found",
          hint: "Vehicle should be linked via Drivers table (user_id) or Vehicles table (driver_phone/driver_name)"
        }
      });
    }

    // Lấy tất cả đơn hàng đang trên xe này (status: LOADING, IN_TRANSIT)
    // Không bao gồm WAREHOUSE_RECEIVED vì đã nhận kho, không còn trên xe nữa
    // Nếu không có, sẽ lấy cả ACCEPTED (đơn đã được chấp nhận nhưng chưa bắt đầu bốc hàng)
    // Debug: Log vehicle_id để kiểm tra
    console.log("🔍 Fetching orders for vehicle_id:", vehicle.vehicle_id, "License plate:", vehicle.license_plate);
    
    // Trước tiên, tìm đơn hàng với status LOADING, IN_TRANSIT (không bao gồm WAREHOUSE_RECEIVED vì đã nhận kho)
    const ordersQuery = `
      SELECT 
        co.order_id,
        co.company_id,
        co.vehicle_id,
        co.customer_id,
        co.cargo_name,
        co.cargo_type,
        co.weight_kg,
        co.volume_m3,
        co.value_vnd,
        co.require_cold,
        co.require_danger,
        co.require_loading,
        co.require_insurance,
        co.pickup_address,
        co.dropoff_address,
        co.pickup_time,
        co.note,
        co.status,
        co.order_code,
        co.is_loaded,
        co.loaded_at,
        co.created_at,
        co.updated_at,
        u.name as customer_name,
        u.phone as customer_phone
      FROM "CargoOrders" co
      LEFT JOIN users u ON co.customer_id = u.id
      WHERE co.vehicle_id = $1
        AND co.status IN ('LOADING', 'IN_TRANSIT')
      ORDER BY co.created_at DESC;
    `;

    let ordersResult = await pool.query(ordersQuery, [vehicle.vehicle_id]);
    
    // Debug: Log số lượng đơn hàng tìm thấy
    console.log(`📦 Found ${ordersResult.rows.length} orders with status LOADING/IN_TRANSIT for vehicle ${vehicle.vehicle_id} (${vehicle.license_plate})`);
    
    // Nếu không có đơn hàng với status trên, kiểm tra và lấy cả ACCEPTED
    if (ordersResult.rows.length === 0) {
      console.log("⚠️ No orders with status LOADING/IN_TRANSIT. Checking for ACCEPTED orders...");
      
      const acceptedOrdersQuery = `
        SELECT 
          co.order_id,
          co.order_code,
          co.company_id,
          co.vehicle_id,
          co.customer_id,
          co.cargo_name,
          co.cargo_type,
          co.weight_kg,
          co.volume_m3,
          co.value_vnd,
          co.require_cold,
          co.require_danger,
          co.require_loading,
          co.require_insurance,
          co.pickup_address,
          co.dropoff_address,
          co.pickup_time,
          co.note,
          co.status,
          co.is_loaded,
          co.loaded_at,
          co.created_at,
          co.updated_at,
          u.name as customer_name,
          u.phone as customer_phone
        FROM "CargoOrders" co
        LEFT JOIN users u ON co.customer_id = u.id
        WHERE co.vehicle_id = $1
          AND co.status = 'ACCEPTED'
        ORDER BY co.created_at DESC
        LIMIT 5;  -- Giới hạn 5 đơn ACCEPTED để hiển thị
      `;
      
      const acceptedResult = await pool.query(acceptedOrdersQuery, [vehicle.vehicle_id]);
      console.log(`📋 Found ${acceptedResult.rows.length} ACCEPTED orders for vehicle ${vehicle.vehicle_id}`);
      
      if (acceptedResult.rows.length > 0) {
        ordersResult = acceptedResult;
        console.log("✅ Using ACCEPTED orders as fallback:", acceptedResult.rows.map(o => ({ id: o.order_id, cargo: o.cargo_name, status: o.status })));
      } else {
        // Kiểm tra xem có đơn hàng nào với vehicle_id này không (không phân biệt status)
        const allOrdersCheck = await pool.query(
          `SELECT order_id, status, cargo_name, is_loaded, loaded_at, order_code FROM "CargoOrders" WHERE vehicle_id = $1 LIMIT 5`,
          [vehicle.vehicle_id]
        );
        console.log(`⚠️ No orders found. Total orders for this vehicle (any status): ${allOrdersCheck.rows.length}`);
        if (allOrdersCheck.rows.length > 0) {
          console.log("Other orders statuses:", allOrdersCheck.rows.map(o => ({ id: o.order_id, status: o.status, cargo: o.cargo_name })));
        }
      }
    } else {
      console.log("Orders:", ordersResult.rows.map(o => ({ id: o.order_id, cargo: o.cargo_name, status: o.status })));
    }

    // Lấy thông tin tuyến đường từ đơn hàng đầu tiên (nếu có)
    let routeFrom = vehicle.current_location || "Chưa xác định";
    let routeTo = "Chưa xác định";
    
    if (ordersResult.rows.length > 0) {
      const firstOrder = ordersResult.rows[0];
      routeFrom = firstOrder.pickup_address || routeFrom;
      routeTo = firstOrder.dropoff_address || routeTo;
    }

    res.json({
      vehicle: {
        ...vehicle,
        routeFrom,
        routeTo,
      },
      orders: ordersResult.rows,
    });
  } catch (err) {
    console.error("=== GET /api/driver/vehicle-info ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/driver/departure
 * Ghi nhận sự kiện xuất phát
 */
export const recordDeparture = async (req, res) => {
  try {
    const { vehicle_id, order_ids, departure_location, notes } = req.body;

    console.log("=== POST /api/driver/departure ===");
    console.log("Request body:", { vehicle_id, order_ids, departure_location, notes });

    if (!vehicle_id) {
      return res.status(400).json({
        error: "Missing required field",
        message: "vehicle_id is required",
      });
    }

    // Xử lý order_ids: nếu là mảng rỗng hoặc không có, sẽ update tất cả đơn của xe
    let finalOrderIds = order_ids;
    if (!finalOrderIds || !Array.isArray(finalOrderIds) || finalOrderIds.length === 0) {
      console.log("⚠️ No order_ids provided, will update all orders for vehicle");
      // Lấy tất cả order_ids của xe có status LOADING hoặc ACCEPTED
      const getOrdersQuery = `
        SELECT order_id, status 
        FROM "CargoOrders"
        WHERE vehicle_id = $1
          AND status IN ('LOADING', 'ACCEPTED')
      `;
      const ordersResult = await pool.query(getOrdersQuery, [vehicle_id]);
      finalOrderIds = ordersResult.rows.map(o => o.order_id);
      console.log(`📦 Found ${finalOrderIds.length} orders to update:`, ordersResult.rows.map(o => ({ id: o.order_id, status: o.status })));
    }

    // Cập nhật status các đơn hàng từ LOADING hoặc ACCEPTED -> IN_TRANSIT
    // Nếu đơn có status ACCEPTED, cần chuyển sang IN_TRANSIT luôn (bỏ qua LOADING)
    if (finalOrderIds && finalOrderIds.length > 0) {
      const updateQuery = `
        UPDATE "CargoOrders"
        SET status = 'IN_TRANSIT',
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = $1
          AND order_id = ANY($2::VARCHAR[])
          AND status IN ('LOADING', 'ACCEPTED');
      `;
      const updateResult = await pool.query(updateQuery, [vehicle_id, finalOrderIds]);
      console.log(`✅ Updated ${updateResult.rowCount} orders to IN_TRANSIT`);
      
      if (updateResult.rowCount === 0) {
        console.log("⚠️ No orders were updated. Checking current status...");
        const checkQuery = `
          SELECT order_id, status 
          FROM "CargoOrders"
          WHERE vehicle_id = $1
            AND order_id = ANY($2::VARCHAR[])
        `;
        const checkResult = await pool.query(checkQuery, [vehicle_id, finalOrderIds]);
        console.log("Current order statuses:", checkResult.rows);
      }
    } else {
      // Nếu không có order_ids cụ thể, update tất cả đơn LOADING hoặc ACCEPTED của xe
      const updateQuery = `
        UPDATE "CargoOrders"
        SET status = 'IN_TRANSIT',
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = $1
          AND status IN ('LOADING', 'ACCEPTED');
      `;
      const updateResult = await pool.query(updateQuery, [vehicle_id]);
      console.log(`✅ Updated ${updateResult.rowCount} orders to IN_TRANSIT`);
    }

    // Ghi vào LocationHistory
    try {
      const locationQuery = `
        INSERT INTO "LocationHistory" (vehicle_id, latitude, longitude, address, recorded_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING location_id;
      `;
      
      // Parse departure_location nếu có format "lat,lng"
      let lat = null, lng = null;
      if (departure_location) {
        if (typeof departure_location === 'string' && departure_location.includes(',')) {
          const parts = departure_location.split(',');
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
        }
      }

      const locationResult = await pool.query(locationQuery, [vehicle_id, lat, lng, departure_location || null]);
      console.log("✅ LocationHistory recorded:", locationResult.rows[0]?.location_id);
      
      // Cập nhật vị trí hiện tại của xe khi xuất phát (nếu có departure_location)
      if (departure_location && typeof departure_location === 'string') {
        await pool.query(`
          UPDATE "Vehicles"
          SET current_location = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $2;
        `, [departure_location, vehicle_id]);
        console.log(`✅ Vehicle ${vehicle_id} current_location updated to: ${departure_location}`);
      }
    } catch (locationErr) {
      console.error("⚠️ Error recording LocationHistory:", locationErr.message);
      // Không throw error, chỉ log để tiếp tục
    }

    // Ghi vào WarehouseOperations nếu có (operation_type = 'OUT')
    if (finalOrderIds && finalOrderIds.length > 0) {
      try {
        for (const orderId of finalOrderIds) {
          const warehouseQuery = `
            INSERT INTO "WarehouseOperations" (
              order_id, operation_type, status, actual_time, notes
            )
            VALUES ($1, 'OUT', 'COMPLETED', CURRENT_TIMESTAMP, $2)
            ON CONFLICT DO NOTHING;
          `;
          await pool.query(warehouseQuery, [orderId, notes || `Xuất phát từ ${departure_location || 'kho'}`]);
        }
        console.log(`✅ WarehouseOperations recorded for ${finalOrderIds.length} orders`);
      } catch (warehouseErr) {
        console.error("⚠️ Error recording WarehouseOperations:", warehouseErr.message);
        // Không throw error, chỉ log để tiếp tục
      }
    }

    res.json({
      success: true,
      message: "Departure recorded successfully",
      updated_orders: finalOrderIds?.length || 0,
    });
  } catch (err) {
    console.error("=== POST /api/driver/departure ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/driver/warehouse-arrival
 * Ghi nhận sự kiện đã tới kho
 */
export const recordWarehouseArrival = async (req, res) => {
  try {
    const { vehicle_id, order_ids, warehouse_location, warehouse_id, notes } = req.body;

    console.log("=== POST /api/driver/warehouse-arrival ===");
    console.log("Request body:", { vehicle_id, order_ids, warehouse_location, warehouse_id, notes });

    if (!vehicle_id) {
      return res.status(400).json({
        error: "Missing required field",
        message: "vehicle_id is required",
      });
    }

    // KHÔNG cập nhật status đơn hàng ở đây
    // Chỉ ghi nhận vị trí đã tới kho
    // Đơn hàng vẫn giữ status IN_TRANSIT cho đến khi driver nhấn "Nhập kho" từng đơn
    console.log("📍 Recording warehouse arrival location only (not updating order status)");

    // Ghi vào LocationHistory
    try {
      const locationQuery = `
        INSERT INTO "LocationHistory" (vehicle_id, latitude, longitude, address, recorded_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING location_id;
      `;
      
      // Parse warehouse_location nếu có format "lat,lng"
      let lat = null, lng = null;
      if (warehouse_location) {
        if (typeof warehouse_location === 'string' && warehouse_location.includes(',')) {
          const parts = warehouse_location.split(',');
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
        }
      }

      const locationResult = await pool.query(locationQuery, [vehicle_id, lat, lng, warehouse_location || null]);
      console.log("✅ LocationHistory recorded:", locationResult.rows[0]?.location_id);
    } catch (locationErr) {
      console.error("⚠️ Error recording LocationHistory:", locationErr.message);
      // Không throw error, chỉ log để tiếp tục
    }

    // KHÔNG ghi vào WarehouseOperations ở đây
    // WarehouseOperations sẽ được ghi khi driver nhấn "Nhập kho" từng đơn hàng

    // Cập nhật vị trí hiện tại của xe (khi đến kho)
    try {
      if (warehouse_location) {
        const updateVehicleQuery = `
          UPDATE "Vehicles"
          SET current_location = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $2;
        `;
        await pool.query(updateVehicleQuery, [warehouse_location, vehicle_id]);
        console.log(`✅ Vehicle ${vehicle_id} current_location updated to: ${warehouse_location}`);
      }
    } catch (vehicleErr) {
      console.error("⚠️ Error updating vehicle location:", vehicleErr.message);
      // Không throw error, chỉ log để tiếp tục
    }

    res.json({
      success: true,
      message: "Warehouse arrival location recorded successfully",
      note: "Order status remains IN_TRANSIT. Please accept warehouse entry for each order individually.",
    });
  } catch (err) {
    console.error("=== POST /api/driver/warehouse-arrival ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/driver/accept-warehouse-entry
 * Chấp nhận nhập kho cho một đơn hàng cụ thể
 */
export const acceptWarehouseEntry = async (req, res) => {
  try {
    const { order_id, vehicle_id, warehouse_location, warehouse_id, notes } = req.body;

    console.log("=== POST /api/driver/accept-warehouse-entry ===");
    console.log("Request body:", { order_id, vehicle_id, warehouse_location, warehouse_id, notes });

    if (!order_id) {
      return res.status(400).json({
        error: "Missing required field",
        message: "order_id is required",
      });
    }

    // Cập nhật status đơn hàng từ IN_TRANSIT -> WAREHOUSE_RECEIVED
    const updateQuery = `
      UPDATE "CargoOrders"
      SET status = 'WAREHOUSE_RECEIVED',
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
        AND status = 'IN_TRANSIT'
      RETURNING order_id, status;
    `;
    
    const updateResult = await pool.query(updateQuery, [order_id]);
    
    if (updateResult.rows.length === 0) {
      // Kiểm tra status hiện tại
      const checkQuery = `
        SELECT order_id, status, vehicle_id 
        FROM "CargoOrders"
        WHERE order_id = $1
      `;
      const checkResult = await pool.query(checkQuery, [order_id]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: "Order not found",
          message: `Order ${order_id} does not exist`,
        });
      }
      
      const currentStatus = checkResult.rows[0].status;
      return res.status(400).json({
        error: "Invalid order status",
        message: `Order ${order_id} has status ${currentStatus}, expected IN_TRANSIT`,
      });
    }

    console.log(`✅ Updated order ${order_id} to WAREHOUSE_RECEIVED`);

    // Cập nhật vị trí xe khi nhập kho (nếu có warehouse_location)
    if (warehouse_location && vehicle_id) {
      try {
        await pool.query(`
          UPDATE "Vehicles"
          SET current_location = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $2;
        `, [warehouse_location, vehicle_id]);
        console.log(`✅ Vehicle ${vehicle_id} current_location updated to: ${warehouse_location}`);
      } catch (locationErr) {
        console.error("⚠️ Error updating vehicle location:", locationErr.message);
        // Không throw error, chỉ log để tiếp tục
      }
    }

    // Lấy thông tin đơn hàng để tạo inventory
    const orderInfoQuery = `
      SELECT 
        cargo_name,
        cargo_type,
        pickup_address,
        dropoff_address,
        weight_kg,
        volume_m3,
        company_id
      FROM "CargoOrders"
      WHERE order_id = $1
    `;
    const orderInfoResult = await pool.query(orderInfoQuery, [order_id]);
    
    if (orderInfoResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `Order ${order_id} does not exist`,
      });
    }

    const orderInfo = orderInfoResult.rows[0];

    // Tìm warehouse_id dựa trên dropoff_address (destination_region)
    // Logic: Tìm warehouse có company_id IS NULL và region match với dropoff_address
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId && orderInfo.dropoff_address) {
      console.log(`🔍 Finding warehouse for dropoff_address: ${orderInfo.dropoff_address}`);
      
      // Lấy region từ dropoff_address
      const regionQuery = `
        SELECT get_region_from_address($1) as region
      `;
      const regionResult = await pool.query(regionQuery, [orderInfo.dropoff_address]);
      const region = regionResult.rows[0]?.region;
      
      console.log(`📍 Detected region from dropoff_address: ${region}`);
      
      if (region) {
        // Tìm warehouse theo region (warehouse có company_id IS NULL và match với region)
        const warehouseQuery = `
          SELECT warehouse_id, warehouse_name
          FROM "Warehouses"
          WHERE company_id IS NULL
            AND (
              get_region_from_address(address) = $1
              OR get_region_from_address(warehouse_name) = $1
              OR warehouse_name ILIKE '%' || $1 || '%'
              OR address ILIKE '%' || $1 || '%'
            )
          ORDER BY 
            CASE 
              WHEN get_region_from_address(address) = $1 THEN 1
              WHEN get_region_from_address(warehouse_name) = $1 THEN 2
              ELSE 3
            END,
            warehouse_id
          LIMIT 1
        `;
        const warehouseResult = await pool.query(warehouseQuery, [region]);
        
        if (warehouseResult.rows.length > 0) {
          finalWarehouseId = warehouseResult.rows[0].warehouse_id;
          console.log(`✅ Found warehouse: ${warehouseResult.rows[0].warehouse_name} (ID: ${finalWarehouseId}) for region ${region}`);
        } else {
          console.log(`⚠️ No warehouse found for region: ${region}, will use default or company warehouse`);
        }
      }
    }
    
    // Fallback: Nếu vẫn không tìm thấy và có company_id, tìm warehouse của company
    if (!finalWarehouseId && orderInfo.company_id) {
      console.log(`🔍 Fallback: Finding warehouse by company_id: ${orderInfo.company_id}`);
      const warehouseQuery = `
        SELECT warehouse_id
        FROM "Warehouses"
        WHERE company_id = $1
        LIMIT 1
      `;
      const warehouseResult = await pool.query(warehouseQuery, [orderInfo.company_id]);
      if (warehouseResult.rows.length > 0) {
        finalWarehouseId = warehouseResult.rows[0].warehouse_id;
        console.log(`✅ Found company warehouse (ID: ${finalWarehouseId})`);
      }
    }
    
    if (!finalWarehouseId) {
      console.log(`⚠️ Warning: No warehouse_id found for order ${order_id}. Warehouse operations may not be properly linked.`);
    }

    // Tạo WarehouseInventory với status INCOMING nếu chưa có
    try {
      const checkInventoryQuery = `
        SELECT inventory_id, status 
        FROM "WarehouseInventory"
        WHERE order_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const existingInventory = await pool.query(checkInventoryQuery, [order_id]);
      
      if (existingInventory.rows.length === 0 && finalWarehouseId) {
        // Tạo inventory mới với status INCOMING
        const inventoryQuery = `
          INSERT INTO "WarehouseInventory" (
            order_id,
            warehouse_id,
            status,
            cargo_name,
            cargo_type,
            pickup_address,
            dropoff_address,
            weight_kg,
            volume_m3,
            entered_by,
            notes
          )
          VALUES ($1, $2, 'INCOMING', $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING inventory_id, order_id, status;
        `;
        
        const inventoryResult = await pool.query(inventoryQuery, [
          order_id,
          finalWarehouseId,
          orderInfo.cargo_name,
          orderInfo.cargo_type,
          orderInfo.pickup_address,
          orderInfo.dropoff_address,
          orderInfo.weight_kg,
          orderInfo.volume_m3,
          'Driver',
          notes || `Driver nhập kho tại ${warehouse_location || ''}`
        ]);
        
        console.log(`✅ Created inventory: ${inventoryResult.rows[0].inventory_id} for order ${order_id} with status INCOMING`);
      } else if (existingInventory.rows.length > 0) {
        // Cập nhật status hiện có sang INCOMING nếu chưa phải
        const currentStatus = existingInventory.rows[0].status;
        if (currentStatus !== 'INCOMING') {
          const updateInventoryQuery = `
            UPDATE "WarehouseInventory"
            SET status = 'INCOMING',
                entered_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = $1
            RETURNING inventory_id, status;
          `;
          await pool.query(updateInventoryQuery, [existingInventory.rows[0].inventory_id]);
          console.log(`✅ Updated inventory ${existingInventory.rows[0].inventory_id} to INCOMING for order ${order_id}`);
        }
      }
    } catch (inventoryErr) {
      console.error("⚠️ Error creating/updating WarehouseInventory:", inventoryErr.message);
      // Không throw error, chỉ log để tiếp tục
    }

    // Ghi vào WarehouseOperations (operation_type = 'IN')
    if (order_id && finalWarehouseId) {
      try {
        const warehouseQuery = `
          INSERT INTO "WarehouseOperations" (
            order_id, warehouse_id, operation_type, status, actual_time, notes
          )
          VALUES ($1, $2, 'IN', 'COMPLETED', CURRENT_TIMESTAMP, $3)
          ON CONFLICT DO NOTHING;
        `;
        await pool.query(warehouseQuery, [
          order_id,
          finalWarehouseId,
          notes || `Driver nhập kho tại ${warehouse_location || ''}`,
        ]);
        console.log(`✅ Created warehouse operation IN for order ${order_id} with warehouse_id ${finalWarehouseId}`);
      } catch (warehouseErr) {
        console.error("⚠️ Error recording WarehouseOperations:", warehouseErr.message);
        // Không throw error, chỉ log để tiếp tục (vì đơn hàng đã được cập nhật status)
      }
    } else if (order_id && !finalWarehouseId) {
      console.log(`⚠️ Skipping WarehouseOperations creation - no warehouse_id found for order ${order_id}`);
    }

    // Kiểm tra xem tất cả đơn hàng của xe đã được nhập kho chưa
    if (vehicle_id) {
      try {
        // Đếm số đơn hàng còn lại có status IN_TRANSIT hoặc LOADING
        const remainingOrdersQuery = `
          SELECT COUNT(*) as remaining_count
          FROM "CargoOrders"
          WHERE vehicle_id = $1
            AND status IN ('IN_TRANSIT', 'LOADING', 'ACCEPTED')
        `;
        const remainingResult = await pool.query(remainingOrdersQuery, [vehicle_id]);
        const remainingCount = parseInt(remainingResult.rows[0].remaining_count) || 0;

        console.log(`📦 Vehicle ${vehicle_id} has ${remainingCount} remaining orders (IN_TRANSIT/LOADING/ACCEPTED)`);

        // Nếu không còn đơn hàng nào cần xử lý, cập nhật trạng thái xe thành AVAILABLE
        if (remainingCount === 0) {
          // Lấy warehouse_location từ đơn hàng vừa nhập kho hoặc từ parameter
          let finalWarehouseLocation = warehouse_location;
          
          if (!finalWarehouseLocation) {
            // Lấy từ dropoff_address của đơn hàng vừa nhập kho
            const locationQuery = `
              SELECT dropoff_address
              FROM "CargoOrders"
              WHERE order_id = $1
            `;
            const locationResult = await pool.query(locationQuery, [order_id]);
            if (locationResult.rows.length > 0 && locationResult.rows[0].dropoff_address) {
              finalWarehouseLocation = locationResult.rows[0].dropoff_address;
            }
          }

          // Cập nhật trạng thái xe thành AVAILABLE và vị trí = warehouse_location
          const vehicleUpdateQuery = `
            UPDATE "Vehicles"
            SET status = 'AVAILABLE',
                current_location = COALESCE($1, current_location),
                updated_at = CURRENT_TIMESTAMP
            WHERE vehicle_id = $2
            RETURNING vehicle_id, status, current_location;
          `;
          
          const vehicleUpdateResult = await pool.query(vehicleUpdateQuery, [
            finalWarehouseLocation,
            vehicle_id
          ]);

          if (vehicleUpdateResult.rows.length > 0) {
            const updatedVehicle = vehicleUpdateResult.rows[0];
            console.log(`✅ Vehicle ${vehicle_id} status updated to AVAILABLE`);
            console.log(`   Location: ${updatedVehicle.current_location}`);
            console.log(`   All orders have been delivered to warehouse`);
          }
        }
      } catch (vehicleErr) {
        console.error("⚠️ Error checking/updating vehicle status:", vehicleErr.message);
        // Không throw error, chỉ log để không ảnh hưởng đến response
      }
    }

    res.json({
      success: true,
      message: "Warehouse entry accepted successfully",
      order_id,
      status: 'WAREHOUSE_RECEIVED',
    });
  } catch (err) {
    console.error("=== POST /api/driver/accept-warehouse-entry ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/driver/movement-event
 * Ghi nhận sự kiện di chuyển/dừng của xe
 */
export const recordMovementEvent = async (req, res) => {
  try {
    const {
      vehicle_id,
      driver_id,
      order_id,
      event_type,
      latitude,
      longitude,
      address,
      location_name,
      odometer_km,
      speed_kmh,
      fuel_level,
      duration_minutes,
      notes,
      driver_notes,
    } = req.body;

    if (!vehicle_id || !event_type) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "vehicle_id and event_type are required",
      });
    }

    // Validate event_type
    const validEventTypes = ['DEPARTURE', 'ARRIVAL', 'STOP', 'RESUME', 'CHECKPOINT', 'FUEL_STOP', 'REST_STOP'];
    if (!validEventTypes.includes(event_type)) {
      return res.status(400).json({
        error: "Invalid event_type",
        message: `event_type must be one of: ${validEventTypes.join(', ')}`,
      });
    }

    // Insert vào VehicleMovementEvents
    const insertQuery = `
      INSERT INTO "VehicleMovementEvents" (
        vehicle_id,
        driver_id,
        order_id,
        event_type,
        latitude,
        longitude,
        address,
        location_name,
        odometer_km,
        speed_kmh,
        fuel_level,
        duration_minutes,
        notes,
        driver_notes,
        event_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      RETURNING event_id, event_time;
    `;

    const result = await pool.query(insertQuery, [
      vehicle_id,
      driver_id || null,
      order_id || null,
      event_type,
      latitude || null,
      longitude || null,
      address || null,
      location_name || null,
      odometer_km || null,
      speed_kmh || null,
      fuel_level || null,
      duration_minutes || null,
      notes || null,
      driver_notes || null,
    ]);

    // Nếu là DEPARTURE, cập nhật status đơn hàng
    if (event_type === 'DEPARTURE') {
      if (order_id) {
        await pool.query(`
          UPDATE "CargoOrders"
          SET status = 'IN_TRANSIT',
              updated_at = CURRENT_TIMESTAMP
          WHERE order_id = $1 AND status = 'LOADING';
        `, [order_id]);
      } else {
        // Update tất cả đơn LOADING của xe
        await pool.query(`
          UPDATE "CargoOrders"
          SET status = 'IN_TRANSIT',
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $1 AND status = 'LOADING';
        `, [vehicle_id]);
      }
    }

    // Nếu là ARRIVAL, cập nhật status đơn hàng
    if (event_type === 'ARRIVAL') {
      if (order_id) {
        await pool.query(`
          UPDATE "CargoOrders"
          SET status = 'WAREHOUSE_RECEIVED',
              updated_at = CURRENT_TIMESTAMP
          WHERE order_id = $1 AND status = 'IN_TRANSIT';
        `, [order_id]);
      } else {
        // Update tất cả đơn IN_TRANSIT của xe
        await pool.query(`
          UPDATE "CargoOrders"
          SET status = 'WAREHOUSE_RECEIVED',
              updated_at = CURRENT_TIMESTAMP
          WHERE vehicle_id = $1 AND status = 'IN_TRANSIT';
        `, [vehicle_id]);
      }
    }

    // Cập nhật vị trí hiện tại của xe (khi có địa chỉ)
    if (address) {
      await pool.query(`
        UPDATE "Vehicles"
        SET current_location = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = $2;
      `, [address, vehicle_id]);
      console.log(`✅ Vehicle ${vehicle_id} current_location updated to: ${address}`);
    }

    // Ghi vào LocationHistory
    if (latitude && longitude) {
      await pool.query(`
        INSERT INTO "LocationHistory" (vehicle_id, order_id, latitude, longitude, address, recorded_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP);
      `, [vehicle_id, order_id || null, latitude, longitude, address || null]);
    }

    res.json({
      success: true,
      message: "Movement event recorded successfully",
      data: {
        event_id: result.rows[0].event_id,
        event_time: result.rows[0].event_time,
      },
    });
  } catch (err) {
    console.error("=== POST /api/driver/movement-event ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/driver/load-order
 * Bốc hàng lên xe bằng cách scan mã đơn hàng
 */
export const loadOrder = async (req, res) => {
  try {
    const { vehicle_id, order_code } = req.body;

    console.log("=== POST /api/driver/load-order ===");
    console.log("Request body:", { vehicle_id, order_code });

    if (!vehicle_id || !order_code) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "vehicle_id and order_code are required",
      });
    }

    // Tìm đơn hàng theo order_code
    // Hỗ trợ tìm theo mã đầy đủ hoặc chỉ số (nếu user nhập số không có tiền tố)
    const normalizedCode = order_code.trim().toUpperCase();
    
    // Thử tìm theo mã đầy đủ trước
    let orderQuery = `
      SELECT order_id, vehicle_id, status, is_loaded, order_code
      FROM "CargoOrders"
      WHERE order_code = $1
    `;
    let orderResult = await pool.query(orderQuery, [normalizedCode]);
    
    // Nếu không tìm thấy, thử tìm theo pattern (nếu user nhập số không có tiền tố)
    if (orderResult.rows.length === 0 && /^\d+$/.test(normalizedCode)) {
      // Nếu chỉ là số, thử tìm với các tiền tố phổ biến
      const patterns = [
        `GMD${normalizedCode.padStart(7, '0')}`,  // GMD0000001
        `GMD${normalizedCode.padStart(6, '0')}`,  // GMD000001
        `ORD-${normalizedCode.padStart(4, '0')}`, // ORD-0001
        `ORD${normalizedCode.padStart(4, '0')}`,  // ORD0001
      ];
      
      for (const pattern of patterns) {
        orderResult = await pool.query(orderQuery, [pattern]);
        if (orderResult.rows.length > 0) {
          console.log(`✅ Found order with pattern: ${pattern} for input: ${normalizedCode}`);
          break;
        }
      }
      
      // Nếu vẫn không tìm thấy, thử tìm bằng LIKE (case insensitive)
      if (orderResult.rows.length === 0) {
        orderQuery = `
          SELECT order_id, vehicle_id, status, is_loaded, order_code
          FROM "CargoOrders"
          WHERE UPPER(order_code) LIKE '%' || $1 || '%'
            OR order_code LIKE '%' || $1 || '%'
        `;
        orderResult = await pool.query(orderQuery, [normalizedCode]);
      }
    }

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `Không tìm thấy đơn hàng với mã: ${order_code}`,
      });
    }

    const order = orderResult.rows[0];

    // Kiểm tra đơn hàng có thuộc về xe này không
    if (order.vehicle_id !== vehicle_id && order.vehicle_id !== String(vehicle_id)) {
      return res.status(403).json({
        error: "Order not assigned to this vehicle",
        message: `Đơn hàng ${order_code} không thuộc về xe này.`,
      });
    }

    // Kiểm tra đơn hàng đã được bốc chưa
    if (order.is_loaded) {
      return res.status(400).json({
        error: "Order already loaded",
        message: `Đơn hàng ${order_code} đã được bốc lên xe.`,
        order: {
          order_id: order.order_id,
          order_code: order.order_code,
          loaded_at: order.loaded_at,
        }
      });
    }

    // Kiểm tra status phải là ACCEPTED hoặc LOADING
    if (!['ACCEPTED', 'LOADING'].includes(order.status)) {
      return res.status(400).json({
        error: "Invalid order status",
        message: `Đơn hàng ${order_code} có trạng thái ${order.status}, không thể bốc hàng. Chỉ có thể bốc hàng khi đơn ở trạng thái ACCEPTED hoặc LOADING.`,
      });
    }

    // Cập nhật is_loaded = true và loaded_at = NOW
    const updateQuery = `
      UPDATE "CargoOrders"
      SET is_loaded = TRUE,
          loaded_at = CURRENT_TIMESTAMP,
          status = CASE 
            WHEN status = 'ACCEPTED' THEN 'LOADING'
            ELSE status
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $1
      RETURNING order_id, order_code, is_loaded, loaded_at, status;
    `;
    const updateResult = await pool.query(updateQuery, [order.order_id]);

    console.log(`✅ Order ${order_code} loaded successfully:`, updateResult.rows[0]);

    res.json({
      success: true,
      message: `Đã bốc hàng ${order_code} lên xe thành công!`,
      order: updateResult.rows[0],
    });
  } catch (err) {
    console.error("=== POST /api/driver/load-order ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

export const getMovementEvents = async (req, res) => {
  try {
    const { vehicle_id, driver_id, order_id, event_type, limit = 50 } = req.query;

    let query = `
      SELECT 
        e.event_id,
        e.vehicle_id,
        e.driver_id,
        e.order_id,
        e.event_type,
        e.latitude,
        e.longitude,
        e.address,
        e.location_name,
        e.odometer_km,
        e.speed_kmh,
        e.fuel_level,
        e.duration_minutes,
        e.notes,
        e.driver_notes,
        e.event_time,
        e.created_at,
        v.license_plate,
        d.full_name as driver_name,
        co.cargo_name
      FROM "VehicleMovementEvents" e
      LEFT JOIN "Vehicles" v ON e.vehicle_id = v.vehicle_id
      LEFT JOIN "Drivers" d ON e.driver_id = d.driver_id
      LEFT JOIN "CargoOrders" co ON e.order_id = co.order_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (vehicle_id) {
      query += ` AND e.vehicle_id = $${paramCount}`;
      params.push(Number(vehicle_id));
      paramCount++;
    }

    if (driver_id) {
      query += ` AND e.driver_id = $${paramCount}`;
      params.push(Number(driver_id));
      paramCount++;
    }

    if (order_id) {
      query += ` AND e.order_id = $${paramCount}`;
      params.push(order_id);
      paramCount++;
    }

    if (event_type) {
      query += ` AND e.event_type = $${paramCount}`;
      params.push(event_type);
      paramCount++;
    }

    query += ` ORDER BY e.event_time DESC LIMIT $${paramCount}`;
    params.push(Number(limit));

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("=== GET /api/driver/movement-events ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};
