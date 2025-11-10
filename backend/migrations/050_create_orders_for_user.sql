-- =====================================================
-- CREATE ORDERS FOR SPECIFIC USER
-- Tạo đơn hàng cho user: b3615512-e0d4-4633-a74b-96273ed22662 (tanhongphong30@gmail.com)
-- =====================================================

BEGIN;

DO $$
DECLARE
  target_user_id UUID := 'b3615512-e0d4-4633-a74b-96273ed22662';
  target_email TEXT := 'tanhongphong30@gmail.com';
  vt_company_id INTEGER;
  num_orders INTEGER := 15;  -- Tạo 15 đơn hàng
  i INTEGER;
  j INTEGER;
  temp_order_id VARCHAR(4);
  temp_vehicle_id INTEGER;
  order_counter INTEGER;
  current_order_id VARCHAR(4);
  vehicle_ids INTEGER[];
  vehicle_count INTEGER;
  hanoi_addresses TEXT[] := ARRAY[
    '10 Phố Hoàn Kiếm, Hoàn Kiếm, Hà Nội',
    '25 Phố Bà Triệu, Hai Bà Trưng, Hà Nội',
    '30 Phố Cầu Giấy, Cầu Giấy, Hà Nội',
    '50 Phố Đống Đa, Đống Đa, Hà Nội',
    '75 Phố Thanh Xuân, Thanh Xuân, Hà Nội'
  ];
  hcm_addresses TEXT[] := ARRAY[
    '15 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    '20 Đường Lê Lợi, Quận 1, TP.HCM',
    '35 Đường Võ Văn Tần, Quận 3, TP.HCM',
    '60 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM',
    '85 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM'
  ];
  cargo_names TEXT[] := ARRAY['Điện tử', 'Thực phẩm', 'Quần áo', 'Nội thất', 'Tài liệu', 'Máy móc', 'Hóa chất', 'Đồ gia dụng', 'Vật liệu xây dựng', 'Thiết bị y tế'];
  cargo_types TEXT[] := ARRAY['Điện tử', 'Thực phẩm', 'Quần áo', 'Nội thất', 'Tài liệu', 'Máy móc', 'Hóa chất'];
  order_statuses TEXT[] := ARRAY['PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];
  pickup_address TEXT;
  dropoff_address TEXT;
  selected_status TEXT;
  selected_vehicle_id INTEGER;
  weight_kg DECIMAL;
  volume_m3 DECIMAL;
  value_vnd DECIMAL;
  declared_value_vnd DECIMAL;
  random_cargo_name TEXT;
  random_cargo_type TEXT;
  order_code TEXT;
  transaction_id INTEGER;
BEGIN
  -- Kiểm tra user có tồn tại không
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User % not found!', target_user_id;
  END IF;

  -- Lấy company_id của VT Logistics
  SELECT company_id INTO vt_company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics' LIMIT 1;
  
  IF vt_company_id IS NULL THEN
    RAISE EXCEPTION 'VT Logistics company not found!';
  END IF;

  -- Lấy danh sách vehicle_id của VT Logistics (ưu tiên xe có routes)
  SELECT ARRAY_AGG(vehicle_id) INTO vehicle_ids
  FROM (
    SELECT DISTINCT v.vehicle_id
    FROM "Vehicles" v
    LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
    WHERE v.company_id = vt_company_id
      AND v.status IN ('AVAILABLE', 'IN_USE')
      AND (vr.vehicle_id IS NOT NULL OR v.current_location IS NOT NULL)
    ORDER BY v.vehicle_id
    LIMIT 50
  ) subq;

  vehicle_count := COALESCE(ARRAY_LENGTH(vehicle_ids, 1), 0);
  
  IF vehicle_count = 0 THEN
    RAISE EXCEPTION 'No vehicles found for VT Logistics!';
  END IF;

  RAISE NOTICE 'Found % vehicles for VT Logistics', vehicle_count;
  RAISE NOTICE 'Creating % orders for user % (%)', num_orders, target_email, target_user_id;

  -- Lấy order_counter từ đơn hàng lớn nhất
  SELECT COALESCE(MAX(CAST(order_id AS INTEGER)), 1000) INTO order_counter
  FROM "CargoOrders"
  WHERE order_id ~ '^[0-9]{4}$';

  order_counter := order_counter + 1;

  -- Tạo các đơn hàng
  FOR i IN 1..num_orders LOOP
    -- Chọn xe ngẫu nhiên từ danh sách
    j := (FLOOR(RANDOM() * vehicle_count) + 1)::INTEGER;
    selected_vehicle_id := vehicle_ids[j];
    
    -- Chọn route: 70% Hà Nội ↔ HCM, 30% các route khác
    IF RANDOM() < 0.7 THEN
      -- Route Hà Nội ↔ HCM
      IF RANDOM() < 0.5 THEN
        pickup_address := hanoi_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hanoi_addresses, 1)) + 1)::INTEGER];
        dropoff_address := hcm_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hcm_addresses, 1)) + 1)::INTEGER];
      ELSE
        pickup_address := hcm_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hcm_addresses, 1)) + 1)::INTEGER];
        dropoff_address := hanoi_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hanoi_addresses, 1)) + 1)::INTEGER];
      END IF;
    ELSE
      -- Route khác (có thể là cùng thành phố hoặc route khác)
      IF RANDOM() < 0.5 THEN
        pickup_address := hanoi_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hanoi_addresses, 1)) + 1)::INTEGER];
        dropoff_address := hanoi_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hanoi_addresses, 1)) + 1)::INTEGER];
      ELSE
        pickup_address := hcm_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hcm_addresses, 1)) + 1)::INTEGER];
        dropoff_address := hcm_addresses[(FLOOR(RANDOM() * ARRAY_LENGTH(hcm_addresses, 1)) + 1)::INTEGER];
      END IF;
    END IF;

    -- Random cargo info
    random_cargo_name := cargo_names[(FLOOR(RANDOM() * ARRAY_LENGTH(cargo_names, 1)) + 1)::INTEGER];
    random_cargo_type := cargo_types[(FLOOR(RANDOM() * ARRAY_LENGTH(cargo_types, 1)) + 1)::INTEGER];
    
    -- Random weight và volume
    weight_kg := (FLOOR(RANDOM() * 5000) + 100)::DECIMAL;  -- 100-5100 kg
    volume_m3 := (FLOOR(RANDOM() * 20) + 1)::DECIMAL / 10;  -- 0.1-2.0 m³
    
    -- Random value
    value_vnd := (FLOOR(RANDOM() * 50000000) + 1000000)::DECIMAL;  -- 1M-51M VND
    declared_value_vnd := value_vnd * (0.8 + RANDOM() * 0.4);  -- 80%-120% của value_vnd

    -- Chọn status: 30% PAID, 20% ACCEPTED, 15% LOADING, 15% IN_TRANSIT, 10% WAREHOUSE_RECEIVED, 10% COMPLETED
    IF RANDOM() < 0.3 THEN
      selected_status := 'PAID';
    ELSIF RANDOM() < 0.5 THEN
      selected_status := 'ACCEPTED';
    ELSIF RANDOM() < 0.65 THEN
      selected_status := 'LOADING';
    ELSIF RANDOM() < 0.8 THEN
      selected_status := 'IN_TRANSIT';
    ELSIF RANDOM() < 0.9 THEN
      selected_status := 'WAREHOUSE_RECEIVED';
    ELSE
      selected_status := 'COMPLETED';
    END IF;

    -- Tạo order_id (4 chữ số)
    current_order_id := LPAD(order_counter::TEXT, 4, '0');
    order_code := 'DH' || current_order_id;

    -- Insert đơn hàng
    INSERT INTO "CargoOrders" (
      order_id, order_code, company_id, vehicle_id, customer_id,
      cargo_name, cargo_type, weight_kg, volume_m3, value_vnd, declared_value_vnd,
      require_cold, require_danger, require_loading, require_insurance,
      pickup_address, dropoff_address,
      pickup_time, estimated_delivery_time,
      priority, note, contact_name, contact_phone, recipient_name, recipient_phone,
      status, created_at, updated_at
    ) VALUES (
      current_order_id,
      order_code,
      vt_company_id,
      selected_vehicle_id,
      target_user_id,
      random_cargo_name,
      random_cargo_type,
      weight_kg,
      volume_m3,
      value_vnd,
      declared_value_vnd,
      CASE WHEN random_cargo_type = 'Thực phẩm' THEN TRUE ELSE FALSE END,
      CASE WHEN random_cargo_type = 'Hóa chất' THEN TRUE ELSE FALSE END,
      CASE WHEN weight_kg > 2000 THEN TRUE ELSE FALSE END,
      CASE WHEN declared_value_vnd > 10000000 THEN TRUE ELSE FALSE END,
      pickup_address,
      dropoff_address,
      NOW() - (i * INTERVAL '2 days') + (FLOOR(RANDOM() * 48) * INTERVAL '1 hour'),
      NOW() - (i * INTERVAL '2 days') + (FLOOR(RANDOM() * 48) * INTERVAL '1 hour') + INTERVAL '24 hours',
      CASE 
        WHEN RANDOM() < 0.1 THEN 'HIGH'
        WHEN RANDOM() < 0.3 THEN 'URGENT'
        ELSE 'NORMAL'
      END,
      'Đơn hàng test cho ' || target_email || ' - Order #' || i,
      'Người gửi ' || i,
      '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 10000000)::TEXT, 9, '0'),
      'Người nhận ' || i,
      '+849' || LPAD((FLOOR(RANDOM() * 99999999) + 20000000)::TEXT, 9, '0'),
      selected_status,
      NOW() - (i * INTERVAL '2 days'),
      NOW() - (i * INTERVAL '2 days') + (FLOOR(RANDOM() * 48) * INTERVAL '1 hour')
    )
    RETURNING order_id INTO temp_order_id;

    order_counter := order_counter + 1;

    -- Nếu status là PAID, ACCEPTED, LOADING, IN_TRANSIT, hoặc COMPLETED, tạo transaction
    IF selected_status IN ('PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'COMPLETED') THEN
      INSERT INTO "Transactions" (
        customer_id, order_id, company_id, amount, payment_method, payment_status,
        transaction_code, paid_at, created_at, updated_at
      ) VALUES (
        target_user_id,
        temp_order_id,
        vt_company_id,
        value_vnd,
        CASE 
          WHEN RANDOM() < 0.5 THEN 'bank_transfer'
          WHEN RANDOM() < 0.8 THEN 'vietqr'
          ELSE 'credit_card'
        END,
        'SUCCESS',
        'TXN' || LPAD((FLOOR(RANDOM() * 999999) + 100000)::TEXT, 6, '0'),
        NOW() - (i * INTERVAL '2 days') + (FLOOR(RANDOM() * 2) * INTERVAL '1 hour'),
        NOW() - (i * INTERVAL '2 days') + (FLOOR(RANDOM() * 2) * INTERVAL '1 hour'),
        NOW() - (i * INTERVAL '2 days') + (FLOOR(RANDOM() * 2) * INTERVAL '1 hour')
      )
      RETURNING transaction_id INTO transaction_id;
      
      RAISE NOTICE '  ✅ Created order % (status: %) with transaction %', order_code, selected_status, transaction_id;
    ELSE
      RAISE NOTICE '  ✅ Created order % (status: %)', order_code, selected_status;
    END IF;

  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== ORDERS CREATED SUCCESSFULLY ===';
  RAISE NOTICE 'Total orders created: %', num_orders;
  RAISE NOTICE 'User: % (%)', target_email, target_user_id;
  RAISE NOTICE 'Company: VT Logistics (ID: %)', vt_company_id;

END $$;

COMMIT;

