# Hướng dẫn Setup Vị trí Xe và Tính Khả dụng

## Tổng quan

Migration này sẽ:
1. Thêm function `get_vehicle_availability()` để tính khả dụng của xe
2. Thêm function `get_available_vehicles_by_route()` để filter xe theo vị trí và điểm đến
3. Tự động cập nhật vị trí mặc định cho các xe chưa có vị trí (dựa trên route)
4. Cập nhật API để filter xe theo vị trí hiện tại và điểm đến mong muốn

## Cách chạy

### Bước 1: Chạy migration cơ bản (nếu chưa chạy)
```bash
cd backend
# Chạy migration tạo bảng Routes và LocationMapping
psql $PSQLDB_CONNECTIONSTRING -f migrations/032_create_routes_and_location_mapping.sql

# Chạy migration setup routes cho xe
psql $PSQLDB_CONNECTIONSTRING -f migrations/034_setup_vehicle_routes_complete.sql
```

### Bước 2: Chạy migration tính khả dụng
```bash
cd backend
psql $PSQLDB_CONNECTIONSTRING -f migrations/035_add_vehicle_availability_logic.sql
```

### Bước 3: Cập nhật vị trí xe (nếu cần)
```bash
cd backend
node scripts/update_vehicle_locations.js
```

## Logic hoạt động

### 1. Tính khả dụng của xe

Function `get_vehicle_availability(vehicle_id, destination_region)` sẽ:
- Kiểm tra xe có đơn hàng active (LOADING, IN_TRANSIT, COMPLETED) → Không khả dụng
- Kiểm tra vị trí hiện tại của xe
- Kiểm tra xem có route từ vị trí hiện tại đến điểm đến không
- Trả về JSON với thông tin khả dụng và lý do

### 2. Filter xe theo vị trí và điểm đến

Function `get_available_vehicles_by_route(company_id, destination_region)` sẽ:
- Chỉ lấy xe có status = 'AVAILABLE'
- Filter xe có route từ vị trí hiện tại đến điểm đến
- Loại bỏ xe có đơn hàng active
- Sắp xếp theo độ phù hợp (xe có vị trí rõ ràng và route đúng ưu tiên hơn)

### 3. API Endpoint

`GET /api/transport-companies/:id/vehicles?destination_region=HCM`

Response sẽ bao gồm:
- Thông tin xe
- `vehicle_region`: Khu vực hiện tại của xe (extract từ current_location)
- `availability`: JSON object với thông tin khả dụng
- `route_name`: Tên route của xe

## Ví dụ

### Xe đang ở Cần Thơ, muốn chở đến HCM:

```sql
-- Chỉ hiển thị xe có:
-- 1. Vị trí hiện tại = Cần Thơ (hoặc chưa có vị trí nhưng có route Cần Thơ → HCM)
-- 2. Route từ Cần Thơ đến HCM
-- 3. Không có đơn hàng active
SELECT * FROM get_available_vehicles_by_route(1, 'HCM');
```

### Cập nhật vị trí xe:

```sql
-- Cập nhật vị trí xe khi đến Cần Thơ
UPDATE "Vehicles"
SET current_location = 'Cần Thơ',
    updated_at = CURRENT_TIMESTAMP
WHERE vehicle_id = 1;
```

## Kiểm tra kết quả

### Xem xe và vị trí của chúng:
```sql
SELECT 
  v.vehicle_id,
  v.license_plate,
  v.current_location,
  get_region_from_address(v.current_location) as vehicle_region,
  r.route_name,
  r.origin_region || ' → ' || r.destination_region as route_direction
FROM "Vehicles" v
LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
ORDER BY v.vehicle_id;
```

### Kiểm tra khả dụng của một xe:
```sql
SELECT get_vehicle_availability(1, 'HCM');
```

### Xem danh sách xe khả dụng cho một tuyến:
```sql
SELECT * FROM get_available_vehicles_by_route(1, 'HCM');
```

## Frontend Flow

1. **Trang danh sách công ty**: Chọn điểm đi và điểm đến → Lưu vào localStorage
2. **Trang chọn xe**: 
   - Truyền `destination_region` qua URL
   - API tự động filter xe theo vị trí hiện tại và điểm đến
   - Hiển thị route: `Vị trí hiện tại → Điểm đến`
3. **Trang nhập thông tin**: 
   - Điểm đi: Text input (vị trí chính xác)
   - Điểm đến: Kho HCM (disabled)

