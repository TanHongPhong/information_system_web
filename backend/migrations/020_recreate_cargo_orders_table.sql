-- Migration: Tạo lại bảng CargoOrders với order_id là VARCHAR(4) thay vì SERIAL
-- Status mới: PENDING_PAYMENT, PAID, ACCEPTED, LOADING, IN_TRANSIT, WAREHOUSE_RECEIVED, COMPLETED

SET search_path TO public;

-- =====================================================
-- BƯỚC 1: Xóa các bảng/phụ thuộc liên quan
-- =====================================================

-- Xóa Transactions trước (vì có foreign key đến CargoOrders)
DROP TABLE IF EXISTS "Transactions" CASCADE;

-- Xóa các triggers và functions liên quan
DROP TRIGGER IF EXISTS trg_set_order_code ON "CargoOrders";
DROP TRIGGER IF EXISTS trg_cargo_orders_updated_at ON "CargoOrders";
DROP FUNCTION IF EXISTS set_order_code();
DROP FUNCTION IF EXISTS generate_order_code();
DROP FUNCTION IF EXISTS cargo_orders_set_updated_at();
DROP FUNCTION IF EXISTS cleanup_pending_payment_orders();

-- Xóa bảng CargoOrders
DROP TABLE IF EXISTS "CargoOrders" CASCADE;

-- =====================================================
-- BƯỚC 2: Tạo lại bảng CargoOrders với cấu trúc mới
-- =====================================================

CREATE TABLE "CargoOrders" (
  order_id VARCHAR(4) PRIMARY KEY,  -- Mã đơn hàng 4 chữ số (1000-9999)
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE RESTRICT,
  vehicle_id INTEGER REFERENCES "Vehicles"(vehicle_id) ON DELETE SET NULL,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Thông tin hàng hóa
  cargo_name TEXT NOT NULL,
  cargo_type TEXT,
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
  
  -- Thông tin liên hệ
  contact_name TEXT,
  contact_phone VARCHAR(20),
  
  -- Trạng thái đơn hàng
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (
    status IN (
      'PENDING_PAYMENT',      -- Chưa thanh toán (sẽ tự xóa sau 15 phút)
      'PAID',                 -- Đã thanh toán
      'ACCEPTED',             -- Đã được supplier tiếp nhận
      'LOADING',              -- Bốc hàng
      'IN_TRANSIT',           -- Đang vận chuyển
      'WAREHOUSE_RECEIVED',   -- Xác nhận nhập kho
      'COMPLETED'             -- Hoàn thành
    )
  ),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BƯỚC 3: Tạo indexes
-- =====================================================

CREATE INDEX idx_cargo_orders_company ON "CargoOrders"(company_id);
CREATE INDEX idx_cargo_orders_vehicle ON "CargoOrders"(vehicle_id);
CREATE INDEX idx_cargo_orders_customer ON "CargoOrders"(customer_id);
CREATE INDEX idx_cargo_orders_status ON "CargoOrders"(status);
CREATE INDEX idx_cargo_orders_pickup_time ON "CargoOrders"(pickup_time);
CREATE INDEX idx_cargo_orders_pending_payment ON "CargoOrders"(status, created_at) WHERE status = 'PENDING_PAYMENT';

-- =====================================================
-- BƯỚC 4: Tạo functions và triggers
-- =====================================================

-- Function để generate mã 4 số ngẫu nhiên (1000-9999)
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS VARCHAR(4) AS $$
DECLARE
    new_id VARCHAR(4);
    id_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate mã 4 số ngẫu nhiên từ 1000 đến 9999
        new_id := LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0');
        
        -- Kiểm tra xem mã đã tồn tại chưa
        SELECT EXISTS(SELECT 1 FROM "CargoOrders" WHERE order_id = new_id) INTO id_exists;
        
        -- Nếu mã không tồn tại, trả về
        IF NOT id_exists THEN
            RETURN new_id;
        END IF;
        
        -- Tăng số lần thử
        attempts := attempts + 1;
        
        -- Nếu thử quá nhiều lần, raise error
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Không thể tạo mã đơn hàng duy nhất sau % lần thử', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function để cleanup PENDING_PAYMENT orders sau 15 phút
CREATE OR REPLACE FUNCTION cleanup_pending_payment_orders()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "CargoOrders"
    WHERE status = 'PENDING_PAYMENT'
      AND created_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function để update updated_at
CREATE OR REPLACE FUNCTION cargo_orders_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động generate order_id khi tạo order mới
CREATE OR REPLACE FUNCTION set_order_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ generate nếu order_id chưa có
    IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
        NEW.order_id := generate_order_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_order_id
BEFORE INSERT ON "CargoOrders"
FOR EACH ROW
EXECUTE FUNCTION set_order_id();

CREATE TRIGGER trg_cargo_orders_updated_at
BEFORE UPDATE ON "CargoOrders"
FOR EACH ROW
EXECUTE FUNCTION cargo_orders_set_updated_at();

-- =====================================================
-- BƯỚC 5: Tạo lại bảng Transactions
-- =====================================================

CREATE TABLE "Transactions" (
  transaction_id SERIAL PRIMARY KEY,
  order_id VARCHAR(4) NOT NULL REFERENCES "CargoOrders"(order_id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  transaction_code VARCHAR(100) UNIQUE,
  paid_at TIMESTAMP,
  gateway_response JSONB,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_order ON "Transactions"(order_id);
CREATE INDEX idx_transactions_company ON "Transactions"(company_id);
CREATE INDEX idx_transactions_customer ON "Transactions"(customer_id);
CREATE INDEX idx_transactions_status ON "Transactions"(payment_status);
CREATE INDEX idx_transactions_code ON "Transactions"(transaction_code);

-- Trigger để update updated_at cho Transactions
CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON "Transactions"
FOR EACH ROW
EXECUTE FUNCTION cargo_orders_set_updated_at();

-- =====================================================
-- HOÀN THÀNH
-- =====================================================

COMMENT ON COLUMN "CargoOrders".order_id IS 'Mã đơn hàng 4 chữ số ngẫu nhiên (1000-9999)';
COMMENT ON COLUMN "CargoOrders".status IS 'PENDING_PAYMENT: Chưa thanh toán (tự xóa sau 15 phút), PAID: Đã thanh toán, ACCEPTED: Đã tiếp nhận, LOADING: Bốc hàng, IN_TRANSIT: Đang vận chuyển, WAREHOUSE_RECEIVED: Nhập kho, COMPLETED: Hoàn thành';

