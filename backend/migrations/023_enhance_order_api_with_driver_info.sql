-- Migration: Enhance Order API to include driver information
-- Không tạo bảng mới, chỉ đảm bảo dữ liệu consistency và cập nhật comments
-- Database hiện tại đã đủ, chỉ cần API trả về thêm driver info

SET search_path TO public;

-- =====================================================
-- KIỂM TRA VÀ ĐẢM BẢO CONSISTENCY
-- =====================================================

-- Đảm bảo Vehicles có đủ thông tin driver
-- (Không cần thay đổi schema, chỉ kiểm tra)

-- Kiểm tra xem có vehicles nào thiếu driver info không
SELECT 
    vehicle_id,
    license_plate,
    vehicle_type,
    CASE 
        WHEN driver_name IS NULL OR driver_name = '' THEN 'Missing driver_name'
        WHEN driver_phone IS NULL OR driver_phone = '' THEN 'Missing driver_phone'
        ELSE 'OK'
    END as driver_info_status
FROM "Vehicles"
WHERE (driver_name IS NULL OR driver_name = '') 
   OR (driver_phone IS NULL OR driver_phone = '')
LIMIT 10;

-- =====================================================
-- CẬP NHẬT COMMENTS ĐỂ RÕ RÀNG
-- =====================================================

COMMENT ON COLUMN "CargoOrders".vehicle_id IS 'ID của xe được gán cho đơn hàng (nullable, có thể chưa gán xe)';
COMMENT ON COLUMN "CargoOrders".status IS 'Trạng thái đơn hàng: PENDING_PAYMENT → PAID → ACCEPTED → LOADING → IN_TRANSIT → WAREHOUSE_RECEIVED → COMPLETED';
COMMENT ON COLUMN "CargoOrders".pickup_address IS 'Địa chỉ lấy hàng (dùng cho StatusPanel timeline)';
COMMENT ON COLUMN "CargoOrders".dropoff_address IS 'Địa chỉ giao hàng (dùng cho StatusPanel timeline)';
COMMENT ON COLUMN "CargoOrders".pickup_time IS 'Thời gian dự kiến lấy hàng (dùng cho StatusPanel progress)';
COMMENT ON COLUMN "CargoOrders".weight_kg IS 'Trọng lượng hàng hóa (kg) - dùng cho VehicleDetailsPanel';
COMMENT ON COLUMN "CargoOrders".volume_m3 IS 'Thể tích hàng hóa (m³) - dùng cho VehicleDetailsPanel';

COMMENT ON COLUMN "Vehicles".license_plate IS 'Biển số xe - được JOIN trong Order API';
COMMENT ON COLUMN "Vehicles".vehicle_type IS 'Loại xe - được JOIN trong Order API';
COMMENT ON COLUMN "Vehicles".capacity_ton IS 'Trọng tải tối đa (tấn) - có thể dùng cho tính toán load';
COMMENT ON COLUMN "Vehicles".driver_name IS 'Tên tài xế - có thể JOIN trong Order API nếu cần';
COMMENT ON COLUMN "Vehicles".driver_phone IS 'SĐT tài xế - có thể JOIN trong Order API nếu cần';

-- =====================================================
-- HOÀN THÀNH
-- =====================================================

-- Ghi chú: Database schema đã đủ, không cần tạo bảng mới
-- API sẽ được cập nhật để trả về driver info nếu cần

