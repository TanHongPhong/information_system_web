-- =====================================================
-- ADD AVAILABLE VEHICLES IN HANOI AND HCM
-- Thêm các xe khả dụng ở Hà Nội và TP.HCM
-- =====================================================

BEGIN;

DO $$
DECLARE
  vt_company_id INTEGER;
  vehicle_counter INTEGER;
  num_vehicles_hanoi INTEGER := 20;  -- 20 xe ở Hà Nội
  num_vehicles_hcm INTEGER := 20;    -- 20 xe ở TP.HCM
  total_new_vehicles INTEGER;
  i INTEGER;
  j INTEGER;
  temp_vehicle_id INTEGER;
  temp_driver_id INTEGER;
  temp_driver_user_id UUID;
  vehicle_types TEXT[] := ARRAY['Xe tải nhỏ', 'Xe tải trung', 'Xe tải lớn', 'Container', 'Xe đầu kéo', 'Xe lạnh'];
  vehicle_capacities DECIMAL[] := ARRAY[1.5, 3.5, 7.5, 20.0, 15.0, 5.0];
  hanoi_addresses TEXT[] := ARRAY[
    '10 Phố Hoàn Kiếm, Hoàn Kiếm, Hà Nội',
    '25 Phố Bà Triệu, Hai Bà Trưng, Hà Nội',
    '30 Phố Cầu Giấy, Cầu Giấy, Hà Nội',
    '50 Phố Đống Đa, Đống Đa, Hà Nội',
    '75 Phố Thanh Xuân, Thanh Xuân, Hà Nội',
    '100 Phố Long Biên, Long Biên, Hà Nội'
  ];
  hcm_addresses TEXT[] := ARRAY[
    '15 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    '20 Đường Lê Lợi, Quận 1, TP.HCM',
    '35 Đường Võ Văn Tần, Quận 3, TP.HCM',
    '60 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
    '85 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM',
    '120 Đường Tân Sơn Nhì, Tân Phú, TP.HCM'
  ];
  random_phone TEXT;
  random_email TEXT;
  random_name TEXT;
  selected_address TEXT;
  password_hash TEXT := '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G';
BEGIN
  -- Lấy company_id của VT Logistics
  SELECT company_id INTO vt_company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics' LIMIT 1;
  
  IF vt_company_id IS NULL THEN
    RAISE EXCEPTION 'VT Logistics company not found!';
  END IF;

  -- Lấy số lượng xe hiện tại để bắt đầu đếm từ đó
  -- Tìm số lớn nhất trong license_plate dạng 29A-XXXXX
  SELECT COALESCE(
    MAX(CAST(
      CASE 
        WHEN license_plate ~ '^29A-(\d+)$' THEN SUBSTRING(license_plate FROM '29A-(\d+)')
        ELSE '0'
      END AS INTEGER
    )), 0) INTO vehicle_counter
  FROM "Vehicles"
  WHERE license_plate LIKE '29A-%' AND license_plate ~ '^29A-\d+$';
  
  vehicle_counter := vehicle_counter + 1;
  
  RAISE NOTICE 'VT Logistics company_id: %', vt_company_id;
  RAISE NOTICE 'Starting vehicle counter from: %', vehicle_counter;
  RAISE NOTICE 'Adding % vehicles in Hanoi', num_vehicles_hanoi;
  RAISE NOTICE 'Adding % vehicles in HCM', num_vehicles_hcm;

  -- ===== TẠO XE Ở HÀ NỘI =====
  FOR i IN 1..num_vehicles_hanoi LOOP
    j := (FLOOR(RANDOM() * ARRAY_LENGTH(vehicle_types, 1)) + 1)::INTEGER;
    temp_driver_user_id := gen_random_uuid();
    
    -- Tạo tài khoản tài xế
    random_phone := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 40000000)::TEXT, 9, '0');
    random_email := 'driver_hanoi_' || i || '@vtlogistics.com';
    random_name := 'Tài xế Hà Nội ' || i;
    selected_address := hanoi_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hanoi_addresses, 1)) + 1)::INTEGER];
    
    INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
    (
      temp_driver_user_id,
      random_name,
      random_phone,
      random_email,
      password_hash,
      'driver',
      NOW() - (i * INTERVAL '5 days'),
      NOW() - (i * INTERVAL '5 days')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Tạo xe ở Hà Nội
    INSERT INTO "Vehicles" (
      company_id, license_plate, vehicle_type, capacity_ton,
      driver_name, driver_phone, status, current_location,
      fuel_type, created_at, updated_at
    ) VALUES (
      vt_company_id,
      '29A-' || LPAD(vehicle_counter::TEXT, 5, '0'),
      vehicle_types[j],
      vehicle_capacities[j],
      random_name,
      random_phone,
      'AVAILABLE',  -- TẤT CẢ XE ĐỀU AVAILABLE
      selected_address,  -- Địa chỉ ở Hà Nội
      'DIESEL',
      NOW() - (i * INTERVAL '5 days'),
      NOW() - (i * INTERVAL '5 days')
    )
    RETURNING vehicle_id INTO temp_vehicle_id;
    
    vehicle_counter := vehicle_counter + 1;

    -- Tạo driver record
    INSERT INTO "Drivers" (
      user_id, company_id, vehicle_id, full_name, phone, email,
      license_number, license_type, status, created_at, updated_at
    ) VALUES (
      temp_driver_user_id,
      vt_company_id,
      temp_vehicle_id,
      random_name,
      random_phone,
      random_email,
      'LIC-HN-' || LPAD(i::TEXT, 4, '0'),
      CASE 
        WHEN vehicle_capacities[j] <= 3.5 THEN 'B2'
        WHEN vehicle_capacities[j] <= 7.5 THEN 'C'
        ELSE 'FC'
      END,
      'ACTIVE',
      NOW() - (i * INTERVAL '5 days'),
      NOW() - (i * INTERVAL '5 days')
    )
    RETURNING driver_id INTO temp_driver_id;
  END LOOP;

  RAISE NOTICE 'Created % vehicles in Hanoi', num_vehicles_hanoi;

  -- ===== TẠO XE Ở TP.HCM =====
  FOR i IN 1..num_vehicles_hcm LOOP
    j := (FLOOR(RANDOM() * ARRAY_LENGTH(vehicle_types, 1)) + 1)::INTEGER;
    temp_driver_user_id := gen_random_uuid();
    
    -- Tạo tài khoản tài xế
    random_phone := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 50000000)::TEXT, 9, '0');
    random_email := 'driver_hcm_' || i || '@vtlogistics.com';
    random_name := 'Tài xế TP.HCM ' || i;
    selected_address := hcm_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hcm_addresses, 1)) + 1)::INTEGER];
    
    INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
    (
      temp_driver_user_id,
      random_name,
      random_phone,
      random_email,
      password_hash,
      'driver',
      NOW() - (i * INTERVAL '5 days'),
      NOW() - (i * INTERVAL '5 days')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Tạo xe ở TP.HCM
    INSERT INTO "Vehicles" (
      company_id, license_plate, vehicle_type, capacity_ton,
      driver_name, driver_phone, status, current_location,
      fuel_type, created_at, updated_at
    ) VALUES (
      vt_company_id,
      '29A-' || LPAD(vehicle_counter::TEXT, 5, '0'),
      vehicle_types[j],
      vehicle_capacities[j],
      random_name,
      random_phone,
      'AVAILABLE',  -- TẤT CẢ XE ĐỀU AVAILABLE
      selected_address,  -- Địa chỉ ở TP.HCM
      'DIESEL',
      NOW() - (i * INTERVAL '5 days'),
      NOW() - (i * INTERVAL '5 days')
    )
    RETURNING vehicle_id INTO temp_vehicle_id;
    
    vehicle_counter := vehicle_counter + 1;

    -- Tạo driver record
    INSERT INTO "Drivers" (
      user_id, company_id, vehicle_id, full_name, phone, email,
      license_number, license_type, status, created_at, updated_at
    ) VALUES (
      temp_driver_user_id,
      vt_company_id,
      temp_vehicle_id,
      random_name,
      random_phone,
      random_email,
      'LIC-HCM-' || LPAD(i::TEXT, 4, '0'),
      CASE 
        WHEN vehicle_capacities[j] <= 3.5 THEN 'B2'
        WHEN vehicle_capacities[j] <= 7.5 THEN 'C'
        ELSE 'FC'
      END,
      'ACTIVE',
      NOW() - (i * INTERVAL '5 days'),
      NOW() - (i * INTERVAL '5 days')
    )
    RETURNING driver_id INTO temp_driver_id;
  END LOOP;

  RAISE NOTICE 'Created % vehicles in HCM', num_vehicles_hcm;
  
  total_new_vehicles := num_vehicles_hanoi + num_vehicles_hcm;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== VEHICLES ADDED SUCCESSFULLY ===';
  RAISE NOTICE 'Total new vehicles: %', total_new_vehicles;
  RAISE NOTICE '  - Hanoi: % vehicles (all AVAILABLE)', num_vehicles_hanoi;
  RAISE NOTICE '  - HCM: % vehicles (all AVAILABLE)', num_vehicles_hcm;
  RAISE NOTICE '';
  RAISE NOTICE 'All vehicles are set to status: AVAILABLE';
  RAISE NOTICE 'All vehicles are located in Hanoi or HCM';

END $$;

COMMIT;

