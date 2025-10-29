-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng Reviews (Đánh giá)
CREATE TABLE IF NOT EXISTS "Reviews" (
  review_id SERIAL PRIMARY KEY,
  -- Đối tượng được đánh giá
  review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('COMPANY', 'DRIVER', 'SERVICE')),
  company_id INTEGER REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES "Drivers"(driver_id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES "CargoOrders"(order_id) ON DELETE SET NULL,
  -- Người đánh giá
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255), -- Tên khách hàng (nếu không có account)
  -- Đánh giá
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 sao
  title VARCHAR(255), -- Tiêu đề đánh giá
  comment TEXT, -- Nội dung đánh giá
  -- Đánh giá chi tiết (theo tiêu chí)
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5), -- Đúng giờ
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5), -- Dịch vụ
  price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5), -- Giá cả
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5), -- An toàn (cho hàng hóa)
  -- Trạng thái
  status VARCHAR(50) DEFAULT 'PUBLISHED' CHECK (status IN ('PENDING', 'PUBLISHED', 'HIDDEN', 'DELETED')),
  -- Moderation
  is_verified BOOLEAN DEFAULT FALSE, -- Đánh giá đã xác minh (từ đơn hàng thật)
  moderator_notes TEXT, -- Ghi chú của người kiểm duyệt
  -- Thời gian
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Index để truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_reviews_company ON "Reviews"(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_driver ON "Reviews"(driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON "Reviews"(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON "Reviews"(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON "Reviews"(review_type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON "Reviews"(rating, review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON "Reviews"(status);

-- 3) Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION reviews_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON "Reviews"
FOR EACH ROW EXECUTE FUNCTION reviews_set_updated_at();

-- 4) Function để cập nhật rating trung bình của công ty
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.review_type = 'COMPANY' AND NEW.company_id IS NOT NULL AND NEW.status = 'PUBLISHED' THEN
    UPDATE "LogisticsCompany"
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM "Reviews"
      WHERE company_id = NEW.company_id
        AND review_type = 'COMPANY'
        AND status = 'PUBLISHED'
    )
    WHERE company_id = NEW.company_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_company_rating
AFTER INSERT OR UPDATE OF rating, status ON "Reviews"
FOR EACH ROW
WHEN (NEW.review_type = 'COMPANY')
EXECUTE FUNCTION update_company_rating();

-- 5) Function để cập nhật rating trung bình của tài xế
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.review_type = 'DRIVER' AND NEW.driver_id IS NOT NULL AND NEW.status = 'PUBLISHED' THEN
    UPDATE "Drivers"
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM "Reviews"
      WHERE driver_id = NEW.driver_id
        AND review_type = 'DRIVER'
        AND status = 'PUBLISHED'
    )
    WHERE driver_id = NEW.driver_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_driver_rating
AFTER INSERT OR UPDATE OF rating, status ON "Reviews"
FOR EACH ROW
WHEN (NEW.review_type = 'DRIVER')
EXECUTE FUNCTION update_driver_rating();

