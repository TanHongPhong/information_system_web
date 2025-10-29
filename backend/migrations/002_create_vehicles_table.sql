-- Tạo bảng Vehicles (Đội xe) với khóa ngoại đến LogisticsCompany
CREATE TABLE IF NOT EXISTS "Vehicles" (
  vehicle_id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type VARCHAR(100) NOT NULL,
  capacity_ton DECIMAL(5,2) NOT NULL,
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OFFLINE')),
  current_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index để tìm kiếm nhanh theo company_id
CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON "Vehicles"(company_id);

-- Index để tìm kiếm theo license_plate
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON "Vehicles"(license_plate);

-- Index để tìm kiếm theo status
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON "Vehicles"(status);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at 
BEFORE UPDATE ON "Vehicles" 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Insert dữ liệu mẫu đội xe cho các công ty
-- Gemadept Logistics (company_id = 1)
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location) VALUES
  (1, '29A-123.45', 'Xe tải 2 tấn', 2.00, 'Nguyễn Văn A', '0901234567', 'AVAILABLE', 'TP.HCM'),
  (1, '30B-678.90', 'Xe tải 4 tấn', 4.00, 'Trần Thị B', '0902345678', 'AVAILABLE', 'TP.HCM'),
  (1, '51G-111.22', 'Container 20ft', 10.00, 'Lê Văn C', '0903456789', 'IN_USE', 'Bình Dương'),
  (1, '29D-333.44', 'Xe lạnh 3 tấn', 3.00, 'Phạm Thị D', '0904567890', 'AVAILABLE', 'TP.HCM');

-- Transimex Logistics (company_id = 2)
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location) VALUES
  (2, '61A-555.66', 'Xe tải 5 tấn', 5.00, 'Hoàng Văn E', '0905678901', 'AVAILABLE', 'Hà Nội'),
  (2, '43G-777.88', 'Container 40ft', 15.00, 'Nguyễn Thị F', '0906789012', 'AVAILABLE', 'Hải Phòng'),
  (2, '30C-999.00', 'Xe lạnh 2 tấn', 2.00, 'Võ Văn G', '0907890123', 'MAINTENANCE', 'TP.HCM');

-- DHL Supply Chain (company_id = 3)
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location) VALUES
  (3, '19B-111.11', 'Xe tải 1.5 tấn', 1.50, 'Đặng Văn H', '0908901234', 'IN_USE', 'Đà Nẵng'),
  (3, '29A-222.22', 'Xe tải 3 tấn', 3.00, 'Bùi Thị I', '0909012345', 'AVAILABLE', 'TP.HCM'),
  (3, '50G-333.33', 'Container 20ft', 10.00, 'Phan Văn J', '0900123456', 'AVAILABLE', 'TP.HCM'),
  (3, '30K-444.44', 'Xe lạnh 4 tấn', 4.00, 'Trương Thị K', '0901234567', 'AVAILABLE', 'TP.HCM');

-- Viettel Post (company_id = 4)
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location) VALUES
  (4, '43A-555.55', 'Xe tải 2.5 tấn', 2.50, 'Lý Văn L', '0902345678', 'AVAILABLE', 'Cần Thơ'),
  (4, '53B-666.66', 'Xe tải 4 tấn', 4.00, 'Cao Thị M', '0903456789', 'IN_USE', 'An Giang'),
  (4, '17G-777.77', 'Container 20ft', 10.00, 'Lê Văn N', '0904567890', 'AVAILABLE', 'TP.HCM');

-- GHTK Express (company_id = 5)
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location) VALUES
  (5, '25A-888.88', 'Xe tải 1.5 tấn', 1.50, 'Đỗ Thị O', '0905678901', 'AVAILABLE', 'TP.HCM'),
  (5, '51H-999.99', 'Container 10ft', 5.00, 'Trịnh Văn P', '0906789012', 'AVAILABLE', 'TP.HCM');

-- Kerry Logistics (company_id = 6)
INSERT INTO "Vehicles" (company_id, license_plate, vehicle_type, capacity_ton, driver_name, driver_phone, status, current_location) VALUES
  (6, '29B-000.11', 'Xe tải 6 tấn', 6.00, 'Vũ Thị Q', '0907890123', 'AVAILABLE', 'TP.HCM'),
  (6, '43G-111.22', 'Container 40ft', 15.00, 'Ngô Văn R', '0908901234', 'AVAILABLE', 'TP.HCM'),
  (6, '30D-222.33', 'Xe lạnh 5 tấn', 5.00, 'Dương Thị S', '0909012345', 'IN_USE', 'Bình Dương'),
  (6, '61A-333.44', 'Xe tải 3 tấn', 3.00, 'Phùng Văn T', '0900123456', 'AVAILABLE', 'Hà Nội');

