-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Thêm cột customer_id (user_id) vào bảng CargoOrders để liên kết với người đặt hàng
ALTER TABLE "CargoOrders" 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2) Index để tìm kiếm đơn hàng theo khách hàng
CREATE INDEX IF NOT EXISTS idx_cargo_orders_customer ON "CargoOrders"(customer_id);

-- 3) Thêm cột contact_name và contact_phone cho trường hợp đặt hàng không cần đăng nhập
ALTER TABLE "CargoOrders"
ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);

