-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng Drivers (Tài xế)
CREATE TABLE IF NOT EXISTS "Drivers" (
  driver_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Liên kết với user account (nếu có)
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES "Vehicles"(vehicle_id) ON DELETE SET NULL,
  -- Thông tin cá nhân
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  license_number VARCHAR(50) UNIQUE, -- Số bằng lái xe
  license_type VARCHAR(50), -- Loại bằng: B2, C, D, E...
  license_expiry DATE, -- Ngày hết hạn bằng lái
  -- Địa chỉ
  address TEXT,
  -- Trạng thái
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED')),
  -- Thống kê
  total_trips INTEGER DEFAULT 0,
  total_distance_km NUMERIC(10,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  -- Ảnh
  avatar_url TEXT,
  -- Thời gian
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Index
CREATE INDEX IF NOT EXISTS idx_drivers_company ON "Drivers"(company_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user ON "Drivers"(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle ON "Drivers"(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON "Drivers"(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON "Drivers"(license_number);

-- 3) Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION drivers_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON "Drivers"
FOR EACH ROW EXECUTE FUNCTION drivers_set_updated_at();

-- 4) Cập nhật Vehicles để tham chiếu đến Drivers (nếu cần)
-- ALTER TABLE "Vehicles" ADD COLUMN IF NOT EXISTS driver_id INTEGER REFERENCES "Drivers"(driver_id);

