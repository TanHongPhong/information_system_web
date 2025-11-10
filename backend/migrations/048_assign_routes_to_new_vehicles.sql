-- =====================================================
-- ASSIGN ROUTES TO NEW VEHICLES IN HANOI AND HCM
-- Gán routes cho các xe mới ở Hà Nội và TP.HCM
-- =====================================================

BEGIN;

DO $$
DECLARE
  vt_company_id INTEGER;
  hanoi_route_id INTEGER;
  hcm_route_id INTEGER;
  hanoi_hcm_route_id INTEGER;
  hcm_hanoi_route_id INTEGER;
  vehicle_record RECORD;
  vehicles_updated INTEGER := 0;
BEGIN
  -- Lấy company_id của VT Logistics
  SELECT company_id INTO vt_company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics' LIMIT 1;
  
  IF vt_company_id IS NULL THEN
    RAISE EXCEPTION 'VT Logistics company not found!';
  END IF;

  RAISE NOTICE 'VT Logistics company_id: %', vt_company_id;

  -- ===== 1. TÌM HOẶC TẠO ROUTES CHO HÀ NỘI ↔ HCM =====
  
  -- Tìm route Hà Nội → HCM
  SELECT route_id INTO hanoi_hcm_route_id
  FROM "Routes"
  WHERE company_id = vt_company_id
    AND origin_region = 'Hà Nội'
    AND destination_region = 'HCM'
    AND is_active = TRUE
  LIMIT 1;

  -- Tìm route HCM → Hà Nội
  SELECT route_id INTO hcm_hanoi_route_id
  FROM "Routes"
  WHERE company_id = vt_company_id
    AND origin_region = 'HCM'
    AND destination_region = 'Hà Nội'
    AND is_active = TRUE
  LIMIT 1;

  -- Nếu chưa có routes, tạo mới
  IF hanoi_hcm_route_id IS NULL THEN
    INSERT INTO "Routes" (company_id, route_name, origin_region, destination_region, estimated_distance_km, estimated_duration_hours, is_active, created_at, updated_at)
    VALUES (
      vt_company_id,
      'Hà Nội - TP.HCM',
      'Hà Nội',
      'HCM',
      1700,
      24,
      TRUE,
      NOW(),
      NOW()
    )
    RETURNING route_id INTO hanoi_hcm_route_id;
    RAISE NOTICE 'Created route: Hà Nội → HCM (route_id: %)', hanoi_hcm_route_id;
  ELSE
    RAISE NOTICE 'Found existing route: Hà Nội → HCM (route_id: %)', hanoi_hcm_route_id;
  END IF;

  IF hcm_hanoi_route_id IS NULL THEN
    INSERT INTO "Routes" (company_id, route_name, origin_region, destination_region, estimated_distance_km, estimated_duration_hours, is_active, created_at, updated_at)
    VALUES (
      vt_company_id,
      'TP.HCM - Hà Nội',
      'HCM',
      'Hà Nội',
      1700,
      24,
      TRUE,
      NOW(),
      NOW()
    )
    RETURNING route_id INTO hcm_hanoi_route_id;
    RAISE NOTICE 'Created route: HCM → Hà Nội (route_id: %)', hcm_hanoi_route_id;
  ELSE
    RAISE NOTICE 'Found existing route: HCM → Hà Nội (route_id: %)', hcm_hanoi_route_id;
  END IF;

  -- ===== 2. GÁN ROUTES CHO XE Ở HÀ NỘI =====
  RAISE NOTICE '';
  RAISE NOTICE 'Assigning routes to vehicles in Hanoi...';
  
  FOR vehicle_record IN
    SELECT v.vehicle_id, v.license_plate, v.current_location
    FROM "Vehicles" v
    WHERE v.company_id = vt_company_id
      AND v.status = 'AVAILABLE'
      AND (
        v.current_location LIKE '%Hà Nội%'
        OR v.current_location LIKE '%Ha Noi%'
        OR v.current_location LIKE '%Hanoi%'
        OR v.current_location ILIKE '%hà nội%'
      )
      AND NOT EXISTS (
        SELECT 1 FROM "VehicleRoutes" vr
        WHERE vr.vehicle_id = v.vehicle_id
          AND vr.route_id = hanoi_hcm_route_id
          AND vr.is_active = TRUE
      )
  LOOP
    -- Gán route Hà Nội → HCM cho xe ở Hà Nội
    INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active, created_at, updated_at)
    VALUES (vehicle_record.vehicle_id, hanoi_hcm_route_id, TRUE, NOW(), NOW())
    ON CONFLICT (vehicle_id, route_id)
    DO UPDATE SET is_active = TRUE, updated_at = NOW();
    
    vehicles_updated := vehicles_updated + 1;
    RAISE NOTICE '  ✅ Assigned route Hà Nội → HCM to vehicle % (%)', vehicle_record.license_plate, vehicle_record.vehicle_id;
  END LOOP;

  RAISE NOTICE 'Updated % vehicles in Hanoi', vehicles_updated;

  -- ===== 3. GÁN ROUTES CHO XE Ở TP.HCM =====
  vehicles_updated := 0;
  RAISE NOTICE '';
  RAISE NOTICE 'Assigning routes to vehicles in HCM...';
  
  FOR vehicle_record IN
    SELECT v.vehicle_id, v.license_plate, v.current_location
    FROM "Vehicles" v
    WHERE v.company_id = vt_company_id
      AND v.status = 'AVAILABLE'
      AND (
        v.current_location LIKE '%TP.HCM%'
        OR v.current_location LIKE '%HCM%'
        OR v.current_location LIKE '%Ho Chi Minh%'
        OR v.current_location LIKE '%Hồ Chí Minh%'
        OR v.current_location ILIKE '%tp.hcm%'
        OR v.current_location ILIKE '%hồ chí minh%'
      )
      AND NOT EXISTS (
        SELECT 1 FROM "VehicleRoutes" vr
        WHERE vr.vehicle_id = v.vehicle_id
          AND vr.route_id = hcm_hanoi_route_id
          AND vr.is_active = TRUE
      )
  LOOP
    -- Gán route HCM → Hà Nội cho xe ở HCM
    INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active, created_at, updated_at)
    VALUES (vehicle_record.vehicle_id, hcm_hanoi_route_id, TRUE, NOW(), NOW())
    ON CONFLICT (vehicle_id, route_id)
    DO UPDATE SET is_active = TRUE, updated_at = NOW();
    
    vehicles_updated := vehicles_updated + 1;
    RAISE NOTICE '  ✅ Assigned route HCM → Hà Nội to vehicle % (%)', vehicle_record.license_plate, vehicle_record.vehicle_id;
  END LOOP;

  RAISE NOTICE 'Updated % vehicles in HCM', vehicles_updated;

  RAISE NOTICE '';
  RAISE NOTICE '=== ROUTE ASSIGNMENT COMPLETED ===';
  RAISE NOTICE 'All available vehicles in Hanoi and HCM have been assigned routes';

END $$;

COMMIT;

