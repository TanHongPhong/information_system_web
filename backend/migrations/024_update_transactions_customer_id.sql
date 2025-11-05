-- Migration: Update customer_id for existing transactions that don't have it
-- Lấy customer_id từ CargoOrders để fill vào Transactions

SET search_path TO public;

-- 1) Kiểm tra số lượng transactions chưa có customer_id
SELECT 
    COUNT(*) as transactions_without_customer_id
FROM "Transactions" t
WHERE t.customer_id IS NULL;

-- 2) Kiểm tra số lượng transactions có thể update được (có order tương ứng)
SELECT 
    COUNT(*) as transactions_can_be_updated
FROM "Transactions" t
INNER JOIN "CargoOrders" co ON t.order_id = co.order_id
WHERE t.customer_id IS NULL
  AND co.customer_id IS NOT NULL;

-- 3) Update customer_id từ CargoOrders cho các transactions chưa có
UPDATE "Transactions" t
SET customer_id = co.customer_id,
    updated_at = CURRENT_TIMESTAMP
FROM "CargoOrders" co
WHERE t.order_id = co.order_id
  AND t.customer_id IS NULL
  AND co.customer_id IS NOT NULL;

-- 4) Kiểm tra kết quả sau khi update
SELECT 
    COUNT(*) as transactions_without_customer_id_after_update
FROM "Transactions" t
WHERE t.customer_id IS NULL;

-- 5) Hiển thị một số transactions đã được update
SELECT 
    t.transaction_id,
    t.order_id,
    t.customer_id,
    t.payment_status,
    t.created_at,
    co.cargo_name
FROM "Transactions" t
LEFT JOIN "CargoOrders" co ON t.order_id = co.order_id
WHERE t.customer_id IS NOT NULL
ORDER BY t.updated_at DESC
LIMIT 10;

-- 6) Comment để giải thích
COMMENT ON COLUMN "Transactions".customer_id IS 'Customer (user) who made this payment - Auto-filled from CargoOrders if not provided';

