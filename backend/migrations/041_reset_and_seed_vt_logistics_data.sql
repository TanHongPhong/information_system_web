-- Migration: Reset và tạo dữ liệu mới cho VT Logistics
-- Xóa dữ liệu đơn hàng, payment, warehouse operations/inventory
-- Giữ lại: companies, users, drivers, warehouses
-- Tạo 50 vehicles và 50 orders cho VT Logistics

SET search_path TO public;

-- =====================================================
-- 1. XÓA DỮ LIỆU CŨ
-- =====================================================

DO $$
BEGIN
  -- Xóa WarehouseInventory (có foreign key đến CargoOrders)
  DELETE FROM "WarehouseInventory";
  RAISE NOTICE '✅ Đã xóa WarehouseInventory';
  
  -- Xóa WarehouseOperations (có foreign key đến CargoOrders)
  DELETE FROM "WarehouseOperations";
  RAISE NOTICE '✅ Đã xóa WarehouseOperations';
  
  -- Xóa OrderStatusHistory (có foreign key đến CargoOrders)
  DELETE FROM "OrderStatusHistory";
  RAISE NOTICE '✅ Đã xóa OrderStatusHistory';
  
  -- Xóa Transactions (có foreign key đến CargoOrders)
  DELETE FROM "Transactions";
  RAISE NOTICE '✅ Đã xóa Transactions';
  
  -- Xóa CargoOrders
  DELETE FROM "CargoOrders";
  RAISE NOTICE '✅ Đã xóa CargoOrders';
  
  -- Reset sequence cho order_id (nếu có)
  -- Note: order_id là VARCHAR(4) nên không có sequence
END $$;

-- =====================================================
-- 2. LẤY THÔNG TIN CÔNG TY VT LOGISTICS
-- =====================================================

DO $$
DECLARE
  v_vt_company_id INTEGER;
  v_warehouse_hcm_id INTEGER;
  v_warehouse_cantho_id INTEGER;
  v_warehouse_danang_id INTEGER;
  v_warehouse_hanoi_id INTEGER;
BEGIN
  -- Lấy company_id của VT Logistics
  SELECT company_id INTO v_vt_company_id
  FROM "LogisticsCompany"
  WHERE company_name = 'VT Logistics'
  LIMIT 1;
  
  IF v_vt_company_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy công ty VT Logistics';
  END IF;
  
  RAISE NOTICE '✅ VT Logistics company_id: %', v_vt_company_id;
  
  -- Lấy warehouse IDs
  SELECT warehouse_id INTO v_warehouse_hcm_id
  FROM "Warehouses"
  WHERE warehouse_name = 'Kho HCM' AND company_id IS NULL
  LIMIT 1;
  
  SELECT warehouse_id INTO v_warehouse_cantho_id
  FROM "Warehouses"
  WHERE warehouse_name = 'Kho Cần Thơ' AND company_id IS NULL
  LIMIT 1;
  
  SELECT warehouse_id INTO v_warehouse_danang_id
  FROM "Warehouses"
  WHERE warehouse_name = 'Kho Đà Nẵng' AND company_id IS NULL
  LIMIT 1;
  
  SELECT warehouse_id INTO v_warehouse_hanoi_id
  FROM "Warehouses"
  WHERE warehouse_name = 'Kho Hà Nội' AND company_id IS NULL
  LIMIT 1;
  
  RAISE NOTICE '✅ Warehouse IDs - HCM: %, Cần Thơ: %, Đà Nẵng: %, Hà Nội: %', 
    v_warehouse_hcm_id, v_warehouse_cantho_id, v_warehouse_danang_id, v_warehouse_hanoi_id;
  
  -- Lưu vào temp table để dùng sau
  CREATE TEMP TABLE IF NOT EXISTS temp_vt_data (
    company_id INTEGER,
    warehouse_hcm_id INTEGER,
    warehouse_cantho_id INTEGER,
    warehouse_danang_id INTEGER,
    warehouse_hanoi_id INTEGER
  );
  
  DELETE FROM temp_vt_data;
  INSERT INTO temp_vt_data VALUES (
    v_vt_company_id,
    v_warehouse_hcm_id,
    v_warehouse_cantho_id,
    v_warehouse_danang_id,
    v_warehouse_hanoi_id
  );
END $$;

-- =====================================================
-- 3. XÓA XE CŨ CỦA VT LOGISTICS (NẾU CÓ)
-- =====================================================

DO $$
DECLARE
  v_company_id INTEGER;
  v_deleted_count INTEGER;
BEGIN
  SELECT company_id INTO v_company_id FROM temp_vt_data LIMIT 1;
  
  -- Xóa VehicleRoutes của VT trước (có foreign key)
  DELETE FROM "VehicleRoutes" vr
  WHERE vr.vehicle_id IN (
    SELECT vehicle_id FROM "Vehicles" WHERE company_id = v_company_id
  );
  
  -- Xóa Vehicles của VT
  DELETE FROM "Vehicles" WHERE company_id = v_company_id;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RAISE NOTICE '✅ Đã xóa % xe cũ của VT Logistics', v_deleted_count;
END $$;

-- =====================================================
-- 4. TẠO 50 XE CHO VT LOGISTICS
-- =====================================================

DO $$
DECLARE
  v_company_id INTEGER;
  v_vehicle_types TEXT[] := ARRAY['Xe tải 2 tấn', 'Xe tải 5 tấn', 'Xe tải 10 tấn', 'Container 20ft', 'Container 40ft', 'Xe lạnh 3 tấn', 'Xe lạnh 5 tấn'];
  v_statuses TEXT[] := ARRAY['AVAILABLE', 'IN_USE', 'AVAILABLE', 'AVAILABLE', 'MAINTENANCE'];
  v_regions TEXT[] := ARRAY['HCM', 'Cần Thơ', 'Đà Nẵng', 'Hà Nội', 'HCM'];
  v_i INTEGER;
  v_license_prefix TEXT;
  v_license_number INTEGER;
  v_license_plate TEXT;
  v_vehicle_type TEXT;
  v_capacity NUMERIC;
  v_status TEXT;
  v_location TEXT;
  v_driver_name TEXT;
  v_driver_phone TEXT;
  v_vehicle_id INTEGER;
  v_plate_exists BOOLEAN;
BEGIN
  SELECT company_id INTO v_company_id FROM temp_vt_data LIMIT 1;
  
  FOR v_i IN 1..50 LOOP
    -- Tạo biển số xe unique: 51A-xxxxx, 51B-xxxxx, 51C-xxxxx
    -- Sử dụng số thứ tự lớn để tránh trùng với dữ liệu cũ
    v_license_prefix := CASE ((v_i - 1) % 3)
      WHEN 0 THEN '51A'
      WHEN 1 THEN '51B'
      ELSE '51C'
    END;
    -- Sử dụng số từ 50000 trở lên để tránh trùng
    v_license_number := 50000 + v_i;
    v_license_plate := v_license_prefix || '-' || v_license_number;
    
    -- Kiểm tra biển số đã tồn tại chưa
    SELECT EXISTS(
      SELECT 1 FROM "Vehicles" WHERE license_plate = v_license_plate
    ) INTO v_plate_exists;
    
    -- Nếu đã tồn tại, thử với số khác
    IF v_plate_exists THEN
      v_license_number := 60000 + v_i;
      v_license_plate := v_license_prefix || '-' || v_license_number;
    END IF;
    
    -- Chọn loại xe và capacity
    v_vehicle_type := v_vehicle_types[1 + ((v_i - 1) % array_length(v_vehicle_types, 1))];
    v_capacity := CASE v_vehicle_type
      WHEN 'Xe tải 2 tấn' THEN 2.0
      WHEN 'Xe tải 5 tấn' THEN 5.0
      WHEN 'Xe tải 10 tấn' THEN 10.0
      WHEN 'Container 20ft' THEN 15.0
      WHEN 'Container 40ft' THEN 20.0
      WHEN 'Xe lạnh 3 tấn' THEN 3.0
      WHEN 'Xe lạnh 5 tấn' THEN 5.0
      ELSE 5.0
    END;
    
    -- Chọn status và location
    v_status := v_statuses[1 + ((v_i - 1) % array_length(v_statuses, 1))];
    v_location := v_regions[1 + ((v_i - 1) % array_length(v_regions, 1))];
    
    -- Tạo tên tài xế
    v_driver_name := 'Tài xế VT ' || LPAD(v_i::TEXT, 3, '0');
    v_driver_phone := '090' || LPAD((2000000 + v_i)::TEXT, 7, '0');
    
    -- Insert vehicle với ON CONFLICT để tránh lỗi nếu vẫn trùng
    INSERT INTO "Vehicles" (
      company_id,
      license_plate,
      vehicle_type,
      capacity_ton,
      driver_name,
      driver_phone,
      status,
      current_location,
      created_at,
      updated_at
    )
    VALUES (
      v_company_id,
      v_license_plate,
      v_vehicle_type,
      v_capacity,
      v_driver_name,
      v_driver_phone,
      v_status,
      v_location,
      CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days'),
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (license_plate) DO NOTHING
    RETURNING vehicle_id INTO v_vehicle_id;
    
    IF v_vehicle_id IS NULL THEN
      RAISE NOTICE '⚠️ Biển số % đã tồn tại, bỏ qua', v_license_plate;
    ELSIF v_i % 10 = 0 THEN
      RAISE NOTICE '✅ Đã tạo % xe', v_i;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Hoàn thành tạo 50 xe cho VT Logistics';
END $$;

-- =====================================================
-- 5. TẠO 50 ĐƠN HÀNG CHO VT LOGISTICS
-- =====================================================

DO $$
DECLARE
  v_company_id INTEGER;
  v_customer_ids UUID[];
  v_vehicle_ids INTEGER[];
  v_warehouse_hcm_id INTEGER;
  v_regions TEXT[] := ARRAY['HCM', 'Cần Thơ', 'Đà Nẵng', 'Hà Nội'];
  v_cargo_types TEXT[] := ARRAY['Điện tử', 'Quần áo', 'Thực phẩm', 'Đồ nội thất', 'Máy móc', 'Hóa chất', 'Gỗ', 'Kim loại'];
  v_statuses TEXT[] := ARRAY['PENDING_PAYMENT', 'PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED'];
  v_i INTEGER;
  v_order_id VARCHAR(4);
  v_customer_id UUID;
  v_vehicle_id INTEGER;
  v_status TEXT;
  v_origin_region TEXT;
  v_dest_region TEXT;
  v_pickup_address TEXT;
  v_dropoff_address TEXT;
  v_cargo_name TEXT;
  v_cargo_type TEXT;
  v_weight NUMERIC;
  v_volume NUMERIC;
  v_value NUMERIC;
  v_contact_name TEXT;
  v_contact_phone TEXT;
BEGIN
  SELECT company_id INTO v_company_id FROM temp_vt_data LIMIT 1;
  SELECT warehouse_hcm_id INTO v_warehouse_hcm_id FROM temp_vt_data LIMIT 1;
  
  -- Lấy danh sách customer IDs (lấy 10 user đầu tiên có role = 'user')
  SELECT ARRAY_AGG(id) INTO v_customer_ids
  FROM users
  WHERE role = 'user'
  LIMIT 10;
  
  -- Lấy danh sách vehicle IDs của VT Logistics
  SELECT ARRAY_AGG(vehicle_id) INTO v_vehicle_ids
  FROM "Vehicles"
  WHERE company_id = v_company_id
  LIMIT 50;
  
  FOR v_i IN 1..50 LOOP
    -- Tạo order_id (4 chữ số, từ 0001 đến 0050)
    v_order_id := LPAD(v_i::TEXT, 4, '0');
    
    -- Chọn customer ngẫu nhiên
    IF array_length(v_customer_ids, 1) > 0 THEN
      v_customer_id := v_customer_ids[1 + (v_i % array_length(v_customer_ids, 1))];
    ELSE
      v_customer_id := NULL;
    END IF;
    
    -- Chọn vehicle ngẫu nhiên (chỉ cho các đơn đã được accept)
    v_vehicle_id := NULL;
    IF v_i > 10 THEN -- Đơn hàng từ 11 trở đi có vehicle
      IF array_length(v_vehicle_ids, 1) > 0 THEN
        v_vehicle_id := v_vehicle_ids[1 + ((v_i - 11) % array_length(v_vehicle_ids, 1))];
      END IF;
    END IF;
    
    -- Chọn status dựa trên thứ tự đơn hàng
    IF v_i <= 5 THEN
      v_status := 'PENDING_PAYMENT';
    ELSIF v_i <= 10 THEN
      v_status := 'PAID';
    ELSIF v_i <= 15 THEN
      v_status := 'ACCEPTED';
    ELSIF v_i <= 20 THEN
      v_status := 'LOADING';
    ELSIF v_i <= 30 THEN
      v_status := 'IN_TRANSIT';
    ELSIF v_i <= 40 THEN
      v_status := 'WAREHOUSE_RECEIVED';
    ELSE
      v_status := 'COMPLETED';
    END IF;
    
    -- Chọn origin và destination region
    v_origin_region := v_regions[1 + ((v_i * 3) % array_length(v_regions, 1))];
    v_dest_region := v_regions[1 + ((v_i * 7) % array_length(v_regions, 1))];
    
    -- Tạo địa chỉ
    v_pickup_address := CASE v_origin_region
      WHEN 'HCM' THEN (100 + (v_i % 100))::TEXT || ' Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'
      WHEN 'Cần Thơ' THEN (200 + (v_i % 100))::TEXT || ' Đường Hùng Vương, Ninh Kiều, Cần Thơ'
      WHEN 'Đà Nẵng' THEN (300 + (v_i % 100))::TEXT || ' Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng'
      ELSE (400 + (v_i % 100))::TEXT || ' Đường Hoàn Kiếm, Quận Hoàn Kiếm, Hà Nội'
    END;
    
    v_dropoff_address := CASE v_dest_region
      WHEN 'HCM' THEN 'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
      WHEN 'Cần Thơ' THEN 'Kho Cần Thơ - 456 Đường XYZ, Ninh Kiều, Cần Thơ'
      WHEN 'Đà Nẵng' THEN 'Kho Đà Nẵng - 321 Đường GHI, Quận Hải Châu, Đà Nẵng'
      ELSE 'Kho Hà Nội - 789 Đường DEF, Quận Hoàn Kiếm, Hà Nội'
    END;
    
    -- Tạo thông tin hàng hóa
    v_cargo_type := v_cargo_types[1 + (v_i % array_length(v_cargo_types, 1))];
    v_cargo_name := v_cargo_type || ' - Lô hàng #' || v_i;
    v_weight := ROUND((100 + (v_i * 50) + (RANDOM() * 500))::NUMERIC, 2);
    v_volume := ROUND((0.5 + (v_i * 0.2) + (RANDOM() * 2.0))::NUMERIC, 3);
    v_value := ROUND((1000000 + (v_i * 500000) + (RANDOM() * 5000000))::NUMERIC, 2);
    
    -- Thông tin liên hệ
    v_contact_name := 'Khách hàng ' || v_i;
    v_contact_phone := '090' || LPAD((2000000 + v_i)::TEXT, 7, '0');
    
    -- Insert order
    INSERT INTO "CargoOrders" (
      order_id,
      company_id,
      vehicle_id,
      customer_id,
      cargo_name,
      cargo_type,
      weight_kg,
      volume_m3,
      value_vnd,
      require_cold,
      require_danger,
      require_loading,
      require_insurance,
      pickup_address,
      dropoff_address,
      pickup_time,
      contact_name,
      contact_phone,
      note,
      status,
      created_at,
      updated_at
    )
    VALUES (
      v_order_id,
      v_company_id,
      v_vehicle_id,
      v_customer_id,
      v_cargo_name,
      v_cargo_type,
      v_weight,
      v_volume,
      v_value,
      CASE WHEN v_i % 5 = 0 THEN TRUE ELSE FALSE END, -- Một số hàng cần lạnh
      CASE WHEN v_i % 7 = 0 THEN TRUE ELSE FALSE END, -- Một số hàng nguy hiểm
      CASE WHEN v_i % 3 = 0 THEN TRUE ELSE FALSE END, -- Một số cần loading đặc biệt
      CASE WHEN v_i % 4 = 0 THEN TRUE ELSE FALSE END, -- Một số cần bảo hiểm
      v_pickup_address,
      v_dropoff_address,
      CURRENT_TIMESTAMP + (RANDOM() * INTERVAL '7 days'),
      v_contact_name,
      v_contact_phone,
      'Đơn hàng test #' || v_i,
      v_status,
      CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days'),
      CURRENT_TIMESTAMP
    );
    
    IF v_i % 10 = 0 THEN
      RAISE NOTICE '✅ Đã tạo % đơn hàng', v_i;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Hoàn thành tạo 50 đơn hàng cho VT Logistics';
END $$;

-- =====================================================
-- 6. TẠO TRANSACTIONS CHO CÁC ĐƠN ĐÃ THANH TOÁN
-- =====================================================

DO $$
DECLARE
  v_company_id INTEGER;
  v_order_ids VARCHAR(4)[];
  v_customer_ids UUID[];
  v_payment_methods TEXT[] := ARRAY['momo', 'zalopay', 'vietqr', 'vpbank'];
  v_i INTEGER;
  v_order_id VARCHAR(4);
  v_customer_id UUID;
  v_order_value NUMERIC;
  v_transaction_code TEXT;
  v_payment_method TEXT;
BEGIN
  SELECT company_id INTO v_company_id FROM temp_vt_data LIMIT 1;
  
  -- Lấy các đơn hàng đã PAID hoặc đã có status trên PAID
  SELECT ARRAY_AGG(order_id) INTO v_order_ids
  FROM "CargoOrders"
  WHERE company_id = v_company_id
    AND status IN ('PAID', 'ACCEPTED', 'LOADING', 'IN_TRANSIT', 'WAREHOUSE_RECEIVED', 'COMPLETED')
  LIMIT 40;
  
  -- Lấy customer IDs
  SELECT ARRAY_AGG(DISTINCT customer_id) INTO v_customer_ids
  FROM "CargoOrders"
  WHERE company_id = v_company_id
    AND customer_id IS NOT NULL
  LIMIT 10;
  
  FOR v_i IN 1..LEAST(array_length(v_order_ids, 1), 40) LOOP
    v_order_id := v_order_ids[v_i];
    
    -- Lấy thông tin đơn hàng
    SELECT value_vnd, customer_id INTO v_order_value, v_customer_id
    FROM "CargoOrders"
    WHERE order_id = v_order_id;
    
    -- Chọn payment method ngẫu nhiên
    v_payment_method := v_payment_methods[1 + (v_i % array_length(v_payment_methods, 1))];
    
    -- Tạo transaction code
    v_transaction_code := 'TXN' || LPAD((1000 + v_i)::TEXT, 6, '0');
    
    -- Insert transaction
    INSERT INTO "Transactions" (
      order_id,
      customer_id,
      company_id,
      amount,
      payment_method,
      payment_status,
      transaction_code,
      paid_at,
      created_at,
      updated_at
    )
    VALUES (
      v_order_id,
      v_customer_id,
      v_company_id,
      v_order_value,
      v_payment_method,
      'SUCCESS',
      v_transaction_code,
      CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '20 days'),
      CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '25 days'),
      CURRENT_TIMESTAMP
    );
    
    IF v_i % 10 = 0 THEN
      RAISE NOTICE '✅ Đã tạo % transactions', v_i;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Hoàn thành tạo transactions';
END $$;

-- =====================================================
-- 7. GÁN TUYẾN ĐƯỜNG CHO XE
-- =====================================================

-- Tự động gán tuyến đường cho các xe dựa trên current_location
DO $$
DECLARE
  v_vehicle RECORD;
  v_route_id INTEGER;
  v_origin_region TEXT;
  v_dest_regions TEXT[];
  v_dest_region TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  -- Lấy company_id của VT
  DECLARE
    v_company_id INTEGER;
  BEGIN
    SELECT company_id INTO v_company_id FROM temp_vt_data LIMIT 1;
    
    -- Lấy tất cả xe của VT
    FOR v_vehicle IN 
      SELECT vehicle_id, current_location
      FROM "Vehicles"
      WHERE company_id = v_company_id
    LOOP
      -- Lấy region từ current_location
      BEGIN
        v_origin_region := get_region_from_address(v_vehicle.current_location);
      EXCEPTION
        WHEN OTHERS THEN
          v_origin_region := v_vehicle.current_location;
      END;
      
      -- Chọn destination region ngẫu nhiên (không trùng origin)
      v_dest_regions := ARRAY['HCM', 'Cần Thơ', 'Đà Nẵng', 'Hà Nội'];
      v_dest_regions := array_remove(v_dest_regions, v_origin_region);
      IF array_length(v_dest_regions, 1) > 0 THEN
        v_dest_region := v_dest_regions[1 + (v_vehicle.vehicle_id % array_length(v_dest_regions, 1))];
      ELSE
        v_dest_region := 'HCM';
      END IF;
      
      -- Tìm hoặc tạo route
      SELECT route_id INTO v_route_id
      FROM "Routes"
      WHERE company_id = v_company_id
        AND origin_region = v_origin_region
        AND destination_region = v_dest_region
      LIMIT 1;
      
      IF v_route_id IS NULL THEN
        -- Tạo route mới
        INSERT INTO "Routes" (
          company_id,
          route_name,
          origin_region,
          destination_region,
          estimated_distance_km,
          estimated_duration_hours,
          is_active
        )
        VALUES (
          v_company_id,
          v_origin_region || ' - ' || v_dest_region,
          v_origin_region,
          v_dest_region,
          200 + (RANDOM() * 1000)::INTEGER,
          5 + (RANDOM() * 10)::INTEGER,
          TRUE
        )
        RETURNING route_id INTO v_route_id;
      END IF;
      
      -- Gán route cho xe (nếu chưa có)
      INSERT INTO "VehicleRoutes" (
        vehicle_id,
        route_id,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        v_vehicle.vehicle_id,
        v_route_id,
        TRUE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (vehicle_id, route_id) DO NOTHING;
      
      v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RAISE NOTICE '✅ Đã gán tuyến đường cho % xe', v_updated_count;
  END;
END $$;

-- =====================================================
-- 8. KIỂM TRA KẾT QUẢ
-- =====================================================

SELECT '=== THỐNG KÊ DỮ LIỆU ===' as info;

SELECT 
  'Vehicles' as table_name,
  COUNT(*) as total_count
FROM "Vehicles" v
INNER JOIN temp_vt_data t ON v.company_id = t.company_id;

SELECT 
  'CargoOrders' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'PENDING_PAYMENT') as pending_payment,
  COUNT(*) FILTER (WHERE status = 'PAID') as paid,
  COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted,
  COUNT(*) FILTER (WHERE status = 'LOADING') as loading,
  COUNT(*) FILTER (WHERE status = 'IN_TRANSIT') as in_transit,
  COUNT(*) FILTER (WHERE status = 'WAREHOUSE_RECEIVED') as warehouse_received,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
FROM "CargoOrders" co
INNER JOIN temp_vt_data t ON co.company_id = t.company_id;

SELECT 
  'Transactions' as table_name,
  COUNT(*) as total_count,
  SUM(amount) as total_amount
FROM "Transactions" tr
INNER JOIN temp_vt_data t ON tr.company_id = t.company_id;

-- =====================================================
-- HOÀN TẤT
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration hoàn tất!';
  RAISE NOTICE '📝 Đã tạo dữ liệu test cho VT Logistics:';
  RAISE NOTICE '   - 50 xe';
  RAISE NOTICE '   - 50 đơn hàng';
  RAISE NOTICE '   - ~40 transactions';
END $$;

-- Cleanup temp table
DROP TABLE IF EXISTS temp_vt_data;

