-- =====================================================
-- SETUP WAREHOUSES AND OPERATIONS
-- Cập nhật tên kho hàng, tạo tài khoản và đơn xuất nhập
-- =====================================================

BEGIN;

DO $$
DECLARE
  vt_company_id INTEGER;
  hanoi_warehouse_id INTEGER;
  hcm_warehouse_id INTEGER;
  danang_warehouse_id INTEGER;
  cantho_warehouse_id INTEGER;
  hanoi_user_id UUID;
  hcm_user_id UUID;
  danang_user_id UUID;
  cantho_user_id UUID;
  num_operations INTEGER := 30;  -- Tạo 30 đơn xuất nhập chủ yếu ở Hà Nội
  i INTEGER;
  temp_order_id VARCHAR(4);
  operation_type_val TEXT;
  status_val TEXT;
  temp_category TEXT;
  dock_number_val TEXT;
  selected_order_id VARCHAR(4);
  order_ids VARCHAR(4)[];
  order_count INTEGER;
  bcrypt_hash TEXT := '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';  -- Hash của "123456"
BEGIN
  -- Lấy company_id của VT Logistics
  SELECT company_id INTO vt_company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics' LIMIT 1;
  
  IF vt_company_id IS NULL THEN
    RAISE EXCEPTION 'VT Logistics company not found!';
  END IF;

  RAISE NOTICE '=== SETTING UP WAREHOUSES ===';
  RAISE NOTICE 'VT Logistics company_id: %', vt_company_id;

  -- ===== 1. CẬP NHẬT TÊN KHO HÀNG VỚI VỊ TRÍ =====
  
  -- Kho Hà Nội
  SELECT warehouse_id INTO hanoi_warehouse_id
  FROM "Warehouses"
  WHERE company_id = vt_company_id
    AND (warehouse_name ILIKE '%hà nội%' OR warehouse_name ILIKE '%hanoi%' OR address ILIKE '%hà nội%' OR address ILIKE '%hanoi%')
  LIMIT 1;

  IF hanoi_warehouse_id IS NOT NULL THEN
    UPDATE "Warehouses"
    SET warehouse_name = 'Kho Hà Nội - VT Logistics',
        address = '100 Đường Láng, Đống Đa, Hà Nội',
        phone = '+842437654321',
        latitude = 21.0285,
        longitude = 105.8542,
        updated_at = NOW()
    WHERE warehouse_id = hanoi_warehouse_id;
    RAISE NOTICE '✅ Updated warehouse: Kho Hà Nội (ID: %)', hanoi_warehouse_id;
  ELSE
    INSERT INTO "Warehouses" (
      company_id, warehouse_name, address, phone, latitude, longitude,
      total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
    ) VALUES (
      vt_company_id,
      'Kho Hà Nội - VT Logistics',
      '100 Đường Láng, Đống Đa, Hà Nội',
      '+842437654321',
      21.0285,
      105.8542,
      50000.00,
      35000.00,
      20,
      'ACTIVE',
      NOW(),
      NOW()
    )
    RETURNING warehouse_id INTO hanoi_warehouse_id;
    RAISE NOTICE '✅ Created warehouse: Kho Hà Nội (ID: %)', hanoi_warehouse_id;
  END IF;

  -- Kho HCM
  SELECT warehouse_id INTO hcm_warehouse_id
  FROM "Warehouses"
  WHERE company_id = vt_company_id
    AND (warehouse_name ILIKE '%hcm%' OR warehouse_name ILIKE '%hồ chí minh%' OR warehouse_name ILIKE '%tp.hcm%' 
         OR address ILIKE '%hcm%' OR address ILIKE '%hồ chí minh%' OR address ILIKE '%tp.hcm%')
  LIMIT 1;

  IF hcm_warehouse_id IS NOT NULL THEN
    UPDATE "Warehouses"
    SET warehouse_name = 'Kho HCM - VT Logistics',
        address = '200 Đường Cộng Hòa, Tân Bình, TP.HCM',
        phone = '+842887654321',
        latitude = 10.8231,
        longitude = 106.6297,
        updated_at = NOW()
    WHERE warehouse_id = hcm_warehouse_id;
    RAISE NOTICE '✅ Updated warehouse: Kho HCM (ID: %)', hcm_warehouse_id;
  ELSE
    INSERT INTO "Warehouses" (
      company_id, warehouse_name, address, phone, latitude, longitude,
      total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
    ) VALUES (
      vt_company_id,
      'Kho HCM - VT Logistics',
      '200 Đường Cộng Hòa, Tân Bình, TP.HCM',
      '+842887654321',
      10.8231,
      106.6297,
      60000.00,
      40000.00,
      25,
      'ACTIVE',
      NOW(),
      NOW()
    )
    RETURNING warehouse_id INTO hcm_warehouse_id;
    RAISE NOTICE '✅ Created warehouse: Kho HCM (ID: %)', hcm_warehouse_id;
  END IF;

  -- Kho Đà Nẵng
  SELECT warehouse_id INTO danang_warehouse_id
  FROM "Warehouses"
  WHERE company_id = vt_company_id
    AND (warehouse_name ILIKE '%đà nẵng%' OR warehouse_name ILIKE '%da nang%' OR address ILIKE '%đà nẵng%' OR address ILIKE '%da nang%')
  LIMIT 1;

  IF danang_warehouse_id IS NOT NULL THEN
    UPDATE "Warehouses"
    SET warehouse_name = 'Kho Đà Nẵng - VT Logistics',
        address = '300 Đường Trần Phú, Hải Châu, Đà Nẵng',
        phone = '+842365432109',
        latitude = 16.0544,
        longitude = 108.2022,
        updated_at = NOW()
    WHERE warehouse_id = danang_warehouse_id;
    RAISE NOTICE '✅ Updated warehouse: Kho Đà Nẵng (ID: %)', danang_warehouse_id;
  ELSE
    INSERT INTO "Warehouses" (
      company_id, warehouse_name, address, phone, latitude, longitude,
      total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
    ) VALUES (
      vt_company_id,
      'Kho Đà Nẵng - VT Logistics',
      '300 Đường Trần Phú, Hải Châu, Đà Nẵng',
      '+842365432109',
      16.0544,
      108.2022,
      40000.00,
      28000.00,
      18,
      'ACTIVE',
      NOW(),
      NOW()
    )
    RETURNING warehouse_id INTO danang_warehouse_id;
    RAISE NOTICE '✅ Created warehouse: Kho Đà Nẵng (ID: %)', danang_warehouse_id;
  END IF;

  -- Kho Cần Thơ
  SELECT warehouse_id INTO cantho_warehouse_id
  FROM "Warehouses"
  WHERE company_id = vt_company_id
    AND (warehouse_name ILIKE '%cần thơ%' OR warehouse_name ILIKE '%can tho%' OR address ILIKE '%cần thơ%' OR address ILIKE '%can tho%')
  LIMIT 1;

  IF cantho_warehouse_id IS NOT NULL THEN
    UPDATE "Warehouses"
    SET warehouse_name = 'Kho Cần Thơ - VT Logistics',
        address = '400 Đường Nguyễn Thái Học, Ninh Kiều, Cần Thơ',
        phone = '+842922345678',
        latitude = 10.0452,
        longitude = 105.7469,
        updated_at = NOW()
    WHERE warehouse_id = cantho_warehouse_id;
    RAISE NOTICE '✅ Updated warehouse: Kho Cần Thơ (ID: %)', cantho_warehouse_id;
  ELSE
    INSERT INTO "Warehouses" (
      company_id, warehouse_name, address, phone, latitude, longitude,
      total_capacity_m3, available_capacity_m3, dock_count, status, created_at, updated_at
    ) VALUES (
      vt_company_id,
      'Kho Cần Thơ - VT Logistics',
      '400 Đường Nguyễn Thái Học, Ninh Kiều, Cần Thơ',
      '+842922345678',
      10.0452,
      105.7469,
      45000.00,
      32000.00,
      22,
      'ACTIVE',
      NOW(),
      NOW()
    )
    RETURNING warehouse_id INTO cantho_warehouse_id;
    RAISE NOTICE '✅ Created warehouse: Kho Cần Thơ (ID: %)', cantho_warehouse_id;
  END IF;

  -- ===== 2. TẠO TÀI KHOẢN KHO HÀNG =====
  
  RAISE NOTICE '';
  RAISE NOTICE '=== CREATING WAREHOUSE ACCOUNTS ===';

  -- Tài khoản Kho Hà Nội
  SELECT id INTO hanoi_user_id
  FROM users
  WHERE email = 'kho.hanoi@warehouse.com' OR (role = 'warehouse' AND warehouse_id = hanoi_warehouse_id)
  LIMIT 1;

  IF hanoi_user_id IS NULL THEN
    INSERT INTO users (id, name, phone, email, password, role, warehouse_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Quản lý Kho Hà Nội',
      '+84901234567',
      'kho.hanoi@warehouse.com',
      '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',  -- 123456
      'warehouse',
      hanoi_warehouse_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO hanoi_user_id;
    RAISE NOTICE '✅ Created account: kho.hanoi@warehouse.com (ID: %)', hanoi_user_id;
  ELSE
    UPDATE users
    SET warehouse_id = hanoi_warehouse_id,
        name = 'Quản lý Kho Hà Nội',
        phone = '+84901234567',
        updated_at = NOW()
    WHERE id = hanoi_user_id;
    RAISE NOTICE '✅ Updated account: kho.hanoi@warehouse.com (ID: %)', hanoi_user_id;
  END IF;

  -- Tài khoản Kho HCM
  SELECT id INTO hcm_user_id
  FROM users
  WHERE email = 'kho.hcm@warehouse.com' OR (role = 'warehouse' AND warehouse_id = hcm_warehouse_id)
  LIMIT 1;

  IF hcm_user_id IS NULL THEN
    INSERT INTO users (id, name, phone, email, password, role, warehouse_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Quản lý Kho HCM',
      '+84901234568',
      'kho.hcm@warehouse.com',
      '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',  -- 123456
      'warehouse',
      hcm_warehouse_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO hcm_user_id;
    RAISE NOTICE '✅ Created account: kho.hcm@warehouse.com (ID: %)', hcm_user_id;
  ELSE
    UPDATE users
    SET warehouse_id = hcm_warehouse_id,
        name = 'Quản lý Kho HCM',
        phone = '+84901234568',
        updated_at = NOW()
    WHERE id = hcm_user_id;
    RAISE NOTICE '✅ Updated account: kho.hcm@warehouse.com (ID: %)', hcm_user_id;
  END IF;

  -- Tài khoản Kho Đà Nẵng
  SELECT id INTO danang_user_id
  FROM users
  WHERE email = 'kho.danang@warehouse.com' OR (role = 'warehouse' AND warehouse_id = danang_warehouse_id)
  LIMIT 1;

  IF danang_user_id IS NULL THEN
    INSERT INTO users (id, name, phone, email, password, role, warehouse_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Quản lý Kho Đà Nẵng',
      '+84901234569',
      'kho.danang@warehouse.com',
      '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',  -- 123456
      'warehouse',
      danang_warehouse_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO danang_user_id;
    RAISE NOTICE '✅ Created account: kho.danang@warehouse.com (ID: %)', danang_user_id;
  ELSE
    UPDATE users
    SET warehouse_id = danang_warehouse_id,
        name = 'Quản lý Kho Đà Nẵng',
        phone = '+84901234569',
        updated_at = NOW()
    WHERE id = danang_user_id;
    RAISE NOTICE '✅ Updated account: kho.danang@warehouse.com (ID: %)', danang_user_id;
  END IF;

  -- Tài khoản Kho Cần Thơ
  SELECT id INTO cantho_user_id
  FROM users
  WHERE email = 'kho.cantho@warehouse.com' OR (role = 'warehouse' AND warehouse_id = cantho_warehouse_id)
  LIMIT 1;

  IF cantho_user_id IS NULL THEN
    INSERT INTO users (id, name, phone, email, password, role, warehouse_id, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Quản lý Kho Cần Thơ',
      '+84901234570',
      'kho.cantho@warehouse.com',
      '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',  -- 123456
      'warehouse',
      cantho_warehouse_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO cantho_user_id;
    RAISE NOTICE '✅ Created account: kho.cantho@warehouse.com (ID: %)', cantho_user_id;
  ELSE
    UPDATE users
    SET warehouse_id = cantho_warehouse_id,
        name = 'Quản lý Kho Cần Thơ',
        phone = '+84901234570',
        updated_at = NOW()
    WHERE id = cantho_user_id;
    RAISE NOTICE '✅ Updated account: kho.cantho@warehouse.com (ID: %)', cantho_user_id;
  END IF;

  -- ===== 3. TẠO ĐƠN XUẤT NHẬP CHỦ YẾU Ở HÀ NỘI =====
  
  RAISE NOTICE '';
  RAISE NOTICE '=== CREATING WAREHOUSE OPERATIONS (Mainly Hanoi) ===';

  -- Lấy danh sách order_id từ các đơn hàng của VT Logistics
  SELECT ARRAY_AGG(order_id) INTO order_ids
  FROM (
    SELECT co.order_id
    FROM "CargoOrders" co
    WHERE co.company_id = vt_company_id
      AND co.status IN ('PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED')
    ORDER BY co.created_at DESC
    LIMIT 100
  ) subq;

  order_count := COALESCE(ARRAY_LENGTH(order_ids, 1), 0);

  IF order_count = 0 THEN
    RAISE WARNING 'No orders found for VT Logistics!';
  ELSE
    RAISE NOTICE 'Found % orders to create operations for', order_count;
  END IF;

  -- Tạo operations (80% ở Hà Nội, 20% ở các kho khác)
  FOR i IN 1..num_operations LOOP
    -- Chọn order ngẫu nhiên
    IF order_count > 0 THEN
      selected_order_id := order_ids[(FLOOR(RANDOM() * order_count) + 1)::INTEGER];
    ELSE
      -- Nếu không có order, tạo order_id giả (sẽ bị lỗi foreign key nhưng không sao)
      selected_order_id := LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0');
    END IF;

    -- 80% operations ở Hà Nội
    IF RANDOM() < 0.8 THEN
      -- Hà Nội
      operation_type_val := CASE WHEN RANDOM() < 0.6 THEN 'IN' ELSE 'OUT' END;
      status_val := CASE 
        WHEN RANDOM() < 0.3 THEN 'PENDING'
        WHEN RANDOM() < 0.7 THEN 'IN_PROGRESS'
        ELSE 'COMPLETED'
      END;
      temp_category := CASE 
        WHEN RANDOM() < 0.7 THEN 'Thường'
        WHEN RANDOM() < 0.9 THEN 'Mát'
        ELSE 'Lạnh'
      END;
      dock_number_val := 'D' || (FLOOR(RANDOM() * 20) + 1)::TEXT;

      INSERT INTO "WarehouseOperations" (
        order_id, warehouse_id, operation_type, quantity_pallets, weight_kg, volume_m3,
        dock_number, carrier_vehicle, temperature_category, status,
        scheduled_time, actual_time, created_at, updated_at, notes
      ) VALUES (
        selected_order_id,
        hanoi_warehouse_id,
        operation_type_val,
        (FLOOR(RANDOM() * 10) + 1)::INTEGER,
        (FLOOR(RANDOM() * 5000) + 100)::NUMERIC,
        (FLOOR(RANDOM() * 20) + 1)::NUMERIC / 10,
        dock_number_val,
        'Xe ' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0'),
        temp_category,
        status_val,
        NOW() - (i * INTERVAL '1 day') + (FLOOR(RANDOM() * 24) * INTERVAL '1 hour'),
        CASE WHEN status_val = 'COMPLETED' THEN NOW() - (i * INTERVAL '1 day') + (FLOOR(RANDOM() * 24) * INTERVAL '1 hour') ELSE NULL END,
        NOW() - (i * INTERVAL '1 day'),
        NOW() - (i * INTERVAL '1 day') + (FLOOR(RANDOM() * 24) * INTERVAL '1 hour'),
        'Đơn xuất nhập kho Hà Nội - Operation #' || i
      );
    ELSE
      -- Các kho khác (HCM, Đà Nẵng, Cần Thơ)
      IF RANDOM() < 0.33 THEN
        -- HCM
        operation_type_val := CASE WHEN RANDOM() < 0.5 THEN 'IN' ELSE 'OUT' END;
        INSERT INTO "WarehouseOperations" (
          order_id, warehouse_id, operation_type, quantity_pallets, weight_kg, volume_m3,
          dock_number, carrier_vehicle, temperature_category, status,
          scheduled_time, actual_time, created_at, updated_at, notes
        ) VALUES (
          selected_order_id,
          hcm_warehouse_id,
          operation_type_val,
          (FLOOR(RANDOM() * 10) + 1)::INTEGER,
          (FLOOR(RANDOM() * 5000) + 100)::NUMERIC,
          (FLOOR(RANDOM() * 20) + 1)::NUMERIC / 10,
          'D' || (FLOOR(RANDOM() * 25) + 1)::TEXT,
          'Xe ' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0'),
          'Thường',
          'COMPLETED',
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          'Đơn xuất nhập kho HCM'
        );
      ELSIF RANDOM() < 0.66 THEN
        -- Đà Nẵng
        operation_type_val := CASE WHEN RANDOM() < 0.5 THEN 'IN' ELSE 'OUT' END;
        INSERT INTO "WarehouseOperations" (
          order_id, warehouse_id, operation_type, quantity_pallets, weight_kg, volume_m3,
          dock_number, carrier_vehicle, temperature_category, status,
          scheduled_time, actual_time, created_at, updated_at, notes
        ) VALUES (
          selected_order_id,
          danang_warehouse_id,
          operation_type_val,
          (FLOOR(RANDOM() * 10) + 1)::INTEGER,
          (FLOOR(RANDOM() * 5000) + 100)::NUMERIC,
          (FLOOR(RANDOM() * 20) + 1)::NUMERIC / 10,
          'D' || (FLOOR(RANDOM() * 18) + 1)::TEXT,
          'Xe ' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0'),
          'Thường',
          'COMPLETED',
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          'Đơn xuất nhập kho Đà Nẵng'
        );
      ELSE
        -- Cần Thơ
        operation_type_val := CASE WHEN RANDOM() < 0.5 THEN 'IN' ELSE 'OUT' END;
        INSERT INTO "WarehouseOperations" (
          order_id, warehouse_id, operation_type, quantity_pallets, weight_kg, volume_m3,
          dock_number, carrier_vehicle, temperature_category, status,
          scheduled_time, actual_time, created_at, updated_at, notes
        ) VALUES (
          selected_order_id,
          cantho_warehouse_id,
          operation_type_val,
          (FLOOR(RANDOM() * 10) + 1)::INTEGER,
          (FLOOR(RANDOM() * 5000) + 100)::NUMERIC,
          (FLOOR(RANDOM() * 20) + 1)::NUMERIC / 10,
          'D' || (FLOOR(RANDOM() * 22) + 1)::TEXT,
          'Xe ' || LPAD((FLOOR(RANDOM() * 9999) + 1)::TEXT, 4, '0'),
          'Thường',
          'COMPLETED',
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          NOW() - (i * INTERVAL '1 day'),
          'Đơn xuất nhập kho Cần Thơ'
        );
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '=== SETUP COMPLETED ===';
  RAISE NOTICE 'Warehouses:';
  RAISE NOTICE '  - Kho Hà Nội (ID: %) - %', hanoi_warehouse_id, (SELECT address FROM "Warehouses" WHERE warehouse_id = hanoi_warehouse_id);
  RAISE NOTICE '  - Kho HCM (ID: %) - %', hcm_warehouse_id, (SELECT address FROM "Warehouses" WHERE warehouse_id = hcm_warehouse_id);
  RAISE NOTICE '  - Kho Đà Nẵng (ID: %) - %', danang_warehouse_id, (SELECT address FROM "Warehouses" WHERE warehouse_id = danang_warehouse_id);
  RAISE NOTICE '  - Kho Cần Thơ (ID: %) - %', cantho_warehouse_id, (SELECT address FROM "Warehouses" WHERE warehouse_id = cantho_warehouse_id);
  RAISE NOTICE '';
  RAISE NOTICE 'Warehouse Accounts:';
  RAISE NOTICE '  - kho.hanoi@warehouse.com (Password: 123456)';
  RAISE NOTICE '  - kho.hcm@warehouse.com (Password: 123456)';
  RAISE NOTICE '  - kho.danang@warehouse.com (Password: 123456)';
  RAISE NOTICE '  - kho.cantho@warehouse.com (Password: 123456)';
  RAISE NOTICE '';
  RAISE NOTICE 'Operations created: % (80%% in Hanoi)', num_operations;

END $$;

COMMIT;

