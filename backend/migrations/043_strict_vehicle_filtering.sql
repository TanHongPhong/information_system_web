-- Migration: Strict vehicle filtering - Loại bỏ xe đang di chuyển, đang sử dụng có orders, và đầy hàng
-- Mục đích: Chỉ hiển thị xe thực sự sẵn sàng nhận đơn hàng mới

SET search_path TO public;

-- =====================================================
-- 1. Function để lấy xe khả dụng theo vị trí hiện tại và điểm đến
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_vehicles_by_location_and_destination(
  p_company_id INTEGER,
  p_origin_region VARCHAR(100),
  p_destination_region VARCHAR(100)
)
RETURNS TABLE (
  vehicle_id INTEGER,
  license_plate VARCHAR(20),
  vehicle_type VARCHAR(100),
  capacity_ton NUMERIC(5,2),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  status VARCHAR(50),
  current_location VARCHAR(255),
  vehicle_region VARCHAR(100),
  route_id INTEGER,
  route_name VARCHAR(255),
  availability JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (v.vehicle_id)
    v.vehicle_id,
    v.license_plate,
    v.vehicle_type,
    v.capacity_ton,
    v.driver_name,
    v.driver_phone,
    v.status,
    v.current_location,
    COALESCE(get_region_from_address(v.current_location), 'UNKNOWN')::VARCHAR(100) as vehicle_region,
    (
      SELECT r.route_id 
      FROM "VehicleRoutes" vr2
      INNER JOIN "Routes" r ON vr2.route_id = r.route_id
      WHERE vr2.vehicle_id = v.vehicle_id
        AND vr2.is_active = TRUE
        AND r.is_active = TRUE
        AND (
          (r.origin_region = p_origin_region AND r.destination_region = p_destination_region)
          OR (r.origin_region = p_destination_region AND r.destination_region = p_origin_region)
        )
      LIMIT 1
    ) as route_id,
    (
      SELECT r.route_name 
      FROM "VehicleRoutes" vr2
      INNER JOIN "Routes" r ON vr2.route_id = r.route_id
      WHERE vr2.vehicle_id = v.vehicle_id
        AND vr2.is_active = TRUE
        AND r.is_active = TRUE
        AND (
          (r.origin_region = p_origin_region AND r.destination_region = p_destination_region)
          OR (r.origin_region = p_destination_region AND r.destination_region = p_origin_region)
        )
      LIMIT 1
    ) as route_name,
    COALESCE(
      get_vehicle_availability(v.vehicle_id, p_destination_region),
      jsonb_build_object('available', true, 'reason', 'Vehicle available')
    ) as availability
  FROM "Vehicles" v
  INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
  WHERE v.company_id = p_company_id
    -- CHỈ lấy xe có status AVAILABLE (không lấy IN_USE nữa)
    -- Loại bỏ MAINTENANCE, INACTIVE và các status không hợp lệ
    AND v.status = 'AVAILABLE'
    -- QUAN TRỌNG: Xe phải ở vị trí = origin_region (điểm đi - nơi lấy hàng)
    AND (
      -- Case 1: Xe có current_location rõ ràng, check region
      get_region_from_address(v.current_location) = p_origin_region
      OR 
      -- Case 2: Nếu current_location trống hoặc không parse được, check route
      (
        (v.current_location IS NULL OR v.current_location = '' OR get_region_from_address(v.current_location) = 'UNKNOWN')
        AND EXISTS(
          SELECT 1 FROM "VehicleRoutes" vr_check
          INNER JOIN "Routes" r_check ON vr_check.route_id = r_check.route_id
          WHERE vr_check.vehicle_id = v.vehicle_id
            AND vr_check.is_active = TRUE
            AND r_check.is_active = TRUE
            AND r_check.origin_region = p_origin_region
            AND r_check.destination_region = p_destination_region
        )
      )
      OR 
      -- Case 3: Fallback - nếu current_location có chứa tên region (case insensitive)
      (v.current_location IS NOT NULL AND v.current_location ILIKE '%' || p_origin_region || '%')
    )
    -- Xe phải có route từ origin_region đến destination_region
    AND EXISTS(
      SELECT 1 FROM "VehicleRoutes" vr2
      INNER JOIN "Routes" r2 ON vr2.route_id = r2.route_id
      WHERE vr2.vehicle_id = v.vehicle_id
        AND vr2.is_active = TRUE
        AND r2.is_active = TRUE
        AND (
          (r2.origin_region = p_origin_region AND r2.destination_region = p_destination_region)
          OR (r2.origin_region = p_destination_region AND r2.destination_region = p_origin_region)
        )
    )
    -- QUAN TRỌNG: Loại bỏ xe có đơn hàng với status LOADING, IN_TRANSIT, COMPLETED
    -- (xe đang bốc hàng, đang vận chuyển, hoặc đã hoàn thành)
    AND NOT EXISTS(
      SELECT 1 FROM "CargoOrders" co
      WHERE co.vehicle_id = v.vehicle_id
        AND co.status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
    )
    -- QUAN TRỌNG: Kiểm tra xe có đầy hàng không (capacity >= 95%)
    -- Tính tổng weight của các orders đang active (ACCEPTED, LOADING, IN_TRANSIT)
    AND (
      SELECT COALESCE(SUM(co.weight_kg), 0)
      FROM "CargoOrders" co
      WHERE co.vehicle_id = v.vehicle_id
        AND co.status IN ('ACCEPTED', 'LOADING', 'IN_TRANSIT')
    ) / 1000.0 < (v.capacity_ton * 0.95)  -- Chỉ cho phép nếu < 95% capacity
  ORDER BY 
    v.vehicle_id,  -- DISTINCT ON yêu cầu ORDER BY theo vehicle_id trước
    CASE 
      WHEN get_region_from_address(v.current_location) = p_origin_region THEN 1
      WHEN v.current_location IS NOT NULL AND v.current_location ILIKE '%' || p_origin_region || '%' THEN 2
      ELSE 3
    END,
    v.license_plate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Comment function
-- =====================================================
COMMENT ON FUNCTION get_available_vehicles_by_location_and_destination IS 
'Lấy danh sách xe khả dụng theo vị trí hiện tại (origin_region) và điểm đến (destination_region). 
Function này sẽ:
- CHỈ lấy xe có status AVAILABLE (không lấy IN_USE)
- Xe phải ở vùng xuất phát (origin_region) để có thể bốc hàng
- Xe phải có route từ origin_region đến destination_region
- Loại bỏ xe có đơn hàng với status LOADING, IN_TRANSIT, COMPLETED (đang bốc hàng, đang vận chuyển)
- Loại bỏ xe đầy hàng (capacity >= 95%)';

