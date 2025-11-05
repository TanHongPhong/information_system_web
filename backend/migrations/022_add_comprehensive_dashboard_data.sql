-- Migration: Thêm dữ liệu đầy đủ cho dashboard
-- Đảm bảo mỗi công ty có đủ orders cho tất cả các status

SET search_path TO public;

-- =====================================================
-- BƯỚC 1: Xóa dữ liệu cũ nếu có (optional - comment nếu không muốn xóa)
-- =====================================================
-- DELETE FROM "Transactions" WHERE order_id IN (SELECT order_id FROM "CargoOrders");
-- DELETE FROM "CargoOrders";

-- =====================================================
-- BƯỚC 2: Tạo đơn hàng với đầy đủ các status cho từng công ty
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
    WHERE v.status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE')
)
INSERT INTO "CargoOrders" (
    order_id,
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
    contact_phone,
    created_at
)
SELECT 
    NULL,  -- Tự động generate order_id
    c.company_id,
    av.vehicle_id,
    su.id as customer_id,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 0 THEN 'Laptop và thiết bị điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 1 THEN 'Vải vóc và quần áo'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 2 THEN 'Thực phẩm đông lạnh'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 3 THEN 'Đồ gỗ nội thất'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 4 THEN 'Thiết bị y tế'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 5 THEN 'Hàng dễ vỡ'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 6 THEN 'Hóa chất công nghiệp'
        ELSE 'Tài liệu quan trọng'
    END as cargo_name,
    CASE 
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 0 THEN 'Điện tử'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 1 THEN 'May mặc'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 2 THEN 'Thực phẩm'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 3 THEN 'Gia dụng'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 4 THEN 'Y tế'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 5 THEN 'Dễ vỡ'
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id, su.id)) % 8 = 6 THEN 'Nguy hiểm'
        ELSE 'Tài liệu'
    END as cargo_type,
    (300 + (ROW_NUMBER() OVER () % 8) * 150)::NUMERIC(10,2) as weight_kg,
    (1.5 + (ROW_NUMBER() OVER () % 6) * 0.5)::NUMERIC(10,3) as volume_m3,
    (10000000 + (ROW_NUMBER() OVER () % 10) * 2000000)::NUMERIC(14,2) as value_vnd,
    CASE WHEN (ROW_NUMBER() OVER () % 8) = 2 THEN true ELSE false END as require_cold,
    CASE WHEN (ROW_NUMBER() OVER () % 8) = 6 THEN true ELSE false END as require_danger,
    CASE WHEN (ROW_NUMBER() OVER () % 4) = 0 THEN true ELSE false END as require_loading,
    CASE WHEN (ROW_NUMBER() OVER () % 3) = 0 THEN true ELSE false END as require_insurance,
    CASE 
        WHEN c.company_name = 'VT Logistics' THEN '123 Nguyễn Huệ, P. Bến Nghé, Q1, TP.HCM'
        WHEN c.company_name = 'Gemadept Logistics' THEN '456 Lê Lợi, P. Bến Thành, Q1, TP.HCM'
        ELSE '789 Điện Biên Phủ, P. 15, Q. Bình Thạnh, TP.HCM'
    END as pickup_address,
    CASE 
        WHEN c.company_name = 'VT Logistics' THEN '567 Lê Lợi, P. Tràng Tiền, Q. Hoàn Kiếm, Hà Nội'
        WHEN c.company_name = 'Gemadept Logistics' THEN '890 Trần Hưng Đạo, P. 5, Q5, TP.HCM'
        ELSE '234 Nguyễn Văn Cừ, P. 4, Q5, TP.HCM'
    END as dropoff_address,
    CURRENT_TIMESTAMP - ((ROW_NUMBER() OVER () % 10) || ' days')::INTERVAL as pickup_time,
    CASE 
        WHEN (ROW_NUMBER() OVER () % 4) = 0 THEN 'Giao hàng trong giờ hành chính (9h-17h)'
        WHEN (ROW_NUMBER() OVER () % 4) = 1 THEN 'Cần bốc xếp cẩn thận, hàng dễ vỡ'
        WHEN (ROW_NUMBER() OVER () % 4) = 2 THEN 'Giao tại cửa, vui lòng gọi trước khi đến'
        ELSE 'Ưu tiên giao hàng nhanh'
    END as note,
    CASE 
        -- Mỗi công ty có ít nhất 4 đơn PAID (để hiển thị trong Order Requests)
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) <= 4 THEN 'PAID'
        -- 3 đơn ACCEPTED (để hiển thị trong Shipping Table)
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) BETWEEN 5 AND 7 THEN 'ACCEPTED'
        -- 2 đơn LOADING
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) BETWEEN 8 AND 9 THEN 'LOADING'
        -- 3 đơn IN_TRANSIT
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) BETWEEN 10 AND 12 THEN 'IN_TRANSIT'
        -- 2 đơn WAREHOUSE_RECEIVED
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) BETWEEN 13 AND 14 THEN 'WAREHOUSE_RECEIVED'
        -- 3 đơn COMPLETED
        WHEN (ROW_NUMBER() OVER (PARTITION BY c.company_id ORDER BY c.company_id)) BETWEEN 15 AND 17 THEN 'COMPLETED'
        -- Còn lại là PENDING_PAYMENT (sẽ tự xóa sau 15 phút)
        ELSE 'PENDING_PAYMENT'
    END as status,
    su.name as contact_name,
    '090' || LPAD((1000000 + (ROW_NUMBER() OVER () % 9000000))::TEXT, 7, '0') as contact_phone,
    CURRENT_TIMESTAMP - ((ROW_NUMBER() OVER () % 10) || ' days')::INTERVAL as created_at
FROM companies c
CROSS JOIN sample_users su
JOIN available_vehicles av ON av.company_id = c.company_id AND av.rn <= 6
LIMIT 54;  -- 18 đơn mỗi công ty (đủ cho tất cả status)

-- =====================================================
-- BƯỚC 3: Tạo transactions cho các đơn hàng đã thanh toán
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
WHERE o.status != 'PENDING_PAYMENT' 
  AND NOT EXISTS (
    SELECT 1 FROM "Transactions" t WHERE t.order_id = o.order_id
  );

-- =====================================================
-- BƯỚC 4: Kiểm tra và hiển thị thống kê
-- =====================================================

DO $$
DECLARE
    total_orders INTEGER;
    paid_count INTEGER;
    accepted_count INTEGER;
    loading_count INTEGER;
    transit_count INTEGER;
    warehouse_count INTEGER;
    completed_count INTEGER;
    pending_count INTEGER;
    total_transactions INTEGER;
    rec RECORD;  -- Khai báo biến record cho FOR loop
BEGIN
    SELECT COUNT(*) INTO total_orders FROM "CargoOrders";
    SELECT COUNT(*) INTO paid_count FROM "CargoOrders" WHERE status = 'PAID';
    SELECT COUNT(*) INTO accepted_count FROM "CargoOrders" WHERE status = 'ACCEPTED';
    SELECT COUNT(*) INTO loading_count FROM "CargoOrders" WHERE status = 'LOADING';
    SELECT COUNT(*) INTO transit_count FROM "CargoOrders" WHERE status = 'IN_TRANSIT';
    SELECT COUNT(*) INTO warehouse_count FROM "CargoOrders" WHERE status = 'WAREHOUSE_RECEIVED';
    SELECT COUNT(*) INTO completed_count FROM "CargoOrders" WHERE status = 'COMPLETED';
    SELECT COUNT(*) INTO pending_count FROM "CargoOrders" WHERE status = 'PENDING_PAYMENT';
    SELECT COUNT(*) INTO total_transactions FROM "Transactions";
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '=== THỐNG KÊ DỮ LIỆU DASHBOARD ===';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tổng số đơn hàng: %', total_orders;
    RAISE NOTICE '';
    RAISE NOTICE 'Theo status:';
    RAISE NOTICE '  PAID (Order Requests): %', paid_count;
    RAISE NOTICE '  ACCEPTED (Shipping): %', accepted_count;
    RAISE NOTICE '  LOADING (Shipping): %', loading_count;
    RAISE NOTICE '  IN_TRANSIT (Shipping): %', transit_count;
    RAISE NOTICE '  WAREHOUSE_RECEIVED (Shipping): %', warehouse_count;
    RAISE NOTICE '  COMPLETED (Shipping): %', completed_count;
    RAISE NOTICE '  PENDING_PAYMENT (sẽ tự xóa): %', pending_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Tổng số Transactions: %', total_transactions;
    RAISE NOTICE '========================================';
    
    -- Kiểm tra dữ liệu theo công ty
    RAISE NOTICE '';
    RAISE NOTICE 'Theo công ty:';
    FOR rec IN 
        SELECT 
            c.company_id,
            c.company_name,
            COUNT(*) as order_count,
            COUNT(CASE WHEN o.status = 'PAID' THEN 1 END) as paid,
            COUNT(CASE WHEN o.status = 'ACCEPTED' THEN 1 END) as accepted,
            COUNT(CASE WHEN o.status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED') THEN 1 END) as shipping
        FROM "LogisticsCompany" c
        LEFT JOIN "CargoOrders" o ON c.company_id = o.company_id
        GROUP BY c.company_id, c.company_name
        ORDER BY c.company_id
    LOOP
        RAISE NOTICE '  % (ID: %): Tổng % đơn (PAID: %, ACCEPTED: %, Shipping: %)', 
            rec.company_name, rec.company_id, rec.order_count, rec.paid, rec.accepted, rec.shipping;
    END LOOP;
    RAISE NOTICE '========================================';
END $$;

-- Hiển thị một số đơn hàng mẫu để kiểm tra
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
ORDER BY 
    c.company_id,
    CASE o.status
        WHEN 'PAID' THEN 1
        WHEN 'ACCEPTED' THEN 2
        WHEN 'LOADING' THEN 3
        WHEN 'IN_TRANSIT' THEN 4
        WHEN 'WAREHOUSE_RECEIVED' THEN 5
        WHEN 'COMPLETED' THEN 6
        ELSE 7
    END,
    o.created_at DESC
LIMIT 20;

