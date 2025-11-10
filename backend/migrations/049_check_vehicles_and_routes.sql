-- =====================================================
-- CHECK VEHICLES AND ROUTES
-- Script để kiểm tra xe và routes đã được tạo đúng chưa
-- =====================================================

-- 1. Kiểm tra số lượng xe AVAILABLE ở Hà Nội và HCM
SELECT 
  'Xe ở Hà Nội' as location_type,
  COUNT(*) as vehicle_count
FROM "Vehicles" v
WHERE v.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics')
  AND v.status = 'AVAILABLE'
  AND (
    v.current_location LIKE '%Hà Nội%'
    OR v.current_location LIKE '%Ha Noi%'
    OR v.current_location LIKE '%Hanoi%'
    OR v.current_location ILIKE '%hà nội%'
  )

UNION ALL

SELECT 
  'Xe ở HCM' as location_type,
  COUNT(*) as vehicle_count
FROM "Vehicles" v
WHERE v.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics')
  AND v.status = 'AVAILABLE'
  AND (
    v.current_location LIKE '%TP.HCM%'
    OR v.current_location LIKE '%HCM%'
    OR v.current_location LIKE '%Ho Chi Minh%'
    OR v.current_location LIKE '%Hồ Chí Minh%'
    OR v.current_location ILIKE '%tp.hcm%'
    OR v.current_location ILIKE '%hồ chí minh%'
  );

-- 2. Kiểm tra routes đã được tạo
SELECT 
  r.route_id,
  r.route_name,
  r.origin_region,
  r.destination_region,
  r.is_active
FROM "Routes" r
WHERE r.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics')
  AND r.is_active = TRUE
  AND (
    (r.origin_region = 'Hà Nội' AND r.destination_region = 'HCM')
    OR (r.origin_region = 'HCM' AND r.destination_region = 'Hà Nội')
  )
ORDER BY r.origin_region, r.destination_region;

-- 3. Kiểm tra xe có routes chưa
SELECT 
  v.vehicle_id,
  v.license_plate,
  v.current_location,
  v.status,
  r.route_name,
  r.origin_region,
  r.destination_region,
  vr.is_active as route_active
FROM "Vehicles" v
LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
WHERE v.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics')
  AND v.status = 'AVAILABLE'
  AND (
    v.current_location LIKE '%Hà Nội%'
    OR v.current_location LIKE '%Ha Noi%'
    OR v.current_location LIKE '%Hanoi%'
    OR v.current_location ILIKE '%hà nội%'
    OR v.current_location LIKE '%TP.HCM%'
    OR v.current_location LIKE '%HCM%'
    OR v.current_location LIKE '%Ho Chi Minh%'
    OR v.current_location LIKE '%Hồ Chí Minh%'
    OR v.current_location ILIKE '%tp.hcm%'
    OR v.current_location ILIKE '%hồ chí minh%'
  )
ORDER BY v.current_location, v.vehicle_id
LIMIT 20;

-- 4. Đếm số xe có routes và không có routes
SELECT 
  CASE 
    WHEN r.route_id IS NOT NULL THEN 'Có route'
    ELSE 'Không có route'
  END as route_status,
  COUNT(*) as vehicle_count
FROM "Vehicles" v
LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
WHERE v.company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics')
  AND v.status = 'AVAILABLE'
  AND (
    v.current_location LIKE '%Hà Nội%'
    OR v.current_location LIKE '%Ha Noi%'
    OR v.current_location LIKE '%Hanoi%'
    OR v.current_location ILIKE '%hà nội%'
    OR v.current_location LIKE '%TP.HCM%'
    OR v.current_location LIKE '%HCM%'
    OR v.current_location LIKE '%Ho Chi Minh%'
    OR v.current_location LIKE '%Hồ Chí Minh%'
    OR v.current_location ILIKE '%tp.hcm%'
    OR v.current_location ILIKE '%hồ chí minh%'
  )
GROUP BY route_status;

