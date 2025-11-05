-- Migration: Sửa constraint CargoOrders_status_check để thêm PENDING_PAYMENT
-- Chạy migration này nếu gặp lỗi: "violates check constraint CargoOrders_status_check"

SET search_path TO public;

-- 1. Xóa TẤT CẢ constraint CHECK liên quan đến status (bất kể tên gì)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Tìm tất cả constraint CHECK trên bảng CargoOrders
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
              AND (check_clause LIKE '%status%' OR check_clause LIKE '%STATUS%')
        ) THEN
            EXECUTE format('ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS %I', constraint_record.constraint_name);
            RAISE NOTICE 'Đã xóa constraint: %', constraint_record.constraint_name;
        END IF;
    END LOOP;
END $$;

-- 2. Thêm constraint mới với PENDING_PAYMENT (đảm bảo không trùng tên)
DO $$
BEGIN
    -- Kiểm tra xem constraint mới đã tồn tại chưa
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public'
          AND table_name = 'CargoOrders'
          AND constraint_name = 'cargoorders_status_check'
    ) THEN
        ALTER TABLE "CargoOrders" 
        ADD CONSTRAINT cargoorders_status_check 
        CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'SUBMITTED', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'));
        
        RAISE NOTICE 'Đã thêm constraint mới với PENDING_PAYMENT';
    ELSE
        RAISE NOTICE 'Constraint cargoorders_status_check đã tồn tại, đang cập nhật...';
        
        -- Xóa constraint cũ nếu tồn tại
        ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS cargoorders_status_check;
        
        -- Thêm lại với PENDING_PAYMENT
        ALTER TABLE "CargoOrders" 
        ADD CONSTRAINT cargoorders_status_check 
        CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'SUBMITTED', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'));
        
        RAISE NOTICE 'Đã cập nhật constraint với PENDING_PAYMENT';
    END IF;
END $$;

-- 3. Kiểm tra và hiển thị constraint hiện tại
DO $$
DECLARE
    constraint_check TEXT;
BEGIN
    SELECT check_clause INTO constraint_check
    FROM information_schema.check_constraints
    WHERE constraint_name = 'cargoorders_status_check'
    LIMIT 1;
    
    IF constraint_check IS NOT NULL THEN
        RAISE NOTICE 'Constraint hiện tại: %', constraint_check;
        
        -- Kiểm tra xem có PENDING_PAYMENT không
        IF constraint_check LIKE '%PENDING_PAYMENT%' THEN
            RAISE NOTICE '✅ Constraint đã có PENDING_PAYMENT!';
        ELSE
            RAISE WARNING '⚠️  Constraint chưa có PENDING_PAYMENT!';
        END IF;
    ELSE
        RAISE WARNING '⚠️  Không tìm thấy constraint cargoorders_status_check!';
    END IF;
END $$;

-- 4. Tạo index nếu chưa có
CREATE INDEX IF NOT EXISTS idx_cargo_orders_pending_payment 
ON "CargoOrders"(status, created_at) 
WHERE status = 'PENDING_PAYMENT';

RAISE NOTICE '✅ Migration hoàn thành! Constraint đã được cập nhật với PENDING_PAYMENT.';

