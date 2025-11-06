-- Migration: Thêm logic tính khả dụng của xe dựa trên vị trí hiện tại
-- Mục đích:
-- 1. Tính khả dụng của xe (có thể nhận đơn từ vị trí hiện tại đến điểm đến)
-- 2. Filter xe theo vị trí hiện tại và điểm đến mong muốn

SET search_path TO public;

-- =====================================================
-- 1. Function để tính khả dụng của xe dựa trên vị trí hiện tại
-- =====================================================
CREATE OR REPLACE FUNCTION get_vehicle_availability(
  p_vehicle_id INTEGER,
  p_destination_region VARCHAR(100)
)
RETURNS JSONB AS $$
DECLARE
  v_vehicle_status VARCHAR(50);
  v_vehicle_location VARCHAR(255);
  v_vehicle_region VARCHAR(100);
  v_has_active_orders BOOLEAN;
  v_route_id INTEGER;
  v_route_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Lấy thông tin xe
  SELECT status, current_location
  INTO v_vehicle_status, v_vehicle_location
  FROM "Vehicles"
  WHERE vehicle_id = p_vehicle_id;
  
  IF v_vehicle_status IS NULL THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'Vehicle not found'
    );
  END IF;
  
  -- Kiểm tra xe có đang có đơn hàng với status LOADING, IN_TRANSIT, hoặc COMPLETED không
  SELECT EXISTS(
    SELECT 1 FROM "CargoOrders"
    WHERE vehicle_id = p_vehicle_id
      AND status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
  ) INTO v_has_active_orders;
  
  IF v_has_active_orders THEN
    RETURN jsonb_build_object(
      'available', false,
      'reason', 'Vehicle has active orders (LOADING, IN_TRANSIT, or COMPLETED), cannot accept new orders',
      'vehicle_status', v_vehicle_status
    );
  END IF;
  
  -- Kiểm tra vị trí hiện tại của xe
  IF v_vehicle_location IS NULL OR v_vehicle_location = '' THEN
    -- Nếu xe chưa có vị trí, kiểm tra xem có route từ bất kỳ đâu đến destination không
    SELECT EXISTS(
      SELECT 1 FROM "VehicleRoutes" vr
      INNER JOIN "Routes" r ON vr.route_id = r.route_id
      WHERE vr.vehicle_id = p_vehicle_id
        AND vr.is_active = TRUE
        AND r.is_active = TRUE
        AND r.destination_region = p_destination_region
    ) INTO v_route_exists;
    
    IF v_route_exists THEN
      RETURN jsonb_build_object(
        'available', true,
        'reason', 'Vehicle location not set, but has route to destination',
        'warning', 'Please set vehicle location for better accuracy'
      );
    ELSE
      RETURN jsonb_build_object(
        'available', false,
        'reason', 'Vehicle location not set and no route to destination found'
      );
    END IF;
  END IF;
  
  -- Extract region từ vị trí hiện tại của xe
  v_vehicle_region := get_region_from_address(v_vehicle_location);
  
  IF v_vehicle_region = 'UNKNOWN' THEN
    -- Nếu không xác định được region, kiểm tra route
    SELECT EXISTS(
      SELECT 1 FROM "VehicleRoutes" vr
      INNER JOIN "Routes" r ON vr.route_id = r.route_id
      WHERE vr.vehicle_id = p_vehicle_id
        AND vr.is_active = TRUE
        AND r.is_active = TRUE
        AND r.destination_region = p_destination_region
    ) INTO v_route_exists;
    
    RETURN jsonb_build_object(
      'available', v_route_exists,
      'reason', CASE 
        WHEN v_route_exists THEN 'Cannot determine vehicle region, but has route to destination'
        ELSE 'Cannot determine vehicle region and no route to destination found'
      END,
      'vehicle_location', v_vehicle_location,
      'vehicle_region', v_vehicle_region,
      'destination_region', p_destination_region
    );
  END IF;
  
  -- Kiểm tra xem có route từ vị trí hiện tại đến điểm đến không
  SELECT EXISTS(
    SELECT 1 FROM "VehicleRoutes" vr
    INNER JOIN "Routes" r ON vr.route_id = r.route_id
    WHERE vr.vehicle_id = p_vehicle_id
      AND vr.is_active = TRUE
      AND r.is_active = TRUE
      AND (
        (r.origin_region = v_vehicle_region AND r.destination_region = p_destination_region)
        OR (r.origin_region = p_destination_region AND r.destination_region = v_vehicle_region)
      )
  ) INTO v_route_exists;
  
  IF v_route_exists THEN
    RETURN jsonb_build_object(
      'available', true,
      'reason', format('Vehicle is in %s and has route to %s', v_vehicle_region, p_destination_region),
      'vehicle_region', v_vehicle_region,
      'destination_region', p_destination_region
    );
  ELSE
    RETURN jsonb_build_object(
      'available', false,
      'reason', format('Vehicle is in %s but no route found to %s', v_vehicle_region, p_destination_region),
      'vehicle_region', v_vehicle_region,
      'destination_region', p_destination_region
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Function để lấy danh sách xe khả dụng theo vị trí và điểm đến
-- =====================================================
CREATE OR REPLACE FUNCTION get_available_vehicles_by_route(
  p_company_id INTEGER,
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
  SELECT 
    v.vehicle_id,
    v.license_plate,
    v.vehicle_type,
    v.capacity_ton,
    v.driver_name,
    v.driver_phone,
    v.status,
    v.current_location,
    COALESCE(get_region_from_address(v.current_location), 'UNKNOWN')::VARCHAR(100) as vehicle_region,
    r.route_id,
    r.route_name,
    get_vehicle_availability(v.vehicle_id, p_destination_region) as availability
  FROM "Vehicles" v
  INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
  LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
  LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
  WHERE v.company_id = p_company_id
    AND v.status = 'AVAILABLE'  -- Chỉ lấy xe đang available
    AND (
      -- Xe có route đến destination từ vị trí hiện tại
      EXISTS(
        SELECT 1 FROM "VehicleRoutes" vr2
        INNER JOIN "Routes" r2 ON vr2.route_id = r2.route_id
        WHERE vr2.vehicle_id = v.vehicle_id
          AND vr2.is_active = TRUE
          AND r2.is_active = TRUE
          AND (
            (r2.origin_region = COALESCE(get_region_from_address(v.current_location), 'UNKNOWN') AND r2.destination_region = p_destination_region)
            OR (r2.destination_region = COALESCE(get_region_from_address(v.current_location), 'UNKNOWN') AND r2.origin_region = p_destination_region)
            OR (v.current_location IS NULL AND r2.destination_region = p_destination_region)
          )
      )
      -- Hoặc xe chưa có vị trí nhưng có route đến destination
      OR (
        (v.current_location IS NULL OR v.current_location = '')
        AND EXISTS(
          SELECT 1 FROM "VehicleRoutes" vr3
          INNER JOIN "Routes" r3 ON vr3.route_id = r3.route_id
          WHERE vr3.vehicle_id = v.vehicle_id
            AND vr3.is_active = TRUE
            AND r3.is_active = TRUE
            AND r3.destination_region = p_destination_region
        )
      )
    )
    -- Không có đơn hàng active (LOADING, IN_TRANSIT, COMPLETED)
    AND NOT EXISTS(
      SELECT 1 FROM "CargoOrders" co
      WHERE co.vehicle_id = v.vehicle_id
        AND co.status IN ('LOADING', 'IN_TRANSIT', 'COMPLETED')
    )
  ORDER BY 
    CASE 
      WHEN v.current_location IS NOT NULL 
        AND get_region_from_address(v.current_location) <> 'UNKNOWN' 
        AND EXISTS(
          SELECT 1 FROM "VehicleRoutes" vr4
          INNER JOIN "Routes" r4 ON vr4.route_id = r4.route_id
          WHERE vr4.vehicle_id = v.vehicle_id
            AND vr4.is_active = TRUE
            AND r4.is_active = TRUE
            AND r4.origin_region = get_region_from_address(v.current_location)
            AND r4.destination_region = p_destination_region
        ) THEN 1
      WHEN v.current_location IS NOT NULL AND get_region_from_address(v.current_location) <> 'UNKNOWN' THEN 2
      ELSE 3
    END,
    v.license_plate;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Cập nhật vị trí mặc định cho các xe (nếu chưa có)
-- =====================================================
-- Gán vị trí mặc định dựa trên route của xe

DO $$
DECLARE
  v_vehicle RECORD;
  v_vehicle_region VARCHAR(100);
BEGIN
  FOR v_vehicle IN 
    SELECT 
      v.vehicle_id,
      v.current_location,
      r.origin_region,
      r.destination_region
    FROM "Vehicles" v
    LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
    LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
    WHERE (v.current_location IS NULL OR v.current_location = '')
      AND r.origin_region IS NOT NULL
  LOOP
    -- Gán vị trí mặc định là origin_region của route
    UPDATE "Vehicles"
    SET current_location = v_vehicle.origin_region,
        updated_at = CURRENT_TIMESTAMP
    WHERE vehicle_id = v_vehicle.vehicle_id;
    
    RAISE NOTICE '✅ Đã cập nhật vị trí cho xe %: %', v_vehicle.vehicle_id, v_vehicle.origin_region;
  END LOOP;
END $$;

