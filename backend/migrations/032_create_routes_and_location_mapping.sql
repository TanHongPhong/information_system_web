-- Migration: Tạo bảng Routes và LocationMapping để quản lý tuyến đường và vị trí xe
-- Mục đích: 
-- 1. Lưu các tuyến đường của từng công ty
-- 2. Mapping địa điểm với khu vực (Hà Nội, HCM, Đà Nẵng, etc.)
-- 3. Hỗ trợ logic: xe đang LOADING không nhận đơn mới, xe chỉ nhận đơn ở khu vực hiện tại

SET search_path TO public;

-- =====================================================
-- 1. Bảng Routes: Lưu các tuyến đường của công ty
-- =====================================================
CREATE TABLE IF NOT EXISTS "Routes" (
  route_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  
  -- Tên tuyến đường
  route_name VARCHAR(255) NOT NULL,
  
  -- Điểm xuất phát và điểm đến (khu vực)
  origin_region VARCHAR(100) NOT NULL, -- Ví dụ: "Hà Nội", "HCM", "Đà Nẵng"
  destination_region VARCHAR(100) NOT NULL, -- Ví dụ: "Hà Nội", "HCM", "Đà Nẵng"
  
  -- Khoảng cách ước tính (km)
  estimated_distance_km DECIMAL(10, 2),
  
  -- Thời gian ước tính (giờ)
  estimated_duration_hours DECIMAL(5, 2),
  
  -- Trạng thái tuyến
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: không cho phép duplicate route cùng công ty, origin, destination
  UNIQUE(company_id, origin_region, destination_region)
);

-- Indexes cho Routes
CREATE INDEX IF NOT EXISTS idx_routes_company ON "Routes"(company_id);
CREATE INDEX IF NOT EXISTS idx_routes_origin ON "Routes"(origin_region);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON "Routes"(destination_region);
CREATE INDEX IF NOT EXISTS idx_routes_active ON "Routes"(is_active) WHERE is_active = TRUE;

-- =====================================================
-- 2. Bảng LocationMapping: Mapping địa chỉ với khu vực
-- =====================================================
CREATE TABLE IF NOT EXISTS "LocationMapping" (
  mapping_id SERIAL PRIMARY KEY,
  
  -- Địa chỉ hoặc từ khóa địa chỉ
  address_keyword VARCHAR(255) NOT NULL, -- Ví dụ: "Hà Nội", "HCM", "Quận 1", "Ba Đình"
  
  -- Khu vực tương ứng
  region VARCHAR(100) NOT NULL, -- Ví dụ: "Hà Nội", "HCM", "Đà Nẵng"
  
  -- Tỉnh/Thành phố
  province VARCHAR(100), -- Ví dụ: "Hà Nội", "Hồ Chí Minh", "Đà Nẵng"
  
  -- Mức độ ưu tiên (1 = cao nhất, dùng để match khi có nhiều mapping)
  priority INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: không cho phép duplicate
  UNIQUE(address_keyword, region)
);

-- Indexes cho LocationMapping
CREATE INDEX IF NOT EXISTS idx_location_mapping_keyword ON "LocationMapping"(address_keyword);
CREATE INDEX IF NOT EXISTS idx_location_mapping_region ON "LocationMapping"(region);
CREATE INDEX IF NOT EXISTS idx_location_mapping_priority ON "LocationMapping"(priority DESC);

-- =====================================================
-- 3. Trigger để update updated_at cho Routes
-- =====================================================
CREATE OR REPLACE FUNCTION routes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_routes_updated_at ON "Routes";
CREATE TRIGGER trg_routes_updated_at
BEFORE UPDATE ON "Routes"
FOR EACH ROW EXECUTE FUNCTION routes_set_updated_at();

-- =====================================================
-- 4. Trigger để update updated_at cho LocationMapping
-- =====================================================
CREATE OR REPLACE FUNCTION location_mapping_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_location_mapping_updated_at ON "LocationMapping";
CREATE TRIGGER trg_location_mapping_updated_at
BEFORE UPDATE ON "LocationMapping"
FOR EACH ROW EXECUTE FUNCTION location_mapping_set_updated_at();

-- =====================================================
-- 5. Seed dữ liệu mẫu cho LocationMapping
-- =====================================================
INSERT INTO "LocationMapping" (address_keyword, region, province, priority) VALUES
  -- Hà Nội
  ('Hà Nội', 'Hà Nội', 'Hà Nội', 1),
  ('Hanoi', 'Hà Nội', 'Hà Nội', 1),
  ('Ba Đình', 'Hà Nội', 'Hà Nội', 2),
  ('Hoàn Kiếm', 'Hà Nội', 'Hà Nội', 2),
  ('Đống Đa', 'Hà Nội', 'Hà Nội', 2),
  ('Hai Bà Trưng', 'Hà Nội', 'Hà Nội', 2),
  ('Cầu Giấy', 'Hà Nội', 'Hà Nội', 2),
  ('Thanh Xuân', 'Hà Nội', 'Hà Nội', 2),
  ('Long Biên', 'Hà Nội', 'Hà Nội', 2),
  ('Nam Từ Liêm', 'Hà Nội', 'Hà Nội', 2),
  ('Bắc Từ Liêm', 'Hà Nội', 'Hà Nội', 2),
  
  -- Hồ Chí Minh
  ('Hồ Chí Minh', 'HCM', 'Hồ Chí Minh', 1),
  ('Ho Chi Minh', 'HCM', 'Hồ Chí Minh', 1),
  ('HCM', 'HCM', 'Hồ Chí Minh', 1),
  ('TP.HCM', 'HCM', 'Hồ Chí Minh', 1),
  ('TP HCM', 'HCM', 'Hồ Chí Minh', 1),
  ('Sài Gòn', 'HCM', 'Hồ Chí Minh', 1),
  ('Saigon', 'HCM', 'Hồ Chí Minh', 1),
  ('Quận 1', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 2', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 3', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 4', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 5', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 6', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 7', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 8', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 9', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 10', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 11', 'HCM', 'Hồ Chí Minh', 2),
  ('Quận 12', 'HCM', 'Hồ Chí Minh', 2),
  ('Bình Thạnh', 'HCM', 'Hồ Chí Minh', 2),
  ('Tân Bình', 'HCM', 'Hồ Chí Minh', 2),
  ('Tân Phú', 'HCM', 'Hồ Chí Minh', 2),
  ('Phú Nhuận', 'HCM', 'Hồ Chí Minh', 2),
  ('Gò Vấp', 'HCM', 'Hồ Chí Minh', 2),
  ('Bình Tân', 'HCM', 'Hồ Chí Minh', 2),
  ('Thủ Đức', 'HCM', 'Hồ Chí Minh', 2),
  
  -- Đà Nẵng
  ('Đà Nẵng', 'Đà Nẵng', 'Đà Nẵng', 1),
  ('Da Nang', 'Đà Nẵng', 'Đà Nẵng', 1),
  ('Hải Châu', 'Đà Nẵng', 'Đà Nẵng', 2),
  ('Thanh Khê', 'Đà Nẵng', 'Đà Nẵng', 2),
  ('Sơn Trà', 'Đà Nẵng', 'Đà Nẵng', 2),
  ('Ngũ Hành Sơn', 'Đà Nẵng', 'Đà Nẵng', 2),
  ('Liên Chiểu', 'Đà Nẵng', 'Đà Nẵng', 2),
  ('Cẩm Lệ', 'Đà Nẵng', 'Đà Nẵng', 2),
  
  -- Hải Phòng
  ('Hải Phòng', 'Hải Phòng', 'Hải Phòng', 1),
  ('Hai Phong', 'Hải Phòng', 'Hải Phòng', 1),
  ('Hồng Bàng', 'Hải Phòng', 'Hải Phòng', 2),
  ('Ngô Quyền', 'Hải Phòng', 'Hải Phòng', 2),
  ('Lê Chân', 'Hải Phòng', 'Hải Phòng', 2),
  
  -- Cần Thơ
  ('Cần Thơ', 'Cần Thơ', 'Cần Thơ', 1),
  ('Can Tho', 'Cần Thơ', 'Cần Thơ', 1),
  ('Ninh Kiều', 'Cần Thơ', 'Cần Thơ', 2),
  ('Ô Môn', 'Cần Thơ', 'Cần Thơ', 2),
  ('Bình Thủy', 'Cần Thơ', 'Cần Thơ', 2)
ON CONFLICT (address_keyword, region) DO NOTHING;

-- =====================================================
-- 6. Seed dữ liệu mẫu cho Routes (tuyến đường phổ biến)
-- =====================================================
-- Lấy company_id đầu tiên để seed
DO $$
DECLARE
  v_company_id INTEGER;
BEGIN
  SELECT company_id INTO v_company_id FROM "LogisticsCompany" LIMIT 1;
  
  IF v_company_id IS NOT NULL THEN
    INSERT INTO "Routes" (company_id, route_name, origin_region, destination_region, estimated_distance_km, estimated_duration_hours, is_active) VALUES
      (v_company_id, 'Hà Nội - HCM', 'Hà Nội', 'HCM', 1700, 24, TRUE),
      (v_company_id, 'HCM - Hà Nội', 'HCM', 'Hà Nội', 1700, 24, TRUE),
      (v_company_id, 'HCM - Đà Nẵng', 'HCM', 'Đà Nẵng', 900, 12, TRUE),
      (v_company_id, 'Đà Nẵng - HCM', 'Đà Nẵng', 'HCM', 900, 12, TRUE),
      (v_company_id, 'Hà Nội - Đà Nẵng', 'Hà Nội', 'Đà Nẵng', 800, 10, TRUE),
      (v_company_id, 'Đà Nẵng - Hà Nội', 'Đà Nẵng', 'Hà Nội', 800, 10, TRUE),
      (v_company_id, 'HCM - Cần Thơ', 'HCM', 'Cần Thơ', 170, 3, TRUE),
      (v_company_id, 'Cần Thơ - HCM', 'Cần Thơ', 'HCM', 170, 3, TRUE)
    ON CONFLICT (company_id, origin_region, destination_region) DO NOTHING;
  END IF;
END $$;

-- =====================================================
-- 7. Tạo function để extract region từ địa chỉ
-- =====================================================
CREATE OR REPLACE FUNCTION get_region_from_address(address_text TEXT)
RETURNS VARCHAR(100) AS $$
DECLARE
  v_region VARCHAR(100);
  v_normalized TEXT;
BEGIN
  -- Chuẩn hóa địa chỉ: lowercase, trim
  v_normalized := LOWER(TRIM(COALESCE(address_text, '')));
  
  IF v_normalized = '' THEN
    RETURN 'UNKNOWN';
  END IF;
  
  -- Tìm mapping: ưu tiên match toàn bộ từ khóa, sau đó match chứa từ khóa
  -- Sắp xếp theo: priority DESC, length DESC (ưu tiên từ khóa dài hơn và priority cao hơn)
  SELECT lm.region INTO v_region
  FROM "LocationMapping" lm
  WHERE v_normalized LIKE '%' || LOWER(lm.address_keyword) || '%'
     OR LOWER(lm.address_keyword) = ANY(string_to_array(v_normalized, ' '))
  ORDER BY lm.priority DESC, LENGTH(lm.address_keyword) DESC
  LIMIT 1;
  
  RETURN COALESCE(v_region, 'UNKNOWN');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. Tạo function để kiểm tra xe có thể nhận đơn hàng không
-- =====================================================
CREATE OR REPLACE FUNCTION can_vehicle_accept_order(
  p_vehicle_id INTEGER,
  p_pickup_address TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_vehicle_status VARCHAR(50);
  v_vehicle_location VARCHAR(255);
  v_vehicle_region VARCHAR(100);
  v_order_region VARCHAR(100);
  v_has_loading_orders BOOLEAN;
  v_result JSONB;
BEGIN
  -- Lấy thông tin xe
  SELECT status, current_location
  INTO v_vehicle_status, v_vehicle_location
  FROM "Vehicles"
  WHERE vehicle_id = p_vehicle_id;
  
  IF v_vehicle_status IS NULL THEN
    RETURN jsonb_build_object(
      'can_accept', false,
      'reason', 'Vehicle not found'
    );
  END IF;
  
  -- Kiểm tra xe có đang có đơn hàng với status LOADING, IN_TRANSIT, hoặc COMPLETED không
  -- Nếu có thì không cho nhận đơn mới
  SELECT EXISTS(
    SELECT 1 FROM "CargoOrders"
    WHERE vehicle_id = p_vehicle_id
      AND status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
  ) INTO v_has_loading_orders;
  
  IF v_has_loading_orders THEN
    RETURN jsonb_build_object(
      'can_accept', false,
      'reason', 'Vehicle has active orders (LOADING, IN_TRANSIT, or COMPLETED), cannot accept new orders'
    );
  END IF;
  
  -- Kiểm tra vị trí xe
  IF v_vehicle_location IS NULL OR v_vehicle_location = '' THEN
    -- Nếu xe chưa có vị trí, cho phép nhận đơn
    RETURN jsonb_build_object(
      'can_accept', true,
      'reason', 'Vehicle location not set, accepting order'
    );
  END IF;
  
  -- Extract region từ vị trí xe và địa chỉ đơn hàng
  v_vehicle_region := get_region_from_address(v_vehicle_location);
  v_order_region := get_region_from_address(p_pickup_address);
  
  -- Kiểm tra xe có ở cùng khu vực với đơn hàng không
  IF v_vehicle_region = 'UNKNOWN' OR v_order_region = 'UNKNOWN' THEN
    -- Nếu không xác định được region, cho phép nhận đơn
    RETURN jsonb_build_object(
      'can_accept', true,
      'reason', 'Cannot determine region, accepting order',
      'vehicle_region', v_vehicle_region,
      'order_region', v_order_region
    );
  END IF;
  
  IF v_vehicle_region = v_order_region THEN
    RETURN jsonb_build_object(
      'can_accept', true,
      'reason', 'Vehicle and order are in the same region',
      'region', v_vehicle_region
    );
  ELSE
    RETURN jsonb_build_object(
      'can_accept', false,
      'reason', format('Vehicle is in %s but order pickup is in %s', v_vehicle_region, v_order_region),
      'vehicle_region', v_vehicle_region,
      'order_region', v_order_region
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. Bảng VehicleRoutes: Map xe với routes cụ thể
-- Mỗi xe chỉ có thể có 1 route active duy nhất (từ A đến B và ngược lại)
-- =====================================================
CREATE TABLE IF NOT EXISTS "VehicleRoutes" (
  vehicle_route_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES "Vehicles"(vehicle_id) ON DELETE CASCADE,
  route_id INTEGER NOT NULL REFERENCES "Routes"(route_id) ON DELETE CASCADE,
  
  -- Trạng thái
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: mỗi xe chỉ có thể có 1 route active duy nhất
  UNIQUE(vehicle_id, route_id)
);

-- Indexes cho VehicleRoutes
CREATE INDEX IF NOT EXISTS idx_vehicle_routes_vehicle ON "VehicleRoutes"(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_routes_route ON "VehicleRoutes"(route_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_routes_active ON "VehicleRoutes"(is_active) WHERE is_active = TRUE;

-- Composite index để tìm nhanh xe theo route
CREATE INDEX IF NOT EXISTS idx_vehicle_routes_vehicle_route_active ON "VehicleRoutes"(vehicle_id, route_id, is_active);

-- =====================================================
-- 10. Trigger để update updated_at cho VehicleRoutes
-- =====================================================
CREATE OR REPLACE FUNCTION vehicle_routes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicle_routes_updated_at ON "VehicleRoutes";
CREATE TRIGGER trg_vehicle_routes_updated_at
BEFORE UPDATE ON "VehicleRoutes"
FOR EACH ROW EXECUTE FUNCTION vehicle_routes_set_updated_at();

-- =====================================================
-- 11. Function để lấy danh sách regions có sẵn (tất cả routes)
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_regions()
RETURNS TABLE (
  region VARCHAR(100),
  region_type VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    origin_region as region,
    'origin'::VARCHAR(20) as region_type
  FROM "Routes"
  WHERE is_active = TRUE
  UNION
  SELECT DISTINCT
    destination_region as region,
    'destination'::VARCHAR(20) as region_type
  FROM "Routes"
  WHERE is_active = TRUE
  ORDER BY region;
END;
$$ LANGUAGE plpgsql;

