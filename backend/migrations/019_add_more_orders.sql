-- Migration: Thêm đơn hàng đã tiếp nhận và order requests
-- Tất cả đơn hàng đều được gán xe sẵn

SET search_path TO public;

-- Lưu lại order_id lớn nhất trước khi thêm dữ liệu mới
DO $$
DECLARE
    max_order_id_before INTEGER;
BEGIN
    SELECT COALESCE(MAX(order_id), 0) INTO max_order_id_before FROM "CargoOrders";
    PERFORM set_config('app.max_order_id_before', max_order_id_before::TEXT, false);
END $$;

-- =====================================================
-- BƯỚC 1: Thêm đơn hàng đã tiếp nhận (CONFIRMED, IN_TRANSIT, COMPLETED)
-- Tất cả đều được gán xe sẵn
-- =====================================================
WITH sample_users AS (
    SELECT id, name FROM users LIMIT 3
),
companies AS (
    SELECT company_id, company_name FROM "LogisticsCompany" ORDER BY company_id
),
available_vehicles AS (
    SELECT 
        v.vehicle_id, 
        v.company_id,
        ROW_NUMBER() OVER (PARTITION BY v.company_id ORDER BY v.vehicle_id) as rn
    FROM "Vehicles" v
    WHERE v.status IN ('AVAILABLE', 'IN_USE')
)
INSERT INTO "CargoOrders" (
    company_id, 
    vehicle_id, 
    customer_id,
    cargo_name, 
    cargo_type, 
    weight_kg, 
    volume_m3, 
    value_vnd,
    require_cold, 
    require_danger, 
    require_loading, 
    require_insurance,
    pickup_address, 
    dropoff_address, 
    pickup_time, 
    note, 
    status,
    contact_name,
    contact_phone
)
SELECT 
    c.company_id,
    av.vehicle_id,
    su.id as customer_id,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 4 = 0 THEN 'Linh kiện điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 4 = 1 THEN 'Vải vóc may mặc'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 4 = 2 THEN 'Thực phẩm tươi sống'
        ELSE 'Đồ gỗ nội thất'
    END as cargo_name,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 4 = 0 THEN 'Điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 4 = 1 THEN 'May mặc'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 4 = 2 THEN 'Thực phẩm'
        ELSE 'Gia dụng'
    END as cargo_type,
    (400 + (ROW_NUMBER() OVER () % 5) * 200)::NUMERIC(10,2) as weight_kg,
    (2.0 + (ROW_NUMBER() OVER () % 4) * 0.8)::NUMERIC(10,3) as volume_m3,
    (15000000 + (ROW_NUMBER() OVER () % 6) * 5000000)::NUMERIC(14,2) as value_vnd,
    CASE WHEN (ROW_NUMBER() OVER () % 4) = 2 THEN true ELSE false END as require_cold,
    false as require_danger,
    CASE WHEN (ROW_NUMBER() OVER () % 3) = 0 THEN true ELSE false END as require_loading,
    CASE WHEN (ROW_NUMBER() OVER () % 2) = 0 THEN true ELSE false END as require_insurance,
    CASE 
        WHEN c.company_name = 'VT Logistics' THEN '123 Nguyễn Huệ, Q1, TP.HCM'
        WHEN c.company_name = 'Gemadept Logistics' THEN '456 Lê Lợi, Q1, TP.HCM'
        ELSE '789 Điện Biên Phủ, Q3, TP.HCM'
    END as pickup_address,
    CASE 
        WHEN c.company_name = 'VT Logistics' THEN '567 Lê Lợi, Q1, Hà Nội'
        WHEN c.company_name = 'Gemadept Logistics' THEN '890 Trần Hưng Đạo, Q5, TP.HCM'
        ELSE '234 Nguyễn Văn Cừ, Q5, TP.HCM'
    END as dropoff_address,
    CURRENT_TIMESTAMP - ((ROW_NUMBER() OVER () % 7) || ' days')::INTERVAL as pickup_time,
    CASE 
        WHEN (ROW_NUMBER() OVER () % 3) = 0 THEN 'Giao hàng trong giờ hành chính'
        WHEN (ROW_NUMBER() OVER () % 3) = 1 THEN 'Cần bốc xếp cẩn thận'
        ELSE 'Giao tại cửa, vui lòng gọi trước'
    END as note,
    CASE 
        WHEN (ROW_NUMBER() OVER () % 3) = 0 THEN 'CONFIRMED'
        WHEN (ROW_NUMBER() OVER () % 3) = 1 THEN 'IN_TRANSIT'
        ELSE 'COMPLETED'
    END as status,
    su.name as contact_name,
    '090' || LPAD((1000000 + (ROW_NUMBER() OVER () % 9000000))::TEXT, 7, '0') as contact_phone
FROM companies c
CROSS JOIN sample_users su
JOIN available_vehicles av ON av.company_id = c.company_id AND av.rn <= 2
LIMIT 15;  -- 15 đơn hàng đã tiếp nhận (5 đơn mỗi công ty)

-- =====================================================
-- BƯỚC 2: Thêm order requests (SUBMITTED) - chờ supplier chấp nhận
-- Tất cả đều được gán xe sẵn
-- =====================================================
WITH sample_users AS (
    SELECT id, name FROM users LIMIT 3
),
companies AS (
    SELECT company_id, company_name FROM "LogisticsCompany" ORDER BY company_id
),
available_vehicles_submitted AS (
    SELECT 
        v.vehicle_id, 
        v.company_id,
        ROW_NUMBER() OVER (PARTITION BY v.company_id ORDER BY v.vehicle_id) as rn
    FROM "Vehicles" v
    WHERE v.status IN ('AVAILABLE', 'IN_USE')
)
INSERT INTO "CargoOrders" (
    company_id, 
    vehicle_id,  -- Gán xe sẵn cho SUBMITTED orders
    customer_id,
    cargo_name, 
    cargo_type, 
    weight_kg, 
    volume_m3, 
    value_vnd,
    require_cold, 
    require_danger, 
    require_loading, 
    require_insurance,
    pickup_address, 
    dropoff_address, 
    pickup_time, 
    note, 
    status,
    contact_name,
    contact_phone
)
SELECT 
    c.company_id,
    avs.vehicle_id,  -- Gán xe sẵn
    su.id as customer_id,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 0 THEN 'Máy tính xách tay'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 1 THEN 'Quần áo thời trang'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 2 THEN 'Rau củ quả tươi'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 3 THEN 'Bàn ghế văn phòng'
        ELSE 'Thiết bị y tế'
    END as cargo_name,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 0 THEN 'Điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 1 THEN 'May mặc'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 2 THEN 'Thực phẩm'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 5 = 3 THEN 'Gia dụng'
        ELSE 'Y tế'
    END as cargo_type,
    (300 + (ROW_NUMBER() OVER () % 6) * 150)::NUMERIC(10,2) as weight_kg,
    (1.5 + (ROW_NUMBER() OVER () % 5) * 0.7)::NUMERIC(10,3) as volume_m3,
    (10000000 + (ROW_NUMBER() OVER () % 8) * 3000000)::NUMERIC(14,2) as value_vnd,
    CASE WHEN (ROW_NUMBER() OVER () % 5) = 2 THEN true ELSE false END as require_cold,
    CASE WHEN (ROW_NUMBER() OVER () % 7) = 6 THEN true ELSE false END as require_danger,
    CASE WHEN (ROW_NUMBER() OVER () % 4) = 0 THEN true ELSE false END as require_loading,
    CASE WHEN (ROW_NUMBER() OVER () % 3) = 0 THEN true ELSE false END as require_insurance,
    CASE 
        WHEN c.company_name = 'VT Logistics' THEN '321 Nguyễn Thái Sơn, Q. Gò Vấp, TP.HCM'
        WHEN c.company_name = 'Gemadept Logistics' THEN '654 Pasteur, Q3, TP.HCM'
        ELSE '987 Võ Văn Tần, Q3, TP.HCM'
    END as pickup_address,
    CASE 
        WHEN c.company_name = 'VT Logistics' THEN '159 Hoàng Diệu, Q. Ba Đình, Hà Nội'
        WHEN c.company_name = 'Gemadept Logistics' THEN '753 Võ Thị Sáu, Q3, TP.HCM'
        ELSE '852 Nguyễn Đình Chiểu, Q3, TP.HCM'
    END as dropoff_address,
    CURRENT_TIMESTAMP + ((ROW_NUMBER() OVER () % 5 + 1) || ' days')::INTERVAL as pickup_time,
    CASE 
        WHEN (ROW_NUMBER() OVER () % 4) = 0 THEN 'Giao hàng nhanh, ưu tiên'
        WHEN (ROW_NUMBER() OVER () % 4) = 1 THEN 'Cần xử lý cẩn thận, hàng dễ vỡ'
        WHEN (ROW_NUMBER() OVER () % 4) = 2 THEN 'Giao trong khung giờ 9h-17h'
        ELSE 'Liên hệ trước khi giao hàng'
    END as note,
    'SUBMITTED' as status,
    su.name as contact_name,
    '091' || LPAD((2000000 + (ROW_NUMBER() OVER () % 8000000))::TEXT, 7, '0') as contact_phone
FROM companies c
CROSS JOIN sample_users su
JOIN available_vehicles_submitted avs ON avs.company_id = c.company_id AND avs.rn <= 4
LIMIT 12;  -- 12 order requests (4 đơn mỗi công ty)

-- =====================================================
-- BƯỚC 3: Tạo transactions cho tất cả đơn hàng vừa thêm
-- =====================================================
DO $$
DECLARE
    max_old_order_id INTEGER;
BEGIN
    -- Lấy order_id lớn nhất trước khi thêm dữ liệu mới
    max_old_order_id := current_setting('app.max_order_id_before', true)::INTEGER;
    
    -- Nếu không có config, lấy từ bảng
    IF max_old_order_id IS NULL THEN
        SELECT COALESCE(MAX(order_id), 0) INTO max_old_order_id FROM "CargoOrders";
    END IF;
    
    -- Tạo transactions cho các đơn hàng đã tiếp nhận
    INSERT INTO "Transactions" (
        order_id, 
        company_id, 
        customer_id,
        amount, 
        payment_method, 
        payment_status, 
        transaction_code, 
        paid_at, 
        note
    )
    SELECT 
        o.order_id,
        o.company_id,
        o.customer_id,
        CASE 
            WHEN o.status = 'COMPLETED' THEN 3500000.00
            WHEN o.status = 'IN_TRANSIT' THEN 2800000.00
            WHEN o.status = 'CONFIRMED' THEN 2200000.00
            ELSE 1500000.00
        END as amount,
        CASE 
            WHEN o.order_id % 4 = 0 THEN 'momo'
            WHEN o.order_id % 4 = 1 THEN 'vietqr'
            WHEN o.order_id % 4 = 2 THEN 'zalopay'
            ELSE 'bank_transfer'
        END as payment_method,
        'SUCCESS' as payment_status,
        'TXN' || LPAD((o.order_id + 1000)::TEXT, 8, '0') as transaction_code,
        CURRENT_TIMESTAMP - ((o.order_id % 7) || ' days')::INTERVAL as paid_at,
        'Thanh toán thành công cho đơn hàng #' || COALESCE(o.order_code, o.order_id::TEXT) as note
    FROM "CargoOrders" o
    WHERE o.order_id > max_old_order_id
      AND o.status IN ('CONFIRMED', 'IN_TRANSIT', 'COMPLETED')
      AND NOT EXISTS (SELECT 1 FROM "Transactions" t WHERE t.order_id = o.order_id);
    
    -- Tạo transactions cho các SUBMITTED orders
    INSERT INTO "Transactions" (
        order_id, 
        company_id, 
        customer_id,
        amount, 
        payment_method, 
        payment_status, 
        transaction_code, 
        paid_at, 
        note
    )
    SELECT 
        o.order_id,
        o.company_id,
        o.customer_id,
        1800000.00 as amount,
        CASE 
            WHEN o.order_id % 4 = 0 THEN 'momo'
            WHEN o.order_id % 4 = 1 THEN 'vietqr'
            WHEN o.order_id % 4 = 2 THEN 'zalopay'
            ELSE 'bank_transfer'
        END as payment_method,
        'SUCCESS' as payment_status,
        'TXN' || LPAD((o.order_id + 2000)::TEXT, 8, '0') as transaction_code,
        CURRENT_TIMESTAMP - ((o.order_id % 3) || ' hours')::INTERVAL as paid_at,
        'Thanh toán thành công - Chờ công ty xác nhận đơn hàng' as note
    FROM "CargoOrders" o
    WHERE o.order_id > max_old_order_id
      AND o.status = 'SUBMITTED'
      AND NOT EXISTS (SELECT 1 FROM "Transactions" t WHERE t.order_id = o.order_id);
END $$;

-- =====================================================
-- HOÀN THÀNH - Kiểm tra dữ liệu đã thêm
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=== THỐNG KÊ ĐƠN HÀNG ĐÃ THÊM ===';
    RAISE NOTICE 'Đơn hàng CONFIRMED: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'CONFIRMED');
    RAISE NOTICE 'Đơn hàng IN_TRANSIT: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'IN_TRANSIT');
    RAISE NOTICE 'Đơn hàng COMPLETED: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'COMPLETED');
    RAISE NOTICE 'Đơn hàng SUBMITTED (Order Requests): %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'SUBMITTED');
    RAISE NOTICE 'Tổng số Transactions: %', (SELECT COUNT(*) FROM "Transactions");
END $$;

-- Hiển thị chi tiết các đơn hàng mới
SELECT 
    o.order_id,
    o.order_code,
    c.company_name,
    o.cargo_name,
    o.status,
    o.vehicle_id,
    v.license_plate,
    COALESCE(o.contact_name, u.name) as customer_name,
    o.pickup_address,
    o.dropoff_address,
    t.payment_status,
    t.amount
FROM "CargoOrders" o
JOIN "LogisticsCompany" c ON o.company_id = c.company_id
LEFT JOIN "Vehicles" v ON o.vehicle_id = v.vehicle_id
LEFT JOIN users u ON o.customer_id = u.id
LEFT JOIN "Transactions" t ON o.order_id = t.order_id
WHERE o.status IN ('CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'SUBMITTED')
ORDER BY o.status, o.order_id DESC
LIMIT 30;
