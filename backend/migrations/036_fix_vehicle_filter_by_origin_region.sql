-- Migration: Fix logic filter xe theo origin_region (điểm đi)
-- Mục đích: Khi chọn điểm đi là Cần Thơ, chỉ hiển thị xe đang ở Cần Thơ

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
    AND v.status = 'AVAILABLE'  -- Chỉ lấy xe đang available
    -- QUAN TRỌNG: Xe phải ở vị trí = origin_region (điểm đi - nơi lấy hàng)
    -- Ví dụ: nếu origin_region = HCM, thì chỉ lấy xe đang ở HCM
    AND (
      -- Xe phải ở vị trí origin_region (điểm đi)
      get_region_from_address(v.current_location) = p_origin_region
      OR (
        -- Nếu xe chưa có vị trí, kiểm tra route có origin_region = p_origin_region không
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
      -- Fallback: nếu vị trí có chứa tên region (case insensitive)
      OR (v.current_location IS NOT NULL AND v.current_location ILIKE '%' || p_origin_region || '%')
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
    -- Không có đơn hàng active (LOADING, IN_TRANSIT, COMPLETED)
    AND NOT EXISTS(
      SELECT 1 FROM "CargoOrders" co
      WHERE co.vehicle_id = v.vehicle_id
        AND co.status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
    )
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

