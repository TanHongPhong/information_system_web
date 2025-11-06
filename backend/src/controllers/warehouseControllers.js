// backend/src/controllers/warehouseControllers.js
import pool from "../config/db.js";

/**
 * GET /api/warehouse/operations
 * Lấy danh sách warehouse operations với filter
 */
export const getWarehouseOperations = async (req, res) => {
  try {
    const { 
      warehouse_id, 
      operation_type, 
      status, 
      dock, 
      temp,
      limit = 100,
      offset = 0
    } = req.query;

    // Tự động lấy warehouse_id từ user nếu user là warehouse
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId && req.user && req.user.role === 'warehouse' && req.user.warehouse_id) {
      finalWarehouseId = req.user.warehouse_id;
      console.log(`🔒 Warehouse user ${req.user.email} - Auto filter by warehouse_id: ${finalWarehouseId}`);
    }

    let query = `
      SELECT 
        wo.operation_id,
        wo.order_id,
        wo.warehouse_id,
        wo.operation_type,
        wo.quantity_pallets as pallets,
        wo.weight_kg as weight,
        wo.volume_m3,
        wo.dock_number as docks,
        wo.carrier_vehicle as carrier,
        wo.temperature_category as temp,
        wo.status,
        wo.actual_time as eta,
        wo.created_at,
        wo.updated_at,
        wo.notes,
        -- Thông tin đơn hàng
        co.cargo_name,
        co.cargo_type,
        co.pickup_address as "from",
        co.dropoff_address as "to",
        co.status as order_status,
        -- Thông tin khách hàng
        COALESCE(co.contact_name, u.name) as customer,
        -- Thông tin kho
        w.warehouse_name,
        w.address as warehouse_address
      FROM "WarehouseOperations" wo
      LEFT JOIN "CargoOrders" co ON wo.order_id = co.order_id
      LEFT JOIN users u ON co.customer_id = u.id
      LEFT JOIN "Warehouses" w ON wo.warehouse_id = w.warehouse_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (finalWarehouseId) {
      query += ` AND wo.warehouse_id = $${paramCount}`;
      params.push(Number(finalWarehouseId));
      paramCount++;
    }

    if (operation_type) {
      query += ` AND wo.operation_type = $${paramCount}`;
      params.push(operation_type.toUpperCase());
      paramCount++;
    }

    if (status) {
      query += ` AND wo.status = $${paramCount}`;
      params.push(status.toUpperCase());
      paramCount++;
    }

    if (dock && dock !== "Tất cả") {
      query += ` AND wo.dock_number = $${paramCount}`;
      params.push(dock);
      paramCount++;
    }

    if (temp && temp !== "Tất cả") {
      query += ` AND wo.temperature_category = $${paramCount}`;
      params.push(temp);
      paramCount++;
    }

    query += ` ORDER BY wo.actual_time DESC, wo.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Format dữ liệu để match với frontend
    const formattedRows = result.rows.map(row => ({
      id: row.order_id,
      type: row.operation_type === 'IN' ? 'in' : 'out',
      status: getStatusText(row.status, row.order_status),
      customer: row.customer || 'Khách hàng',
      from: row.from || 'Chưa xác định',
      to: row.to || 'Chưa xác định',
      weight: Number(row.weight) || 0,
      unit: 'KG',
      pallets: row.pallets || 0,
      docks: row.docks || 'D1',
      carrier: row.carrier || 'N/A',
      eta: formatDate(row.eta || row.created_at),
      temp: row.temp || 'Thường',
      cargo_name: row.cargo_name,
      cargo_type: row.cargo_type,
      warehouse_name: row.warehouse_name,
    }));

    res.json({
      operations: formattedRows,
      total: formattedRows.length,
    });
  } catch (err) {
    console.error("=== GET /api/warehouse/operations ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * GET /api/warehouse/kpis
 * Lấy thống kê KPI cho warehouse (từ cả WarehouseOperations và WarehouseInventory)
 */
export const getWarehouseKPIs = async (req, res) => {
  try {
    const { warehouse_id } = req.query;

    // Tự động lấy warehouse_id từ user nếu user là warehouse
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId && req.user && req.user.role === 'warehouse' && req.user.warehouse_id) {
      finalWarehouseId = req.user.warehouse_id;
      console.log(`🔒 Warehouse user ${req.user.email} - Auto filter by warehouse_id: ${finalWarehouseId}`);
    }

    let whereClause = '';
    const params = [];
    if (finalWarehouseId) {
      whereClause = 'WHERE warehouse_id = $1';
      params.push(Number(finalWarehouseId));
    }

    // Lấy KPI từ WarehouseInventory (hàng hóa trong kho)
    const inventoryKpiQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'INCOMING') as incoming,
        COUNT(*) FILTER (WHERE status = 'STORED') as stored,
        COUNT(*) FILTER (WHERE status = 'OUTGOING') as outgoing,
        COUNT(*) FILTER (WHERE status = 'SHIPPED') as shipped,
        SUM(quantity_pallets) FILTER (WHERE status = 'STORED') as stored_pallets,
        SUM(weight_kg) FILTER (WHERE status = 'STORED') as stored_weight,
        SUM(volume_m3) FILTER (WHERE status = 'STORED') as stored_volume
      FROM "WarehouseInventory"
      ${whereClause}
    `;

    const inventoryKpiResult = await pool.query(inventoryKpiQuery, params);
    const inventoryKpis = inventoryKpiResult.rows[0];

    // Lấy KPI từ WarehouseOperations (lịch sử nhập/xuất)
    const operationsKpiQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE operation_type = 'IN' AND status = 'COMPLETED') as total_in,
        COUNT(*) FILTER (WHERE operation_type = 'OUT' AND status = 'COMPLETED') as total_out,
        SUM(quantity_pallets) FILTER (WHERE operation_type = 'IN') as total_pallets_in,
        SUM(quantity_pallets) FILTER (WHERE operation_type = 'OUT') as total_pallets_out,
        SUM(weight_kg) FILTER (WHERE operation_type = 'IN') as total_weight_in,
        SUM(weight_kg) FILTER (WHERE operation_type = 'OUT') as total_weight_out
      FROM "WarehouseOperations"
      ${whereClause}
    `;

    const operationsKpiResult = await pool.query(operationsKpiQuery, params);
    const operationsKpis = operationsKpiResult.rows[0];

    res.json({
      // Inventory stats (hàng hóa hiện tại trong kho)
      incoming: Number(inventoryKpis.incoming) || 0,
      stored: Number(inventoryKpis.stored) || 0,
      outgoing: Number(inventoryKpis.outgoing) || 0,
      shipped: Number(inventoryKpis.shipped) || 0,
      stored_pallets: Number(inventoryKpis.stored_pallets) || 0,
      stored_weight: Number(inventoryKpis.stored_weight) || 0,
      stored_volume: Number(inventoryKpis.stored_volume) || 0,
      // Operations stats (tổng số nhập/xuất)
      total_in: Number(operationsKpis.total_in) || 0,
      total_out: Number(operationsKpis.total_out) || 0,
      total_pallets_in: Number(operationsKpis.total_pallets_in) || 0,
      total_pallets_out: Number(operationsKpis.total_pallets_out) || 0,
      total_weight_in: Number(operationsKpis.total_weight_in) || 0,
      total_weight_out: Number(operationsKpis.total_weight_out) || 0,
    });
  } catch (err) {
    console.error("=== GET /api/warehouse/kpis ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/warehouse/scan-qr
 * Xử lý QR code scan để cập nhật warehouse operation
 */
export const scanQRCode = async (req, res) => {
  try {
    const { qr_code, operation_type, warehouse_id, dock_number } = req.body;

    console.log("=== POST /api/warehouse/scan-qr ===");
    console.log("Request body:", { qr_code, operation_type, warehouse_id, dock_number });

    if (!qr_code) {
      return res.status(400).json({
        error: "Missing required field",
        message: "qr_code is required",
      });
    }

    // Parse QR code format: "ORDER_ID|PALLET=X|MODE=IN/OUT"
    const parts = qr_code.split('|');
    let orderId = null;
    let pallets = null;

    for (const part of parts) {
      if (part.startsWith('DL') || part.match(/^\d{4}$/)) {
        orderId = part;
      } else if (part.startsWith('PALLET=')) {
        pallets = parseInt(part.replace('PALLET=', ''));
      }
    }

    if (!orderId) {
      return res.status(400).json({
        error: "Invalid QR code format",
        message: "QR code must contain order_id",
      });
    }

    // Tìm đơn hàng
    const orderQuery = `
      SELECT 
        co.order_id,
        co.company_id,
        co.vehicle_id,
        co.status,
        co.cargo_name,
        co.weight_kg,
        co.volume_m3,
        co.require_cold,
        co.cargo_type,
        v.license_plate
      FROM "CargoOrders" co
      LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
      WHERE co.order_id = $1
    `;

    const orderResult = await pool.query(orderQuery, [orderId]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `Order ${orderId} does not exist`,
      });
    }

    const order = orderResult.rows[0];

    // Xác định warehouse_id nếu không có
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId) {
      const warehouseQuery = `
        SELECT warehouse_id 
        FROM "Warehouses"
        WHERE company_id = $1
        LIMIT 1
      `;
      const warehouseResult = await pool.query(warehouseQuery, [order.company_id]);
      if (warehouseResult.rows.length > 0) {
        finalWarehouseId = warehouseResult.rows[0].warehouse_id;
      }
    }

    // Xác định operation_type từ QR hoặc request
    let finalOperationType = operation_type || 'IN';
    if (qr_code.includes('MODE=IN')) {
      finalOperationType = 'IN';
    } else if (qr_code.includes('MODE=OUT')) {
      finalOperationType = 'OUT';
    }

    // Xác định temperature category
    let temperatureCategory = 'Thường';
    if (order.require_cold) {
      if (order.cargo_type && (order.cargo_type.includes('đông lạnh') || order.cargo_type.includes('lạnh'))) {
        temperatureCategory = 'Lạnh';
      } else {
        temperatureCategory = 'Mát';
      }
    }

    // Tính pallets nếu không có
    const finalPallets = pallets || Math.max(1, Math.ceil(order.weight_kg / 300));

    // Nếu là IN, tạo inventory mới với status INCOMING
    if (finalOperationType === 'IN') {
      // Kiểm tra xem đã có inventory chưa
      const checkInventoryQuery = `
        SELECT inventory_id, status 
        FROM "WarehouseInventory"
        WHERE order_id = $1 AND warehouse_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const existingInventory = await pool.query(checkInventoryQuery, [order.order_id, finalWarehouseId]);
      
      if (existingInventory.rows.length === 0) {
        // Tạo inventory mới
        const inventoryQuery = `
          INSERT INTO "WarehouseInventory" (
            order_id,
            warehouse_id,
            status,
            quantity_pallets,
            weight_kg,
            volume_m3,
            temperature_category,
            cargo_name,
            cargo_type,
            pickup_address,
            dropoff_address,
            notes
          )
          VALUES ($1, $2, 'INCOMING', $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING inventory_id, order_id, status;
        `;
        
        const inventoryResult = await pool.query(inventoryQuery, [
          order.order_id,
          finalWarehouseId,
          finalPallets,
          order.weight_kg,
          order.volume_m3,
          temperatureCategory,
          order.cargo_name,
          order.cargo_type,
          order.pickup_address,
          order.dropoff_address,
          `QR scan: Nhập kho`
        ]);
        
        console.log(`✅ Created inventory: ${inventoryResult.rows[0].inventory_id} for order ${order.order_id}`);
      } else {
        // Cập nhật inventory hiện có sang INCOMING nếu chưa phải
        const currentStatus = existingInventory.rows[0].status;
        if (currentStatus !== 'INCOMING') {
          const updateInventoryQuery = `
            UPDATE "WarehouseInventory"
            SET status = 'INCOMING', updated_at = CURRENT_TIMESTAMP
            WHERE inventory_id = $1
            RETURNING inventory_id, order_id, status;
          `;
          await pool.query(updateInventoryQuery, [existingInventory.rows[0].inventory_id]);
          console.log(`✅ Updated inventory to INCOMING for order ${order.order_id}`);
        }
      }
    } else if (finalOperationType === 'OUT') {
      // Nếu là OUT, cập nhật inventory sang OUTGOING hoặc SHIPPED
      const inventoryQuery = `
        SELECT inventory_id, status 
        FROM "WarehouseInventory"
        WHERE order_id = $1 AND warehouse_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const inventoryResult = await pool.query(inventoryQuery, [order.order_id, finalWarehouseId]);
      
      if (inventoryResult.rows.length > 0) {
        const inventory = inventoryResult.rows[0];
        // Cập nhật sang OUTGOING nếu đang STORED, hoặc SHIPPED nếu đã OUTGOING
        const newStatus = inventory.status === 'STORED' ? 'OUTGOING' : 'SHIPPED';
        const updateQuery = `
          UPDATE "WarehouseInventory"
          SET status = $1, updated_at = CURRENT_TIMESTAMP
          WHERE inventory_id = $2
          RETURNING inventory_id, order_id, status;
        `;
        await pool.query(updateQuery, [newStatus, inventory.inventory_id]);
        console.log(`✅ Updated inventory to ${newStatus} for order ${order.order_id}`);
      }
    }

    // Tạo hoặc cập nhật warehouse operation (để giữ lịch sử)
    const insertQuery = `
      INSERT INTO "WarehouseOperations" (
        order_id,
        warehouse_id,
        operation_type,
        quantity_pallets,
        weight_kg,
        volume_m3,
        dock_number,
        carrier_vehicle,
        temperature_category,
        status,
        qr_code,
        scanned_at,
        actual_time,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'COMPLETED', $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $11)
      ON CONFLICT (operation_id) DO UPDATE
      SET 
        scanned_at = CURRENT_TIMESTAMP,
        actual_time = CURRENT_TIMESTAMP,
        status = 'COMPLETED',
        updated_at = CURRENT_TIMESTAMP
      RETURNING operation_id, order_id, operation_type, status;
    `;

    const insertResult = await pool.query(insertQuery, [
      order.order_id,
      finalWarehouseId,
      finalOperationType,
      finalPallets,
      order.weight_kg,
      order.volume_m3,
      dock_number || `D${(parseInt(order.order_id) % 6) + 1}`,
      order.license_plate || 'N/A',
      temperatureCategory,
      qr_code,
      `QR scan: ${finalOperationType === 'IN' ? 'Nhập kho' : 'Xuất kho'}`
    ]);

    console.log(`✅ QR scan processed: Order ${order.order_id}, Operation: ${finalOperationType}`);

    res.json({
      success: true,
      message: `QR code scanned successfully: ${finalOperationType === 'IN' ? 'Nhập kho' : 'Xuất kho'}`,
      operation: insertResult.rows[0],
      order_id: order.order_id,
    });
  } catch (err) {
    console.error("=== POST /api/warehouse/scan-qr ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/warehouse/update-operation
 * Cập nhật warehouse operation (status, dock, etc.)
 */
export const updateWarehouseOperation = async (req, res) => {
  try {
    const { operation_id, status, dock_number, notes } = req.body;

    if (!operation_id) {
      return res.status(400).json({
        error: "Missing required field",
        message: "operation_id is required",
      });
    }

    const updateFields = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (dock_number) {
      updateFields.push(`dock_number = $${paramCount}`);
      params.push(dock_number);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No fields to update",
        message: "At least one field (status, dock_number, notes) must be provided",
      });
    }

    params.push(operation_id);
    const updateQuery = `
      UPDATE "WarehouseOperations"
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE operation_id = $${paramCount}
      RETURNING operation_id, order_id, status, dock_number;
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Operation not found",
        message: `Operation ${operation_id} does not exist`,
      });
    }

    res.json({
      success: true,
      message: "Operation updated successfully",
      operation: result.rows[0],
    });
  } catch (err) {
    console.error("=== POST /api/warehouse/update-operation ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

// Helper functions
function getStatusText(operationStatus, orderStatus) {
  // Map operation status và order status thành text hiển thị
  if (operationStatus === 'COMPLETED') {
    if (orderStatus === 'WAREHOUSE_RECEIVED') {
      return 'Lưu kho';
    } else if (orderStatus === 'IN_TRANSIT' || orderStatus === 'LOADING') {
      return 'Đã xuất kho';
    }
  } else if (operationStatus === 'IN_PROGRESS') {
    return 'Đang xử lý';
  } else if (operationStatus === 'PENDING') {
    return 'Chờ xử lý';
  }
  
  // Fallback dựa trên order status
  if (orderStatus === 'IN_TRANSIT') {
    return 'Đang vận chuyển';
  } else if (orderStatus === 'WAREHOUSE_RECEIVED') {
    return 'Lưu kho';
  }
  
  return 'Đang xử lý';
}

/**
 * GET /api/warehouse/inventory
 * Lấy danh sách hàng hóa trong kho (từ bảng WarehouseInventory)
 */
export const getWarehouseInventory = async (req, res) => {
  try {
    const { 
      warehouse_id, 
      status,
      location,
      date,
      month,
      limit = 100,
      offset = 0
    } = req.query;

    // Tự động lấy warehouse_id từ user nếu user là warehouse
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId && req.user && req.user.role === 'warehouse' && req.user.warehouse_id) {
      finalWarehouseId = req.user.warehouse_id;
      console.log(`🔒 Warehouse user ${req.user.email} - Auto filter by warehouse_id: ${finalWarehouseId}`);
    }

    let query = `
      SELECT 
        inv.inventory_id,
        inv.order_id,
        inv.warehouse_id,
        inv.status,
        inv.location_in_warehouse as location,
        inv.quantity_pallets as pallets,
        inv.weight_kg as weight,
        inv.volume_m3,
        inv.temperature_category as temp,
        inv.cargo_name,
        inv.cargo_type,
        inv.pickup_address as "from",
        inv.dropoff_address as "to",
        inv.entered_at,
        inv.stored_at,
        inv.shipped_at,
        inv.entered_by,
        inv.stored_by,
        inv.shipped_by,
        inv.notes,
        inv.volume_m3,
        -- Thông tin khách hàng
        COALESCE(co.contact_name, u.name) as customer,
        -- Thông tin kho
        w.warehouse_name
      FROM "WarehouseInventory" inv
      LEFT JOIN "CargoOrders" co ON inv.order_id = co.order_id
      LEFT JOIN users u ON co.customer_id = u.id
      LEFT JOIN "Warehouses" w ON inv.warehouse_id = w.warehouse_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (finalWarehouseId) {
      query += ` AND inv.warehouse_id = $${paramCount}`;
      params.push(Number(finalWarehouseId));
      paramCount++;
    }

    if (status) {
      query += ` AND inv.status = $${paramCount}`;
      params.push(status.toUpperCase());
      paramCount++;
    }

    if (location) {
      query += ` AND inv.location_in_warehouse = $${paramCount}`;
      params.push(location);
      paramCount++;
    }

    // Filter theo ngày (YYYY-MM-DD)
    if (date) {
      query += ` AND DATE(inv.entered_at) = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    // Filter theo tháng (YYYY-MM)
    if (month) {
      query += ` AND DATE_TRUNC('month', inv.entered_at) = $${paramCount}::date`;
      params.push(month + '-01');
      paramCount++;
    }

    query += ` ORDER BY inv.entered_at DESC, inv.created_at DESC`;
    
    // Nếu có date hoặc month filter (export), không limit
    // Nếu không có date/month filter, áp dụng limit mặc định
    if (!date && !month) {
      if (limit) {
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(Number(limit), Number(offset));
      }
    }
    // Nếu có date hoặc month, không limit để export tất cả dữ liệu

    const result = await pool.query(query, params);

    // Format dữ liệu để match với frontend
    const formattedRows = result.rows.map(row => {
      // Format datetime với giờ
      const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };

      // Format date only (giữ lại cho backward compatibility)
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('vi-VN');
      };

      return {
        inventory_id: row.inventory_id,
        id: row.order_id,
        type: getTypeFromStatus(row.status),
        status: getInventoryStatusText(row.status),
        customer: row.customer || 'Khách hàng',
        from: row.from || 'Chưa xác định',
        to: row.to || 'Chưa xác định',
        weight: Number(row.weight) || 0,
        unit: 'KG',
        pallets: row.pallets || 0,
        docks: row.location || 'Chưa xác định',
        carrier: 'N/A', // Không có trong inventory
        eta: formatDate(row.stored_at || row.entered_at),
        temp: row.temp || 'Thường',
        cargo_name: row.cargo_name,
        cargo_type: row.cargo_type,
        warehouse_name: row.warehouse_name,
        location: row.location,
        inventory_status: row.status,
        volume_m3: row.volume_m3,
        // Date only (backward compatibility)
        entered_at: formatDate(row.entered_at),
        stored_at: formatDate(row.stored_at),
        shipped_at: formatDate(row.shipped_at),
        // DateTime với giờ (cho Excel export)
        entered_at_datetime: formatDateTime(row.entered_at),
        stored_at_datetime: formatDateTime(row.stored_at),
        shipped_at_datetime: formatDateTime(row.shipped_at),
        // Raw timestamps để tính toán
        entered_at_raw: row.entered_at,
        stored_at_raw: row.stored_at,
        shipped_at_raw: row.shipped_at,
        entered_by: row.entered_by,
        stored_by: row.stored_by,
        shipped_by: row.shipped_by,
      };
    });

    res.json({
      inventory: formattedRows,
      total: formattedRows.length,
    });
  } catch (err) {
    console.error("=== GET /api/warehouse/inventory ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/warehouse/inventory/create
 * Tạo inventory mới khi nhập kho
 */
export const createInventory = async (req, res) => {
  try {
    const { 
      order_id, 
      warehouse_id, 
      location_in_warehouse,
      quantity_pallets,
      weight_kg,
      volume_m3,
      temperature_category,
      entered_by,
      notes 
    } = req.body;

    console.log("=== POST /api/warehouse/inventory/create ===");
    console.log("Request body:", req.body);

    if (!order_id) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "order_id is required",
      });
    }

    // Nếu không có warehouse_id, tự động detect từ order's company
    let finalWarehouseId = warehouse_id;
    if (!finalWarehouseId) {
      const orderQuery = `
        SELECT company_id 
        FROM "CargoOrders"
        WHERE order_id = $1
      `;
      const orderResult = await pool.query(orderQuery, [order_id]);
      
      if (orderResult.rows.length > 0) {
        const companyId = orderResult.rows[0].company_id;
        // Tìm warehouse của company
        const warehouseQuery = `
          SELECT warehouse_id 
          FROM "Warehouses"
          WHERE company_id = $1
          LIMIT 1
        `;
        const warehouseResult = await pool.query(warehouseQuery, [companyId]);
        if (warehouseResult.rows.length > 0) {
          finalWarehouseId = warehouseResult.rows[0].warehouse_id;
        }
      }
      
      if (!finalWarehouseId) {
        return res.status(400).json({
          error: "Warehouse not found",
          message: "Cannot determine warehouse_id. Please provide warehouse_id or ensure order has a valid company_id",
        });
      }
    }

    // Lấy thông tin đơn hàng
    const orderQuery = `
      SELECT 
        cargo_name,
        cargo_type,
        pickup_address,
        dropoff_address,
        weight_kg,
        volume_m3
      FROM "CargoOrders"
      WHERE order_id = $1
    `;
    const orderResult = await pool.query(orderQuery, [order_id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Order not found",
        message: `Order ${order_id} does not exist`,
      });
    }

    const order = orderResult.rows[0];

    // Tạo inventory với status INCOMING
    const insertQuery = `
      INSERT INTO "WarehouseInventory" (
        order_id,
        warehouse_id,
        status,
        location_in_warehouse,
        quantity_pallets,
        weight_kg,
        volume_m3,
        temperature_category,
        cargo_name,
        cargo_type,
        pickup_address,
        dropoff_address,
        entered_by,
        notes
      )
      VALUES ($1, $2, 'INCOMING', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING inventory_id, order_id, status, location_in_warehouse;
    `;

    const insertResult = await pool.query(insertQuery, [
      order_id,
      finalWarehouseId,
      location_in_warehouse || null,
      quantity_pallets || null,
      weight_kg || order.weight_kg,
      volume_m3 || order.volume_m3,
      temperature_category || 'Thường',
      order.cargo_name,
      order.cargo_type,
      order.pickup_address,
      order.dropoff_address,
      entered_by || null,
      notes || null,
    ]);

    console.log(`✅ Created inventory: ${insertResult.rows[0].inventory_id} for order ${order_id}`);

    res.json({
      success: true,
      message: "Inventory created successfully",
      inventory: insertResult.rows[0],
    });
  } catch (err) {
    console.error("=== POST /api/warehouse/inventory/create ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/warehouse/inventory/update-status
 * Cập nhật trạng thái inventory
 */
export const updateInventoryStatus = async (req, res) => {
  try {
    const { 
      inventory_id,
      order_id,
      status,
      location_in_warehouse,
      stored_by,
      shipped_by,
      notes 
    } = req.body;

    console.log("=== POST /api/warehouse/inventory/update-status ===");
    console.log("Request body:", req.body);

    if (!status) {
      return res.status(400).json({
        error: "Missing required field",
        message: "status is required",
      });
    }

    const validStatuses = ['INCOMING', 'STORED', 'OUTGOING', 'SHIPPED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Tìm inventory
    let inventoryId = inventory_id;
    if (!inventoryId && order_id) {
      const findQuery = `
        SELECT inventory_id 
        FROM "WarehouseInventory"
        WHERE order_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const findResult = await pool.query(findQuery, [order_id]);
      if (findResult.rows.length > 0) {
        inventoryId = findResult.rows[0].inventory_id;
      }
    }

    if (!inventoryId) {
      return res.status(404).json({
        error: "Inventory not found",
        message: "inventory_id or order_id is required",
      });
    }

    // Build update query
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    updateFields.push(`status = $${paramCount}`);
    params.push(status.toUpperCase());
    paramCount++;

    if (location_in_warehouse) {
      updateFields.push(`location_in_warehouse = $${paramCount}`);
      params.push(location_in_warehouse);
      paramCount++;
    }

    if (status.toUpperCase() === 'STORED' && stored_by) {
      updateFields.push(`stored_by = $${paramCount}`);
      params.push(stored_by);
      paramCount++;
    }

    if (status.toUpperCase() === 'SHIPPED' && shipped_by) {
      updateFields.push(`shipped_by = $${paramCount}`);
      params.push(shipped_by);
      paramCount++;
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    params.push(inventoryId);
    const updateQuery = `
      UPDATE "WarehouseInventory"
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE inventory_id = $${paramCount}
      RETURNING inventory_id, order_id, status, location_in_warehouse, stored_at, shipped_at;
    `;

    const result = await pool.query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Inventory not found",
        message: `Inventory ${inventoryId} does not exist`,
      });
    }

    console.log(`✅ Updated inventory ${inventoryId} to status ${status.toUpperCase()}`);

    res.json({
      success: true,
      message: "Inventory status updated successfully",
      inventory: result.rows[0],
    });
  } catch (err) {
    console.error("=== POST /api/warehouse/inventory/update-status ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

// Helper functions
function getInventoryStatusText(status) {
  const statusMap = {
    'INCOMING': 'Đang nhập kho',
    'STORED': 'Lưu kho',
    'OUTGOING': 'Đang xuất kho',
    'SHIPPED': 'Đã xuất kho',
  };
  return statusMap[status] || status;
}

function getTypeFromStatus(status) {
  if (status === 'INCOMING' || status === 'STORED') {
    return 'in';
  } else if (status === 'OUTGOING' || status === 'SHIPPED') {
    return 'out';
  }
  return 'in';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}


