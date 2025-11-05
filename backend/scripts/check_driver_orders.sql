-- Script kiểm tra đơn hàng của các driver
-- Chạy script này trên Neon Database để debug

-- 1. Kiểm tra các driver và xe được gán
SELECT 
    u.email as "Email Driver",
    u.name as "Tên Driver",
    u.phone as "Số điện thoại",
    d.vehicle_id,
    v.license_plate as "Biển số xe",
    v.driver_name as "Tên tài xế trong Vehicles",
    v.driver_phone as "SĐT trong Vehicles"
FROM users u
LEFT JOIN "Drivers" d ON u.id = d.user_id
LEFT JOIN "Vehicles" v ON d.vehicle_id = v.vehicle_id
WHERE u.role = 'driver'
ORDER BY u.email;

-- 2. Kiểm tra đơn hàng của từng xe
SELECT 
    v.vehicle_id,
    v.license_plate as "Biển số xe",
    v.driver_name as "Tên tài xế",
    COUNT(co.order_id) FILTER (WHERE co.status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED')) as "Số đơn có hàng",
    COUNT(co.order_id) as "Tổng số đơn",
    STRING_AGG(DISTINCT co.status, ', ') as "Các status đơn hàng"
FROM "Vehicles" v
LEFT JOIN "CargoOrders" co ON v.vehicle_id = co.vehicle_id
WHERE v.driver_name IS NOT NULL OR v.driver_phone IS NOT NULL
GROUP BY v.vehicle_id, v.license_plate, v.driver_name
ORDER BY v.vehicle_id;

-- 3. Kiểm tra chi tiết đơn hàng của xe 29A-123.45 (xe của Nguyễn Văn A)
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

-- 4. Kiểm tra đơn hàng với status LOADING, IN_TRANSIT, WAREHOUSE_RECEIVED của xe 29A-123.45
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

-- 5. Kiểm tra tất cả đơn hàng có status LOADING, IN_TRANSIT, WAREHOUSE_RECEIVED và xe của chúng
SELECT 
    co.order_id,
    co.cargo_name,
    co.status,
    co.vehicle_id,
    v.license_plate,
    v.driver_name,
    co.created_at
FROM "CargoOrders" co
LEFT JOIN "Vehicles" v ON co.vehicle_id = v.vehicle_id
WHERE co.status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED')
ORDER BY v.license_plate, co.created_at DESC;

