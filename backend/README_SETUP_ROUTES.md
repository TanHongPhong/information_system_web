# Hướng dẫn Setup Routes cho Xe

## Tổng quan

Script này sẽ:
1. Tạo routes mặc định cho tất cả công ty (HCM ↔ Hà Nội, HCM ↔ Đà Nẵng, v.v.)
2. Gán route cố định cho từng xe (mỗi xe 1 route A→B, có thể quay lại B→A)
3. Đảm bảo có warehouse HCM cho mỗi công ty

## Cách chạy

### Option 1: Chạy bằng Node.js Script (Khuyên dùng)

```bash
cd backend
node scripts/setup_vehicle_routes.js
```

Script này sẽ:
- Tự động chạy migration SQL
- Hiển thị thống kê kết quả
- Hiển thị danh sách xe và route của chúng

### Option 2: Chạy trực tiếp SQL

```bash
# Kết nối đến database PostgreSQL
psql -U your_username -d your_database -f migrations/034_setup_vehicle_routes_complete.sql
```

Hoặc nếu dùng Neon/Cloud database:
```bash
# Export connection string
export PGPASSWORD=your_password

# Chạy migration
psql "postgresql://user:password@host:port/database" -f migrations/034_setup_vehicle_routes_complete.sql
```

### Option 3: Chạy từng bước

Nếu muốn kiểm tra từng bước, có thể chạy từng phần trong file SQL:

```sql
-- 1. Tạo routes mặc định
-- (Copy phần 1 từ file SQL)

-- 2. Gán route cho xe
-- (Copy phần 2 từ file SQL)

-- 3. Tạo warehouse HCM
-- (Copy phần 3 từ file SQL)
```

## Kiểm tra kết quả

### Xem routes đã tạo:
```sql
SELECT 
  r.route_id,
  r.route_name,
  r.origin_region,
  r.destination_region,
  lc.company_name
FROM "Routes" r
INNER JOIN "LogisticsCompany" lc ON r.company_id = lc.company_id
WHERE r.is_active = TRUE
ORDER BY lc.company_name, r.route_name;
```

### Xem xe và route của chúng:
```sql
SELECT 
  v.vehicle_id,
  v.license_plate,
  v.driver_name,
  lc.company_name,
  r.route_name,
  r.origin_region || ' → ' || r.destination_region as route_direction
FROM "Vehicles" v
INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
ORDER BY lc.company_name, v.license_plate;
```

### Xem warehouse HCM:
```sql
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  w.address,
  lc.company_name
FROM "Warehouses" w
INNER JOIN "LogisticsCompany" lc ON w.company_id = lc.company_id
WHERE w.status = 'ACTIVE'
  AND (
    w.warehouse_name ILIKE '%HCM%' 
    OR w.warehouse_name ILIKE '%Hồ Chí Minh%'
  )
ORDER BY lc.company_name;
```

## Gán route thủ công cho xe

Nếu muốn gán route cụ thể cho một xe:

```sql
-- Sử dụng function assign_route_to_vehicle
SELECT assign_route_to_vehicle(
  vehicle_id,      -- ID của xe
  'HCM',           -- Origin region
  'Hà Nội'         -- Destination region
);
```

Ví dụ:
```sql
-- Gán route HCM → Hà Nội cho xe có ID = 1
SELECT assign_route_to_vehicle(1, 'HCM', 'Hà Nội');
```

## Lưu ý

1. **Mỗi xe chỉ có 1 route active**: Khi gán route mới, route cũ sẽ tự động bị deactivate
2. **Route ngược được tự động tạo**: Khi gán route A→B, hệ thống sẽ tự động tạo route B→A (nếu chưa có)
3. **Warehouse HCM**: Mỗi công ty sẽ có 1 warehouse HCM mặc định

## Troubleshooting

### Lỗi: "Vehicle not found"
- Kiểm tra xem vehicle_id có tồn tại không
- Kiểm tra xem vehicle có company_id không

### Lỗi: "Route not found"
- Chạy migration 032_create_routes_and_location_mapping.sql trước
- Đảm bảo đã seed dữ liệu LocationMapping

### Xe không có route
- Kiểm tra xem công ty của xe có route nào không
- Chạy lại script setup để gán route mặc định

