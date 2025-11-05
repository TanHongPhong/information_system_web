-- Migration: Tạo dữ liệu warehouse và tài khoản warehouse
-- Chạy script này trên Neon Database để setup warehouse accounts và seed data

SET search_path TO public;

-- =====================================================
-- 1. ĐẢM BẢO BẢNG WAREHOUSES VÀ WAREHOUSEOperations TỒN TẠI
-- =====================================================

-- Chạy migration 009 trước nếu chưa có
-- \i backend/migrations/009_create_warehouse_operations_table.sql

-- Fix order_id type nếu bảng đã tồn tại với type INTEGER (từ migration cũ)
DO $$
BEGIN
  -- Kiểm tra xem bảng WarehouseOperations có tồn tại không
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'WarehouseOperations'
  ) THEN
    -- Kiểm tra xem order_id có phải là INTEGER không
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'WarehouseOperations' 
        AND column_name = 'order_id' 
        AND data_type = 'integer'
    ) THEN
      -- Chuyển đổi order_id từ INTEGER sang VARCHAR(4)
      ALTER TABLE "WarehouseOperations" 
      ALTER COLUMN order_id TYPE VARCHAR(4) USING LPAD(order_id::TEXT, 4, '0');
      
      RAISE NOTICE '✅ Đã chuyển order_id từ INTEGER sang VARCHAR(4)';
    ELSE
      RAISE NOTICE '✅ order_id đã là VARCHAR(4)';
    END IF;
  ELSE
    RAISE NOTICE '✅ Bảng WarehouseOperations chưa tồn tại, sẽ được tạo với order_id VARCHAR(4)';
  END IF;
END $$;

-- =====================================================
-- 2. TẠO BẢNG WAREHOUSES NẾU CHƯA TỒN TẠI
-- =====================================================

-- Tạo bảng Warehouses nếu chưa có
CREATE TABLE IF NOT EXISTS "Warehouses" (
  warehouse_id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  warehouse_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  -- Tọa độ GPS
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  -- Thông tin kho
  total_capacity_m3 NUMERIC(12,2),
  available_capacity_m3 NUMERIC(12,2),
  dock_count INTEGER DEFAULT 0,
  -- Trạng thái
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng WarehouseOperations nếu chưa có
CREATE TABLE IF NOT EXISTS "WarehouseOperations" (
  operation_id SERIAL PRIMARY KEY,
  order_id VARCHAR(4) NOT NULL REFERENCES "CargoOrders"(order_id) ON DELETE RESTRICT,
  warehouse_id INTEGER REFERENCES "Warehouses"(warehouse_id) ON DELETE SET NULL,
  -- Loại hoạt động
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('IN', 'OUT', 'TRANSFER', 'RETURN')),
  -- Thông tin hàng hóa
  quantity_pallets INTEGER CHECK (quantity_pallets >= 0),
  weight_kg NUMERIC(10,2) CHECK (weight_kg >= 0),
  volume_m3 NUMERIC(10,3) CHECK (volume_m3 >= 0),
  -- Dock/Gate (Cổng kho)
  dock_number VARCHAR(20), -- D1, D2, D3, etc.
  -- Xe/Container đưa hàng đến/lấy đi
  carrier_vehicle VARCHAR(100), -- Biển số xe hoặc ID container
  -- Nhiệt độ (cho hàng lạnh)
  temperature_celsius NUMERIC(5,2),
  temperature_category VARCHAR(20) CHECK (temperature_category IN ('Thường', 'Mát', 'Lạnh', 'Đông lạnh')),
  -- Trạng thái
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  -- Thông tin kiểm tra
  inspection_status VARCHAR(50), -- Đã kiểm tra / Chưa kiểm tra / Có vấn đề
  inspection_notes TEXT,
  inspector_name VARCHAR(255), -- Người kiểm tra
  -- QR Code/Scan
  qr_code TEXT, -- Mã QR được quét
  scanned_at TIMESTAMP, -- Thời gian quét QR
  -- Thời gian
  scheduled_time TIMESTAMP, -- Thời gian dự kiến
  actual_time TIMESTAMP, -- Thời gian thực tế
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Metadata
  notes TEXT
);

-- Tạo index cho Warehouses nếu chưa có
CREATE INDEX IF NOT EXISTS idx_warehouses_company ON "Warehouses"(company_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON "Warehouses"(status);

-- Tạo index cho WarehouseOperations nếu chưa có
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_order ON "WarehouseOperations"(order_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_type ON "WarehouseOperations"(operation_type);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_status ON "WarehouseOperations"(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_created ON "WarehouseOperations"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_scheduled ON "WarehouseOperations"(scheduled_time);

-- Tạo trigger cho updated_at nếu chưa có
CREATE OR REPLACE FUNCTION warehouse_operations_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warehouse_operations_updated_at ON "WarehouseOperations";
CREATE TRIGGER trg_warehouse_operations_updated_at
BEFORE UPDATE ON "WarehouseOperations"
FOR EACH ROW EXECUTE FUNCTION warehouse_operations_set_updated_at();

CREATE OR REPLACE FUNCTION warehouses_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warehouses_updated_at ON "Warehouses";
CREATE TRIGGER trg_warehouses_updated_at
BEFORE UPDATE ON "Warehouses"
FOR EACH ROW EXECUTE FUNCTION warehouses_set_updated_at();

-- Thêm foreign key nếu chưa có
ALTER TABLE "WarehouseOperations"
DROP CONSTRAINT IF EXISTS fk_warehouse_operations_warehouse;

ALTER TABLE "WarehouseOperations"
ADD CONSTRAINT fk_warehouse_operations_warehouse
FOREIGN KEY (warehouse_id) REFERENCES "Warehouses"(warehouse_id) ON DELETE SET NULL;

-- =====================================================
-- 3. TẠO CÁC KHO HÀNG (WAREHOUSES)
-- =====================================================

-- Tạo các kho hàng cho các công ty logistics
INSERT INTO "Warehouses" (
  company_id,
  warehouse_name,
  address,
  phone,
  latitude,
  longitude,
  total_capacity_m3,
  available_capacity_m3,
  dock_count,
  status
)
SELECT 
  lc.company_id,
  CASE 
    WHEN lc.company_name = 'VT Logistics' THEN 'Kho trung tâm TP.HCM'
    WHEN lc.company_name = 'Gemadept Logistics' THEN 'Kho trung tâm Gemadept'
    ELSE 'Kho trung tâm ' || lc.company_name
  END as warehouse_name,
  CASE 
    WHEN lc.company_name = 'VT Logistics' THEN '123 Nguyễn Huệ, P. Bến Nghé, Q1, TP.HCM'
    WHEN lc.company_name = 'Gemadept Logistics' THEN '456 Lê Lợi, P. Bến Thành, Q1, TP.HCM'
    ELSE '789 Điện Biên Phủ, P. 15, Q. Bình Thạnh, TP.HCM'
  END as address,
  '0901234567' as phone,
  CASE 
    WHEN lc.company_name = 'VT Logistics' THEN 10.8231::NUMERIC(10,8)
    WHEN lc.company_name = 'Gemadept Logistics' THEN 10.7769::NUMERIC(10,8)
    ELSE 10.8231::NUMERIC(10,8)
  END as latitude,
  CASE 
    WHEN lc.company_name = 'VT Logistics' THEN 106.6297::NUMERIC(11,8)
    WHEN lc.company_name = 'Gemadept Logistics' THEN 106.7009::NUMERIC(11,8)
    ELSE 106.6297::NUMERIC(11,8)
  END as longitude,
  10000.00 as total_capacity_m3,
  7500.00 as available_capacity_m3,
  6 as dock_count,
  'ACTIVE' as status
FROM "LogisticsCompany" lc
WHERE NOT EXISTS (
  SELECT 1 FROM "Warehouses" w WHERE w.company_id = lc.company_id
);

-- =====================================================
-- 4. TẠO TÀI KHOẢN WAREHOUSE
-- =====================================================
-- 
-- LƯU Ý: Để tạo tài khoản warehouse với password đã hash, 
-- chạy script: node scripts/create_warehouse_accounts.js
-- Script này sẽ tự động hash password và insert vào database
-- Password mặc định: "warehouse123"
-- =====================================================

-- Danh sách tài khoản warehouse sẽ được tạo:
-- 1. warehouse1@warehouse.com / warehouse123
-- 2. warehouse2@warehouse.com / warehouse123
-- 3. warehouse3@warehouse.com / warehouse123
-- 4. kho1@vtlogistics.com / warehouse123 (cho VT Logistics)
-- 5. kho1@gemadept.com / warehouse123 (cho Gemadept Logistics)

-- =====================================================
-- 5. CẬP NHẬT ROLE CHECK ĐỂ CHO PHÉP 'warehouse'
-- =====================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'transport_company', 'driver', 'warehouse'));

-- =====================================================
-- 6. SEED DỮ LIỆU WAREHOUSEOperations TỪ CARGOrders
-- =====================================================

-- Tạo các warehouse operations từ các đơn hàng đã có
-- Lấy các đơn hàng có status WAREHOUSE_RECEIVED, IN_TRANSIT, LOADING để tạo operations

DO $$
DECLARE
  v_order RECORD;
  v_warehouse_id INTEGER;
  v_vehicle_id INTEGER;
  v_license_plate VARCHAR(50);
  v_dock_number VARCHAR(20);
  v_pallets INTEGER;
  v_temperature_category VARCHAR(20);
BEGIN
  -- Lấy warehouse đầu tiên của mỗi company
  FOR v_order IN 
    SELECT 
      co.order_id,
      co.company_id,
      co.vehicle_id,
      co.status,
      co.cargo_name,
      co.cargo_type,
      co.weight_kg,
      co.volume_m3,
      co.require_cold,
      co.pickup_address,
      co.dropoff_address,
      co.created_at
    FROM "CargoOrders" co
    WHERE co.status IN ('WAREHOUSE_RECEIVED', 'IN_TRANSIT', 'LOADING')
      AND co.order_id NOT IN (SELECT order_id FROM "WarehouseOperations" WHERE order_id IS NOT NULL)
    ORDER BY co.created_at DESC
    LIMIT 50
  LOOP
    -- Tìm warehouse của company
    SELECT warehouse_id INTO v_warehouse_id
    FROM "Warehouses"
    WHERE company_id = v_order.company_id
    LIMIT 1;
    
    -- Nếu không có warehouse, tạo mới
    IF v_warehouse_id IS NULL THEN
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
      VALUES (
        v_order.company_id,
        'Kho trung tâm',
        'TP.HCM',
        '0901234567',
        10000.00,
        7500.00,
        6,
        'ACTIVE'
      )
      RETURNING warehouse_id INTO v_warehouse_id;
    END IF;
    
    -- Lấy thông tin vehicle
    SELECT v.license_plate INTO v_license_plate
    FROM "Vehicles" v
    WHERE v.vehicle_id = v_order.vehicle_id
    LIMIT 1;
    
    -- Tính toán dock number (D1-D6)
    -- order_id là VARCHAR(4), cần convert sang số để tính modulo
    v_dock_number := 'D' || ((COALESCE(CAST(v_order.order_id AS INTEGER), 0) % 6) + 1)::TEXT;
    
    -- Tính toán pallets (dựa trên weight)
    v_pallets := GREATEST(1, CEIL(v_order.weight_kg / 300.0)::INTEGER);
    
    -- Xác định temperature category
    IF v_order.require_cold THEN
      v_temperature_category := CASE 
        WHEN v_order.cargo_type ILIKE '%đông lạnh%' OR v_order.cargo_type ILIKE '%lạnh%' THEN 'Đông lạnh'
        WHEN v_order.cargo_type ILIKE '%mát%' THEN 'Mát'
        ELSE 'Lạnh'
      END;
    ELSE
      v_temperature_category := 'Thường';
    END IF;
    
    -- Tạo operation IN nếu status là WAREHOUSE_RECEIVED
    IF v_order.status = 'WAREHOUSE_RECEIVED' THEN
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
        actual_time,
        notes
      )
      VALUES (
        v_order.order_id,
        v_warehouse_id,
        'IN',
        v_pallets,
        v_order.weight_kg,
        v_order.volume_m3,
        v_dock_number,
        v_license_plate,
        v_temperature_category,
        'COMPLETED',
        v_order.created_at + INTERVAL '1 day',
        'Đã nhập kho từ ' || COALESCE(v_order.pickup_address, 'kho')
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Tạo operation OUT nếu status là IN_TRANSIT hoặc LOADING (đã xuất kho)
    IF v_order.status IN ('IN_TRANSIT', 'LOADING') THEN
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
        actual_time,
        notes
      )
      VALUES (
        v_order.order_id,
        v_warehouse_id,
        'OUT',
        v_pallets,
        v_order.weight_kg,
        v_order.volume_m3,
        v_dock_number,
        v_license_plate,
        v_temperature_category,
        'COMPLETED',
        v_order.created_at + INTERVAL '2 hours',
        'Đã xuất kho đến ' || COALESCE(v_order.dropoff_address, 'địa điểm giao hàng')
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Đã tạo warehouse operations từ CargoOrders';
END $$;

-- =====================================================
-- 7. TẠO THÊM DỮ LIỆU MẪU CHO WAREHOUSEOperations
-- =====================================================

-- Tạo thêm một số operations mẫu để đủ dữ liệu hiển thị
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
  actual_time,
  notes
)
SELECT 
  co.order_id,
  w.warehouse_id,
  CASE 
    WHEN co.status = 'WAREHOUSE_RECEIVED' THEN 'IN'
    WHEN co.status IN ('IN_TRANSIT', 'LOADING') THEN 'OUT'
    ELSE 'IN'
  END as operation_type,
  GREATEST(1, CEIL(co.weight_kg / 300.0)::INTEGER) as quantity_pallets,
  co.weight_kg,
  co.volume_m3,
  'D' || ((COALESCE(CAST(co.order_id AS INTEGER), ROW_NUMBER() OVER ()) % 6) + 1)::TEXT as dock_number,
  v.license_plate as carrier_vehicle,
  CASE 
    WHEN co.require_cold THEN 
      CASE 
        WHEN co.cargo_type ILIKE '%đông lạnh%' THEN 'Đông lạnh'
        WHEN co.cargo_type ILIKE '%lạnh%' THEN 'Lạnh'
        ELSE 'Mát'
      END
    ELSE 'Thường'
  END as temperature_category,
  'COMPLETED' as status,
  co.created_at + (ROW_NUMBER() OVER () % 7 || ' days')::INTERVAL as actual_time,
  CASE 
    WHEN co.status = 'WAREHOUSE_RECEIVED' THEN 'Đã nhập kho từ ' || COALESCE(co.pickup_address, 'kho')
    ELSE 'Đã xuất kho đến ' || COALESCE(co.dropoff_address, 'địa điểm giao hàng')
  END as notes
FROM "CargoOrders" co
JOIN "Warehouses" w ON w.company_id = co.company_id
LEFT JOIN "Vehicles" v ON v.vehicle_id = co.vehicle_id
WHERE co.status IN ('WAREHOUSE_RECEIVED', 'IN_TRANSIT', 'LOADING', 'COMPLETED')
  AND co.order_id NOT IN (SELECT order_id FROM "WarehouseOperations" WHERE order_id IS NOT NULL)
LIMIT 30
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. KIỂM TRA KẾT QUẢ
-- =====================================================

-- Kiểm tra số lượng warehouses
SELECT 
  '=== WAREHOUSES ===' as info;
  
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  lc.company_name,
  w.address,
  w.dock_count,
  w.status
FROM "Warehouses" w
LEFT JOIN "LogisticsCompany" lc ON w.company_id = lc.company_id
ORDER BY w.warehouse_id;

-- Kiểm tra số lượng warehouse operations
SELECT 
  '=== WAREHOUSE OPERATIONS ===' as info;
  
SELECT 
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE operation_type = 'IN') as in_operations,
  COUNT(*) FILTER (WHERE operation_type = 'OUT') as out_operations,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_operations,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pending_operations
FROM "WarehouseOperations";

-- Hiển thị một số operations mẫu
SELECT 
  '=== SAMPLE WAREHOUSE OPERATIONS ===' as info;
  
SELECT 
  wo.operation_id,
  wo.order_id,
  co.cargo_name,
  wo.operation_type,
  wo.status,
  wo.dock_number,
  wo.carrier_vehicle,
  wo.temperature_category,
  wo.quantity_pallets,
  wo.weight_kg,
  wo.actual_time,
  w.warehouse_name
FROM "WarehouseOperations" wo
LEFT JOIN "CargoOrders" co ON wo.order_id = co.order_id
LEFT JOIN "Warehouses" w ON wo.warehouse_id = w.warehouse_id
ORDER BY wo.actual_time DESC
LIMIT 10;

