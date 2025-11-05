-- Migration: Thêm customer_id vào bảng Transactions
-- Để theo dõi customer nào đã thanh toán

SET search_path TO public;

-- 1) Thêm cột customer_id vào bảng Transactions
ALTER TABLE "Transactions" 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2) Index để tìm kiếm transaction theo customer
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON "Transactions"(customer_id);

-- 3) Cập nhật customer_id cho các transaction hiện có (lấy từ CargoOrders)
UPDATE "Transactions" t
SET customer_id = co.customer_id
FROM "CargoOrders" co
WHERE t.order_id = co.order_id
  AND t.customer_id IS NULL
  AND co.customer_id IS NOT NULL;

-- 4) Comment để giải thích
COMMENT ON COLUMN "Transactions".customer_id IS 'Customer (user) who made this payment';

