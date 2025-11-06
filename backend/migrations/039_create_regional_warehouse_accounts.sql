-- Migration: Tạo tài khoản warehouse theo khu vực
-- Xóa các tài khoản warehouse cũ, tạo warehouse mới cho từng khu vực
-- và tạo tài khoản user cho mỗi warehouse

SET search_path TO public;

-- =====================================================
-- 1. THÊM CỘT warehouse_id VÀO BẢNG users
-- =====================================================

DO $$ 
BEGIN
  -- Thêm cột warehouse_id nếu chưa có
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'warehouse_id'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN warehouse_id INTEGER REFERENCES "Warehouses"(warehouse_id) ON DELETE SET NULL;
    
    COMMENT ON COLUMN users.warehouse_id IS 'Liên kết user warehouse với warehouse cụ thể (chỉ cho role=warehouse)';
    
    -- Tạo index cho warehouse_id
    CREATE INDEX IF NOT EXISTS idx_users_warehouse_id ON users(warehouse_id) WHERE warehouse_id IS NOT NULL;
    
    RAISE NOTICE '✅ Đã thêm cột warehouse_id vào bảng users';
  ELSE
    RAISE NOTICE 'ℹ️ Cột warehouse_id đã tồn tại trong bảng users';
  END IF;
END $$;

-- =====================================================
-- 2. XÓA TẤT CẢ TÀI KHOẢN WAREHOUSE CŨ
-- =====================================================

DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Xóa tất cả user có role = 'warehouse'
  DELETE FROM users WHERE role = 'warehouse';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE '✅ Đã xóa % tài khoản warehouse cũ', deleted_count;
END $$;

-- =====================================================
-- 3. XÓA CÁC WAREHOUSE CŨ (TÙY CHỌN - UNCOMMENT NẾU MUỐN XÓA)
-- =====================================================

-- LƯU Ý: Nếu bạn muốn giữ lại các warehouse cũ và chỉ thêm warehouse mới,
-- thì bỏ qua phần này. Nếu muốn xóa hết và tạo mới, uncomment phần dưới.

-- DO $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   -- Xóa tất cả warehouse cũ (sẽ cascade xóa WarehouseOperations và WarehouseInventory)
--   DELETE FROM "Warehouses";
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   
--   RAISE NOTICE '✅ Đã xóa % warehouse cũ', deleted_count;
-- END $$;

-- =====================================================
-- 4. TẠO WAREHOUSE MỚI CHO TỪNG KHU VỰC
-- =====================================================

-- Tạo warehouse cho HCM, Cần Thơ, Đà Nẵng, Hà Nội
-- Mỗi warehouse sẽ độc lập, không gắn với company cụ thể (company_id = NULL)

DO $$
DECLARE
  v_warehouse_id INTEGER;
  v_regions TEXT[] := ARRAY['HCM', 'Cần Thơ', 'Đà Nẵng', 'Hà Nội'];
  v_region TEXT;
  v_warehouse_name TEXT;
  v_address TEXT;
  v_latitude NUMERIC(10,8);
  v_longitude NUMERIC(11,8);
BEGIN
  FOREACH v_region IN ARRAY v_regions
  LOOP
    -- Kiểm tra xem warehouse đã tồn tại chưa
    SELECT warehouse_id INTO v_warehouse_id
    FROM "Warehouses"
    WHERE warehouse_name ILIKE '%' || v_region || '%'
      AND company_id IS NULL
    LIMIT 1;
    
    -- Gán giá trị theo region
    CASE v_region
      WHEN 'HCM' THEN
        v_warehouse_name := 'Kho HCM';
        v_address := '123 Đường ABC, Quận 1, TP. Hồ Chí Minh';
        v_latitude := 10.8231;
        v_longitude := 106.6297;
      WHEN 'Cần Thơ' THEN
        v_warehouse_name := 'Kho Cần Thơ';
        v_address := '456 Đường XYZ, Ninh Kiều, Cần Thơ';
        v_latitude := 10.0452;
        v_longitude := 105.7469;
      WHEN 'Đà Nẵng' THEN
        v_warehouse_name := 'Kho Đà Nẵng';
        v_address := '321 Đường GHI, Quận Hải Châu, Đà Nẵng';
        v_latitude := 16.0544;
        v_longitude := 108.2022;
      WHEN 'Hà Nội' THEN
        v_warehouse_name := 'Kho Hà Nội';
        v_address := '789 Đường DEF, Quận Hoàn Kiếm, Hà Nội';
        v_latitude := 21.0285;
        v_longitude := 105.8542;
    END CASE;
    
    -- Nếu chưa tồn tại, tạo mới
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
        NULL, -- Không gắn với company cụ thể
        v_warehouse_name,
        v_address,
        '0901234567',
        v_latitude,
        v_longitude,
        10000.00,
        7500.00,
        6,
        'ACTIVE'
      )
      RETURNING warehouse_id INTO v_warehouse_id;
      
      RAISE NOTICE '✅ Đã tạo warehouse: % (warehouse_id: %)', v_warehouse_name, v_warehouse_id;
    ELSE
      RAISE NOTICE 'ℹ️ Warehouse % đã tồn tại (warehouse_id: %)', v_warehouse_name, v_warehouse_id;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 5. TẠO TÀI KHOẢN USER CHO MỖI WAREHOUSE
-- =====================================================

-- LƯU Ý: Để tạo tài khoản với password đã hash, 
-- cần chạy script Node.js: node scripts/create_regional_warehouse_accounts.js
-- Script này sẽ tự động hash password và insert vào database

-- Danh sách tài khoản sẽ được tạo:
-- 1. kho.hcm@warehouse.com / warehouse123 (Kho HCM)
-- 2. kho.cantho@warehouse.com / warehouse123 (Kho Cần Thơ)
-- 3. kho.danang@warehouse.com / warehouse123 (Kho Đà Nẵng)
-- 4. kho.hanoi@warehouse.com / warehouse123 (Kho Hà Nội)

-- =====================================================
-- 6. KIỂM TRA KẾT QUẢ
-- =====================================================

-- Hiển thị danh sách warehouse mới tạo
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  w.address,
  get_region_from_address(w.address) as region,
  w.status,
  w.company_id
FROM "Warehouses" w
WHERE w.company_id IS NULL
  AND w.warehouse_name IN ('Kho HCM', 'Kho Cần Thơ', 'Kho Đà Nẵng', 'Kho Hà Nội')
ORDER BY w.warehouse_id;

-- =====================================================
-- 7. CẬP NHẬT CÁC ĐƠN HÀNG ĐÃ CÓ ĐỂ GẮN VỚI WAREHOUSE THEO KHU VỰC
-- =====================================================

-- Cập nhật WarehouseOperations để gắn với warehouse theo dropoff_address
DO $$
DECLARE
  v_order RECORD;
  v_warehouse_id INTEGER;
  v_region TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  -- Cập nhật WarehouseOperations dựa trên dropoff_address của đơn hàng
  FOR v_order IN 
    SELECT DISTINCT wo.operation_id, co.dropoff_address
    FROM "WarehouseOperations" wo
    INNER JOIN "CargoOrders" co ON wo.order_id = co.order_id
    WHERE wo.warehouse_id IS NULL
      OR wo.warehouse_id IN (SELECT warehouse_id FROM "Warehouses" WHERE company_id IS NOT NULL)
  LOOP
    -- Lấy region từ dropoff_address
    v_region := get_region_from_address(v_order.dropoff_address);
    
    -- Tìm warehouse theo region
    SELECT warehouse_id INTO v_warehouse_id
    FROM "Warehouses"
    WHERE company_id IS NULL
      AND (
        get_region_from_address(address) = v_region
        OR warehouse_name ILIKE '%' || v_region || '%'
      )
    LIMIT 1;
    
    -- Cập nhật warehouse_id nếu tìm thấy
    IF v_warehouse_id IS NOT NULL THEN
      UPDATE "WarehouseOperations"
      SET warehouse_id = v_warehouse_id
      WHERE operation_id = v_order.operation_id;
      
      v_updated_count := v_updated_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Đã cập nhật % warehouse operations', v_updated_count;
END $$;

-- Cập nhật WarehouseInventory tương tự
DO $$
DECLARE
  v_order RECORD;
  v_warehouse_id INTEGER;
  v_region TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  FOR v_order IN 
    SELECT DISTINCT inv.inventory_id, co.dropoff_address
    FROM "WarehouseInventory" inv
    INNER JOIN "CargoOrders" co ON inv.order_id = co.order_id
    WHERE inv.warehouse_id IS NULL
      OR inv.warehouse_id IN (SELECT warehouse_id FROM "Warehouses" WHERE company_id IS NOT NULL)
  LOOP
    v_region := get_region_from_address(v_order.dropoff_address);
    
    SELECT warehouse_id INTO v_warehouse_id
    FROM "Warehouses"
    WHERE company_id IS NULL
      AND (
        get_region_from_address(address) = v_region
        OR warehouse_name ILIKE '%' || v_region || '%'
      )
    LIMIT 1;
    
    IF v_warehouse_id IS NOT NULL THEN
      UPDATE "WarehouseInventory"
      SET warehouse_id = v_warehouse_id
      WHERE inventory_id = v_order.inventory_id;
      
      v_updated_count := v_updated_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Đã cập nhật % warehouse inventory', v_updated_count;
END $$;

-- =====================================================
-- HOÀN TẤT
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration hoàn tất!';
  RAISE NOTICE '📝 Bước tiếp theo: Chạy script node scripts/create_regional_warehouse_accounts.js để tạo tài khoản user';
END $$;

