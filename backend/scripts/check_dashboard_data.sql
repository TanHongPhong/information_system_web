-- Script kiểm tra dữ liệu dashboard
-- Chạy script này để xem dữ liệu đã được đẩy lên chưa

SET search_path TO public;

-- =====================================================
-- KIỂM TRA TỔNG QUAN
-- =====================================================

SELECT 
    'Tổng số đơn hàng' as metric,
    COUNT(*)::TEXT as value
FROM "CargoOrders"
UNION ALL
SELECT 
    'Tổng số Transactions' as metric,
    COUNT(*)::TEXT as value
FROM "Transactions"
UNION ALL
SELECT 
    'Tổng số Vehicles' as metric,
    COUNT(*)::TEXT as value
FROM "Vehicles"
UNION ALL
SELECT 
    'Tổng số Companies' as metric,
    COUNT(*)::TEXT as value
FROM "LogisticsCompany"
UNION ALL
SELECT 
    'Tổng số Users' as metric,
    COUNT(*)::TEXT as value
FROM users;

-- =====================================================
-- KIỂM TRA ĐƠN HÀNG THEO STATUS
-- =====================================================

SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM "CargoOrders") as percentage
FROM "CargoOrders"
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'PAID' THEN 1
        WHEN 'ACCEPTED' THEN 2
        WHEN 'LOADING' THEN 3
        WHEN 'IN_TRANSIT' THEN 4
        WHEN 'WAREHOUSE_RECEIVED' THEN 5
        WHEN 'COMPLETED' THEN 6
        WHEN 'PENDING_PAYMENT' THEN 7
        ELSE 8
    END;

-- =====================================================
-- KIỂM TRA ĐƠN HÀNG THEO CÔNG TY
-- =====================================================

SELECT 
    c.company_id,
    c.company_name,
    COUNT(o.order_id) as total_orders,
    COUNT(CASE WHEN o.status = 'PAID' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN o.status = 'ACCEPTED' THEN 1 END) as accepted_orders,
    COUNT(CASE WHEN o.status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED') THEN 1 END) as shipping_orders
FROM "LogisticsCompany" c
LEFT JOIN "CargoOrders" o ON c.company_id = o.company_id
GROUP BY c.company_id, c.company_name
ORDER BY c.company_id;

-- =====================================================
-- KIỂM TRA ĐƠN HÀNG CÓ TRANSACTION
-- =====================================================

SELECT 
    o.status,
    COUNT(DISTINCT o.order_id) as orders_with_transaction,
    COUNT(DISTINCT CASE WHEN o.status != 'PENDING_PAYMENT' THEN o.order_id END) as non_pending_orders,
    COUNT(DISTINCT t.transaction_id) as total_transactions
FROM "CargoOrders" o
LEFT JOIN "Transactions" t ON o.order_id = t.order_id
GROUP BY o.status
ORDER BY 
    CASE o.status
        WHEN 'PAID' THEN 1
        WHEN 'ACCEPTED' THEN 2
        WHEN 'LOADING' THEN 3
        WHEN 'IN_TRANSIT' THEN 4
        WHEN 'WAREHOUSE_RECEIVED' THEN 5
        WHEN 'COMPLETED' THEN 6
        WHEN 'PENDING_PAYMENT' THEN 7
        ELSE 8
    END;

-- =====================================================
-- HIỂN THỊ MẪU ĐƠN HÀNG CHO MỖI STATUS
-- =====================================================

SELECT 
    o.order_id,
    c.company_name,
    o.status,
    o.cargo_name,
    COALESCE(o.contact_name, u.name) as customer_name,
    v.license_plate,
    t.payment_status,
    o.created_at
FROM "CargoOrders" o
JOIN "LogisticsCompany" c ON o.company_id = c.company_id
LEFT JOIN users u ON o.customer_id = u.id
LEFT JOIN "Vehicles" v ON o.vehicle_id = v.vehicle_id
LEFT JOIN "Transactions" t ON o.order_id = t.order_id
WHERE o.status IN ('PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED')
ORDER BY 
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
LIMIT 30;

