-- Migration: Cập nhật warehouse_id cho các đơn hàng dựa trên dropoff_address
-- Đảm bảo các đơn hàng được gắn với warehouse đúng theo khu vực đích đến

SET search_path TO public;

-- =====================================================
-- 1. CẬP NHẬT WAREHOUSEOperations DỰA TRÊN dropoff_address
-- =====================================================

DO $$
DECLARE
  v_order RECORD;
  v_warehouse_id INTEGER;
  v_region TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  -- Cập nhật WarehouseOperations dựa trên dropoff_address của đơn hàng
  FOR v_order IN 
    SELECT DISTINCT wo.operation_id, co.dropoff_address, co.order_id
    FROM "WarehouseOperations" wo
    INNER JOIN "CargoOrders" co ON wo.order_id = co.order_id
    WHERE wo.warehouse_id IS NULL
      OR wo.warehouse_id IN (
        SELECT warehouse_id 
        FROM "Warehouses" 
        WHERE company_id IS NOT NULL
      )
    ORDER BY co.order_id
  LOOP
    -- Lấy region từ dropoff_address
    BEGIN
      v_region := get_region_from_address(v_order.dropoff_address);
    EXCEPTION
      WHEN OTHERS THEN
        v_region := NULL;
    END;
    
    -- Tìm warehouse theo region (warehouse có company_id IS NULL)
    IF v_region IS NOT NULL THEN
      SELECT warehouse_id INTO v_warehouse_id
      FROM "Warehouses"
      WHERE company_id IS NULL
        AND (
          get_region_from_address(address) = v_region
          OR get_region_from_address(warehouse_name) = v_region
          OR warehouse_name ILIKE '%' || v_region || '%'
          OR address ILIKE '%' || v_region || '%'
        )
      ORDER BY 
        CASE 
          WHEN get_region_from_address(address) = v_region THEN 1
          WHEN get_region_from_address(warehouse_name) = v_region THEN 2
          ELSE 3
        END,
        warehouse_id
      LIMIT 1;
      
      -- Cập nhật warehouse_id nếu tìm thấy
      IF v_warehouse_id IS NOT NULL THEN
        UPDATE "WarehouseOperations"
        SET warehouse_id = v_warehouse_id
        WHERE operation_id = v_order.operation_id;
        
        v_updated_count := v_updated_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Đã cập nhật % warehouse operations', v_updated_count;
END $$;

-- =====================================================
-- 2. CẬP NHẬT WAREHOUSEInventory DỰA TRÊN dropoff_address
-- =====================================================

DO $$
DECLARE
  v_order RECORD;
  v_warehouse_id INTEGER;
  v_region TEXT;
  v_updated_count INTEGER := 0;
BEGIN
  FOR v_order IN 
    SELECT DISTINCT inv.inventory_id, co.dropoff_address, co.order_id
    FROM "WarehouseInventory" inv
    INNER JOIN "CargoOrders" co ON inv.order_id = co.order_id
    WHERE inv.warehouse_id IS NULL
      OR inv.warehouse_id IN (
        SELECT warehouse_id 
        FROM "Warehouses" 
        WHERE company_id IS NOT NULL
      )
    ORDER BY co.order_id
  LOOP
    -- Lấy region từ dropoff_address
    BEGIN
      v_region := get_region_from_address(v_order.dropoff_address);
    EXCEPTION
      WHEN OTHERS THEN
        v_region := NULL;
    END;
    
    -- Tìm warehouse theo region (warehouse có company_id IS NULL)
    IF v_region IS NOT NULL THEN
      SELECT warehouse_id INTO v_warehouse_id
      FROM "Warehouses"
      WHERE company_id IS NULL
        AND (
          get_region_from_address(address) = v_region
          OR get_region_from_address(warehouse_name) = v_region
          OR warehouse_name ILIKE '%' || v_region || '%'
          OR address ILIKE '%' || v_region || '%'
        )
      ORDER BY 
        CASE 
          WHEN get_region_from_address(address) = v_region THEN 1
          WHEN get_region_from_address(warehouse_name) = v_region THEN 2
          ELSE 3
        END,
        warehouse_id
      LIMIT 1;
      
      -- Cập nhật warehouse_id nếu tìm thấy
      IF v_warehouse_id IS NOT NULL THEN
        UPDATE "WarehouseInventory"
        SET warehouse_id = v_warehouse_id
        WHERE inventory_id = v_order.inventory_id;
        
        v_updated_count := v_updated_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Đã cập nhật % warehouse inventory', v_updated_count;
END $$;

-- =====================================================
-- 3. KIỂM TRA KẾT QUẢ
-- =====================================================

-- Hiển thị thống kê warehouse operations theo warehouse
SELECT 
  w.warehouse_name,
  w.address,
  get_region_from_address(w.address) as region,
  COUNT(wo.operation_id) as total_operations,
  COUNT(CASE WHEN wo.operation_type = 'IN' THEN 1 END) as in_operations,
  COUNT(CASE WHEN wo.operation_type = 'OUT' THEN 1 END) as out_operations
FROM "Warehouses" w
LEFT JOIN "WarehouseOperations" wo ON w.warehouse_id = wo.warehouse_id
WHERE w.company_id IS NULL
GROUP BY w.warehouse_id, w.warehouse_name, w.address
ORDER BY w.warehouse_id;

-- Hiển thị thống kê warehouse inventory theo warehouse
SELECT 
  w.warehouse_name,
  w.address,
  get_region_from_address(w.address) as region,
  COUNT(inv.inventory_id) as total_inventory,
  COUNT(CASE WHEN inv.status = 'INCOMING' THEN 1 END) as incoming,
  COUNT(CASE WHEN inv.status = 'STORED' THEN 1 END) as stored,
  COUNT(CASE WHEN inv.status = 'OUTGOING' THEN 1 END) as outgoing,
  COUNT(CASE WHEN inv.status = 'SHIPPED' THEN 1 END) as shipped
FROM "Warehouses" w
LEFT JOIN "WarehouseInventory" inv ON w.warehouse_id = inv.warehouse_id
WHERE w.company_id IS NULL
GROUP BY w.warehouse_id, w.warehouse_name, w.address
ORDER BY w.warehouse_id;

-- =====================================================
-- HOÀN TẤT
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration hoàn tất!';
  RAISE NOTICE '📝 Đã cập nhật warehouse_id cho các đơn hàng dựa trên dropoff_address';
END $$;

