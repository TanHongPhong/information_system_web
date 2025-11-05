-- Migration: Thêm status PENDING_PAYMENT cho đơn hàng chờ thanh toán
-- Chạy migration này trước khi cập nhật code

SET search_path TO public;

-- 1. Thêm status PENDING_PAYMENT vào CHECK constraint
-- Tìm và drop TẤT CẢ constraint CHECK liên quan đến status (có thể có tên tự động)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Tìm tất cả constraint CHECK liên quan đến status
    FOR constraint_record IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'CargoOrders'
          AND constraint_type = 'CHECK'
    LOOP
        -- Kiểm tra xem constraint có liên quan đến status không
        IF EXISTS (
            SELECT 1 
            FROM information_schema.check_constraints 
            WHERE constraint_name = constraint_record.constraint_name
              AND check_clause LIKE '%status%'
        ) THEN
            EXECUTE format('ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS %I', constraint_record.constraint_name);
            RAISE NOTICE 'Đã xóa constraint: %', constraint_record.constraint_name;
        END IF;
    END LOOP;
END $$;

-- Thêm constraint mới với PENDING_PAYMENT (đảm bảo không trùng)
DO $$
BEGIN
    -- Xóa constraint cũ nếu đã tồn tại với tên này
    ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS cargoorders_status_check;
    
    -- Thêm constraint mới
    ALTER TABLE "CargoOrders" 
    ADD CONSTRAINT cargoorders_status_check 
    CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'SUBMITTED', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'));
    
    RAISE NOTICE '✅ Đã thêm constraint với PENDING_PAYMENT';
END $$;

-- 2. Tạo index cho status PENDING_PAYMENT để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_cargo_orders_pending_payment 
ON "CargoOrders"(status, created_at) 
WHERE status = 'PENDING_PAYMENT';

-- 3. Tạo function để tự động xóa đơn hàng PENDING_PAYMENT sau 15 phút
CREATE OR REPLACE FUNCTION cleanup_pending_payment_orders()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Xóa các đơn hàng có status PENDING_PAYMENT và tạo hơn 15 phút
    DELETE FROM "CargoOrders"
    WHERE status = 'PENDING_PAYMENT'
      AND created_at < NOW() - INTERVAL '15 minutes';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log số lượng đơn hàng đã xóa
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Đã xóa % đơn hàng chờ thanh toán quá 15 phút', deleted_count;
    END IF;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Tạo extension pg_cron nếu chưa có (cần quyền superuser)
-- Nếu không có quyền, có thể chạy function này thủ công hoặc dùng Node.js cron job
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 5. Lưu ý: Nếu dùng pg_cron, có thể schedule job như sau:
-- SELECT cron.schedule('cleanup-pending-orders', '*/5 * * * *', $$SELECT cleanup_pending_payment_orders()$$);
-- (Chạy mỗi 5 phút)

-- 6. Hoặc dùng PostgreSQL Event Trigger (nếu có quyền)
-- Tạo function tự động chạy khi INSERT
CREATE OR REPLACE FUNCTION check_pending_payment_cleanup()
RETURNS TRIGGER AS $$
BEGIN
    -- Tự động cleanup khi có đơn hàng mới
    PERFORM cleanup_pending_payment_orders();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger để tự động cleanup (tùy chọn - có thể comment nếu không cần)
-- CREATE TRIGGER trg_auto_cleanup_pending_payment
-- AFTER INSERT ON "CargoOrders"
-- FOR EACH ROW
-- WHEN (NEW.status = 'PENDING_PAYMENT')
-- EXECUTE FUNCTION check_pending_payment_cleanup();

