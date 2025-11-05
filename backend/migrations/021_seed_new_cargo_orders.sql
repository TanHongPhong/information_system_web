-- Migration: Tạo dữ liệu mẫu cho bảng CargoOrders mới
-- Tất cả đơn hàng đều được gán xe sẵn

SET search_path TO public;

-- =====================================================
-- Tạo đơn hàng với các status khác nhau
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
    order_id,  -- Sẽ tự động generate nếu NULL
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
    NULL,  -- Tự động generate order_id
    c.company_id,
    av.vehicle_id,
    su.id as customer_id,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 0 THEN 'Linh kiện điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 1 THEN 'Vải vóc may mặc'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 2 THEN 'Thực phẩm tươi sống'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 3 THEN 'Đồ gỗ nội thất'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 4 THEN 'Thiết bị y tế'
        ELSE 'Hàng dễ vỡ'
    END as cargo_name,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 0 THEN 'Điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 1 THEN 'May mặc'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 2 THEN 'Thực phẩm'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 3 THEN 'Gia dụng'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) % 6 = 4 THEN 'Y tế'
        ELSE 'Dễ vỡ'
    END as cargo_type,
    (400 + (ROW_NUMBER() OVER () % 5) * 200)::NUMERIC(10,2) as weight_kg,
    (2.0 + (ROW_NUMBER() OVER () % 4) * 0.8)::NUMERIC(10,3) as volume_m3,
    (15000000 + (ROW_NUMBER() OVER () % 6) * 5000000)::NUMERIC(14,2) as value_vnd,
    CASE WHEN (ROW_NUMBER() OVER () % 6) = 2 THEN true ELSE false END as require_cold,
    CASE WHEN (ROW_NUMBER() OVER () % 7) = 6 THEN true ELSE false END as require_danger,
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
        WHEN (ROW_NUMBER() OVER () % 7) = 0 THEN 'PENDING_PAYMENT'
        WHEN (ROW_NUMBER() OVER () % 7) = 1 THEN 'PAID'
        WHEN (ROW_NUMBER() OVER () % 7) = 2 THEN 'ACCEPTED'
        WHEN (ROW_NUMBER() OVER () % 7) = 3 THEN 'LOADING'
        WHEN (ROW_NUMBER() OVER () % 7) = 4 THEN 'IN_TRANSIT'
        WHEN (ROW_NUMBER() OVER () % 7) = 5 THEN 'WAREHOUSE_RECEIVED'
        ELSE 'COMPLETED'
    END as status,
    su.name as contact_name,
    '090' || LPAD((1000000 + (ROW_NUMBER() OVER () % 9000000))::TEXT, 7, '0') as contact_phone
FROM companies c
CROSS JOIN sample_users su
JOIN available_vehicles av ON av.company_id = c.company_id AND av.rn <= 3
LIMIT 21;  -- 21 đơn hàng (7 đơn mỗi công ty, mỗi status 3 đơn)

-- =====================================================
-- Tạo transactions cho các đơn hàng đã thanh toán
-- =====================================================

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
        WHEN o.status = 'WAREHOUSE_RECEIVED' THEN 3200000.00
        WHEN o.status = 'IN_TRANSIT' THEN 2800000.00
        WHEN o.status = 'LOADING' THEN 2500000.00
        WHEN o.status = 'ACCEPTED' THEN 2200000.00
        WHEN o.status = 'PAID' THEN 1800000.00
        ELSE 1500000.00
    END as amount,
    CASE 
        WHEN (CAST(SUBSTRING(o.order_id, 1, 1) AS INTEGER) % 4) = 0 THEN 'momo'
        WHEN (CAST(SUBSTRING(o.order_id, 1, 1) AS INTEGER) % 4) = 1 THEN 'vietqr'
        WHEN (CAST(SUBSTRING(o.order_id, 1, 1) AS INTEGER) % 4) = 2 THEN 'zalopay'
        ELSE 'bank_transfer'
    END as payment_method,
    CASE 
        WHEN o.status = 'PENDING_PAYMENT' THEN 'PENDING'
        ELSE 'SUCCESS'
    END as payment_status,
    'TXN' || LPAD((CAST(SUBSTRING(o.order_id, 1, 4) AS INTEGER) + 1000)::TEXT, 8, '0') as transaction_code,
    CASE 
        WHEN o.status = 'PENDING_PAYMENT' THEN NULL
        ELSE CURRENT_TIMESTAMP - ((CAST(SUBSTRING(o.order_id, 1, 1) AS INTEGER) % 7) || ' days')::INTERVAL
    END as paid_at,
    'Thanh toán thành công cho đơn hàng #' || o.order_id as note
FROM "CargoOrders" o
WHERE o.status != 'PENDING_PAYMENT' OR EXISTS (
    SELECT 1 FROM "Transactions" t WHERE t.order_id = o.order_id
);

-- =====================================================
-- HOÀN THÀNH - Kiểm tra dữ liệu
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== THỐNG KÊ ĐƠN HÀNG ===';
    RAISE NOTICE 'Tổng số đơn hàng: %', (SELECT COUNT(*) FROM "CargoOrders");
    RAISE NOTICE 'PENDING_PAYMENT: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'PENDING_PAYMENT');
    RAISE NOTICE 'PAID: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'PAID');
    RAISE NOTICE 'ACCEPTED: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'ACCEPTED');
    RAISE NOTICE 'LOADING: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'LOADING');
    RAISE NOTICE 'IN_TRANSIT: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'IN_TRANSIT');
    RAISE NOTICE 'WAREHOUSE_RECEIVED: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'WAREHOUSE_RECEIVED');
    RAISE NOTICE 'COMPLETED: %', (SELECT COUNT(*) FROM "CargoOrders" WHERE status = 'COMPLETED');
    RAISE NOTICE 'Tổng số Transactions: %', (SELECT COUNT(*) FROM "Transactions");
END $$;

-- Hiển thị một số đơn hàng mẫu
SELECT 
    o.order_id,
    c.company_name,
    o.cargo_name,
    o.status,
    o.vehicle_id,
    v.license_plate,
    COALESCE(o.contact_name, u.name) as customer_name,
    t.payment_status,
    t.amount
FROM "CargoOrders" o
JOIN "LogisticsCompany" c ON o.company_id = c.company_id
LEFT JOIN "Vehicles" v ON o.vehicle_id = v.vehicle_id
LEFT JOIN users u ON o.customer_id = u.id
LEFT JOIN "Transactions" t ON o.order_id = t.order_id
ORDER BY o.created_at DESC
LIMIT 10;

