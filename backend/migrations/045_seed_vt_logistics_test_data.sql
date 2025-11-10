-- =====================================================
-- SEED DATA: MULTI-COMPANY LOGISTICS - LARGE TEST DATASET
-- Tạo bộ dữ liệu test lớn cho nhiều công ty logistics
-- - VT Logistics: >50 xe đa dạng kích thước
-- - Đơn hàng tập trung tuyến Hà Nội - TP.HCM - Đà Nẵng - Cần Thơ
-- - Tài khoản: admin cho mỗi công ty, user, driver, warehouse
-- - 15 khách hàng: phân bổ đều đơn hàng
-- - 4 kho: Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ
-- =====================================================

BEGIN;

-- ===== 1. TẠO CÁC CÔNG TY LOGISTICS =====
-- VT Logistics
INSERT INTO "LogisticsCompany" (
  company_name, address, phone, email, rating, description, status,
  has_cold, has_dangerous_goods, has_loading_dock, has_insurance,
  tax_code, website, created_at, updated_at
) VALUES (
  'VT Logistics',
  '123 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội',
  '+84987654321',
  'contact@vtlogistics.com',
  4.8,
  'Công ty vận tải hàng đầu Việt Nam, chuyên tuyến Bắc - Nam',
  'ACTIVE',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  '0100123456',
  'https://vtlogistics.com',
  NOW() - INTERVAL '2 years',
  NOW() - INTERVAL '2 years'
)
ON CONFLICT DO NOTHING;

-- FastShip Logistics
INSERT INTO "LogisticsCompany" (
  company_name, address, phone, email, rating, description, status,
  has_cold, has_dangerous_goods, has_loading_dock, has_insurance,
  tax_code, website, created_at, updated_at
) VALUES (
  'FastShip Logistics',
  '456 Đường Lê Lợi, Quận 1, TP.HCM',
  '+84987654322',
  'contact@fastship.com',
  4.6,
  'Công ty vận tải nhanh chuyên tuyến miền Nam',
  'ACTIVE',
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  '0100123457',
  'https://fastship.com',
  NOW() - INTERVAL '1 year 6 months',
  NOW() - INTERVAL '1 year 6 months'
)
ON CONFLICT DO NOTHING;

-- Central Express
INSERT INTO "LogisticsCompany" (
  company_name, address, phone, email, rating, description, status,
  has_cold, has_dangerous_goods, has_loading_dock, has_insurance,
  tax_code, website, created_at, updated_at
) VALUES (
  'Central Express',
  '789 Đường Trần Phú, Hải Châu, Đà Nẵng',
  '+84987654323',
  'contact@centralexpress.com',
  4.5,
  'Công ty vận tải chuyên tuyến miền Trung',
  'ACTIVE',
  FALSE,
  TRUE,
  TRUE,
  FALSE,
  '0100123458',
  'https://centralexpress.com',
  NOW() - INTERVAL '1 year',
  NOW() - INTERVAL '1 year'
)
ON CONFLICT DO NOTHING;

-- Lấy company_id của VT Logistics
DO $$
DECLARE
  vt_company_id INTEGER;
  fastship_company_id INTEGER;
  central_company_id INTEGER;
  vt_admin_id UUID;
  fastship_admin_id UUID;
  central_admin_id UUID;
  warehouse_user_ids UUID[] := ARRAY[]::UUID[];
  driver_user_ids UUID[] := ARRAY[]::UUID[];
  customer_user_ids UUID[] := ARRAY[]::UUID[];
  hanoi_warehouse_id INTEGER;
  hcm_warehouse_id INTEGER;
  danang_warehouse_id INTEGER;
  cantho_warehouse_id INTEGER;
  vehicle_ids INTEGER[] := ARRAY[]::INTEGER[];
  driver_ids INTEGER[] := ARRAY[]::INTEGER[];
  order_ids VARCHAR(4)[] := ARRAY[]::VARCHAR(4)[];
  i INTEGER;
  j INTEGER;
  temp_vehicle_id INTEGER;
  temp_driver_id INTEGER;
  num_vehicles INTEGER := 60;
  num_drivers INTEGER := 60;
  num_orders INTEGER := 250;
  num_customers INTEGER := 15;
  vehicle_types TEXT[] := ARRAY['Xe tải nhỏ', 'Xe tải trung', 'Xe tải lớn', 'Container', 'Xe đầu kéo', 'Xe lạnh'];
  vehicle_capacities DECIMAL[] := ARRAY[1.5, 3.5, 7.5, 20.0, 15.0, 5.0];
  cargo_types TEXT[] := ARRAY['Điện tử', 'Thực phẩm', 'Quần áo', 'Nội thất', 'Tài liệu', 'Máy móc', 'Hóa chất'];
  order_statuses TEXT[] := ARRAY['PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];
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
  danang_addresses TEXT[] := ARRAY[
    '50 Đường Trần Phú, Hải Châu, Đà Nẵng',
    '75 Đường Lê Duẩn, Hải Châu, Đà Nẵng',
    '100 Đường Nguyễn Văn Linh, Thanh Khê, Đà Nẵng',
    '125 Đường Hoàng Diệu, Sơn Trà, Đà Nẵng'
  ];
  cantho_addresses TEXT[] := ARRAY[
    '30 Đường Nguyễn Thái Học, Ninh Kiều, Cần Thơ',
    '55 Đường Trần Hưng Đạo, Ninh Kiều, Cần Thơ',
    '80 Đường 3 Tháng 2, Ninh Kiều, Cần Thơ',
    '105 Đường Võ Văn Tần, Ninh Kiều, Cần Thơ'
  ];
  random_phone TEXT;
  random_email TEXT;
  random_name TEXT;
  current_order_id VARCHAR(4);
  order_counter INTEGER := 1000;
  vehicle_counter INTEGER := 1;
BEGIN
  -- Lấy company_id của các công ty
  SELECT company_id INTO vt_company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics' LIMIT 1;
  SELECT company_id INTO fastship_company_id FROM "LogisticsCompany" WHERE company_name = 'FastShip Logistics' LIMIT 1;
  SELECT company_id INTO central_company_id FROM "LogisticsCompany" WHERE company_name = 'Central Express' LIMIT 1;
  
  IF vt_company_id IS NULL THEN
    RAISE EXCEPTION 'VT Logistics company not found!';
  END IF;

  RAISE NOTICE 'VT Logistics company_id: %', vt_company_id;
  RAISE NOTICE 'FastShip Logistics company_id: %', fastship_company_id;
  RAISE NOTICE 'Central Express company_id: %', central_company_id;

  -- ===== 2. TẠO TÀI KHOẢN ADMIN CHO CÁC CÔNG TY =====
  -- Admin VT Logistics
  vt_admin_id := gen_random_uuid();
    INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
    (
      vt_admin_id,
      'VT Admin',
      '+84900000001',
      'admin@vtlogistics.com',
      '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
      'transport_company',
      NOW() - INTERVAL '2 years',
      NOW() - INTERVAL '2 years'
    )
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO "TransportCompanyAdmin" (company_id, name, phone, email, password, is_active, created_at, updated_at)
    VALUES (
      vt_company_id,
      'VT Admin',
      '+84900000001',
      'admin@vtlogistics.com',
      '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
      TRUE,
      NOW() - INTERVAL '2 years',
      NOW() - INTERVAL '2 years'
    )
    ON CONFLICT DO NOTHING;

    -- Admin FastShip Logistics
    IF fastship_company_id IS NOT NULL THEN
      fastship_admin_id := gen_random_uuid();
      INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
      (
        fastship_admin_id,
        'FastShip Admin',
        '+84900000002',
        'admin@fastship.com',
        '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
        'transport_company',
        NOW() - INTERVAL '1 year 6 months',
        NOW() - INTERVAL '1 year 6 months'
      )
      ON CONFLICT (email) DO NOTHING;

      INSERT INTO "TransportCompanyAdmin" (company_id, name, phone, email, password, is_active, created_at, updated_at)
      VALUES (
        fastship_company_id,
        'FastShip Admin',
        '+84900000002',
        'admin@fastship.com',
        '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
        TRUE,
        NOW() - INTERVAL '1 year 6 months',
        NOW() - INTERVAL '1 year 6 months'
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- Admin Central Express
    IF central_company_id IS NOT NULL THEN
      central_admin_id := gen_random_uuid();
      INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
      (
        central_admin_id,
        'Central Admin',
        '+84900000003',
        'admin@centralexpress.com',
        '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
        'transport_company',
        NOW() - INTERVAL '1 year',
        NOW() - INTERVAL '1 year'
      )
      ON CONFLICT (email) DO NOTHING;

      INSERT INTO "TransportCompanyAdmin" (company_id, name, phone, email, password, is_active, created_at, updated_at)
      VALUES (
        central_company_id,
        'Central Admin',
        '+84900000003',
        'admin@centralexpress.com',
        '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
        TRUE,
        NOW() - INTERVAL '1 year',
        NOW() - INTERVAL '1 year'
      )
      ON CONFLICT DO NOTHING;
    END IF;

  RAISE NOTICE 'Created admins for all companies';

  -- ===== 3. TẠO CÁC TÀI KHOẢN KHÁCH HÀNG (15 KHÁCH HÀNG) =====
  FOR i IN 1..num_customers LOOP
    customer_user_ids := array_append(customer_user_ids, gen_random_uuid());
    random_phone := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 10000000)::TEXT, 9, '0');
    random_email := 'customer' || i || '@example.com';
    random_name := 'Khách hàng ' || i;
    
    INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
    (
      customer_user_ids[i],
      random_name,
      random_phone,
      random_email,
      '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
      'user',
      NOW() - (i * INTERVAL '30 days'),
      NOW() - (i * INTERVAL '30 days')
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Created % customers', num_customers;

  -- ===== 4. TẠO CÁC KHO HÀNG (4 KHO: HÀ NỘI, TP.HCM, ĐÀ NẴNG, CẦN THƠ) =====
  -- Kho Hà Nội
  INSERT INTO "Warehouses" (
    company_id, warehouse_name, address, phone, latitude, longitude,
    total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
  ) VALUES (
    vt_company_id,
    'VT Logistics - Kho Hà Nội',
    '100 Đường Trần Duy Hưng, Cầu Giấy, Hà Nội',
    '+842412345678',
    21.0285,
    105.8542,
    50000.00,
    35000.00,
    20,
    'ACTIVE',
    NOW() - INTERVAL '2 years',
    NOW() - INTERVAL '2 years'
  )
  RETURNING warehouse_id INTO hanoi_warehouse_id;

  -- Kho TP.HCM
  INSERT INTO "Warehouses" (
    company_id, warehouse_name, address, phone, latitude, longitude,
    total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
  ) VALUES (
    vt_company_id,
    'VT Logistics - Kho TP.HCM',
    '200 Đường Cộng Hòa, Tân Bình, TP.HCM',
    '+842887654321',
    10.8231,
    106.6297,
    60000.00,
    40000.00,
    25,
    'ACTIVE',
    NOW() - INTERVAL '2 years',
    NOW() - INTERVAL '2 years'
  )
  RETURNING warehouse_id INTO hcm_warehouse_id;

  -- Kho Đà Nẵng
  INSERT INTO "Warehouses" (
    company_id, warehouse_name, address, phone, latitude, longitude,
    total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
  ) VALUES (
    vt_company_id,
    'VT Logistics - Kho Đà Nẵng',
    '300 Đường Trần Phú, Hải Châu, Đà Nẵng',
    '+842365432109',
    16.0544,
    108.2022,
    40000.00,
    28000.00,
    18,
    'ACTIVE',
    NOW() - INTERVAL '1 year 6 months',
    NOW() - INTERVAL '1 year 6 months'
  )
  RETURNING warehouse_id INTO danang_warehouse_id;

  -- Kho Cần Thơ
  INSERT INTO "Warehouses" (
    company_id, warehouse_name, address, phone, latitude, longitude,
    total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
  ) VALUES (
    vt_company_id,
    'VT Logistics - Kho Cần Thơ',
    '400 Đường Nguyễn Thái Học, Ninh Kiều, Cần Thơ',
    '+842922345678',
    10.0452,
    105.7469,
    45000.00,
    32000.00,
    22,
    'ACTIVE',
    NOW() - INTERVAL '1 year 6 months',
    NOW() - INTERVAL '1 year 6 months'
  )
  RETURNING warehouse_id INTO cantho_warehouse_id;

  RAISE NOTICE 'Created warehouses: Hanoi (%), HCM (%), Da Nang (%), Can Tho (%)', 
    hanoi_warehouse_id, hcm_warehouse_id, danang_warehouse_id, cantho_warehouse_id;

  -- ===== 5. TẠO TÀI KHOẢN QUẢN LÝ KHO (4 QUẢN LÝ) =====
  FOR i IN 1..4 LOOP
    warehouse_user_ids := array_append(warehouse_user_ids, gen_random_uuid());
    random_phone := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 20000000)::TEXT, 9, '0');
    random_email := 'warehouse' || i || '@vtlogistics.com';
    random_name := 'Quản lý kho ' || CASE 
      WHEN i = 1 THEN 'Hà Nội'
      WHEN i = 2 THEN 'TP.HCM'
      WHEN i = 3 THEN 'Đà Nẵng'
      ELSE 'Cần Thơ'
    END;
    
    INSERT INTO users (id, name, phone, email, password, role, warehouse_id, created_at, updated_at) VALUES
    (
      warehouse_user_ids[i],
      random_name,
      random_phone,
      random_email,
      '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
      'warehouse',
      CASE 
        WHEN i = 1 THEN hanoi_warehouse_id
        WHEN i = 2 THEN hcm_warehouse_id
        WHEN i = 3 THEN danang_warehouse_id
        ELSE cantho_warehouse_id
      END,
      NOW() - INTERVAL '1 year',
      NOW() - INTERVAL '1 year'
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Created warehouse managers';

  -- ===== 6. TẠO ĐỘI XE (>50 XE ĐA DẠNG) =====
  FOR i IN 1..num_vehicles LOOP
    j := (FLOOR(RANDOM() * ARRAY_LENGTH(vehicle_types, 1)) + 1)::INTEGER;
    driver_user_ids := array_append(driver_user_ids, gen_random_uuid());
    
    -- Tạo tài khoản tài xế
    random_phone := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 30000000)::TEXT, 9, '0');
    random_email := 'driver' || i || '@vtlogistics.com';
    random_name := 'Tài xế ' || i;
    
    INSERT INTO users (id, name, phone, email, password, role, created_at, updated_at) VALUES
    (
      driver_user_ids[i],
      random_name,
      random_phone,
      random_email,
      '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G',
      'driver',
      NOW() - (i * INTERVAL '10 days'),
      NOW() - (i * INTERVAL '10 days')
    )
    ON CONFLICT (email) DO NOTHING;

    -- Tạo xe
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
      CASE 
        WHEN RANDOM() < 0.7 THEN 'AVAILABLE'
        WHEN RANDOM() < 0.9 THEN 'IN_USE'
        ELSE 'MAINTENANCE'
      END,
      CASE 
        WHEN RANDOM() < 0.25 THEN hanoi_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hanoi_addresses, 1)) + 1)::INTEGER]
        WHEN RANDOM() < 0.5 THEN hcm_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hcm_addresses, 1)) + 1)::INTEGER]
        WHEN RANDOM() < 0.75 THEN danang_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(danang_addresses, 1)) + 1)::INTEGER]
        ELSE cantho_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(cantho_addresses, 1)) + 1)::INTEGER]
      END,
      CASE 
        WHEN j = 6 THEN 'DIESEL' -- Xe lạnh
        WHEN j <= 3 THEN 'DIESEL'
        ELSE 'DIESEL'
      END,
      NOW() - (i * INTERVAL '10 days'),
      NOW() - (i * INTERVAL '10 days')
    )
    RETURNING vehicle_id INTO temp_vehicle_id;
    
    vehicle_ids[i] := temp_vehicle_id;
    vehicle_counter := vehicle_counter + 1;

    -- Tạo driver record
    INSERT INTO "Drivers" (
      user_id, company_id, vehicle_id, full_name, phone, email,
      license_number, license_type, status, created_at, updated_at
    ) VALUES (
      driver_user_ids[i],
      vt_company_id,
      temp_vehicle_id,
      random_name,
      random_phone,
      random_email,
      'LIC-' || LPAD(i::TEXT, 6, '0'),
      CASE 
        WHEN vehicle_capacities[j] <= 3.5 THEN 'B2'
        WHEN vehicle_capacities[j] <= 7.5 THEN 'C'
        ELSE 'FC'
      END,
      'ACTIVE',
      NOW() - (i * INTERVAL '10 days'),
      NOW() - (i * INTERVAL '10 days')
    )
    RETURNING driver_id INTO temp_driver_id;
    
    driver_ids[i] := temp_driver_id;
  END LOOP;

  RAISE NOTICE 'Created % vehicles and drivers', num_vehicles;

  -- ===== 7. TẠO ĐƠN HÀNG (PHÂN BỔ ĐỀU CHO 15 KHÁCH HÀNG) =====
  FOR i IN 1..num_orders LOOP
    current_order_id := LPAD(order_counter::TEXT, 4, '0');
    order_ids := array_append(order_ids, current_order_id);
    order_counter := order_counter + 1;
    
    -- Chọn tuyến đường ngẫu nhiên giữa 4 thành phố
    DECLARE
      pickup_addr TEXT;
      delivery_addr TEXT;
      pickup_city TEXT;
      delivery_city TEXT;
      pickup_city_idx INTEGER;
      delivery_city_idx INTEGER;
      selected_addresses TEXT[];
    BEGIN
      -- Chọn 2 thành phố khác nhau
      pickup_city_idx := (FLOOR(RANDOM() * 4) + 1)::INTEGER;
      delivery_city_idx := (FLOOR(RANDOM() * 4) + 1)::INTEGER;
      WHILE delivery_city_idx = pickup_city_idx LOOP
        delivery_city_idx := (FLOOR(RANDOM() * 4) + 1)::INTEGER;
      END LOOP;
      
      -- Chọn địa chỉ pickup
      CASE pickup_city_idx
        WHEN 1 THEN 
          pickup_city := 'Hà Nội';
          selected_addresses := hanoi_addresses;
        WHEN 2 THEN 
          pickup_city := 'TP.HCM';
          selected_addresses := hcm_addresses;
        WHEN 3 THEN 
          pickup_city := 'Đà Nẵng';
          selected_addresses := danang_addresses;
        ELSE 
          pickup_city := 'Cần Thơ';
          selected_addresses := cantho_addresses;
      END CASE;
      pickup_addr := selected_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(selected_addresses, 1)) + 1)::INTEGER];
      
      -- Chọn địa chỉ delivery
      CASE delivery_city_idx
        WHEN 1 THEN 
          delivery_city := 'Hà Nội';
          selected_addresses := hanoi_addresses;
        WHEN 2 THEN 
          delivery_city := 'TP.HCM';
          selected_addresses := hcm_addresses;
        WHEN 3 THEN 
          delivery_city := 'Đà Nẵng';
          selected_addresses := danang_addresses;
        ELSE 
          delivery_city := 'Cần Thơ';
          selected_addresses := cantho_addresses;
      END CASE;
      delivery_addr := selected_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(selected_addresses, 1)) + 1)::INTEGER];

      -- Chọn customer (phân bổ đều cho 15 khách hàng)
      DECLARE
        selected_customer_id UUID;
        selected_vehicle_id INTEGER;
        selected_status TEXT;
        cargo_weight DECIMAL;
        cargo_volume DECIMAL;
        cargo_value DECIMAL;
        declared_value DECIMAL;
        order_created_at TIMESTAMPTZ;
        order_pickup_time TIMESTAMPTZ;
        order_delivery_time TIMESTAMPTZ;
        contact_phone_val TEXT;
        recipient_phone_val TEXT;
        customer_idx INTEGER;
      BEGIN
        -- Phân bổ đều: mỗi khách hàng có khoảng num_orders/num_customers đơn hàng
        customer_idx := ((i - 1) % num_customers) + 1;
        selected_customer_id := customer_user_ids[customer_idx];

        -- Chọn vehicle (chỉ nếu status không phải PENDING_PAYMENT)
        selected_status := order_statuses[(FLOOR(RANDOM() * ARRAY_LENGTH(order_statuses, 1)) + 1)::INTEGER];
        IF selected_status != 'PENDING_PAYMENT' THEN
          selected_vehicle_id := vehicle_ids[(FLOOR(RANDOM() * num_vehicles) + 1)::INTEGER];
        ELSE
          selected_vehicle_id := NULL;
        END IF;

        -- Tính toán thời gian
        order_created_at := NOW() - (i * INTERVAL '2 hours');
        order_pickup_time := order_created_at + (FLOOR(RANDOM() * 48) * INTERVAL '1 hour');
        order_delivery_time := order_pickup_time + (FLOOR(RANDOM() * 72 + 24) * INTERVAL '1 hour');

        -- Tính toán cargo
        cargo_weight := (FLOOR(RANDOM() * 5000) + 100)::DECIMAL;
        cargo_volume := (FLOOR(RANDOM() * 50) + 1)::DECIMAL;
        cargo_value := (FLOOR(RANDOM() * 50000000) + 1000000)::DECIMAL;
        declared_value := cargo_value * (1.0 + (RANDOM() * 0.3));

        -- Tạo phone numbers hợp lệ
        contact_phone_val := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 10000000)::TEXT, 9, '0');
        recipient_phone_val := '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 10000000)::TEXT, 9, '0');

        -- Tạo order_code
        DECLARE
          order_code_val TEXT;
        BEGIN
          order_code_val := 'GMD' || LPAD((i)::TEXT, 7, '0');
          
          INSERT INTO "CargoOrders" (
            order_id, company_id, vehicle_id, customer_id,
            cargo_name, cargo_type, weight_kg, volume_m3, value_vnd, declared_value_vnd,
            require_cold, require_danger, require_loading, require_insurance,
            pickup_address, dropoff_address, pickup_time, estimated_delivery_time,
            priority, note, contact_name, contact_phone, recipient_name, recipient_phone,
            status, order_code, is_loaded, loaded_at, created_at, updated_at
          ) VALUES (
            current_order_id,
            vt_company_id,
            selected_vehicle_id,
            selected_customer_id,
            'Hàng ' || cargo_types[(FLOOR(RANDOM() * ARRAY_LENGTH(cargo_types, 1)) + 1)::INTEGER] || ' - Đơn ' || i,
            cargo_types[(FLOOR(RANDOM() * ARRAY_LENGTH(cargo_types, 1)) + 1)::INTEGER],
            cargo_weight,
            cargo_volume,
            cargo_value,
            declared_value,
            CASE WHEN RANDOM() < 0.2 THEN TRUE ELSE FALSE END,
            CASE WHEN RANDOM() < 0.1 THEN TRUE ELSE FALSE END,
            CASE WHEN RANDOM() < 0.3 THEN TRUE ELSE FALSE END,
            CASE WHEN RANDOM() < 0.4 THEN TRUE ELSE FALSE END,
            pickup_addr,
            delivery_addr,
            order_pickup_time,
            order_delivery_time,
            CASE 
              WHEN RANDOM() < 0.1 THEN 'URGENT'
              WHEN RANDOM() < 0.3 THEN 'HIGH'
              WHEN RANDOM() < 0.7 THEN 'NORMAL'
              ELSE 'LOW'
            END,
            'Ghi chú đơn hàng ' || i,
            'Người liên hệ ' || i,
            contact_phone_val,
            'Người nhận ' || i,
            recipient_phone_val,
            selected_status,
            order_code_val,
            CASE WHEN selected_status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED') THEN TRUE ELSE FALSE END,
            CASE WHEN selected_status IN ('LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED') 
              THEN order_pickup_time + (FLOOR(RANDOM() * 2) * INTERVAL '1 hour')
              ELSE NULL 
            END,
            order_created_at,
            order_created_at
          );
        END;
      END;
    END;
  END LOOP;

  RAISE NOTICE 'Created % orders', num_orders;

  -- ===== 8. TẠO GIAO DỊCH (GÁN CHO CUSTOMER_ID CỦA ĐƠN HÀNG) =====
  FOR i IN 1..ARRAY_LENGTH(order_ids, 1) LOOP
    DECLARE
      order_amount DECIMAL;
      order_status_val TEXT;
      order_customer_id UUID;
      payment_status_val TEXT;
      transaction_created_at TIMESTAMPTZ;
      paid_at_val TIMESTAMPTZ;
    BEGIN
      -- Lấy thông tin đơn hàng
      SELECT value_vnd, status, customer_id INTO order_amount, order_status_val, order_customer_id
      FROM "CargoOrders"
      WHERE order_id = order_ids[i];

      -- Xác định payment_status dựa trên order status
      IF order_status_val = 'PENDING_PAYMENT' THEN
        payment_status_val := 'PENDING';
        paid_at_val := NULL;
      ELSIF order_status_val IN ('PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED') THEN
        payment_status_val := 'SUCCESS';
        paid_at_val := (SELECT created_at FROM "CargoOrders" WHERE order_id = order_ids[i]) + (FLOOR(RANDOM() * 60) * INTERVAL '1 minute');
      ELSE
        payment_status_val := 'FAILED';
        paid_at_val := NULL;
      END IF;

      transaction_created_at := (SELECT created_at FROM "CargoOrders" WHERE order_id = order_ids[i]);

      INSERT INTO "Transactions" (
        order_id, company_id, customer_id, amount, payment_method, payment_status,
        transaction_code, paid_at, gateway_response, created_at, updated_at
      ) VALUES (
        order_ids[i],
        vt_company_id,
        order_customer_id, -- GÁN CHO CUSTOMER_ID CỦA ĐƠN HÀNG
        order_amount,
        CASE 
          WHEN RANDOM() < 0.4 THEN 'vietqr'
          WHEN RANDOM() < 0.7 THEN 'bank_transfer'
          ELSE 'credit_card'
        END,
        payment_status_val,
        'TXN-' || LPAD(i::TEXT, 8, '0'),
        paid_at_val,
        jsonb_build_object(
          'status', payment_status_val,
          'message', 'Transaction processed successfully',
          'timestamp', transaction_created_at
        ),
        transaction_created_at,
        transaction_created_at
      );
    END;
  END LOOP;

  RAISE NOTICE 'Created % transactions (assigned to respective customers)', ARRAY_LENGTH(order_ids, 1);

  RAISE NOTICE '=== SEED DATA COMPLETED ===';
  RAISE NOTICE 'VT Logistics company_id: %', vt_company_id;
  RAISE NOTICE 'Total vehicles: %', num_vehicles;
  RAISE NOTICE 'Total drivers: %', num_drivers;
  RAISE NOTICE 'Total customers: %', num_customers;
  RAISE NOTICE 'Total orders: %', num_orders;
  RAISE NOTICE 'Total transactions: %', ARRAY_LENGTH(order_ids, 1);
  RAISE NOTICE 'Total warehouses: 4 (Hanoi, HCM, Da Nang, Can Tho)';

END $$;

COMMIT;
