-- Migration: Gán tuyến đường cố định cho từng xe
-- Mỗi xe chỉ có 1 tuyến đường (A→B), khi quay lại là B→A
-- Logic: Tự động gán route cho xe dựa trên routes của công ty

SET search_path TO public;

-- =====================================================
-- 1. Function để gán route cho xe (tự động tạo route ngược nếu chưa có)
-- =====================================================
CREATE OR REPLACE FUNCTION assign_route_to_vehicle(
  p_vehicle_id INTEGER,
  p_origin_region VARCHAR(100),
  p_destination_region VARCHAR(100)
)
RETURNS JSONB AS $$
DECLARE
  v_company_id INTEGER;
  v_route_id INTEGER;
  v_reverse_route_id INTEGER;
  v_result JSONB;
BEGIN
  -- Lấy company_id từ vehicle
  SELECT company_id INTO v_company_id
  FROM "Vehicles"
  WHERE vehicle_id = p_vehicle_id;
  
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vehicle not found'
    );
  END IF;
  
  -- Tìm hoặc tạo route A→B
  SELECT route_id INTO v_route_id
  FROM "Routes"
  WHERE company_id = v_company_id
    AND origin_region = p_origin_region
    AND destination_region = p_destination_region
    AND is_active = TRUE
  LIMIT 1;
  
  IF v_route_id IS NULL THEN
    -- Tạo route mới nếu chưa có
    INSERT INTO "Routes" (
      company_id, 
      route_name, 
      origin_region, 
      destination_region,
      is_active
    )
    VALUES (
      v_company_id,
      p_origin_region || ' - ' || p_destination_region,
      p_origin_region,
      p_destination_region,
      TRUE
    )
    RETURNING route_id INTO v_route_id;
  END IF;
  
  -- Tìm hoặc tạo route B→A (route ngược)
  SELECT route_id INTO v_reverse_route_id
  FROM "Routes"
  WHERE company_id = v_company_id
    AND origin_region = p_destination_region
    AND destination_region = p_origin_region
    AND is_active = TRUE
  LIMIT 1;
  
  IF v_reverse_route_id IS NULL THEN
    -- Tạo route ngược nếu chưa có
    INSERT INTO "Routes" (
      company_id, 
      route_name, 
      origin_region, 
      destination_region,
      is_active
    )
    VALUES (
      v_company_id,
      p_destination_region || ' - ' || p_origin_region,
      p_destination_region,
      p_origin_region,
      TRUE
    )
    RETURNING route_id INTO v_reverse_route_id;
  END IF;
  
  -- Deactivate tất cả routes cũ của xe này
  UPDATE "VehicleRoutes"
  SET is_active = FALSE,
      updated_at = CURRENT_TIMESTAMP
  WHERE vehicle_id = p_vehicle_id
    AND is_active = TRUE;
  
  -- Gán route A→B cho xe (chỉ gán 1 route, nhưng có thể dùng cả 2 chiều)
  INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active)
  VALUES (p_vehicle_id, v_route_id, TRUE)
  ON CONFLICT (vehicle_id, route_id) 
  DO UPDATE SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
  
  RETURN jsonb_build_object(
    'success', true,
    'vehicle_id', p_vehicle_id,
    'route_id', v_route_id,
    'route_name', p_origin_region || ' - ' || p_destination_region,
    'reverse_route_id', v_reverse_route_id,
    'reverse_route_name', p_destination_region || ' - ' || p_origin_region,
    'message', 'Route assigned successfully. Vehicle can use both directions.'
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Gán route mặc định cho các xe hiện có
-- =====================================================
-- Lấy xe đầu tiên của mỗi công ty và gán route mặc định
DO $$
DECLARE
  v_vehicle RECORD;
  v_company_id INTEGER;
  v_default_route VARCHAR(100);
BEGIN
  -- Gán route mặc định: HCM → Hà Nội (hoặc ngược lại)
  FOR v_vehicle IN 
    SELECT DISTINCT ON (v.company_id) 
      v.vehicle_id, 
      v.company_id
    FROM "Vehicles" v
    WHERE v.company_id IS NOT NULL
    ORDER BY v.company_id, v.vehicle_id
  LOOP
    BEGIN
      -- Gán route HCM → Hà Nội (hoặc route đầu tiên có sẵn)
      SELECT route_id INTO v_default_route
      FROM "Routes"
      WHERE company_id = v_vehicle.company_id
        AND is_active = TRUE
      ORDER BY route_id
      LIMIT 1;
      
      IF v_default_route IS NOT NULL THEN
        -- Lấy origin và destination từ route
        DECLARE
          v_origin VARCHAR(100);
          v_dest VARCHAR(100);
        BEGIN
          SELECT origin_region, destination_region
          INTO v_origin, v_dest
          FROM "Routes"
          WHERE route_id = v_default_route;
          
          -- Gán route cho xe
          PERFORM assign_route_to_vehicle(
            v_vehicle.vehicle_id,
            v_origin,
            v_dest
          );
        END;
      ELSE
        -- Nếu chưa có route, tạo route mặc định HCM → Hà Nội
        PERFORM assign_route_to_vehicle(
          v_vehicle.vehicle_id,
          'HCM',
          'Hà Nội'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors for individual vehicles
      RAISE NOTICE 'Error assigning route to vehicle %: %', v_vehicle.vehicle_id, SQLERRM;
    END;
  END LOOP;
END $$;

-- =====================================================
-- 3. Function để lấy warehouse mặc định (HCM) cho điểm đến
-- =====================================================
CREATE OR REPLACE FUNCTION get_default_warehouse_location()
RETURNS VARCHAR(255) AS $$
DECLARE
  v_warehouse_name VARCHAR(255);
  v_address TEXT;
BEGIN
  -- Lấy kho đầu tiên có tên chứa "HCM" hoặc kho đầu tiên
  SELECT 
    COALESCE(
      w.warehouse_name,
      'Kho HCM'
    ),
    COALESCE(
      w.address,
      '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
    )
  INTO v_warehouse_name, v_address
  FROM "Warehouses" w
  WHERE w.status = 'ACTIVE'
    AND (
      w.warehouse_name ILIKE '%HCM%' 
      OR w.warehouse_name ILIKE '%Hồ Chí Minh%'
      OR w.address ILIKE '%HCM%'
      OR w.address ILIKE '%Hồ Chí Minh%'
    )
  ORDER BY w.warehouse_id
  LIMIT 1;
  
  -- Nếu không tìm thấy, lấy kho đầu tiên
  IF v_warehouse_name IS NULL THEN
    SELECT 
      COALESCE(w.warehouse_name, 'Kho HCM'),
      COALESCE(w.address, '123 Đường ABC, Quận 1, TP. Hồ Chí Minh')
    INTO v_warehouse_name, v_address
    FROM "Warehouses" w
    WHERE w.status = 'ACTIVE'
    ORDER BY w.warehouse_id
    LIMIT 1;
  END IF;
  
  -- Trả về tên kho và địa chỉ
  RETURN COALESCE(v_warehouse_name || ' - ' || v_address, 'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. API Helper Function để lấy thông tin warehouse HCM
-- =====================================================
CREATE OR REPLACE FUNCTION get_warehouse_hcm_info()
RETURNS TABLE (
  warehouse_name VARCHAR(255),
  address TEXT,
  full_address VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(
      w.warehouse_name,
      'Kho HCM'
    )::VARCHAR(255),
    COALESCE(
      w.address,
      '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
    )::TEXT,
    COALESCE(
      w.warehouse_name || ' - ' || w.address,
      'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
    )::VARCHAR(255)
  FROM "Warehouses" w
  WHERE w.status = 'ACTIVE'
    AND (
      w.warehouse_name ILIKE '%HCM%' 
      OR w.warehouse_name ILIKE '%Hồ Chí Minh%'
      OR w.address ILIKE '%HCM%'
      OR w.address ILIKE '%Hồ Chí Minh%'
    )
  ORDER BY w.warehouse_id
  LIMIT 1;
  
  -- Nếu không tìm thấy, trả về giá trị mặc định
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'Kho HCM'::VARCHAR(255),
      '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::TEXT,
      'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::VARCHAR(255);
  END IF;
END;
$$ LANGUAGE plpgsql;

