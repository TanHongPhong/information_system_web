-- Migration: Link Driver Account to Vehicle
-- Tạo liên kết giữa user account (driver) với vehicle
-- Có 2 cách: qua bảng Drivers hoặc qua Vehicles.driver_phone

SET search_path TO public;

-- =====================================================
-- CÁCH 1: Tạo record trong bảng Drivers để liên kết user với vehicle
-- =====================================================

-- Ví dụ: Liên kết user với email "tanhongphong30@gmail.com" với vehicle có driver_phone = "0394254331"
-- Bước 1: Tìm user_id từ email
-- SELECT id, email, phone, name FROM users WHERE email = 'tanhongphong30@gmail.com';

-- Bước 2: Tìm vehicle_id từ driver_phone
-- SELECT vehicle_id, license_plate, driver_name, driver_phone FROM "Vehicles" WHERE driver_phone LIKE '%0394254331%';

-- Bước 3: Tạo hoặc cập nhật record trong Drivers
-- INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, status)
-- SELECT 
--   u.id as user_id,
--   v.company_id,
--   v.vehicle_id,
--   COALESCE(v.driver_name, u.name) as full_name,
--   u.phone,
--   u.email,
--   'ACTIVE' as status
-- FROM users u
-- CROSS JOIN "Vehicles" v
-- WHERE u.email = 'tanhongphong30@gmail.com'
--   AND (v.driver_phone LIKE '%0394254331%' OR v.driver_phone = u.phone)
-- LIMIT 1
-- ON CONFLICT (driver_id) DO UPDATE
-- SET vehicle_id = EXCLUDED.vehicle_id,
--     updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- CÁCH 2: Cập nhật Vehicles.driver_phone để khớp với user.phone
-- =====================================================

-- UPDATE "Vehicles" v
-- SET driver_phone = u.phone,
--     driver_name = u.name,
--     updated_at = CURRENT_TIMESTAMP
-- FROM users u
-- WHERE u.email = 'tanhongphong30@gmail.com'
--   AND v.driver_phone IS NULL OR v.driver_phone = '';

-- =====================================================
-- HƯỚNG DẪN SỬ DỤNG:
-- =====================================================

-- Để link driver với vehicle, chạy một trong các câu lệnh sau:

-- OPTION A: Tạo record trong Drivers table (khuyến nghị)
-- Thay thế email và phone trong câu lệnh dưới:
DO $$
DECLARE
  v_user_id UUID;
  v_vehicle_id INTEGER;
  v_company_id INTEGER;
BEGIN
  -- Tìm user_id từ email
  SELECT id INTO v_user_id 
  FROM users 
  WHERE email = 'tanhongphong30@gmail.com' OR phone = '0394254331'
  LIMIT 1;

  -- Tìm vehicle_id từ driver_phone hoặc driver_name
  SELECT v.vehicle_id, v.company_id INTO v_vehicle_id, v_company_id
  FROM "Vehicles" v
  WHERE v.driver_phone LIKE '%0394254331%'
     OR v.driver_phone LIKE '%tanhongphong30%'
  LIMIT 1;

  -- Nếu tìm thấy cả user và vehicle, tạo record trong Drivers
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, status)
    SELECT 
      v_user_id,
      v_company_id,
      v_vehicle_id,
      u.name,
      u.phone,
      u.email,
      'ACTIVE'
    FROM users u
    WHERE u.id = v_user_id
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Driver linked successfully: User % linked to Vehicle %', v_user_id, v_vehicle_id;
  ELSE
    RAISE NOTICE 'Cannot link: User ID = %, Vehicle ID = %', v_user_id, v_vehicle_id;
  END IF;
END $$;

-- OPTION B: Cập nhật Vehicles.driver_phone để khớp với user
-- UPDATE "Vehicles" v
-- SET driver_phone = u.phone,
--     driver_name = u.name,
--     updated_at = CURRENT_TIMESTAMP
-- FROM users u
-- WHERE (u.email = 'tanhongphong30@gmail.com' OR u.phone = '0394254331')
--   AND v.vehicle_id = (
--     SELECT vehicle_id FROM "Vehicles" 
--     WHERE driver_phone IS NULL OR driver_phone = '' 
--     LIMIT 1
--   );

-- =====================================================
-- KIỂM TRA KẾT QUẢ:
-- =====================================================

-- Kiểm tra xem driver đã được link chưa:
SELECT 
  d.driver_id,
  d.full_name,
  d.phone,
  d.email,
  v.vehicle_id,
  v.license_plate,
  v.driver_phone,
  v.driver_name,
  lc.company_name
FROM "Drivers" d
LEFT JOIN "Vehicles" v ON d.vehicle_id = v.vehicle_id
LEFT JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
WHERE d.email = 'tanhongphong30@gmail.com' 
   OR d.phone = '0394254331'
   OR d.user_id IN (SELECT id FROM users WHERE email = 'tanhongphong30@gmail.com');


