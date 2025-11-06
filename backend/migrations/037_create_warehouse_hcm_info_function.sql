-- Migration: Tạo function get_warehouse_hcm_info để lấy thông tin kho HCM
-- Mục đích: Trả về thông tin kho HCM mặc định cho frontend

SET search_path TO public;

-- =====================================================
-- Function: get_warehouse_hcm_info
-- =====================================================
CREATE OR REPLACE FUNCTION get_warehouse_hcm_info()
RETURNS TABLE (
  warehouse_name VARCHAR(255),
  address TEXT,
  full_address VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(w.warehouse_name, 'Kho HCM')::VARCHAR(255),
    COALESCE(w.address, '123 Đường ABC, Quận 1, TP. Hồ Chí Minh')::TEXT,
    COALESCE(w.warehouse_name || ' - ' || w.address, 'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh')::VARCHAR(255)
  FROM "Warehouses" w
  WHERE w.status = 'ACTIVE'
    AND (
      w.warehouse_name ILIKE '%HCM%' 
      OR w.warehouse_name ILIKE '%Hồ Chí Minh%'
      OR w.address ILIKE '%HCM%'
      OR w.address ILIKE '%Hồ Chí Minh%'
    )
  ORDER BY w.warehouse_id
  LIMIT 1;
  
  -- Nếu không tìm thấy kho HCM, trả về giá trị mặc định
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'Kho HCM'::VARCHAR(255),
      '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::TEXT,
      'Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh'::VARCHAR(255);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Comment cho function
COMMENT ON FUNCTION get_warehouse_hcm_info() IS 'Trả về thông tin kho HCM mặc định. Nếu không tìm thấy kho HCM trong database, trả về giá trị mặc định.';

