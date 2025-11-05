-- ⚡ SỬA LỖI CONSTRAINT NGAY LẬP TỨC
-- Chạy script này trong Neon SQL Editor để sửa lỗi "violates check constraint CargoOrders_status_check"

-- Bước 1: Xóa TẤT CẢ constraint CHECK liên quan đến status (bất kể tên gì)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Tìm tất cả constraint CHECK trên bảng CargoOrders
    FOR constraint_record IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'CargoOrders'
          AND tc.constraint_type = 'CHECK'
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

-- Bước 2: Xóa constraint cũ với tên cụ thể (nếu có)
ALTER TABLE "CargoOrders" DROP CONSTRAINT IF EXISTS cargoorders_status_check;

-- Bước 3: Thêm constraint mới với PENDING_PAYMENT
ALTER TABLE "CargoOrders" 
ADD CONSTRAINT cargoorders_status_check 
CHECK (status IN ('DRAFT', 'PENDING_PAYMENT', 'SUBMITTED', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'));

-- Bước 4: Kiểm tra kết quả
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'cargoorders_status_check';

-- ✅ XONG! Bây giờ bạn có thể tạo order với status PENDING_PAYMENT
-- Test ngay bằng cách tạo order mới qua API

