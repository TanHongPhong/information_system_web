-- Migration: Tạo bảng WarehouseInventory để lưu trữ hàng hóa trong kho
-- Chạy script này trên Neon Database

SET search_path TO public;

-- =====================================================
-- 1. TẠO BẢNG WAREHOUSE INVENTORY
-- =====================================================

-- Bảng này lưu trữ hàng hóa đang được lưu trong kho
-- Mỗi đơn hàng có thể có nhiều bản ghi inventory (nếu được chuyển kho)
CREATE TABLE IF NOT EXISTS "WarehouseInventory" (
  inventory_id SERIAL PRIMARY KEY,
  order_id VARCHAR(4) NOT NULL REFERENCES "CargoOrders"(order_id) ON DELETE RESTRICT,
  warehouse_id INTEGER NOT NULL REFERENCES "Warehouses"(warehouse_id) ON DELETE CASCADE,
  
  -- Trạng thái hàng hóa trong kho
  -- INCOMING: Đang nhập kho (đã quét QR, đang xử lý)
  -- STORED: Đã lưu kho (đã kiểm tra và lưu vào vị trí)
  -- OUTGOING: Đang xuất kho (đã chuẩn bị, đang chờ xuất)
  -- SHIPPED: Đã xuất kho hoàn tất (đã lên xe, rời kho)
  status VARCHAR(50) DEFAULT 'INCOMING' CHECK (status IN ('INCOMING', 'STORED', 'OUTGOING', 'SHIPPED')),
  
  -- Vị trí trong kho (ví dụ: A-01-02, Khu A, Kệ 01, Tầng 02)
  location_in_warehouse VARCHAR(50),
  
  -- Thông tin hàng hóa
  quantity_pallets INTEGER CHECK (quantity_pallets >= 0),
  weight_kg NUMERIC(10,2) CHECK (weight_kg >= 0),
  volume_m3 NUMERIC(10,3) CHECK (volume_m3 >= 0),
  temperature_category VARCHAR(20) CHECK (temperature_category IN ('Thường', 'Mát', 'Lạnh', 'Đông lạnh')),
  
  -- Thông tin đơn hàng (denormalized để dễ query)
  cargo_name VARCHAR(255),
  cargo_type VARCHAR(100),
  pickup_address TEXT,
  dropoff_address TEXT,
  
  -- Thời gian các sự kiện
  entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian bắt đầu nhập kho
  stored_at TIMESTAMP,                             -- Thời gian lưu vào vị trí
  shipped_at TIMESTAMP,                            -- Thời gian xuất kho
  
  -- Thông tin người xử lý
  entered_by VARCHAR(255),  -- Người nhận hàng vào kho
  stored_by VARCHAR(255),   -- Người lưu hàng vào vị trí
  shipped_by VARCHAR(255),  -- Người xuất hàng
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TẠO INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_order ON "WarehouseInventory"(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse ON "WarehouseInventory"(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON "WarehouseInventory"(status);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON "WarehouseInventory"(location_in_warehouse);
CREATE INDEX IF NOT EXISTS idx_inventory_entered_at ON "WarehouseInventory"(entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_stored_at ON "WarehouseInventory"(stored_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_status ON "WarehouseInventory"(warehouse_id, status);

-- =====================================================
-- 3. TẠO TRIGGER CHO updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION warehouse_inventory_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warehouse_inventory_updated_at ON "WarehouseInventory";
CREATE TRIGGER trg_warehouse_inventory_updated_at
BEFORE UPDATE ON "WarehouseInventory"
FOR EACH ROW EXECUTE FUNCTION warehouse_inventory_set_updated_at();

-- =====================================================
-- 4. TẠO FUNCTION ĐỂ TỰ ĐỘNG CẬP NHẬT THỜI GIAN KHI ĐỔI STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION warehouse_inventory_update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Khi status thay đổi, tự động cập nhật timestamp tương ứng
  IF NEW.status = 'STORED' AND (OLD.status IS NULL OR OLD.status != 'STORED') THEN
    NEW.stored_at = CURRENT_TIMESTAMP;
  END IF;
  
  IF NEW.status = 'SHIPPED' AND (OLD.status IS NULL OR OLD.status != 'SHIPPED') THEN
    NEW.shipped_at = CURRENT_TIMESTAMP;
  END IF;
  
  -- Nếu status là INCOMING và chưa có entered_at, set entered_at
  IF NEW.status = 'INCOMING' AND NEW.entered_at IS NULL THEN
    NEW.entered_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warehouse_inventory_timestamps ON "WarehouseInventory";
CREATE TRIGGER trg_warehouse_inventory_timestamps
BEFORE UPDATE ON "WarehouseInventory"
FOR EACH ROW EXECUTE FUNCTION warehouse_inventory_update_timestamps();

-- =====================================================
-- 5. TẠO FUNCTION ĐỂ TỰ ĐỘNG CẬP NHẬT CAPACITY CỦA WAREHOUSE
-- =====================================================

CREATE OR REPLACE FUNCTION warehouse_update_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Tính lại available_capacity_m3 khi có thay đổi inventory
  IF TG_OP = 'INSERT' THEN
    -- Khi thêm hàng vào kho (STORED), giảm available capacity
    IF NEW.status = 'STORED' THEN
      UPDATE "Warehouses"
      SET available_capacity_m3 = GREATEST(0, available_capacity_m3 - COALESCE(NEW.volume_m3, 0))
      WHERE warehouse_id = NEW.warehouse_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Khi status thay đổi từ STORED sang SHIPPED, tăng available capacity
    IF OLD.status = 'STORED' AND NEW.status = 'SHIPPED' THEN
      UPDATE "Warehouses"
      SET available_capacity_m3 = available_capacity_m3 + COALESCE(OLD.volume_m3, 0)
      WHERE warehouse_id = NEW.warehouse_id;
    -- Khi status thay đổi từ khác sang STORED, giảm available capacity
    ELSIF OLD.status != 'STORED' AND NEW.status = 'STORED' THEN
      UPDATE "Warehouses"
      SET available_capacity_m3 = GREATEST(0, available_capacity_m3 - COALESCE(NEW.volume_m3, 0))
      WHERE warehouse_id = NEW.warehouse_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Khi xóa inventory (nếu status là STORED), tăng available capacity
    IF OLD.status = 'STORED' THEN
      UPDATE "Warehouses"
      SET available_capacity_m3 = available_capacity_m3 + COALESCE(OLD.volume_m3, 0)
      WHERE warehouse_id = OLD.warehouse_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_warehouse_update_capacity ON "WarehouseInventory";
CREATE TRIGGER trg_warehouse_update_capacity
AFTER INSERT OR UPDATE OR DELETE ON "WarehouseInventory"
FOR EACH ROW EXECUTE FUNCTION warehouse_update_capacity();

-- =====================================================
-- 6. SEED DỮ LIỆU MẪU TỪ WAREHOUSEOperations
-- =====================================================

-- Tạo inventory từ các warehouse operations đã có
INSERT INTO "WarehouseInventory" (
  order_id,
  warehouse_id,
  status,
  quantity_pallets,
  weight_kg,
  volume_m3,
  temperature_category,
  location_in_warehouse,
  cargo_name,
  cargo_type,
  pickup_address,
  dropoff_address,
  entered_at,
  stored_at,
  entered_by
)
SELECT DISTINCT ON (wo.order_id, wo.warehouse_id)
  wo.order_id,
  wo.warehouse_id,
  CASE 
    WHEN wo.operation_type = 'IN' AND wo.status = 'COMPLETED' THEN 'STORED'
    WHEN wo.operation_type = 'IN' AND wo.status = 'IN_PROGRESS' THEN 'INCOMING'
    WHEN wo.operation_type = 'OUT' AND wo.status = 'COMPLETED' THEN 'SHIPPED'
    WHEN wo.operation_type = 'OUT' AND wo.status = 'IN_PROGRESS' THEN 'OUTGOING'
    ELSE 'STORED'
  END as status,
  wo.quantity_pallets,
  wo.weight_kg,
  wo.volume_m3,
  wo.temperature_category,
  'A-' || LPAD((ROW_NUMBER() OVER (PARTITION BY wo.warehouse_id ORDER BY wo.order_id)::TEXT), 2, '0') || '-01' as location_in_warehouse,
  co.cargo_name,
  co.cargo_type,
  co.pickup_address,
  co.dropoff_address,
  wo.actual_time as entered_at,
  CASE 
    WHEN wo.operation_type = 'IN' AND wo.status = 'COMPLETED' THEN wo.actual_time
    ELSE NULL
  END as stored_at,
  wo.inspector_name as entered_by
FROM "WarehouseOperations" wo
LEFT JOIN "CargoOrders" co ON wo.order_id = co.order_id
WHERE wo.warehouse_id IS NOT NULL
  AND wo.order_id NOT IN (SELECT order_id FROM "WarehouseInventory" WHERE order_id IS NOT NULL)
ORDER BY wo.order_id, wo.warehouse_id, wo.actual_time DESC
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. KIỂM TRA KẾT QUẢ
-- =====================================================

SELECT 
  '=== WAREHOUSE INVENTORY ===' as info;
  
SELECT 
  COUNT(*) as total_inventory,
  COUNT(*) FILTER (WHERE status = 'INCOMING') as incoming_count,
  COUNT(*) FILTER (WHERE status = 'STORED') as stored_count,
  COUNT(*) FILTER (WHERE status = 'OUTGOING') as outgoing_count,
  COUNT(*) FILTER (WHERE status = 'SHIPPED') as shipped_count
FROM "WarehouseInventory";

-- Hiển thị một số inventory mẫu
SELECT 
  '=== SAMPLE WAREHOUSE INVENTORY ===' as info;
  
SELECT 
  inv.inventory_id,
  inv.order_id,
  co.cargo_name,
  inv.status,
  inv.location_in_warehouse,
  inv.quantity_pallets,
  inv.weight_kg,
  inv.temperature_category,
  w.warehouse_name,
  inv.entered_at,
  inv.stored_at,
  inv.shipped_at
FROM "WarehouseInventory" inv
LEFT JOIN "CargoOrders" co ON inv.order_id = co.order_id
LEFT JOIN "Warehouses" w ON inv.warehouse_id = w.warehouse_id
ORDER BY inv.entered_at DESC
LIMIT 10;

