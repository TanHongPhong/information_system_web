-- Migration: Tối ưu và tinh chỉnh database
-- Bao gồm: indexes, constraints, triggers, views, và data integrity

SET search_path TO public;

-- =====================================================
-- 1. KIỂM TRA VÀ ĐẢM BẢO CONSTRAINTS
-- =====================================================

-- 1.1. Đảm bảo customer_id trong Transactions có thể được update từ CargoOrders
-- (Không cần constraint mới, chỉ cần đảm bảo foreign key đúng)

-- 1.2. Thêm check constraint cho amount trong Transactions (phải >= 0)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transactions_amount_check' 
        AND table_name = 'Transactions'
    ) THEN
        ALTER TABLE "Transactions" 
        ADD CONSTRAINT transactions_amount_check 
        CHECK (amount >= 0);
        RAISE NOTICE '✅ Đã thêm constraint transactions_amount_check';
    ELSE
        RAISE NOTICE '⚠️  Constraint transactions_amount_check đã tồn tại';
    END IF;
END $$;

-- 1.3. Thêm check constraint cho weight_kg và volume_m3 trong CargoOrders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cargoorders_weight_check' 
        AND table_name = 'CargoOrders'
    ) THEN
        ALTER TABLE "CargoOrders" 
        ADD CONSTRAINT cargoorders_weight_check 
        CHECK (weight_kg IS NULL OR weight_kg >= 0);
        RAISE NOTICE '✅ Đã thêm constraint cargoorders_weight_check';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cargoorders_volume_check' 
        AND table_name = 'CargoOrders'
    ) THEN
        ALTER TABLE "CargoOrders" 
        ADD CONSTRAINT cargoorders_volume_check 
        CHECK (volume_m3 IS NULL OR volume_m3 >= 0);
        RAISE NOTICE '✅ Đã thêm constraint cargoorders_volume_check';
    END IF;
END $$;

-- =====================================================
-- 2. TỐI ƯU INDEXES CHO PERFORMANCE
-- =====================================================

-- 2.1. Composite indexes cho các query phổ biến

-- Index cho query orders theo customer và status
CREATE INDEX IF NOT EXISTS idx_cargo_orders_customer_status 
ON "CargoOrders"(customer_id, status, created_at DESC)
WHERE customer_id IS NOT NULL;

-- Index cho query transactions theo customer và payment_status
CREATE INDEX IF NOT EXISTS idx_transactions_customer_status 
ON "Transactions"(customer_id, payment_status, created_at DESC)
WHERE customer_id IS NOT NULL;

-- Index cho query orders theo company và status
CREATE INDEX IF NOT EXISTS idx_cargo_orders_company_status 
ON "CargoOrders"(company_id, status, created_at DESC);

-- Index cho query orders theo vehicle và status
CREATE INDEX IF NOT EXISTS idx_cargo_orders_vehicle_status 
ON "CargoOrders"(vehicle_id, status, created_at DESC)
WHERE vehicle_id IS NOT NULL;

-- Index cho query tìm orders theo customer và thời gian
CREATE INDEX IF NOT EXISTS idx_cargo_orders_customer_created 
ON "CargoOrders"(customer_id, created_at DESC)
WHERE customer_id IS NOT NULL;

-- Index cho query tìm transactions theo order và payment_status
CREATE INDEX IF NOT EXISTS idx_transactions_order_status 
ON "Transactions"(order_id, payment_status);

-- =====================================================
-- 3. TRIGGERS TỰ ĐỘNG CẬP NHẬT
-- =====================================================

-- 3.1. Trigger tự động update customer_id trong Transactions khi insert/update
CREATE OR REPLACE FUNCTION auto_update_transaction_customer_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu transaction không có customer_id, lấy từ order
    IF NEW.customer_id IS NULL AND NEW.order_id IS NOT NULL THEN
        SELECT customer_id INTO NEW.customer_id
        FROM "CargoOrders"
        WHERE order_id = NEW.order_id
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger cũ nếu có
DROP TRIGGER IF EXISTS trg_auto_update_transaction_customer_id ON "Transactions";

-- Tạo trigger mới
DROP TRIGGER IF EXISTS trg_auto_update_transaction_customer_id ON "Transactions";
CREATE TRIGGER trg_auto_update_transaction_customer_id
BEFORE INSERT OR UPDATE ON "Transactions"
FOR EACH ROW
EXECUTE FUNCTION auto_update_transaction_customer_id();

-- 3.2. Trigger tự động update updated_at
CREATE OR REPLACE FUNCTION auto_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Thêm trigger cho Transactions nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_transactions_updated_at'
    ) THEN
        CREATE TRIGGER trg_transactions_updated_at
        BEFORE UPDATE ON "Transactions"
        FOR EACH ROW
        EXECUTE FUNCTION auto_update_updated_at();
        RAISE NOTICE '✅ Đã tạo trigger trg_transactions_updated_at';
    END IF;
END $$;

-- =====================================================
-- 4. VIEWS HỮU ÍCH CHO REPORTING
-- =====================================================

-- 4.1. View tổng hợp thông tin order với customer và company
CREATE OR REPLACE VIEW v_orders_with_details AS
SELECT 
    co.order_id,
    co.status,
    co.cargo_name,
    co.weight_kg,
    co.volume_m3,
    co.value_vnd,
    co.pickup_address,
    co.dropoff_address,
    co.created_at as order_created_at,
    co.updated_at as order_updated_at,
    -- Customer info
    co.customer_id,
    u.id as customer_user_id,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    -- Company info
    co.company_id,
    lc.company_name,
    lc.phone as company_phone,
    -- Vehicle info
    co.vehicle_id,
    v.license_plate,
    v.vehicle_type,
    v.driver_name,
    v.driver_phone
FROM "CargoOrders" co
LEFT JOIN users u ON co.customer_id = u.id
LEFT JOIN "LogisticsCompany" lc ON co.company_id = lc.company_id
LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id;

COMMENT ON VIEW v_orders_with_details IS 'View tổng hợp thông tin orders với customer, company, và vehicle';

-- 4.2. View tổng hợp transactions với thông tin đầy đủ
CREATE OR REPLACE VIEW v_transactions_with_details AS
SELECT 
    t.transaction_id,
    t.order_id,
    t.amount,
    t.payment_method,
    t.payment_status,
    t.transaction_code,
    t.paid_at,
    t.created_at as transaction_created_at,
    t.updated_at as transaction_updated_at,
    -- Customer info
    t.customer_id,
    u.id as customer_user_id,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone,
    -- Order info
    co.cargo_name,
    co.status as order_status,
    co.value_vnd as order_value,
    -- Company info
    t.company_id,
    lc.company_name
FROM "Transactions" t
LEFT JOIN users u ON t.customer_id = u.id
LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
LEFT JOIN "LogisticsCompany" lc ON t.company_id = lc.company_id;

COMMENT ON VIEW v_transactions_with_details IS 'View tổng hợp thông tin transactions với customer, order, và company';

-- 4.3. View thống kê orders theo customer
CREATE OR REPLACE VIEW v_customer_order_stats AS
SELECT 
    u.id as customer_id,
    u.name as customer_name,
    u.email as customer_email,
    COUNT(co.order_id) as total_orders,
    COUNT(CASE WHEN co.status = 'PENDING_PAYMENT' THEN 1 END) as pending_payment_orders,
    COUNT(CASE WHEN co.status = 'PAID' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN co.status = 'COMPLETED' THEN 1 END) as completed_orders,
    SUM(co.value_vnd) as total_order_value,
    SUM(CASE WHEN co.status = 'COMPLETED' THEN co.value_vnd ELSE 0 END) as completed_order_value,
    MIN(co.created_at) as first_order_date,
    MAX(co.created_at) as last_order_date
FROM users u
LEFT JOIN "CargoOrders" co ON u.id = co.customer_id
WHERE u.role = 'user'
GROUP BY u.id, u.name, u.email;

COMMENT ON VIEW v_customer_order_stats IS 'Thống kê orders theo customer';

-- =====================================================
-- 5. CẬP NHẬT COMMENTS CHO TẤT CẢ CỘT QUAN TRỌNG
-- =====================================================

-- Comments cho Transactions
COMMENT ON COLUMN "Transactions".order_id IS 'Mã đơn hàng (VARCHAR(4)) - liên kết với CargoOrders';
COMMENT ON COLUMN "Transactions".customer_id IS 'ID khách hàng (UUID) - tự động lấy từ CargoOrders nếu không được cung cấp';
COMMENT ON COLUMN "Transactions".company_id IS 'ID công ty vận chuyển';
COMMENT ON COLUMN "Transactions".amount IS 'Số tiền thanh toán (VND) - phải >= 0';
COMMENT ON COLUMN "Transactions".payment_method IS 'Phương thức thanh toán: momo, zalopay, vpbank, vietqr, etc.';
COMMENT ON COLUMN "Transactions".payment_status IS 'Trạng thái thanh toán: PENDING, SUCCESS, FAILED, CANCELLED';
COMMENT ON COLUMN "Transactions".transaction_code IS 'Mã giao dịch từ gateway (unique)';
COMMENT ON COLUMN "Transactions".paid_at IS 'Thời gian thanh toán thành công (NULL nếu chưa thanh toán)';

-- Comments cho CargoOrders (bổ sung)
COMMENT ON COLUMN "CargoOrders".order_id IS 'Mã đơn hàng 4 chữ số (VARCHAR(4)) - tự động generate';
COMMENT ON COLUMN "CargoOrders".customer_id IS 'ID khách hàng đặt hàng (UUID) - nullable';
COMMENT ON COLUMN "CargoOrders".company_id IS 'ID công ty vận chuyển';
COMMENT ON COLUMN "CargoOrders".vehicle_id IS 'ID xe được gán (nullable - có thể chưa gán xe)';
COMMENT ON COLUMN "CargoOrders".status IS 'Trạng thái: PENDING_PAYMENT → PAID → ACCEPTED → LOADING → IN_TRANSIT → WAREHOUSE_RECEIVED → COMPLETED';
COMMENT ON COLUMN "CargoOrders".value_vnd IS 'Giá trị đơn hàng (VND) - dùng để tính phí vận chuyển';
COMMENT ON COLUMN "CargoOrders".weight_kg IS 'Trọng lượng hàng (kg) - phải >= 0';
COMMENT ON COLUMN "CargoOrders".volume_m3 IS 'Thể tích hàng (m³) - phải >= 0';

-- =====================================================
-- 6. KIỂM TRA VÀ BÁO CÁO
-- =====================================================

-- 6.1. Kiểm tra số lượng indexes
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('Transactions', 'CargoOrders');
    
    RAISE NOTICE '📊 Tổng số indexes trên Transactions và CargoOrders: %', index_count;
END $$;

-- 6.2. Hiển thị thống kê data
DO $$
DECLARE
    transaction_count INTEGER;
    order_count INTEGER;
    customer_count INTEGER;
    missing_customer_id_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO transaction_count FROM "Transactions";
    SELECT COUNT(*) INTO order_count FROM "CargoOrders";
    SELECT COUNT(*) INTO customer_count FROM users WHERE role = 'user';
    SELECT COUNT(*) INTO missing_customer_id_count 
    FROM "Transactions" 
    WHERE customer_id IS NULL;
    
    RAISE NOTICE '📊 Thống kê database:';
    RAISE NOTICE '   - Transactions: %', transaction_count;
    RAISE NOTICE '   - Orders: %', order_count;
    RAISE NOTICE '   - Customers: %', customer_count;
    RAISE NOTICE '   - Transactions thiếu customer_id: %', missing_customer_id_count;
    
    RAISE NOTICE '✅ Migration 025 - Tối ưu database hoàn thành!';
    RAISE NOTICE '   - Đã thêm constraints';
    RAISE NOTICE '   - Đã tối ưu indexes';
    RAISE NOTICE '   - Đã tạo triggers tự động';
    RAISE NOTICE '   - Đã tạo views hữu ích';
    RAISE NOTICE '   - Đã cập nhật comments';
END $$;

-- =====================================================
-- 7. CLEANUP (Nếu cần)
-- =====================================================

-- Không có cleanup cần thiết ở đây
-- Có thể thêm logic cleanup cho LocationHistory nếu cần (xóa dữ liệu cũ hơn X ngày)

