-- Migration: Thêm các trường reset password vào bảng users
-- Mục đích: Hỗ trợ chức năng quên mật khẩu và reset password

SET search_path TO public;

-- Thêm cột reset_token nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'reset_token'
  ) THEN
    EXECUTE 'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)';
  END IF;
END $$;

-- Thêm cột reset_token_expiry nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'reset_token_expiry'
  ) THEN
    EXECUTE 'ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP';
  END IF;
END $$;

-- Tạo index cho reset_token để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token) WHERE reset_token IS NOT NULL;

-- Thêm cột reset_token và reset_token_expiry cho TransportCompanyAdmin nếu cần
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'TransportCompanyAdmin') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'TransportCompanyAdmin' AND column_name = 'reset_token'
    ) THEN
      EXECUTE 'ALTER TABLE "TransportCompanyAdmin" ADD COLUMN reset_token VARCHAR(255)';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'TransportCompanyAdmin' AND column_name = 'reset_token_expiry'
    ) THEN
      EXECUTE 'ALTER TABLE "TransportCompanyAdmin" ADD COLUMN reset_token_expiry TIMESTAMP';
    END IF;
  END IF;
END $$;

-- Tạo index cho reset_token trong TransportCompanyAdmin
CREATE INDEX IF NOT EXISTS idx_transport_company_admin_reset_token 
ON "TransportCompanyAdmin"(reset_token) WHERE reset_token IS NOT NULL;

