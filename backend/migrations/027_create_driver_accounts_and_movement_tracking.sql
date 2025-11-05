-- Migration: Tạo tài khoản driver và bảng tracking di chuyển/dừng
-- Chạy script này trên Neon Database để setup driver accounts và movement tracking

SET search_path TO public;

-- =====================================================
-- 1. TẠO BẢNG TRACKING DI CHUYỂN/DỪNG
-- =====================================================

-- Bảng VehicleMovementEvents: Ghi lại các sự kiện di chuyển/dừng của xe
CREATE TABLE IF NOT EXISTS "VehicleMovementEvents" (
  event_id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES "Vehicles"(vehicle_id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES "Drivers"(driver_id) ON DELETE SET NULL,
  order_id VARCHAR(4) REFERENCES "CargoOrders"(order_id) ON DELETE SET NULL,
  
  -- Loại sự kiện
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'DEPARTURE',      -- Xuất phát
    'ARRIVAL',        -- Đã tới kho/điểm đến
    'STOP',           -- Dừng lại
    'RESUME',         -- Tiếp tục di chuyển
    'CHECKPOINT',     -- Điểm kiểm tra
    'FUEL_STOP',      -- Dừng đổ xăng
    'REST_STOP'       -- Dừng nghỉ
  )),
  
  -- Thông tin vị trí
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  address TEXT,
  location_name VARCHAR(255), -- Tên địa điểm (ví dụ: "Kho Hà Nội", "Trạm dừng chân")
  
  -- Thông tin di chuyển
  odometer_km NUMERIC(10,2), -- Số km đã đi (từ đồng hồ xe)
  speed_kmh NUMERIC(5,2),    -- Tốc độ (km/h)
  fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100), -- Mức xăng (%)
  
  -- Thông tin thời gian
  event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER, -- Thời gian dừng (phút) - chỉ dùng cho STOP events
  
  -- Ghi chú
  notes TEXT,
  driver_notes TEXT, -- Ghi chú của tài xế
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index cho truy vấn nhanh
CREATE INDEX IF NOT EXISTS idx_movement_events_vehicle ON "VehicleMovementEvents"(vehicle_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_movement_events_driver ON "VehicleMovementEvents"(driver_id);
CREATE INDEX IF NOT EXISTS idx_movement_events_type ON "VehicleMovementEvents"(event_type);
CREATE INDEX IF NOT EXISTS idx_movement_events_order ON "VehicleMovementEvents"(order_id);
CREATE INDEX IF NOT EXISTS idx_movement_events_time ON "VehicleMovementEvents"(event_time DESC);

-- Trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION vehicle_movement_events_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movement_events_updated_at
BEFORE UPDATE ON "VehicleMovementEvents"
FOR EACH ROW EXECUTE FUNCTION vehicle_movement_events_set_updated_at();

-- =====================================================
-- 2. CẬP NHẬT ROLE CHECK ĐỂ CHO PHÉP 'driver'
-- =====================================================

-- Đảm bảo role 'driver' được chấp nhận
-- (Phần này sẽ được thực hiện trong script create_driver_accounts.js)

-- =====================================================
-- LƯU Ý: Để tạo tài khoản driver với password đã hash, 
-- chạy script: node scripts/create_driver_accounts.js
-- Script này sẽ tự động hash password và insert vào database
-- Password mặc định: "driver123"
-- =====================================================

INSERT INTO users (name, phone, email, password, role, created_at, updated_at)
VALUES
  -- Driver 1: Nguyễn Văn A
  ('Nguyễn Văn A', '0901234567', 'nguyenvana@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 2: Trần Thị B
  ('Trần Thị B', '0902345678', 'tranthib@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 3: Lê Văn C
  ('Lê Văn C', '0903456789', 'levanc@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 4: Phạm Thị D
  ('Phạm Thị D', '0904567890', 'phamthid@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 5: Hoàng Văn E
  ('Hoàng Văn E', '0905678901', 'hoangvane@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 6: Nguyễn Thị F
  ('Nguyễn Thị F', '0906789012', 'nguyenthif@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 7: Võ Văn G
  ('Võ Văn G', '0907890123', 'vovang@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 8: Đặng Văn H
  ('Đặng Văn H', '0908901234', 'dangvanh@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 9: Bùi Thị I
  ('Bùi Thị I', '0909012345', 'buithii@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver 10: Phan Văn J
  ('Phan Văn J', '0900123456', 'phanvanj@driver.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Driver đặc biệt: Tan Hong Phong (tài khoản của bạn)
  ('Tân Hồng Phong', '0394254331', 'tanhongphong30@gmail.com', '$2b$10$rKZ8Qx8x8x8x8x8xOe8x8x8x8x8x8x8x8x8x8x8x8x8x8x8x', 'driver', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 3. TẠO RECORDS TRONG BẢNG DRIVERS VÀ LIÊN KẾT VỚI VEHICLES
-- =====================================================

-- Liên kết các driver với vehicles dựa trên phone/email
DO $$
DECLARE
  v_user_id UUID;
  v_vehicle_id INTEGER;
  v_company_id INTEGER;
  v_driver_id INTEGER;
BEGIN
  -- Driver 1: Nguyễn Văn A -> Vehicle 1 (29A-123.45)
  SELECT id INTO v_user_id FROM users WHERE email = 'nguyenvana@driver.com';
  SELECT vehicle_id, company_id INTO v_vehicle_id, v_company_id FROM "Vehicles" WHERE license_plate = '29A-123.45' LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, license_number, license_type, status)
    VALUES (v_user_id, v_company_id, v_vehicle_id, 'Nguyễn Văn A', '0901234567', 'nguyenvana@driver.com', 'DL000001', 'C', 'ACTIVE')
    ON CONFLICT (driver_id) DO UPDATE
    SET vehicle_id = EXCLUDED.vehicle_id, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP
    RETURNING driver_id INTO v_driver_id;
    
    UPDATE "Vehicles" SET driver_phone = '0901234567', driver_name = 'Nguyễn Văn A' WHERE vehicle_id = v_vehicle_id;
  END IF;
  
  -- Driver 2: Trần Thị B -> Vehicle 2 (30B-678.90)
  SELECT id INTO v_user_id FROM users WHERE email = 'tranthib@driver.com';
  SELECT vehicle_id, company_id INTO v_vehicle_id, v_company_id FROM "Vehicles" WHERE license_plate = '30B-678.90' LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, license_number, license_type, status)
    VALUES (v_user_id, v_company_id, v_vehicle_id, 'Trần Thị B', '0902345678', 'tranthib@driver.com', 'DL000002', 'C', 'ACTIVE')
    ON CONFLICT (driver_id) DO UPDATE
    SET vehicle_id = EXCLUDED.vehicle_id, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP
    RETURNING driver_id INTO v_driver_id;
    
    UPDATE "Vehicles" SET driver_phone = '0902345678', driver_name = 'Trần Thị B' WHERE vehicle_id = v_vehicle_id;
  END IF;
  
  -- Driver 3: Lê Văn C -> Vehicle 3 (51G-111.22)
  SELECT id INTO v_user_id FROM users WHERE email = 'levanc@driver.com';
  SELECT vehicle_id, company_id INTO v_vehicle_id, v_company_id FROM "Vehicles" WHERE license_plate = '51G-111.22' LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, license_number, license_type, status)
    VALUES (v_user_id, v_company_id, v_vehicle_id, 'Lê Văn C', '0903456789', 'levanc@driver.com', 'DL000003', 'C', 'ACTIVE')
    ON CONFLICT (driver_id) DO UPDATE
    SET vehicle_id = EXCLUDED.vehicle_id, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP
    RETURNING driver_id INTO v_driver_id;
    
    UPDATE "Vehicles" SET driver_phone = '0903456789', driver_name = 'Lê Văn C' WHERE vehicle_id = v_vehicle_id;
  END IF;
  
  -- Driver 4: Phạm Thị D -> Vehicle 4 (29D-333.44)
  SELECT id INTO v_user_id FROM users WHERE email = 'phamthid@driver.com';
  SELECT vehicle_id, company_id INTO v_vehicle_id, v_company_id FROM "Vehicles" WHERE license_plate = '29D-333.44' LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, license_number, license_type, status)
    VALUES (v_user_id, v_company_id, v_vehicle_id, 'Phạm Thị D', '0904567890', 'phamthid@driver.com', 'DL000004', 'C', 'ACTIVE')
    ON CONFLICT (driver_id) DO UPDATE
    SET vehicle_id = EXCLUDED.vehicle_id, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP
    RETURNING driver_id INTO v_driver_id;
    
    UPDATE "Vehicles" SET driver_phone = '0904567890', driver_name = 'Phạm Thị D' WHERE vehicle_id = v_vehicle_id;
  END IF;
  
  -- Driver 5: Hoàng Văn E -> Vehicle 5 (61A-555.66)
  SELECT id INTO v_user_id FROM users WHERE email = 'hoangvane@driver.com';
  SELECT vehicle_id, company_id INTO v_vehicle_id, v_company_id FROM "Vehicles" WHERE license_plate = '61A-555.66' LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, license_number, license_type, status)
    VALUES (v_user_id, v_company_id, v_vehicle_id, 'Hoàng Văn E', '0905678901', 'hoangvane@driver.com', 'DL000005', 'C', 'ACTIVE')
    ON CONFLICT (driver_id) DO UPDATE
    SET vehicle_id = EXCLUDED.vehicle_id, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP
    RETURNING driver_id INTO v_driver_id;
    
    UPDATE "Vehicles" SET driver_phone = '0905678901', driver_name = 'Hoàng Văn E' WHERE vehicle_id = v_vehicle_id;
  END IF;
  
  -- Tân Hồng Phong -> Vehicle đầu tiên có thể (hoặc vehicle cụ thể)
  SELECT id INTO v_user_id FROM users WHERE email = 'tanhongphong30@gmail.com';
  SELECT vehicle_id, company_id INTO v_vehicle_id, v_company_id 
  FROM "Vehicles" 
  WHERE vehicle_id NOT IN (SELECT DISTINCT vehicle_id FROM "Drivers" WHERE vehicle_id IS NOT NULL)
  LIMIT 1;
  
  IF v_user_id IS NOT NULL AND v_vehicle_id IS NOT NULL THEN
    INSERT INTO "Drivers" (user_id, company_id, vehicle_id, full_name, phone, email, license_number, license_type, status)
    VALUES (v_user_id, v_company_id, v_vehicle_id, 'Tân Hồng Phong', '0394254331', 'tanhongphong30@gmail.com', 'DL000011', 'C', 'ACTIVE')
    ON CONFLICT (driver_id) DO UPDATE
    SET vehicle_id = EXCLUDED.vehicle_id, user_id = EXCLUDED.user_id, updated_at = CURRENT_TIMESTAMP
    RETURNING driver_id INTO v_driver_id;
    
    UPDATE "Vehicles" SET driver_phone = '0394254331', driver_name = 'Tân Hồng Phong' WHERE vehicle_id = v_vehicle_id;
    
    RAISE NOTICE '✅ Linked driver Tân Hồng Phong to vehicle %', v_vehicle_id;
  END IF;
  
END $$;

-- =====================================================
-- 4. CẬP NHẬT ROLE CHECK TRONG USERS TABLE
-- =====================================================

-- Đảm bảo role 'driver' được chấp nhận
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'transport_company', 'driver'));

-- =====================================================
-- 5. KIỂM TRA KẾT QUẢ
-- =====================================================

-- Kiểm tra các driver accounts đã được tạo
SELECT 
  u.id,
  u.email,
  u.phone,
  u.name,
  u.role,
  d.driver_id,
  d.vehicle_id,
  v.license_plate,
  v.driver_phone,
  v.driver_name
FROM users u
LEFT JOIN "Drivers" d ON u.id = d.user_id
LEFT JOIN "Vehicles" v ON d.vehicle_id = v.vehicle_id
WHERE u.role = 'driver'
ORDER BY u.email;

-- =====================================================
-- 6. HƯỚNG DẪN SỬ DỤNG
-- =====================================================

-- Sau khi chạy migration này:
-- 1. Đăng nhập với các tài khoản driver:
--    - Email: nguyenvana@driver.com, Password: (cần hash trong app)
--    - Email: tanhongphong30@gmail.com, Password: (cần hash trong app)
--
-- 2. Khi driver đăng nhập, hệ thống sẽ tự động:
--    - Tìm vehicle được gán cho driver
--    - Hiển thị biển số xe, hàng hóa trên xe
--    - Cho phép ghi nhận các sự kiện di chuyển/dừng
--
-- 3. Sử dụng API:
--    POST /api/driver/movement-event
--    Body: {
--      vehicle_id: 1,
--      event_type: "DEPARTURE" | "ARRIVAL" | "STOP" | "RESUME",
--      latitude: 10.8231,
--      longitude: 106.6297,
--      address: "TP.HCM",
--      notes: "Ghi chú"
--    }

