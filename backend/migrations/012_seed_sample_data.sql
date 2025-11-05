-- =====================================================
-- Script insert dữ liệu mẫu vào Neon Database
-- Chạy script này sau khi đã có bảng users với dữ liệu
-- Script sẽ tự động xóa dữ liệu cũ và insert dữ liệu mới
-- =====================================================

SET search_path TO public;

-- =====================================================
-- BƯỚC 0: Kiểm tra và thêm các cột thiếu (nếu cần)
-- =====================================================
DO $$
BEGIN
    -- Thêm các cột cho LogisticsCompany nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'LogisticsCompany' AND column_name = 'has_dangerous_goods') THEN
        ALTER TABLE "LogisticsCompany" ADD COLUMN has_dangerous_goods BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'LogisticsCompany' AND column_name = 'has_cold') THEN
        ALTER TABLE "LogisticsCompany" ADD COLUMN has_cold BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'LogisticsCompany' AND column_name = 'has_loading_dock') THEN
        ALTER TABLE "LogisticsCompany" ADD COLUMN has_loading_dock BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'LogisticsCompany' AND column_name = 'has_insurance') THEN
        ALTER TABLE "LogisticsCompany" ADD COLUMN has_insurance BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'LogisticsCompany' AND column_name = 'logo_url') THEN
        ALTER TABLE "LogisticsCompany" ADD COLUMN logo_url TEXT;
    END IF;
    
    -- Kiểm tra và thêm cột cho CompanyRates
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'CompanyRates' AND column_name = 'minimum_cost') THEN
        ALTER TABLE "CompanyRates" ADD COLUMN minimum_cost NUMERIC(10,2) CHECK (minimum_cost >= 0);
    END IF;
    
    -- Kiểm tra và thêm cột cho CargoOrders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'CargoOrders' AND column_name = 'customer_id') THEN
        ALTER TABLE "CargoOrders" ADD COLUMN customer_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'CargoOrders' AND column_name = 'contact_name') THEN
        ALTER TABLE "CargoOrders" ADD COLUMN contact_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'CargoOrders' AND column_name = 'contact_phone') THEN
        ALTER TABLE "CargoOrders" ADD COLUMN contact_phone VARCHAR(20);
    END IF;
END $$;

-- =====================================================
-- BƯỚC 1: Xóa dữ liệu cũ (nếu có) - TRỪ BẢNG users
-- =====================================================
-- Xóa theo thứ tự để tránh lỗi foreign key constraint
-- Sử dụng DO block để kiểm tra bảng tồn tại trước khi xóa
DO $$
BEGIN
    -- Xóa Transactions nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Transactions') THEN
        DELETE FROM "Transactions";
    END IF;
    
    -- Xóa CargoOrders nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CargoOrders') THEN
        DELETE FROM "CargoOrders";
    END IF;
    
    -- Xóa Drivers nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Drivers') THEN
        DELETE FROM "Drivers";
    END IF;
    
    -- Xóa Vehicles nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Vehicles') THEN
        DELETE FROM "Vehicles";
    END IF;
    
    -- Xóa CompanyRates nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CompanyRates') THEN
        DELETE FROM "CompanyRates";
    END IF;
    
    -- Xóa CompanyAreas nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'CompanyAreas') THEN
        DELETE FROM "CompanyAreas";
    END IF;
    
    -- Xóa LogisticsCompany nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'LogisticsCompany') THEN
        DELETE FROM "LogisticsCompany";
    END IF;
END $$;

-- Reset sequence (nếu cần)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'LogisticsCompany_company_id_seq') THEN
        ALTER SEQUENCE "LogisticsCompany_company_id_seq" RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Vehicles_vehicle_id_seq') THEN
        ALTER SEQUENCE "Vehicles_vehicle_id_seq" RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Drivers_driver_id_seq') THEN
        ALTER SEQUENCE "Drivers_driver_id_seq" RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'CargoOrders_order_id_seq') THEN
        ALTER SEQUENCE "CargoOrders_order_id_seq" RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'Transactions_transaction_id_seq') THEN
        ALTER SEQUENCE "Transactions_transaction_id_seq" RESTART WITH 1;
    END IF;
END $$;

-- =====================================================
-- BƯỚC 2: INSERT LOGISTICS COMPANIES (3 công ty)
-- =====================================================
INSERT INTO "LogisticsCompany" (company_name, address, phone, email, rating, description, has_cold, has_dangerous_goods, has_loading_dock, has_insurance, logo_url, status)
VALUES 
    ('VT Logistics', '123 Nguyễn Huệ, Q1, TP.HCM', '0901111111', 'contact@vtlogistics.com', 4.8, 'Công ty logistics hàng đầu Việt Nam', true, true, true, true, 'https://via.placeholder.com/150', 'ACTIVE'),
    ('Gemadept Logistics', '456 Lê Lợi, Q1, TP.HCM', '0902222222', 'contact@gemadept.com', 4.5, 'Chuyên vận chuyển hàng hóa nội địa', true, false, true, true, 'https://via.placeholder.com/150', 'ACTIVE'),
    ('Transimex Logistics', '789 Điện Biên Phủ, Q3, TP.HCM', '0903333333', 'contact@transimex.com', 4.3, 'Vận chuyển quốc tế và nội địa', true, true, true, true, 'https://via.placeholder.com/150', 'ACTIVE');

-- =====================================================
-- BƯỚC 3: INSERT COMPANY AREAS (Khu vực hoạt động)
-- =====================================================
INSERT INTO "CompanyAreas" (company_id, area)
SELECT company_id, 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Hà Nội' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Đà Nẵng' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Miền Nam' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, 'Bình Dương' FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, 'Đồng Nai' FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, 'Hà Nội' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, 'Hải Phòng' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, 'Miền Bắc' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics';

-- =====================================================
-- BƯỚC 4: INSERT COMPANY RATES (Bảng giá)
-- =====================================================
INSERT INTO "CompanyRates" (company_id, vehicle_type, cost_per_km, minimum_cost)
SELECT company_id, 'Xe tải 2 tấn', 15000.00, 500000.00 FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Xe tải 5 tấn', 20000.00, 800000.00 FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Container 20ft', 30000.00, 1500000.00 FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Xe lạnh 3 tấn', 25000.00, 1000000.00 FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, 'Xe tải 2 tấn', 14000.00, 450000.00 FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, 'Xe tải 4 tấn', 18000.00, 700000.00 FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, 'Container 20ft', 28000.00, 1400000.00 FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, 'Xe tải 3 tấn', 16000.00, 600000.00 FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, 'Xe tải 5 tấn', 21000.00, 850000.00 FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, 'Container 40ft', 35000.00, 1800000.00 FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics';

-- =====================================================
-- BƯỚC 5: INSERT VEHICLES (3 xe mỗi công ty - tổng 9 xe)
-- =====================================================
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location)
SELECT company_id, '51A-12345', 'Xe tải 5 tấn', 5.00, 'Nguyễn Văn A', '0901111111', 'AVAILABLE', 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, '51B-67890', 'Container 20ft', 10.00, 'Trần Thị B', '0901111112', 'IN_USE', 'Bình Dương' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, '51C-11111', 'Xe lạnh 3 tấn', 3.00, 'Lê Văn C', '0901111113', 'AVAILABLE', 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'VT Logistics'
UNION ALL
SELECT company_id, '29A-22222', 'Xe tải 2 tấn', 2.00, 'Phạm Thị D', '0902222221', 'AVAILABLE', 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, '29B-33333', 'Xe tải 4 tấn', 4.00, 'Hoàng Văn E', '0902222222', 'IN_USE', 'Đồng Nai' FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, '43G-44444', 'Container 20ft', 10.00, 'Nguyễn Thị F', '0902222223', 'AVAILABLE', 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics'
UNION ALL
SELECT company_id, '30A-55555', 'Xe tải 3 tấn', 3.00, 'Võ Văn G', '0903333331', 'AVAILABLE', 'TP.HCM' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, '30B-66666', 'Xe tải 5 tấn', 5.00, 'Đặng Thị H', '0903333332', 'AVAILABLE', 'Hà Nội' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics'
UNION ALL
SELECT company_id, '43G-77777', 'Container 40ft', 15.00, 'Bùi Văn I', '0903333333', 'IN_USE', 'Hải Phòng' FROM "LogisticsCompany" WHERE company_name = 'Transimex Logistics';

-- =====================================================
-- BƯỚC 6: INSERT DRIVERS (1 tài xế cho mỗi xe - tổng 9 tài xế)
-- Chỉ insert nếu bảng Drivers tồn tại
-- =====================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Drivers') THEN
        INSERT INTO "Drivers" (company_id, vehicle_id, full_name, phone, email, license_number, license_type, license_expiry, address, status, total_trips, rating)
        SELECT 
            v.company_id,
            v.vehicle_id,
            v.driver_name,
            v.driver_phone,
            CASE 
                WHEN v.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics') THEN REPLACE(v.driver_name, ' ', ''::TEXT) || '@vtlogistics.com'
                WHEN v.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'Gemadept Logistics') THEN REPLACE(v.driver_name, ' ', ''::TEXT) || '@gemadept.com'
                ELSE REPLACE(v.driver_name, ' ', ''::TEXT) || '@transimex.com'
            END as email,
            'DL' || LPAD((ROW_NUMBER() OVER ())::TEXT, 6, '0') as license_number,
            CASE WHEN v.vehicle_type LIKE '%Container%' THEN 'D' ELSE 'C' END as license_type,
            CURRENT_DATE + INTERVAL '18 months' as license_expiry,
            v.current_location as address,
            'ACTIVE' as status,
            (30 + ROW_NUMBER() OVER () * 5)::INTEGER as total_trips,
            (4.4 + (ROW_NUMBER() OVER () % 6) * 0.1)::NUMERIC(3,2) as rating
        FROM "Vehicles" v;
    END IF;
END $$;

-- =====================================================
-- BƯỚC 7: INSERT CARGO ORDERS (4 đơn hàng mỗi công ty - tổng 12 đơn)
-- Lưu ý: customer_id sẽ lấy từ user đầu tiên trong bảng users
-- =====================================================
WITH sample_user AS (
    SELECT id FROM users LIMIT 1
),
company_vehicles AS (
    SELECT 
        c.company_id,
        c.company_name,
        v.vehicle_id,
        v.license_plate,
        ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY v.vehicle_id) as rn
    FROM "LogisticsCompany" c
    JOIN "Vehicles" v ON c.company_id = v.company_id
)
INSERT INTO "CargoOrders" (
    company_id, vehicle_id, customer_id, cargo_name, cargo_type, weight_kg, volume_m3, value_vnd,
    require_cold, require_danger, require_loading, require_insurance,
    pickup_address, dropoff_address, pickup_time, note, status
)
SELECT 
    cv.company_id,
    cv.vehicle_id,
    su.id as customer_id,
    CASE 
        WHEN cv.rn = 1 THEN 'Hàng điện tử'
        WHEN cv.rn = 2 THEN 'Hàng may mặc'
        WHEN cv.rn = 3 THEN 'Hàng thực phẩm đông lạnh'
        ELSE 'Hàng gia dụng'
    END as cargo_name,
    CASE 
        WHEN cv.rn = 1 THEN 'Điện tử'
        WHEN cv.rn = 2 THEN 'May mặc'
        WHEN cv.rn = 3 THEN 'Thực phẩm'
        ELSE 'Gia dụng'
    END as cargo_type,
    CASE cv.rn 
        WHEN 1 THEN 500.00
        WHEN 2 THEN 800.00
        WHEN 3 THEN 300.00
        ELSE 1200.00
    END as weight_kg,
    CASE cv.rn 
        WHEN 1 THEN 2.5
        WHEN 2 THEN 4.0
        WHEN 3 THEN 1.5
        ELSE 6.0
    END as volume_m3,
    CASE cv.rn 
        WHEN 1 THEN 50000000.00
        WHEN 2 THEN 30000000.00
        WHEN 3 THEN 20000000.00
        ELSE 40000000.00
    END as value_vnd,
    CASE WHEN cv.rn = 3 THEN true ELSE false END as require_cold,
    false as require_danger,
    CASE WHEN cv.rn IN (1, 4) THEN true ELSE false END as require_loading,
    CASE WHEN cv.rn IN (1, 3) THEN true ELSE false END as require_insurance,
    CASE 
        WHEN cv.company_name = 'VT Logistics' THEN '279 Nguyễn Tri Phương P8 Q10 TPHCM'
        WHEN cv.company_name = 'Gemadept Logistics' THEN '123 Lê Lợi, P. Bến Thành, Q.1, TPHCM'
        ELSE '789 Điện Biên Phủ, Q.3, TP.HCM'
    END as pickup_address,
    CASE 
        WHEN cv.company_name = 'VT Logistics' THEN '777 Lê Lai P3 Q1 TP.Hà Nội'
        WHEN cv.company_name = 'Gemadept Logistics' THEN '456 Hai Bà Trưng, P. Tân Định, Q.1'
        ELSE 'KCN Linh Trung, Q. Thủ Đức, TPHCM'
    END as dropoff_address,
    CURRENT_TIMESTAMP + (cv.rn || ' days')::INTERVAL as pickup_time,
    CASE cv.rn 
        WHEN 1 THEN 'Giao hàng trong giờ hành chính'
        WHEN 2 THEN 'Cần bốc xếp cẩn thận'
        WHEN 3 THEN 'Cần giữ nhiệt độ -18°C'
        ELSE 'Giao tại cửa'
    END as note,
    CASE cv.rn 
        WHEN 1 THEN 'CONFIRMED'
        WHEN 2 THEN 'IN_TRANSIT'
        WHEN 3 THEN 'SUBMITTED'
        ELSE 'DRAFT'
    END as status
FROM company_vehicles cv
CROSS JOIN sample_user su
WHERE cv.rn <= 4;  -- 4 đơn hàng cho mỗi công ty

-- =====================================================
-- BƯỚC 8: INSERT TRANSACTIONS (1 giao dịch cho mỗi đơn hàng)
-- Một số đơn đã thanh toán (SUCCESS), một số chưa (PENDING)
-- =====================================================
INSERT INTO "Transactions" (
    order_id, company_id, amount, payment_method, payment_status, transaction_code, paid_at, note
)
SELECT 
    o.order_id,
    o.company_id,
    CASE 
        WHEN o.status = 'COMPLETED' THEN 3000000.00
        WHEN o.status = 'IN_TRANSIT' THEN 2500000.00
        WHEN o.status = 'CONFIRMED' THEN 2000000.00
        ELSE 1500000.00
    END as amount,
    CASE 
        WHEN o.order_id % 3 = 0 THEN 'momo'
        WHEN o.order_id % 3 = 1 THEN 'vietqr'
        ELSE 'zalopay'
    END as payment_method,
    CASE 
        WHEN o.status IN ('COMPLETED', 'IN_TRANSIT', 'CONFIRMED') THEN 'SUCCESS'
        WHEN o.status = 'SUBMITTED' THEN 'PENDING'
        ELSE 'PENDING'
    END as payment_status,
    CASE 
        WHEN o.status IN ('COMPLETED', 'IN_TRANSIT', 'CONFIRMED') THEN 'TXN' || LPAD(o.order_id::TEXT, 8, '0')
        ELSE NULL
    END as transaction_code,
    CASE 
        WHEN o.status IN ('COMPLETED', 'IN_TRANSIT', 'CONFIRMED') THEN CURRENT_TIMESTAMP - (o.order_id % 5 || ' days')::INTERVAL
        ELSE NULL
    END as paid_at,
    CASE 
        WHEN o.status IN ('COMPLETED', 'IN_TRANSIT', 'CONFIRMED') THEN 'Thanh toán thành công'
        ELSE 'Chờ thanh toán'
    END as note
FROM "CargoOrders" o;

-- =====================================================
-- HOÀN THÀNH - Kiểm tra dữ liệu đã insert
-- =====================================================
-- Kiểm tra dữ liệu đã insert (chỉ bảng tồn tại)
DO $$
DECLARE
    drivers_count INTEGER := 0;
BEGIN
    -- Kiểm tra và đếm Drivers nếu bảng tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Drivers') THEN
        SELECT COUNT(*) INTO drivers_count FROM "Drivers";
    END IF;
    
    -- Hiển thị kết quả
    RAISE NOTICE '=== THỐNG KÊ DỮ LIỆU ĐÃ INSERT ===';
    RAISE NOTICE 'LogisticsCompany: %', (SELECT COUNT(*) FROM "LogisticsCompany");
    RAISE NOTICE 'Vehicles: %', (SELECT COUNT(*) FROM "Vehicles");
    RAISE NOTICE 'Drivers: %', drivers_count;
    RAISE NOTICE 'CargoOrders: %', (SELECT COUNT(*) FROM "CargoOrders");
    RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM "Transactions");
    RAISE NOTICE 'CompanyAreas: %', (SELECT COUNT(*) FROM "CompanyAreas");
    RAISE NOTICE 'CompanyRates: %', (SELECT COUNT(*) FROM "CompanyRates");
END $$;

-- Query để xem kết quả dạng bảng (chỉ các bảng tồn tại)
SELECT 
    'LogisticsCompany' as table_name, 
    COUNT(*) as count 
FROM "LogisticsCompany"
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM "Vehicles"
UNION ALL
SELECT 'CargoOrders', COUNT(*) FROM "CargoOrders"
UNION ALL
SELECT 'Transactions', COUNT(*) FROM "Transactions"
UNION ALL
SELECT 'CompanyAreas', COUNT(*) FROM "CompanyAreas"
UNION ALL
SELECT 'CompanyRates', COUNT(*) FROM "CompanyRates"
ORDER BY table_name;

-- Query riêng cho Drivers (chỉ chạy nếu bảng tồn tại)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Drivers') THEN
        RAISE NOTICE 'Drivers: %', (SELECT COUNT(*) FROM "Drivers");
    ELSE
        RAISE NOTICE 'Drivers: Bảng không tồn tại (0)';
    END IF;
END $$;

-- Xem chi tiết đơn hàng và trạng thái thanh toán
SELECT 
    o.order_id,
    c.company_name,
    v.license_plate,
    o.cargo_name,
    o.status as order_status,
    t.payment_status,
    t.amount,
    t.paid_at
FROM "CargoOrders" o
JOIN "LogisticsCompany" c ON o.company_id = c.company_id
LEFT JOIN "Vehicles" v ON o.vehicle_id = v.vehicle_id
LEFT JOIN "Transactions" t ON o.order_id = t.order_id
ORDER BY o.order_id;

