-- =====================================================
-- MIGRATION: Thêm khu vực hoạt động cho các công ty - chỉ 4 điểm chính
-- - Xóa tất cả khu vực cũ
-- - Thêm lại chỉ 4 khu vực: Hà Nội, Đà Nẵng, Cần Thơ, HCM
-- =====================================================

BEGIN;

-- ===== 1. XÓA TẤT CẢ KHU VỰC HOẠT ĐỘNG CŨ =====
DELETE FROM "CompanyAreas";

-- ===== 2. THÊM LẠI CHỈ 4 KHU VỰC CHÍNH =====
DO $$
DECLARE
  vt_company_id INTEGER;
  fastship_company_id INTEGER;
  central_company_id INTEGER;
BEGIN
  -- Lấy company_id của các công ty
  SELECT company_id INTO vt_company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics' LIMIT 1;
  SELECT company_id INTO fastship_company_id FROM "LogisticsCompany" WHERE company_name = 'FastShip Logistics' LIMIT 1;
  SELECT company_id INTO central_company_id FROM "LogisticsCompany" WHERE company_name = 'Central Express' LIMIT 1;

  -- VT Logistics: Tất cả 4 điểm
  IF vt_company_id IS NOT NULL THEN
    INSERT INTO "CompanyAreas" (company_id, area, created_at)
    VALUES 
      (vt_company_id, 'Hà Nội', NOW()),
      (vt_company_id, 'Đà Nẵng', NOW()),
      (vt_company_id, 'Cần Thơ', NOW()),
      (vt_company_id, 'HCM', NOW())
    ON CONFLICT (company_id, area) DO NOTHING;
  END IF;

  -- FastShip Logistics: Chủ yếu miền Nam (HCM, Cần Thơ)
  IF fastship_company_id IS NOT NULL THEN
    INSERT INTO "CompanyAreas" (company_id, area, created_at)
    VALUES 
      (fastship_company_id, 'HCM', NOW()),
      (fastship_company_id, 'Cần Thơ', NOW())
    ON CONFLICT (company_id, area) DO NOTHING;
  END IF;

  -- Central Express: Chủ yếu miền Trung (Đà Nẵng)
  IF central_company_id IS NOT NULL THEN
    INSERT INTO "CompanyAreas" (company_id, area, created_at)
    VALUES 
      (central_company_id, 'Đà Nẵng', NOW()),
      (central_company_id, 'HCM', NOW())
    ON CONFLICT (company_id, area) DO NOTHING;
  END IF;

END $$;

-- ===== 3. THÊM CHO CÁC CÔNG TY KHÁC (NẾU CÓ) =====
-- Thêm tất cả 4 điểm cho các công ty ACTIVE còn lại
DO $$
DECLARE
  company_rec RECORD;
BEGIN
  FOR company_rec IN 
    SELECT company_id, company_name 
    FROM "LogisticsCompany" 
    WHERE status = 'ACTIVE'
      AND company_name NOT IN ('VT Logistics', 'FastShip Logistics', 'Central Express')
  LOOP
    -- Thêm tất cả 4 điểm
    INSERT INTO "CompanyAreas" (company_id, area, created_at)
    VALUES 
      (company_rec.company_id, 'Hà Nội', NOW()),
      (company_rec.company_id, 'Đà Nẵng', NOW()),
      (company_rec.company_id, 'Cần Thơ', NOW()),
      (company_rec.company_id, 'HCM', NOW())
    ON CONFLICT (company_id, area) DO NOTHING;

  END LOOP;
END $$;

COMMIT;

SELECT '✅ Migration 055: Đã thêm khu vực hoạt động - chỉ 4 điểm chính (Hà Nội, Đà Nẵng, Cần Thơ, HCM)!' AS result;

