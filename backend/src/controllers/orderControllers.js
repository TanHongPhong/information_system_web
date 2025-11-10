import pool from "../config/db.js";
import { validateAndNormalizePhone } from "../utils/phone.js";

export const getCargoOrders = async (req, res) => {
  try {
    const { company_id, status, order_id, customer_id, vehicle_id } = req.query;
      let query = `SELECT co.order_id, co.order_code, co.company_id, co.vehicle_id, co.customer_id,
                        co.cargo_name, co.cargo_type, co.weight_kg, co.volume_m3, co.value_vnd,
                        co.declared_value_vnd,
                        co.require_cold, co.require_danger, co.require_loading, co.require_insurance,
                        co.pickup_address, co.dropoff_address, co.pickup_time, co.estimated_delivery_time,
                        co.priority, co.note, co.status, co.created_at, co.updated_at,
                        co.contact_name, co.contact_phone, co.recipient_name, co.recipient_phone,
                        lc.company_name, v.license_plate, v.vehicle_type, v.capacity_ton,
                        v.driver_name, v.driver_phone, u.id as customer_user_id, u.email as customer_email,
                        COALESCE(co.contact_name, u.name) as customer_name,
                        COALESCE(co.contact_phone, u.phone) as customer_phone
                 FROM "CargoOrders" co
                 LEFT JOIN "LogisticsCompany" lc ON co.company_id = lc.company_id
                 LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
                 LEFT JOIN users u ON co.customer_id = u.id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (order_id) { query += ` AND co.order_id = $${paramCount}`; params.push(order_id); paramCount++; }
    if (company_id) { query += ` AND co.company_id = $${paramCount}`; params.push(Number(company_id)); paramCount++; }
    if (status) { query += ` AND co.status = $${paramCount}`; params.push(status); paramCount++; }
    if (customer_id) { query += ` AND co.customer_id = $${paramCount}::uuid`; params.push(String(customer_id).trim()); paramCount++; }
    if (vehicle_id) { query += ` AND co.vehicle_id = $${paramCount}`; params.push(Number(vehicle_id)); paramCount++; }

    query += ` ORDER BY co.created_at DESC LIMIT 100`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/cargo-orders ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const createCargoOrder = async (req, res) => {
  try {
    const { company_id, vehicle_id, customer_id, cargo_name, cargo_type, weight_kg, volume_m3,
            value_vnd, declared_value_vnd, require_cold, require_danger, require_loading, require_insurance,
            pickup_address, dropoff_address, pickup_time, estimated_delivery_time, priority, note,
            contact_name, contact_phone, recipient_name, recipient_phone } = req.body;

    if (!company_id || !cargo_name || !pickup_address || !dropoff_address) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["company_id", "cargo_name", "pickup_address", "dropoff_address"],
      });
    }

    // Validate route: kiểm tra xem pickup_address và dropoff_address có thuộc tuyến đường của công ty không
    // Sử dụng pattern matching thay vì function get_region_from_address (không tồn tại)
    const getRegionFromAddress = (address) => {
      if (!address) return null;
      const addr = address.toLowerCase();
      if (addr.includes('hà nội') || addr.includes('ha noi') || addr.includes('hanoi')) return 'Hà Nội';
      if (addr.includes('hcm') || addr.includes('tp.hcm') || addr.includes('hồ chí minh') || addr.includes('ho chi minh')) return 'HCM';
      if (addr.includes('đà nẵng') || addr.includes('da nang')) return 'Đà Nẵng';
      if (addr.includes('cần thơ') || addr.includes('can tho')) return 'Cần Thơ';
      return null;
    };
    
    const originRegion = getRegionFromAddress(pickup_address);
    const destRegion = getRegionFromAddress(dropoff_address);
    
    // Chỉ validate route nếu cả hai region đều được xác định
    // Nếu không xác định được region, vẫn cho phép tạo đơn (có thể là địa chỉ chi tiết)
    if (originRegion && destRegion) {
      // Kiểm tra route có tồn tại trong Routes của công ty không
      // Kiểm tra cả hai chiều (A->B và B->A)
      const routeCheck = await pool.query(
        `SELECT route_id, route_name 
         FROM "Routes"
         WHERE company_id = $1
           AND is_active = TRUE
           AND (
             (origin_region = $2 AND destination_region = $3)
             OR (origin_region = $3 AND destination_region = $2)
           )
         LIMIT 1`,
        [Number(company_id), originRegion, destRegion]
      );
      
      // Nếu không tìm thấy route, chỉ cảnh báo, không reject đơn hàng
      // Vì có thể route chưa được tạo nhưng công ty vẫn có thể vận chuyển
      if (routeCheck.rows.length === 0) {
        console.warn(`⚠️ Route from ${originRegion} to ${destRegion} not found for company ${company_id}, but allowing order creation`);
      }
    }

    let finalCustomerId = customer_id || req.user?.id || req.headers['x-user-id'] || null;
    if (finalCustomerId) {
      finalCustomerId = String(finalCustomerId).trim();
    }

    let finalContactName = contact_name ? String(contact_name).trim() : null;
    let finalContactPhone = contact_phone ? String(contact_phone).trim() : null;
    let finalRecipientPhone = recipient_phone ? String(recipient_phone).trim() : null;

    if (finalContactName && finalContactName.length === 0) finalContactName = null;
    if (finalContactPhone && finalContactPhone.length === 0) finalContactPhone = null;
    if (finalRecipientPhone && finalRecipientPhone.length === 0) finalRecipientPhone = null;

    // Validate contact_phone nếu có
    if (finalContactPhone) {
      const { valid, normalized } = validateAndNormalizePhone(finalContactPhone);
      if (!valid) {
        return res.status(400).json({
          error: "Invalid contact phone",
          message: "Số điện thoại người liên hệ không hợp lệ",
        });
      }
      finalContactPhone = normalized;
    }

    // Validate recipient_phone nếu có
    if (finalRecipientPhone) {
      const { valid, normalized } = validateAndNormalizePhone(finalRecipientPhone);
      if (!valid) {
        return res.status(400).json({
          error: "Invalid recipient phone",
          message: "Số điện thoại người nhận không hợp lệ",
        });
      }
      finalRecipientPhone = normalized;
    }

    if (finalCustomerId && (!finalContactName || !finalContactPhone)) {
      try {
        const { rows: customerRows } = await pool.query(
          `SELECT name, phone FROM users WHERE id = $1 LIMIT 1`,
          [finalCustomerId]
        );
        if (customerRows.length > 0) {
          if (!finalContactName) finalContactName = customerRows[0].name || null;
          if (!finalContactPhone) {
            // Validate phone từ database trước khi dùng
            const customerPhone = customerRows[0].phone || null;
            if (customerPhone) {
              const { valid, normalized } = validateAndNormalizePhone(customerPhone);
              if (valid) {
                finalContactPhone = normalized;
              }
            }
          }
        }
      } catch (contactErr) {
        console.warn("createCargoOrder: unable to hydrate contact info from users table", contactErr.message);
      }
    }

    const reqCold = require_cold || cargo_type === "food" || cargo_type === "cold";
    const reqDanger = require_danger || cargo_type === "dangerous";
    const reqLoading = require_loading || cargo_type === "oversize";

    const { rows } = await pool.query(
      `INSERT INTO "CargoOrders" 
       (company_id, vehicle_id, customer_id, cargo_name, cargo_type, weight_kg, volume_m3, value_vnd,
        declared_value_vnd,
        require_cold, require_danger, require_loading, require_insurance, pickup_address, dropoff_address,
        pickup_time, estimated_delivery_time, priority, note, contact_name, contact_phone, recipient_name, recipient_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING order_id, order_code, company_id, vehicle_id, customer_id, cargo_name, cargo_type, status, priority, contact_name, contact_phone, recipient_name, recipient_phone, created_at`,
      [Number(company_id), vehicle_id ? Number(vehicle_id) : null, finalCustomerId, cargo_name, cargo_type || null,
       weight_kg ? Number(weight_kg) : null, volume_m3 ? Number(volume_m3) : null, value_vnd ? Number(value_vnd) : null,
       declared_value_vnd ? Number(declared_value_vnd) : null,
       reqCold || false, reqDanger || false, reqLoading || false, require_insurance || false,
       pickup_address, dropoff_address, pickup_time || null, estimated_delivery_time || null,
       priority || 'NORMAL', note || null, finalContactName, finalContactPhone, recipient_name || null, finalRecipientPhone, 'PENDING_PAYMENT']
    );

    res.status(201).json({
      success: true,
      message: "Đơn hàng đã được tạo thành công. Vui lòng thanh toán trong vòng 15 phút.",
      data: rows[0],
      warning: "Đơn hàng sẽ tự động bị xóa nếu không thanh toán trong 15 phút",
    });
  } catch (err) {
    console.error("POST /api/cargo-orders ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message, details: err.detail, hint: err.hint });
  }
};

export const updateCargoOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    if (!orderId || orderId.length !== 4 || !/^\d{4}$/.test(orderId)) {
      return res.status(400).json({ error: "Invalid order ID. Must be 4 digits" });
    }

    const { status, vehicle_id, priority, estimated_delivery_time, reason } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing required fields", required: ["status"] });
    }

    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status", valid_statuses: validStatuses });
    }

    const oldStatusResult = await pool.query(`SELECT status FROM "CargoOrders" WHERE order_id = $1`, [orderId]);
    if (oldStatusResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const oldStatus = oldStatusResult.rows[0].status;
    
    // Nếu đang phân công vehicle_id, kiểm tra xe có thể nhận đơn không
    if (vehicle_id !== undefined && vehicle_id !== null) {
      // Lấy thông tin đơn hàng để kiểm tra pickup_address
      const orderInfoResult = await pool.query(
        `SELECT pickup_address FROM "CargoOrders" WHERE order_id = $1`,
        [orderId]
      );
      
      if (orderInfoResult.rows.length > 0) {
        const pickupAddress = orderInfoResult.rows[0].pickup_address;
        
        // Kiểm tra xe có thể nhận đơn không
        const checkResult = await pool.query(
          `SELECT can_vehicle_accept_order($1, $2) as result`,
          [vehicle_id, pickupAddress || '']
        );
        
        if (checkResult.rows.length > 0) {
          const checkData = checkResult.rows[0].result;
          
          if (!checkData.can_accept) {
            return res.status(400).json({
              error: "Cannot assign order to vehicle",
              reason: checkData.reason,
              vehicle_region: checkData.vehicle_region,
              order_region: checkData.order_region
            });
          }
        }
      }
    }
    
    const updateFields = [`status = $1`, `updated_at = CURRENT_TIMESTAMP`];
    const params = [status];
    let paramCount = 2;

    if (vehicle_id !== undefined) { updateFields.push(`vehicle_id = $${paramCount}`); params.push(vehicle_id ? Number(vehicle_id) : null); paramCount++; }
    if (priority !== undefined) { updateFields.push(`priority = $${paramCount}`); params.push(priority); paramCount++; }
    if (estimated_delivery_time !== undefined) { updateFields.push(`estimated_delivery_time = $${paramCount}`); params.push(estimated_delivery_time || null); paramCount++; }
    
    params.push(orderId);

    const { rows } = await pool.query(
      `UPDATE "CargoOrders" SET ${updateFields.join(', ')} WHERE order_id = $${paramCount}
       RETURNING order_id, status, vehicle_id, priority, estimated_delivery_time, updated_at`,
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (oldStatus !== status) {
      try {
        await pool.query(
          `INSERT INTO "OrderStatusHistory" (order_id, old_status, new_status, changed_by_type, changed_by_id, changed_by_name, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, oldStatus, status, req.user?.type || 'SYSTEM', req.user?.id || null, 
           req.user?.name || req.user?.email || 'System', reason || null]
        );
      } catch (historyErr) {
        console.error("Error logging status change:", historyErr.message);
      }
    }

    res.json({ success: true, message: "Đơn hàng đã được cập nhật thành công", data: rows[0] });
  } catch (err) {
    console.error("PUT /api/cargo-orders/:id ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message, details: err.detail, hint: err.hint });
  }
};

