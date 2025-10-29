-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng LogisticsCompany (Công ty vận chuyển logistics)
CREATE TABLE IF NOT EXISTS "LogisticsCompany" (
  company_id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  description TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  -- Dịch vụ hỗ trợ
  has_cold BOOLEAN DEFAULT FALSE,
  has_dangerous_goods BOOLEAN DEFAULT FALSE,
  has_loading_dock BOOLEAN DEFAULT FALSE,
  has_insurance BOOLEAN DEFAULT FALSE,
  -- Logo/Ảnh
  logo_url TEXT,
  -- Thời gian
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Bảng CompanyAreas (Khu vực hoạt động của công ty)
CREATE TABLE IF NOT EXISTS "CompanyAreas" (
  area_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  area VARCHAR(100) NOT NULL, -- Ví dụ: "TP.HCM", "Hà Nội", "Miền Nam"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, area)
);

-- 3) Bảng CompanyRates (Bảng giá theo loại xe)
CREATE TABLE IF NOT EXISTS "CompanyRates" (
  rate_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  vehicle_type VARCHAR(100) NOT NULL, -- Ví dụ: "Xe tải 2 tấn", "Container 20ft"
  cost_per_km NUMERIC(10,2) CHECK (cost_per_km >= 0),
  minimum_cost NUMERIC(10,2) CHECK (minimum_cost >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, vehicle_type)
);

-- 4) Index cho LogisticsCompany
CREATE INDEX IF NOT EXISTS idx_logistics_company_status ON "LogisticsCompany"(status);
CREATE INDEX IF NOT EXISTS idx_logistics_company_rating ON "LogisticsCompany"(rating);
CREATE INDEX IF NOT EXISTS idx_logistics_company_name ON "LogisticsCompany"(company_name);

-- 5) Index cho CompanyAreas
CREATE INDEX IF NOT EXISTS idx_company_areas_company ON "CompanyAreas"(company_id);
CREATE INDEX IF NOT EXISTS idx_company_areas_area ON "CompanyAreas"(area);

-- 6) Index cho CompanyRates
CREATE INDEX IF NOT EXISTS idx_company_rates_company ON "CompanyRates"(company_id);
CREATE INDEX IF NOT EXISTS idx_company_rates_vehicle_type ON "CompanyRates"(vehicle_type);

-- 7) Trigger cập nhật updated_at cho LogisticsCompany
CREATE OR REPLACE FUNCTION logistics_company_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_logistics_company_updated_at
BEFORE UPDATE ON "LogisticsCompany"
FOR EACH ROW EXECUTE FUNCTION logistics_company_set_updated_at();

-- 8) Trigger cập nhật updated_at cho CompanyRates
CREATE OR REPLACE FUNCTION company_rates_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_company_rates_updated_at
BEFORE UPDATE ON "CompanyRates"
FOR EACH ROW EXECUTE FUNCTION company_rates_set_updated_at();

-- 9) Seed dữ liệu mẫu (tùy chọn - có thể comment nếu đã có dữ liệu)
-- INSERT INTO "LogisticsCompany" (company_name, address, phone, email, rating, description, has_cold, has_dangerous_goods, has_loading_dock, has_insurance)
-- VALUES 
--   ('Gemadept Logistics', '123 Đường ABC, Q1, TP.HCM', '0901234567', 'contact@gemadept.com', 4.5, 'Công ty logistics hàng đầu Việt Nam', true, true, true, true),
--   ('Transimex Logistics', '456 Đường XYZ, Q2, TP.HCM', '0902345678', 'contact@transimex.com', 4.3, 'Chuyên vận chuyển quốc tế', true, false, true, true);

