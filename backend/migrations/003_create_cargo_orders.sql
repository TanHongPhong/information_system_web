-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng đơn hàng/hàng hóa (CargoOrders)
-- Lưu yêu cầu đặt xe theo công ty + xe + thông tin hàng hóa
CREATE TABLE IF NOT EXISTS "CargoOrders" (
  order_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE RESTRICT,
  vehicle_id INTEGER REFERENCES "Vehicles"(vehicle_id) ON DELETE SET NULL,
  -- Thông tin hàng hóa
  cargo_name TEXT NOT NULL,
  cargo_type TEXT,              -- Khô / Lạnh / Nguy hiểm / Cồng kềnh ...
  weight_kg NUMERIC(10,2) CHECK (weight_kg >= 0),
  volume_m3 NUMERIC(10,3) CHECK (volume_m3 >= 0),
  value_vnd NUMERIC(14,2) CHECK (value_vnd >= 0),
  require_cold BOOLEAN DEFAULT FALSE,
  require_danger BOOLEAN DEFAULT FALSE,
  require_loading BOOLEAN DEFAULT FALSE,
  require_insurance BOOLEAN DEFAULT FALSE,
  -- Tuyến đường
  pickup_address TEXT,
  dropoff_address TEXT,
  pickup_time TIMESTAMP,
  note TEXT,
  -- Trạng thái đơn
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','CONFIRMED','IN_TRANSIT','COMPLETED','CANCELLED')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Index hỗ trợ truy vấn
CREATE INDEX IF NOT EXISTS idx_cargo_orders_company ON "CargoOrders"(company_id);
CREATE INDEX IF NOT EXISTS idx_cargo_orders_vehicle ON "CargoOrders"(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_cargo_orders_status ON "CargoOrders"(status);
CREATE INDEX IF NOT EXISTS idx_cargo_orders_pickup_time ON "CargoOrders"(pickup_time);

-- 3) Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION cargo_orders_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cargo_orders_updated_at
BEFORE UPDATE ON "CargoOrders"
FOR EACH ROW EXECUTE FUNCTION cargo_orders_set_updated_at();

-- 4) Seed nhẹ (tùy chọn)
-- INSERT INTO "CargoOrders"(company_id, vehicle_id, cargo_name, cargo_type, weight_kg, pickup_address, dropoff_address, status)
-- SELECT 1, v.vehicle_id, 'Hàng FMCG', 'Khô', 1200, 'TP.HCM', 'Hà Nội', 'DRAFT' FROM "Vehicles" v WHERE v.company_id = 1 LIMIT 1;


