-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng WarehouseOperations (Quản lý nhập/xuất kho)
CREATE TABLE IF NOT EXISTS "WarehouseOperations" (
  operation_id SERIAL PRIMARY KEY,
  order_id VARCHAR(4) NOT NULL REFERENCES "CargoOrders"(order_id) ON DELETE RESTRICT,
  warehouse_id INTEGER, -- Có thể tham chiếu đến bảng Warehouses nếu cần quản lý nhiều kho
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

-- 2) Bảng Warehouses (Kho hàng) - Tùy chọn, nếu cần quản lý nhiều kho
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

-- 3) Index cho WarehouseOperations
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_order ON "WarehouseOperations"(order_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_type ON "WarehouseOperations"(operation_type);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_status ON "WarehouseOperations"(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_created ON "WarehouseOperations"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_ops_scheduled ON "WarehouseOperations"(scheduled_time);

-- 4) Index cho Warehouses
CREATE INDEX IF NOT EXISTS idx_warehouses_company ON "Warehouses"(company_id);
CREATE INDEX IF NOT EXISTS idx_warehouses_status ON "Warehouses"(status);

-- 5) Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION warehouse_operations_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trg_warehouses_updated_at
BEFORE UPDATE ON "Warehouses"
FOR EACH ROW EXECUTE FUNCTION warehouses_set_updated_at();

-- 6) Thêm foreign key từ WarehouseOperations đến Warehouses (nếu có)
ALTER TABLE "WarehouseOperations"
ADD CONSTRAINT IF NOT EXISTS fk_warehouse_operations_warehouse
FOREIGN KEY (warehouse_id) REFERENCES "Warehouses"(warehouse_id) ON DELETE SET NULL;

