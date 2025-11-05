-- Script để kiểm tra đơn hàng của customer
-- Thay thế customer_id bằng customer_id từ localStorage của bạn

-- 1. Kiểm tra user có tồn tại không
SELECT 
    id,
    email,
    name,
    phone,
    role
FROM users
WHERE id = '89db2755-40c9-4200-8c64-84dd46ced9d2';

-- 2. Kiểm tra tất cả đơn hàng của customer này
SELECT 
    co.order_id,
    co.status,
    co.customer_id,
    co.company_id,
    co.cargo_name,
    co.created_at,
    co.updated_at,
    u.email as customer_email,
    u.name as customer_name
FROM "CargoOrders" co
LEFT JOIN users u ON co.customer_id = u.id
WHERE co.customer_id = '89db2755-40c9-4200-8c64-84dd46ced9d2'
ORDER BY co.created_at DESC;

-- 3. Đếm số đơn hàng theo status
SELECT 
    status,
    COUNT(*) as count
FROM "CargoOrders"
WHERE customer_id = '89db2755-40c9-4200-8c64-84dd46ced9d2'
GROUP BY status
ORDER BY count DESC;

-- 4. Kiểm tra đơn hàng với các status hợp lệ cho customer
SELECT 
    co.order_id,
    co.status,
    co.customer_id,
    co.cargo_name,
    co.created_at
FROM "CargoOrders" co
WHERE co.customer_id = '89db2755-40c9-4200-8c64-84dd46ced9d2'
  AND co.status IN ('PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED')
ORDER BY co.created_at DESC;

-- 5. Kiểm tra tất cả customer_id trong CargoOrders (để xem format)
SELECT DISTINCT 
    customer_id,
    COUNT(*) as order_count
FROM "CargoOrders"
WHERE customer_id IS NOT NULL
GROUP BY customer_id
ORDER BY order_count DESC
LIMIT 10;

