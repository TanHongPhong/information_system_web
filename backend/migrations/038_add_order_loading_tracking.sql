-- Migration: Thêm tracking cho việc bốc hàng (loading)
-- Mục đích: Theo dõi đơn hàng nào đã được bốc lên xe

SET search_path TO public;

-- =====================================================
-- 1. Thêm cột is_loaded và loaded_at vào CargoOrders
-- =====================================================

DO $$ 
BEGIN
  -- Thêm cột is_loaded (boolean)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'CargoOrders' 
      AND column_name = 'is_loaded'
  ) THEN
    ALTER TABLE "CargoOrders" 
    ADD COLUMN is_loaded BOOLEAN DEFAULT FALSE;
    
    COMMENT ON COLUMN "CargoOrders".is_loaded IS 'Đánh dấu đơn hàng đã được bốc lên xe chưa';
  END IF;

  -- Thêm cột loaded_at (timestamp)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'CargoOrders' 
      AND column_name = 'loaded_at'
  ) THEN
    ALTER TABLE "CargoOrders" 
    ADD COLUMN loaded_at TIMESTAMP;
    
    COMMENT ON COLUMN "CargoOrders".loaded_at IS 'Thời điểm bốc hàng lên xe';
  END IF;
END $$;

-- =====================================================
-- 2. Tạo index cho is_loaded
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cargo_orders_is_loaded 
ON "CargoOrders"(is_loaded) 
WHERE is_loaded = FALSE;

-- =====================================================
-- 3. Cập nhật các đơn hàng có status LOADING hoặc IN_TRANSIT
-- Đánh dấu là đã bốc (nếu muốn, hoặc có thể để FALSE)
-- =====================================================

-- Không tự động đánh dấu, để driver tự bốc hàng

