-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng Notifications (Thông báo)
CREATE TABLE IF NOT EXISTS "Notifications" (
  notification_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Người nhận thông báo
  -- Loại thông báo
  type VARCHAR(50) NOT NULL, -- 'ORDER_STATUS', 'PAYMENT', 'VEHICLE_UPDATE', 'SYSTEM', etc.
  -- Tiêu đề và nội dung
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  -- Liên kết đến đối tượng liên quan (order, transaction, etc.)
  related_entity_type VARCHAR(50), -- 'order', 'transaction', 'vehicle', etc.
  related_entity_id INTEGER, -- ID của đối tượng liên quan
  -- Trạng thái
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  -- Priority (độ ưu tiên)
  priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  -- Action URL (link đến trang liên quan)
  action_url TEXT,
  -- Metadata
  metadata JSONB, -- Lưu thông tin bổ sung dưới dạng JSON
  -- Thời gian
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Index để truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_notifications_user ON "Notifications"(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON "Notifications"(user_id, is_read, created_at DESC)
WHERE is_read = FALSE; -- Partial index cho thông báo chưa đọc
CREATE INDEX IF NOT EXISTS idx_notifications_type ON "Notifications"(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related ON "Notifications"(related_entity_type, related_entity_id);

-- 3) Function để đếm số thông báo chưa đọc của một user
CREATE OR REPLACE FUNCTION count_unread_notifications(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM "Notifications"
  WHERE user_id = p_user_id AND is_read = FALSE;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- 4) Trigger để tự động đánh dấu thời gian đọc
CREATE OR REPLACE FUNCTION notifications_mark_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notifications_mark_read
BEFORE UPDATE OF is_read ON "Notifications"
FOR EACH ROW
WHEN (NEW.is_read = TRUE AND OLD.is_read = FALSE)
EXECUTE FUNCTION notifications_mark_read();

