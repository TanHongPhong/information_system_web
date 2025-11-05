-- Migration: Tạo bảng TransportCompanyAdmin để lưu tài khoản admin riêng biệt
-- Bảng này độc lập với bảng users, dành riêng cho admin của các công ty vận tải

-- 1. Tạo bảng TransportCompanyAdmin
CREATE TABLE IF NOT EXISTS "TransportCompanyAdmin" (
  admin_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- bcrypt hash
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Một email chỉ có thể là admin của một công ty
  UNIQUE(email, company_id)
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_transport_company_admin_email ON "TransportCompanyAdmin"(email);
CREATE INDEX IF NOT EXISTS idx_transport_company_admin_company_id ON "TransportCompanyAdmin"(company_id);
CREATE INDEX IF NOT EXISTS idx_transport_company_admin_active ON "TransportCompanyAdmin"(is_active);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_transport_company_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transport_company_admin_updated_at 
BEFORE UPDATE ON "TransportCompanyAdmin" 
FOR EACH ROW 
EXECUTE FUNCTION update_transport_company_admin_updated_at();

-- 2. Tạo view để dễ query (join với LogisticsCompany)
CREATE OR REPLACE VIEW "TransportCompanyAdminView" AS
SELECT 
  tca.admin_id,
  tca.company_id,
  tca.name,
  tca.phone,
  tca.email,
  tca.is_active,
  tca.created_at,
  tca.updated_at,
  lc.company_name,
  lc.address as company_address,
  lc.phone as company_phone,
  lc.email as company_email
FROM "TransportCompanyAdmin" tca
INNER JOIN "LogisticsCompany" lc ON tca.company_id = lc.company_id;

-- 3. Comment cho bảng
COMMENT ON TABLE "TransportCompanyAdmin" IS 'Bảng lưu tài khoản admin riêng biệt của các công ty vận tải';
COMMENT ON COLUMN "TransportCompanyAdmin".admin_id IS 'ID của admin';
COMMENT ON COLUMN "TransportCompanyAdmin".company_id IS 'ID của công ty (từ bảng LogisticsCompany)';
COMMENT ON COLUMN "TransportCompanyAdmin".email IS 'Email đăng nhập (unique)';
COMMENT ON COLUMN "TransportCompanyAdmin".password IS 'Mật khẩu đã được hash bằng bcrypt';
COMMENT ON COLUMN "TransportCompanyAdmin".is_active IS 'Trạng thái hoạt động của tài khoản';
