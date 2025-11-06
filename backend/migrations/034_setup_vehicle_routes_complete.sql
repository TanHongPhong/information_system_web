-- Migration: Setup hoàn chỉnh routes cho xe và warehouse HCM
-- Chạy script này sau khi đã chạy 032_create_routes_and_location_mapping.sql
-- Mục đích:
-- 1. Tạo routes mặc định cho các công ty
-- 2. Gán route cố định cho từng xe (mỗi xe 1 route A→B, có thể quay lại B→A)
-- 3. Đảm bảo có warehouse HCM

SET search_path TO public;

-- =====================================================
-- 1. TẠO ROUTES MẶC ĐỊNH CHO TẤT CẢ CÔNG TY
-- =====================================================
-- Tạo các routes phổ biến cho mỗi công ty nếu chưa có

DO $$
DECLARE
  v_company RECORD;
  v_route_id INTEGER;
BEGIN
  FOR v_company IN 
    SELECT DISTINCT company_id FROM "LogisticsCompany" WHERE status = 'ACTIVE'
  LOOP
    -- Tạo các routes phổ biến
    INSERT INTO "Routes" (company_id, route_name, origin_region, destination_region, estimated_distance_km, estimated_duration_hours, is_active)
    VALUES 
      (v_company.company_id, 'HCM - Hà Nội', 'HCM', 'Hà Nội', 1700, 24, TRUE),
      (v_company.company_id, 'Hà Nội - HCM', 'Hà Nội', 'HCM', 1700, 24, TRUE),
      (v_company.company_id, 'HCM - Đà Nẵng', 'HCM', 'Đà Nẵng', 900, 12, TRUE),
      (v_company.company_id, 'Đà Nẵng - HCM', 'Đà Nẵng', 'HCM', 900, 12, TRUE),
      (v_company.company_id, 'Hà Nội - Đà Nẵng', 'Hà Nội', 'Đà Nẵng', 800, 10, TRUE),
      (v_company.company_id, 'Đà Nẵng - Hà Nội', 'Đà Nẵng', 'Hà Nội', 800, 10, TRUE),
      (v_company.company_id, 'HCM - Cần Thơ', 'HCM', 'Cần Thơ', 170, 3, TRUE),
      (v_company.company_id, 'Cần Thơ - HCM', 'Cần Thơ', 'HCM', 170, 3, TRUE)
    ON CONFLICT (company_id, origin_region, destination_region) DO NOTHING;
    
    RAISE NOTICE '✅ Đã tạo routes cho công ty %', v_company.company_id;
  END LOOP;
END $$;

-- =====================================================
-- 2. GÁN ROUTE CỐ ĐỊNH CHO TỪNG XE
-- =====================================================
-- Logic: Mỗi xe sẽ được gán 1 route cố định
-- Nếu xe chưa có route, gán route đầu tiên có sẵn của công ty
-- Nếu đã có route, giữ nguyên

DO $$
DECLARE
  v_vehicle RECORD;
  v_route RECORD;
  v_route_id INTEGER;
  v_vehicle_route_exists BOOLEAN;
BEGIN
  FOR v_vehicle IN 
    SELECT v.vehicle_id, v.company_id, v.license_plate
    FROM "Vehicles" v
    WHERE v.company_id IS NOT NULL
    ORDER BY v.company_id, v.vehicle_id
  LOOP
    -- Kiểm tra xem xe đã có route active chưa
    SELECT EXISTS(
      SELECT 1 FROM "VehicleRoutes" vr
      WHERE vr.vehicle_id = v_vehicle.vehicle_id
        AND vr.is_active = TRUE
    ) INTO v_vehicle_route_exists;
    
    -- Nếu chưa có route, gán route đầu tiên của công ty
    IF NOT v_vehicle_route_exists THEN
      -- Lấy route đầu tiên của công ty (ưu tiên HCM → Hà Nội)
      SELECT route_id INTO v_route_id
      FROM "Routes"
      WHERE company_id = v_vehicle.company_id
        AND is_active = TRUE
        AND (
          (origin_region = 'HCM' AND destination_region = 'Hà Nội')
          OR (origin_region = 'Hà Nội' AND destination_region = 'HCM')
        )
      ORDER BY 
        CASE 
          WHEN origin_region = 'HCM' AND destination_region = 'Hà Nội' THEN 1
          ELSE 2
        END,
        route_id
      LIMIT 1;
      
      -- Nếu không có route HCM ↔ Hà Nội, lấy route đầu tiên
      IF v_route_id IS NULL THEN
        SELECT route_id INTO v_route_id
        FROM "Routes"
        WHERE company_id = v_vehicle.company_id
          AND is_active = TRUE
        ORDER BY route_id
        LIMIT 1;
      END IF;
      
      -- Gán route cho xe
      IF v_route_id IS NOT NULL THEN
        -- Deactivate tất cả routes cũ (nếu có)
        UPDATE "VehicleRoutes"
        SET is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = v_vehicle.vehicle_id;
        
        -- Gán route mới
        INSERT INTO "VehicleRoutes" (vehicle_id, route_id, is_active)
        VALUES (v_vehicle.vehicle_id, v_route_id, TRUE)
        ON CONFLICT (vehicle_id, route_id) 
        DO UPDATE SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
        
        -- Cập nhật vị trí xe = origin_region của route (nếu chưa có)
        UPDATE "Vehicles"
        SET current_location = (
          SELECT origin_region FROM "Routes" WHERE route_id = v_route_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE vehicle_id = v_vehicle.vehicle_id
          AND (current_location IS NULL OR current_location = '');
        
        RAISE NOTICE '✅ Đã gán route % cho xe % (biển số: %)', 
          v_route_id, v_vehicle.vehicle_id, v_vehicle.license_plate;
      ELSE
        RAISE NOTICE '⚠️ Công ty % không có route nào để gán cho xe %', 
          v_vehicle.company_id, v_vehicle.vehicle_id;
      END IF;
    ELSE
      RAISE NOTICE 'ℹ️ Xe % đã có route, bỏ qua', v_vehicle.vehicle_id;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 3. ĐẢM BẢO CÓ WAREHOUSE HCM
-- =====================================================
-- Tạo hoặc cập nhật warehouse HCM cho mỗi công ty

DO $$
DECLARE
  v_company RECORD;
  v_warehouse_id INTEGER;
BEGIN
  FOR v_company IN 
    SELECT DISTINCT company_id, company_name 
    FROM "LogisticsCompany" 
    WHERE status = 'ACTIVE'
  LOOP
    -- Kiểm tra xem đã có warehouse HCM chưa
    SELECT warehouse_id INTO v_warehouse_id
    FROM "Warehouses"
    WHERE company_id = v_company.company_id
      AND (
        warehouse_name ILIKE '%HCM%' 
        OR warehouse_name ILIKE '%Hồ Chí Minh%'
        OR address ILIKE '%HCM%'
        OR address ILIKE '%Hồ Chí Minh%'
      )
      AND status = 'ACTIVE'
    LIMIT 1;
    
    -- Nếu chưa có, tạo mới
    IF v_warehouse_id IS NULL THEN
      INSERT INTO "Warehouses" (
        company_id,
        warehouse_name,
        address,
        phone,
        latitude,
        longitude,
        total_capacity_m3,
        available_capacity_m3,
        dock_count,
        status
      )
      VALUES (
        v_company.company_id,
        'Kho trung tâm TP.HCM - ' || v_company.company_name,
        '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        '0901234567',
        10.8231::NUMERIC(10,8),  -- Tọa độ Quận 1, HCM
        106.6297::NUMERIC(11,8),
        10000.00,
        7500.00,
        6,
        'ACTIVE'
      )
      RETURNING warehouse_id INTO v_warehouse_id;
      
      RAISE NOTICE '✅ Đã tạo warehouse HCM cho công ty % (warehouse_id: %)', 
        v_company.company_id, v_warehouse_id;
    ELSE
      RAISE NOTICE 'ℹ️ Công ty % đã có warehouse HCM (warehouse_id: %)', 
        v_company.company_id, v_warehouse_id;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 4. KIỂM TRA VÀ HIỂN THỊ KẾT QUẢ
-- =====================================================

-- Thống kê routes
SELECT 
  'Routes được tạo' as category,
  COUNT(*) as count
FROM "Routes"
WHERE is_active = TRUE
UNION ALL
SELECT 
  'Xe đã được gán route' as category,
  COUNT(DISTINCT vehicle_id) as count
FROM "VehicleRoutes"
WHERE is_active = TRUE
UNION ALL
SELECT 
  'Warehouse HCM' as category,
  COUNT(*) as count
FROM "Warehouses"
WHERE status = 'ACTIVE'
  AND (
    warehouse_name ILIKE '%HCM%' 
    OR warehouse_name ILIKE '%Hồ Chí Minh%'
    OR address ILIKE '%HCM%'
    OR address ILIKE '%Hồ Chí Minh%'
  );

-- Hiển thị danh sách xe và route của chúng
SELECT 
  v.vehicle_id,
  v.license_plate,
  v.driver_name,
  lc.company_name,
  r.route_name,
  r.origin_region,
  r.destination_region
FROM "Vehicles" v
INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
ORDER BY lc.company_name, v.license_plate;

-- Hiển thị danh sách warehouse HCM
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  w.address,
  lc.company_name
FROM "Warehouses" w
INNER JOIN "LogisticsCompany" lc ON w.company_id = lc.company_id
WHERE w.status = 'ACTIVE'
  AND (
    w.warehouse_name ILIKE '%HCM%' 
    OR w.warehouse_name ILIKE '%Hồ Chí Minh%'
    OR w.address ILIKE '%HCM%'
    OR w.address ILIKE '%Hồ Chí Minh%'
  )
ORDER BY lc.company_name;

