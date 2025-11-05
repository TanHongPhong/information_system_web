-- Script để kiểm tra và sửa lỗi đơn hàng của Driver A (Nguyễn Văn A)
-- Chạy script này trên Neon Database

-- BƯỚC 1: Kiểm tra thông tin driver A và xe được gán
SELECT 
    '=== THÔNG TIN DRIVER A ===' as info;
    
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    u.phone,
    d.driver_id,
    d.vehicle_id,
    v.license_plate,
    v.driver_name,
    v.driver_phone
FROM users u
LEFT JOIN "Drivers" d ON u.id = d.user_id
LEFT JOIN "Vehicles" v ON d.vehicle_id = v.vehicle_id
WHERE u.email = 'nguyenvana@driver.com';

-- BƯỚC 2: Kiểm tra tất cả đơn hàng của xe 29A-123.45
SELECT 
    '=== TẤT CẢ ĐƠN HÀNG CỦA XE 29A-123.45 ===' as info;

SELECT 
    co.order_id,
    co.cargo_name,
    co.status,
    co.vehicle_id,
    v.license_plate,
    co.created_at,
    co.updated_at
FROM "CargoOrders" co
LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
WHERE v.license_plate = '29A-123.45'
ORDER BY co.created_at DESC;

-- BƯỚC 3: Kiểm tra đơn hàng với status cần hiển thị (LOADING, IN_TRANSIT, WAREHOUSE_RECEIVED)
SELECT 
    '=== ĐƠN HÀNG CÓ HÀNG (LOADING/IN_TRANSIT/WAREHOUSE_RECEIVED) ===' as info;

SELECT 
    co.order_id,
    co.cargo_name,
    co.status,
    co.vehicle_id,
    v.license_plate,
    co.created_at
FROM "CargoOrders" co
LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
WHERE v.license_plate = '29A-123.45'
  AND co.status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED')
ORDER BY co.created_at DESC;

-- BƯỚC 4: Kiểm tra đơn hàng với status ACCEPTED (có thể cần chuyển sang LOADING)
SELECT 
    '=== ĐƠN HÀNG ACCEPTED CỦA XE 29A-123.45 (CÓ THỂ CẦN CHUYỂN SANG LOADING) ===' as info;

SELECT 
    co.order_id,
    co.cargo_name,
    co.status,
    co.vehicle_id,
    v.license_plate,
    co.created_at
FROM "CargoOrders" co
LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
WHERE v.license_plate = '29A-123.45'
  AND co.status = 'ACCEPTED'
ORDER BY co.created_at DESC;

-- BƯỚC 5: So sánh với các xe khác có hàng
SELECT 
    '=== SO SÁNH VỚI CÁC XE KHÁC CÓ HÀNG ===' as info;

SELECT 
    v.license_plate,
    v.driver_name,
    COUNT(co.order_id) FILTER (WHERE co.status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED')) as "Số đơn có hàng",
    COUNT(co.order_id) FILTER (WHERE co.status = 'ACCEPTED') as "Số đơn ACCEPTED",
    COUNT(co.order_id) as "Tổng số đơn"
FROM "Vehicles" v
LEFT JOIN "CargoOrders" co ON v.vehicle_id = co.vehicle_id
WHERE v.driver_name IS NOT NULL
GROUP BY v.license_plate, v.driver_name
ORDER BY "Số đơn có hàng" DESC;

-- BƯỚC 6: Nếu xe 29A-123.45 có đơn ACCEPTED nhưng không có LOADING/IN_TRANSIT/WAREHOUSE_RECEIVED
-- Có thể cần chuyển một số đơn ACCEPTED sang LOADING để test
-- (UNCOMMENT phần này nếu cần)
/*
-- Tìm vehicle_id của xe 29A-123.45
DO $$
DECLARE
    v_vehicle_id INTEGER;
BEGIN
    SELECT vehicle_id INTO v_vehicle_id 
    FROM "Vehicles" 
    WHERE license_plate = '29A-123.45' 
    LIMIT 1;
    
    IF v_vehicle_id IS NOT NULL THEN
        -- Chuyển 2 đơn ACCEPTED đầu tiên sang LOADING
        UPDATE "CargoOrders"
        SET status = 'LOADING',
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = v_vehicle_id
          AND status = 'ACCEPTED'
          AND order_id IN (
              SELECT order_id 
              FROM "CargoOrders"
              WHERE vehicle_id = v_vehicle_id
                AND status = 'ACCEPTED'
              ORDER BY created_at DESC
              LIMIT 2
          );
        
        RAISE NOTICE '✅ Đã chuyển 2 đơn hàng từ ACCEPTED sang LOADING cho xe %', v_vehicle_id;
    ELSE
        RAISE NOTICE '❌ Không tìm thấy xe 29A-123.45';
    END IF;
END $$;
*/

