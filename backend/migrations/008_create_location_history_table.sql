-- 0) Kiểm tra không read-only, đảm bảo schema
SHOW default_transaction_read_only; -- off
SET search_path TO public;

-- 1) Bảng LocationHistory (Lịch sử vị trí xe)
-- Dùng để theo dõi vị trí xe theo thời gian thực cho tính năng tracking
CREATE TABLE IF NOT EXISTS "LocationHistory" (
  location_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES "Vehicles"(vehicle_id) ON DELETE CASCADE,
  order_id INTEGER REFERENCES "CargoOrders"(order_id) ON DELETE SET NULL,
  -- Tọa độ GPS
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  -- Địa chỉ văn bản (có thể geocode từ lat/lng)
  address TEXT,
  -- Tốc độ (km/h)
  speed_kmh NUMERIC(5,2),
  -- Hướng di chuyển (độ, 0-360)
  heading_degrees INTEGER CHECK (heading_degrees >= 0 AND heading_degrees <= 360),
  -- Độ chính xác GPS (mét)
  accuracy_meters NUMERIC(6,2),
  -- Thời gian
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Metadata
  device_info TEXT, -- Thông tin thiết bị gửi vị trí
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100)
);

-- 2) Index để truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_location_history_vehicle ON "LocationHistory"(vehicle_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_history_order ON "LocationHistory"(order_id);
CREATE INDEX IF NOT EXISTS idx_location_history_recorded ON "LocationHistory"(recorded_at DESC);
-- Index cho spatial queries (tìm xe gần một vị trí)
CREATE INDEX IF NOT EXISTS idx_location_history_coords ON "LocationHistory"(latitude, longitude);

-- 3) Index composite để lấy vị trí mới nhất của xe
CREATE INDEX IF NOT EXISTS idx_location_history_vehicle_latest ON "LocationHistory"(vehicle_id, recorded_at DESC)
WHERE recorded_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'; -- Chỉ index dữ liệu 24h gần nhất

-- 4) Function để lấy vị trí mới nhất của một xe
CREATE OR REPLACE FUNCTION get_latest_vehicle_location(p_vehicle_id INTEGER)
RETURNS TABLE (
  location_id INTEGER,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  recorded_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lh.location_id,
    lh.latitude,
    lh.longitude,
    lh.address,
    lh.recorded_at
  FROM "LocationHistory" lh
  WHERE lh.vehicle_id = p_vehicle_id
  ORDER BY lh.recorded_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

