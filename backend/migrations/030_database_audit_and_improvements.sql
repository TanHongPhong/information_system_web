-- =====================================================
-- MIGRATION: Database Audit và Improvements
-- Mục đích: Bổ sung các bảng, cột, indexes, constraints còn thiếu
-- Ngày tạo: 2025
-- =====================================================

SET search_path TO public;

-- =====================================================
-- PHẦN 1: KIỂM TRA VÀ BỔ SUNG CÁC BẢNG CÒN THIẾU
-- =====================================================

-- 1.1. Bảng OrderStatusHistory: Lưu lịch sử thay đổi trạng thái đơn hàng
-- Đây là bảng quan trọng để audit và theo dõi quá trình xử lý đơn hàng
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  history_id SERIAL PRIMARY KEY,
  order_id VARCHAR(4) NOT NULL REFERENCES "CargoOrders"(order_id) ON DELETE CASCADE,
  
  -- Trạng thái cũ và mới
  old_status VARCHAR(32),
  new_status VARCHAR(32) NOT NULL,
  
  -- Người thay đổi (có thể là user_id, driver_id, hoặc system)
  changed_by_type VARCHAR(50), -- 'USER', 'DRIVER', 'SYSTEM', 'ADMIN', 'WAREHOUSE'
  changed_by_id VARCHAR(255),  -- ID của người thay đổi (có thể là UUID hoặc INTEGER)
  changed_by_name VARCHAR(255), -- Tên người thay đổi (để dễ query)
  
  -- Lý do thay đổi
  reason TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho OrderStatusHistory
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON "OrderStatusHistory"(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON "OrderStatusHistory"(new_status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_by ON "OrderStatusHistory"(changed_by_type, changed_by_id);

-- 1.2. Bảng PaymentMethods: Lưu các phương thức thanh toán được hỗ trợ
CREATE TABLE IF NOT EXISTS "PaymentMethods" (
  method_id SERIAL PRIMARY KEY,
  method_code VARCHAR(50) NOT NULL UNIQUE, -- 'vietqr', 'bank_transfer', 'cash', 'credit_card'
  method_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  icon_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data cho PaymentMethods
INSERT INTO "PaymentMethods" (method_code, method_name, description, is_active)
VALUES 
  ('vietqr', 'VietQR', 'Thanh toán qua mã QR VietQR', TRUE),
  ('bank_transfer', 'Chuyển khoản ngân hàng', 'Thanh toán qua chuyển khoản', TRUE),
  ('cash', 'Tiền mặt', 'Thanh toán bằng tiền mặt', TRUE),
  ('credit_card', 'Thẻ tín dụng', 'Thanh toán bằng thẻ tín dụng', FALSE)
ON CONFLICT (method_code) DO UPDATE
SET method_name = EXCLUDED.method_name,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- Trigger để update updated_at cho PaymentMethods
CREATE OR REPLACE FUNCTION payment_methods_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_methods_updated_at ON "PaymentMethods";
CREATE TRIGGER trg_payment_methods_updated_at
BEFORE UPDATE ON "PaymentMethods"
FOR EACH ROW EXECUTE FUNCTION payment_methods_set_updated_at();

-- 1.3. Bảng UserPreferences: Lưu cài đặt người dùng
CREATE TABLE IF NOT EXISTS "UserPreferences" (
  preference_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Cài đặt thông báo
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  
  -- Cài đặt hiển thị
  language VARCHAR(10) DEFAULT 'vi',
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark'
  
  -- Cài đặt đơn hàng
  default_payment_method VARCHAR(50),
  auto_save_draft BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);

-- Indexes cho UserPreferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON "UserPreferences"(user_id);

-- Trigger để update updated_at cho UserPreferences
CREATE OR REPLACE FUNCTION user_preferences_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON "UserPreferences";
CREATE TRIGGER trg_user_preferences_updated_at
BEFORE UPDATE ON "UserPreferences"
FOR EACH ROW EXECUTE FUNCTION user_preferences_set_updated_at();

-- 1.4. Bảng DocumentFiles: Lưu thông tin tài liệu, hóa đơn, vận đơn
CREATE TABLE IF NOT EXISTS "DocumentFiles" (
  document_id SERIAL PRIMARY KEY,
  
  -- Liên kết với đơn hàng hoặc giao dịch
  order_id VARCHAR(4) REFERENCES "CargoOrders"(order_id) ON DELETE CASCADE,
  transaction_id INTEGER REFERENCES "Transactions"(transaction_id) ON DELETE CASCADE,
  
  -- Loại tài liệu
  document_type VARCHAR(50) NOT NULL, -- 'INVOICE', 'BILL_OF_LADING', 'CONTRACT', 'RECEIPT', 'OTHER'
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500), -- Đường dẫn file trên server hoặc cloud storage
  file_url VARCHAR(500),  -- URL công khai (nếu có)
  file_size BIGINT,      -- Kích thước file (bytes)
  mime_type VARCHAR(100), -- 'application/pdf', 'image/jpeg', etc.
  
  -- Thông tin upload
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho DocumentFiles
CREATE INDEX IF NOT EXISTS idx_document_files_order ON "DocumentFiles"(order_id);
CREATE INDEX IF NOT EXISTS idx_document_files_transaction ON "DocumentFiles"(transaction_id);
CREATE INDEX IF NOT EXISTS idx_document_files_type ON "DocumentFiles"(document_type);
CREATE INDEX IF NOT EXISTS idx_document_files_uploaded_by ON "DocumentFiles"(uploaded_by);

-- Trigger để update updated_at cho DocumentFiles
CREATE OR REPLACE FUNCTION document_files_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_document_files_updated_at ON "DocumentFiles";
CREATE TRIGGER trg_document_files_updated_at
BEFORE UPDATE ON "DocumentFiles"
FOR EACH ROW EXECUTE FUNCTION document_files_set_updated_at();

-- =====================================================
-- PHẦN 2: BỔ SUNG CÁC CỘT CÒN THIẾU
-- =====================================================

-- 2.1. Bổ sung cột cho bảng CargoOrders
-- Thêm cột order_code (mã đơn hàng dạng GMD00000000XXXX) nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'CargoOrders' AND column_name = 'order_code'
  ) THEN
    -- Thêm cột trước (không có UNIQUE)
    EXECUTE 'ALTER TABLE "CargoOrders" ADD COLUMN order_code VARCHAR(20)';
  END IF;
END $$;

-- Tạo function để generate order_code (bên ngoài DO block)
CREATE OR REPLACE FUNCTION generate_order_code(order_id_val VARCHAR(4))
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN 'GMD' || LPAD(order_id_val, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Update các đơn hàng hiện tại nếu có cột order_code
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'CargoOrders' AND column_name = 'order_code'
  ) THEN
    -- Update các đơn hàng hiện tại
    EXECUTE format('UPDATE "CargoOrders" SET order_code = generate_order_code(order_id) WHERE order_code IS NULL OR order_code = %L', '');
    
    -- Tạo unique index (thay vì UNIQUE constraint)
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_cargo_orders_order_code_unique ON "CargoOrders"(order_code) WHERE order_code IS NOT NULL';
  END IF;
END $$;

-- Tạo trigger để tự động generate order_code
CREATE OR REPLACE FUNCTION set_order_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_code IS NULL OR NEW.order_code = '' THEN
    NEW.order_code := generate_order_code(NEW.order_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_code ON "CargoOrders";
CREATE TRIGGER trg_set_order_code
BEFORE INSERT OR UPDATE ON "CargoOrders"
FOR EACH ROW
WHEN (NEW.order_code IS NULL OR NEW.order_code = '')
EXECUTE FUNCTION set_order_code();

-- Thêm cột estimated_delivery_time nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'CargoOrders' AND column_name = 'estimated_delivery_time'
  ) THEN
    EXECUTE 'ALTER TABLE "CargoOrders" ADD COLUMN estimated_delivery_time TIMESTAMP';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cargo_orders_estimated_delivery ON "CargoOrders"(estimated_delivery_time)';
  END IF;
END $$;

-- Thêm cột priority nếu chưa có (ưu tiên đơn hàng)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'CargoOrders' AND column_name = 'priority'
  ) THEN
    EXECUTE 'ALTER TABLE "CargoOrders" ADD COLUMN priority VARCHAR(20) DEFAULT ''NORMAL'' CHECK (priority IN (''LOW'', ''NORMAL'', ''HIGH'', ''URGENT''))';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cargo_orders_priority ON "CargoOrders"(priority)';
  END IF;
END $$;

-- 2.2. Bổ sung cột cho bảng Transactions
-- Thêm cột refund_amount nếu chưa có (số tiền hoàn lại)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Transactions' AND column_name = 'refund_amount'
  ) THEN
    EXECUTE 'ALTER TABLE "Transactions" ADD COLUMN refund_amount NUMERIC(14,2) CHECK (refund_amount >= 0)';
  END IF;
END $$;

-- Thêm cột refunded_at nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Transactions' AND column_name = 'refunded_at'
  ) THEN
    EXECUTE 'ALTER TABLE "Transactions" ADD COLUMN refunded_at TIMESTAMP';
  END IF;
END $$;

-- Thêm cột refund_reason nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Transactions' AND column_name = 'refund_reason'
  ) THEN
    EXECUTE 'ALTER TABLE "Transactions" ADD COLUMN refund_reason TEXT';
  END IF;
END $$;

-- 2.3. Bổ sung cột cho bảng Vehicles
-- Thêm cột last_maintenance_date nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Vehicles' AND column_name = 'last_maintenance_date'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicles" ADD COLUMN last_maintenance_date DATE';
  END IF;
END $$;

-- Thêm cột next_maintenance_date nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Vehicles' AND column_name = 'next_maintenance_date'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicles" ADD COLUMN next_maintenance_date DATE';
  END IF;
END $$;

-- Thêm cột fuel_type nếu chưa có (loại nhiên liệu)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'Vehicles' AND column_name = 'fuel_type'
  ) THEN
    EXECUTE 'ALTER TABLE "Vehicles" ADD COLUMN fuel_type VARCHAR(20) CHECK (fuel_type IN (''DIESEL'', ''PETROL'', ''ELECTRIC'', ''HYBRID'', ''LPG''))';
  END IF;
END $$;

-- 2.4. Bổ sung cột cho bảng LogisticsCompany
-- Thêm cột tax_code nếu chưa có (mã số thuế)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'LogisticsCompany' AND column_name = 'tax_code'
  ) THEN
    EXECUTE 'ALTER TABLE "LogisticsCompany" ADD COLUMN tax_code VARCHAR(20)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_logistics_company_tax_code ON "LogisticsCompany"(tax_code)';
  END IF;
END $$;

-- Thêm cột website nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'LogisticsCompany' AND column_name = 'website'
  ) THEN
    EXECUTE 'ALTER TABLE "LogisticsCompany" ADD COLUMN website VARCHAR(255)';
  END IF;
END $$;

-- 2.5. Bổ sung cột cho bảng Users
-- Thêm cột avatar_url nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    EXECUTE 'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)';
  END IF;
END $$;

-- Thêm cột email_verified nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_verified'
  ) THEN
    EXECUTE 'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE';
  END IF;
END $$;

-- Thêm cột phone_verified nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_verified'
  ) THEN
    EXECUTE 'ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE';
  END IF;
END $$;

-- =====================================================
-- PHẦN 3: BỔ SUNG INDEXES CHO PERFORMANCE
-- =====================================================

-- 3.1. Composite indexes cho các query phổ biến

-- Index cho CargoOrders: company_id + status + created_at
CREATE INDEX IF NOT EXISTS idx_cargo_orders_company_status_created 
ON "CargoOrders"(company_id, status, created_at DESC);

-- Index cho CargoOrders: vehicle_id + status
CREATE INDEX IF NOT EXISTS idx_cargo_orders_vehicle_status 
ON "CargoOrders"(vehicle_id, status) WHERE vehicle_id IS NOT NULL;

-- Index cho Transactions: customer_id + payment_status + created_at
CREATE INDEX IF NOT EXISTS idx_transactions_customer_status_created 
ON "Transactions"(customer_id, payment_status, created_at DESC) WHERE customer_id IS NOT NULL;

-- Index cho Transactions: company_id + payment_status + created_at
CREATE INDEX IF NOT EXISTS idx_transactions_company_status_created 
ON "Transactions"(company_id, payment_status, created_at DESC);

-- Index cho LocationHistory: vehicle_id + order_id + recorded_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'LocationHistory'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_location_history_vehicle_order_time ON "LocationHistory"(vehicle_id, order_id, recorded_at DESC) WHERE vehicle_id IS NOT NULL';
  END IF;
END $$;

-- Index cho WarehouseOperations: warehouse_id + operation_type + status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'WarehouseOperations'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_warehouse_ops_warehouse_type_status ON "WarehouseOperations"(warehouse_id, operation_type, status) WHERE warehouse_id IS NOT NULL';
  END IF;
END $$;

-- Index cho WarehouseInventory: warehouse_id + status + entered_at
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'WarehouseInventory'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse_status_entered ON "WarehouseInventory"(warehouse_id, status, entered_at DESC) WHERE warehouse_id IS NOT NULL';
  END IF;
END $$;

-- Index cho Drivers: company_id + status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'Drivers'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_drivers_company_status ON "Drivers"(company_id, status) WHERE company_id IS NOT NULL';
  END IF;
END $$;

-- Index cho Vehicles: company_id + status + vehicle_type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'Vehicles'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_vehicles_company_status_type ON "Vehicles"(company_id, status, vehicle_type) WHERE company_id IS NOT NULL';
  END IF;
END $$;

-- =====================================================
-- PHẦN 4: TẠO TRIGGER ĐỂ TỰ ĐỘNG LƯU LỊCH SỬ THAY ĐỔI STATUS
-- =====================================================

-- Function để tự động tạo record trong OrderStatusHistory khi status thay đổi
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Chỉ log khi status thực sự thay đổi
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO "OrderStatusHistory" (
      order_id,
      old_status,
      new_status,
      changed_by_type,
      changed_by_id,
      changed_by_name,
      reason,
      notes
    )
    VALUES (
      NEW.order_id,
      OLD.status,
      NEW.status,
      'SYSTEM', -- Mặc định là SYSTEM, có thể override từ application
      NULL,
      'System',
      'Status changed automatically',
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger nếu chưa có
DROP TRIGGER IF EXISTS trg_log_order_status_change ON "CargoOrders";
CREATE TRIGGER trg_log_order_status_change
AFTER UPDATE ON "CargoOrders"
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION log_order_status_change();

-- =====================================================
-- PHẦN 5: ĐẢM BẢO TẤT CẢ FOREIGN KEYS ĐƯỢC SET ĐÚNG
-- =====================================================

-- 5.1. Kiểm tra và thêm foreign key cho WarehouseOperations.warehouse_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'WarehouseOperations'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' AND constraint_name = 'fk_warehouse_operations_warehouse'
  ) THEN
    EXECUTE 'ALTER TABLE "WarehouseOperations" ADD CONSTRAINT fk_warehouse_operations_warehouse FOREIGN KEY (warehouse_id) REFERENCES "Warehouses"(warehouse_id) ON DELETE SET NULL';
  END IF;
END $$;

-- 5.2. Kiểm tra và thêm foreign key cho Transactions.customer_id (nếu chưa có)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' AND constraint_name = 'transactions_customer_id_fkey'
  ) THEN
    EXECUTE 'ALTER TABLE "Transactions" ADD CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL';
  END IF;
END $$;

-- =====================================================
-- PHẦN 6: TẠO VIEWS HỮU ÍCH CHO QUERY
-- =====================================================

-- 6.1. View tổng hợp thông tin đơn hàng với tất cả thông tin liên quan
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'CargoOrders'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW "OrderDetailsView" AS
SELECT 
  co.order_id,
  co.order_code,
  co.company_id,
  lc.company_name,
  co.vehicle_id,
  v.license_plate,
  v.vehicle_type,
  co.customer_id,
  COALESCE(co.contact_name, u.name) as customer_name,
  COALESCE(co.contact_phone, u.phone) as customer_phone,
  u.email as customer_email,
  co.cargo_name,
  co.cargo_type,
  co.weight_kg,
  co.volume_m3,
  co.value_vnd,
  co.pickup_address,
  co.dropoff_address,
  co.pickup_time,
  co.estimated_delivery_time,
  co.status,
  co.priority,
  co.created_at,
  co.updated_at,
  -- Thông tin giao dịch
  t.transaction_id,
  t.payment_status,
  t.amount,
  t.payment_method,
  t.paid_at,
  -- Thông tin driver
  d.driver_id,
  d.full_name as driver_name,
  d.phone as driver_phone,
  -- Thông tin warehouse
  wi.inventory_id,
  wi.status as warehouse_status,
  w.warehouse_name
FROM "CargoOrders" co
LEFT JOIN "LogisticsCompany" lc ON co.company_id = lc.company_id
LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
LEFT JOIN users u ON co.customer_id = u.id
LEFT JOIN "Transactions" t ON co.order_id = t.order_id AND t.payment_status = ''SUCCESS''
LEFT JOIN "Drivers" d ON v.vehicle_id = d.vehicle_id
LEFT JOIN "WarehouseInventory" wi ON co.order_id = wi.order_id AND wi.status = ''STORED''
LEFT JOIN "Warehouses" w ON wi.warehouse_id = w.warehouse_id';
  END IF;
END $$;

-- 6.2. View thống kê đơn hàng theo công ty
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'CargoOrders'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW "CompanyOrderStatsView" AS
SELECT 
  lc.company_id,
  lc.company_name,
  COUNT(DISTINCT co.order_id) as total_orders,
  COUNT(DISTINCT co.order_id) FILTER (WHERE co.status = ''PENDING_PAYMENT'') as pending_payment_orders,
  COUNT(DISTINCT co.order_id) FILTER (WHERE co.status = ''PAID'') as paid_orders,
  COUNT(DISTINCT co.order_id) FILTER (WHERE co.status = ''ACCEPTED'') as accepted_orders,
  COUNT(DISTINCT co.order_id) FILTER (WHERE co.status = ''IN_TRANSIT'') as in_transit_orders,
  COUNT(DISTINCT co.order_id) FILTER (WHERE co.status = ''COMPLETED'') as completed_orders,
  SUM(t.amount) FILTER (WHERE t.payment_status = ''SUCCESS'') as total_revenue,
  AVG(t.amount) FILTER (WHERE t.payment_status = ''SUCCESS'') as avg_order_value
FROM "LogisticsCompany" lc
LEFT JOIN "CargoOrders" co ON lc.company_id = co.company_id
LEFT JOIN "Transactions" t ON co.order_id = t.order_id
GROUP BY lc.company_id, lc.company_name';
  END IF;
END $$;

-- 6.3. View thống kê warehouse
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'Warehouses'
  ) THEN
    EXECUTE 'CREATE OR REPLACE VIEW "WarehouseStatsView" AS
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  w.company_id,
  lc.company_name,
  COUNT(DISTINCT wi.inventory_id) as total_items,
  COUNT(DISTINCT wi.inventory_id) FILTER (WHERE wi.status = ''INCOMING'') as incoming_items,
  COUNT(DISTINCT wi.inventory_id) FILTER (WHERE wi.status = ''STORED'') as stored_items,
  COUNT(DISTINCT wi.inventory_id) FILTER (WHERE wi.status = ''OUTGOING'') as outgoing_items,
  COUNT(DISTINCT wi.inventory_id) FILTER (WHERE wi.status = ''SHIPPED'') as shipped_items,
  SUM(wi.volume_m3) FILTER (WHERE wi.status = ''STORED'') as used_capacity_m3,
  w.available_capacity_m3,
  w.total_capacity_m3,
  ROUND((w.available_capacity_m3 / NULLIF(w.total_capacity_m3, 0) * 100)::NUMERIC, 2) as capacity_usage_percent
FROM "Warehouses" w
LEFT JOIN "LogisticsCompany" lc ON w.company_id = lc.company_id
LEFT JOIN "WarehouseInventory" wi ON w.warehouse_id = wi.warehouse_id
GROUP BY w.warehouse_id, w.warehouse_name, w.company_id, lc.company_name, w.available_capacity_m3, w.total_capacity_m3';
  END IF;
END $$;

-- =====================================================
-- PHẦN 7: KIỂM TRA VÀ BÁO CÁO
-- =====================================================

-- Hiển thị thông tin các bảng đã tạo
SELECT 
  '=== NEW TABLES CREATED ===' as info;

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('OrderStatusHistory', 'PaymentMethods', 'UserPreferences', 'DocumentFiles')
ORDER BY table_name;

-- Hiển thị số lượng indexes mới
SELECT 
  '=== NEW INDEXES CREATED ===' as info;

SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Hiển thị các views đã tạo
SELECT 
  '=== VIEWS CREATED ===' as info;

SELECT 
  table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%View'
ORDER BY table_name;

-- =====================================================
-- HOÀN THÀNH
-- =====================================================

COMMENT ON TABLE "OrderStatusHistory" IS 'Lưu lịch sử thay đổi trạng thái đơn hàng để audit và tracking';
COMMENT ON TABLE "PaymentMethods" IS 'Danh sách các phương thức thanh toán được hỗ trợ';
COMMENT ON TABLE "UserPreferences" IS 'Cài đặt và tùy chọn của người dùng';
COMMENT ON TABLE "DocumentFiles" IS 'Quản lý tài liệu, hóa đơn, vận đơn liên quan đến đơn hàng';

SELECT '✅ Database audit and improvements completed successfully!' as result;

