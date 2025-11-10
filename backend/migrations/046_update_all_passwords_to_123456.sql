-- =====================================================
-- UPDATE ALL PASSWORDS TO "123456" (SQL VERSION)
-- 
-- LƯU Ý: Script này sử dụng hash cố định. 
-- Nếu không hoạt động, hãy dùng script Node.js: node scripts/update_all_passwords.js
-- =====================================================

BEGIN;

-- Hash của password "123456" (bcrypt, salt rounds = 10)
-- Hash này được tạo bằng: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('123456', 10).then(hash => console.log(hash));"
-- Mỗi lần hash sẽ khác nhau do salt ngẫu nhiên, nhưng tất cả đều verify được với password "123456"
DO $$
DECLARE
  password_hash TEXT := '$2b$10$iI46v3aiFOajN.WlN0VFSunegLSxvCPJvAT13VX2jvoDEhSzaJl0G';
  updated_users_count INTEGER;
  updated_admins_count INTEGER;
BEGIN
  RAISE NOTICE 'Starting password update...';
  RAISE NOTICE 'New password: 123456';
  
  -- Cập nhật password cho tất cả users
  UPDATE users
  SET password = password_hash,
      updated_at = NOW()
  WHERE email IS NOT NULL;
  
  GET DIAGNOSTICS updated_users_count = ROW_COUNT;
  RAISE NOTICE 'Updated % user passwords in users table', updated_users_count;

  -- Cập nhật password cho tất cả TransportCompanyAdmin
  UPDATE "TransportCompanyAdmin"
  SET password = password_hash,
      updated_at = NOW()
  WHERE email IS NOT NULL;
  
  GET DIAGNOSTICS updated_admins_count = ROW_COUNT;
  RAISE NOTICE 'Updated % admin passwords in TransportCompanyAdmin table', updated_admins_count;

  RAISE NOTICE '';
  RAISE NOTICE '=== PASSWORD UPDATE COMPLETED ===';
  RAISE NOTICE 'Total users updated: %', updated_users_count;
  RAISE NOTICE 'Total admins updated: %', updated_admins_count;
  RAISE NOTICE 'All passwords have been set to: 123456';
  RAISE NOTICE '';
  RAISE NOTICE 'Sample accounts to test:';
  RAISE NOTICE '  - admin@vtlogistics.com / 123456';
  RAISE NOTICE '  - customer1@example.com / 123456';
  RAISE NOTICE '  - driver1@vtlogistics.com / 123456';
  RAISE NOTICE '  - warehouse1@vtlogistics.com / 123456';
  
END $$;

COMMIT;
