-- =====================================================
-- UPDATE WAREHOUSE OPERATIONS STATUS
-- Cập nhật status cho các operations để phù hợp với logic mới
-- =====================================================

BEGIN;

DO $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  RAISE NOTICE '=== UPDATING WAREHOUSE OPERATIONS STATUS ===';
  
  -- Cập nhật IN operations:
  -- - Nếu status là PENDING -> giữ nguyên (INCOMING)
  -- - Nếu status là IN_PROGRESS hoặc COMPLETED -> giữ nguyên (STORED)
  -- - Nếu status NULL -> đặt thành PENDING
  
  UPDATE "WarehouseOperations"
  SET status = 'PENDING',
      updated_at = NOW()
  WHERE operation_type = 'IN'
    AND (status IS NULL OR status = '');
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % IN operations with NULL/empty status to PENDING', updated_count;
  
  -- Cập nhật OUT operations:
  -- - Nếu status là PENDING -> giữ nguyên (OUTGOING)
  -- - Nếu status là COMPLETED -> giữ nguyên (SHIPPED)
  -- - Nếu status là IN_PROGRESS -> đổi thành PENDING (vì OUT không nên có IN_PROGRESS)
  -- - Nếu status NULL -> đặt thành PENDING
  
  UPDATE "WarehouseOperations"
  SET status = 'PENDING',
      updated_at = NOW()
  WHERE operation_type = 'OUT'
    AND (status IS NULL OR status = '' OR status = 'IN_PROGRESS');
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % OUT operations with NULL/empty/IN_PROGRESS status to PENDING', updated_count;
  
  -- Đảm bảo actual_time được set cho các operations COMPLETED
  UPDATE "WarehouseOperations"
  SET actual_time = COALESCE(actual_time, created_at, NOW()),
      updated_at = NOW()
  WHERE status = 'COMPLETED'
    AND actual_time IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % COMPLETED operations with NULL actual_time', updated_count;
  
  -- Thống kê
  RAISE NOTICE '';
  RAISE NOTICE '=== STATUS SUMMARY ===';
  
  RAISE NOTICE 'IN Operations:';
  PERFORM (
    SELECT COUNT(*) FROM "WarehouseOperations" 
    WHERE operation_type = 'IN' AND status = 'PENDING'
  ) INTO updated_count;
  RAISE NOTICE '  - PENDING (INCOMING): %', updated_count;
  
  PERFORM (
    SELECT COUNT(*) FROM "WarehouseOperations" 
    WHERE operation_type = 'IN' AND status IN ('IN_PROGRESS', 'COMPLETED')
  ) INTO updated_count;
  RAISE NOTICE '  - IN_PROGRESS/COMPLETED (STORED): %', updated_count;
  
  RAISE NOTICE 'OUT Operations:';
  PERFORM (
    SELECT COUNT(*) FROM "WarehouseOperations" 
    WHERE operation_type = 'OUT' AND status = 'PENDING'
  ) INTO updated_count;
  RAISE NOTICE '  - PENDING (OUTGOING): %', updated_count;
  
  PERFORM (
    SELECT COUNT(*) FROM "WarehouseOperations" 
    WHERE operation_type = 'OUT' AND status = 'COMPLETED'
  ) INTO updated_count;
  RAISE NOTICE '  - COMPLETED (SHIPPED): %', updated_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== UPDATE COMPLETED ===';

END $$;

COMMIT;

