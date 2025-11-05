# Hướng Dẫn Setup Driver Accounts và Movement Tracking

## Bước 1: Tạo Tài Khoản Driver

Chạy script Node.js để tạo các tài khoản driver với password đã hash:

```bash
cd backend
node scripts/create_driver_accounts.js
```

Script này sẽ:
- Tạo 11 tài khoản driver (bao gồm tài khoản của bạn)
- Hash password bằng bcrypt
- Password mặc định: `driver123`

## Bước 2: Chạy Migration SQL

Chạy file migration trên Neon Database:

```sql
-- Copy toàn bộ nội dung từ file:
backend/migrations/027_create_driver_accounts_and_movement_tracking.sql
```

Hoặc chạy từng phần:

1. **Tạo bảng VehicleMovementEvents** (để track di chuyển/dừng)
2. **Cập nhật role check** (cho phép role 'driver')
3. **Link drivers với vehicles** (tự động gán vehicle cho driver)

## Bước 3: Danh Sách Tài Khoản Driver

Sau khi chạy script và migration, bạn có thể đăng nhập với:

| Email | Password | Phone | Vehicle |
|-------|----------|-------|---------|
| nguyenvana@driver.com | driver123 | 0901234567 | 29A-123.45 |
| tranthib@driver.com | driver123 | 0902345678 | 30B-678.90 |
| levanc@driver.com | driver123 | 0903456789 | 51G-111.22 |
| phamthid@driver.com | driver123 | 0904567890 | 29D-333.44 |
| hoangvane@driver.com | driver123 | 0905678901 | 61A-555.66 |
| nguyenthif@driver.com | driver123 | 0906789012 | (auto-assigned) |
| vovang@driver.com | driver123 | 0907890123 | (auto-assigned) |
| dangvanh@driver.com | driver123 | 0908901234 | (auto-assigned) |
| buithii@driver.com | driver123 | 0909012345 | (auto-assigned) |
| phanvanj@driver.com | driver123 | 0900123456 | (auto-assigned) |
| **tanhongphong30@gmail.com** | **driver123** | **0394254331** | **(auto-assigned)** |

## Bước 4: Test Đăng Nhập

1. Mở trang đăng nhập
2. Đăng nhập với email và password trên
3. Chọn role: `driver`
4. Sau khi đăng nhập, vào trang `/driver`
5. Hệ thống sẽ tự động:
   - Tìm vehicle được gán cho driver
   - Hiển thị biển số xe
   - Hiển thị các đơn hàng trên xe (hàng hóa)
   - Cho phép ghi nhận sự kiện di chuyển/dừng

## API Endpoints

### 1. Lấy thông tin xe và đơn hàng
```
GET /api/driver/vehicle-info?email={email}&phone={phone}
```

### 2. Ghi nhận xuất phát
```
POST /api/driver/departure
Body: {
  vehicle_id: 1,
  order_ids: ["0001", "0002"],
  departure_location: "TP.HCM",
  notes: "Xuất phát từ kho"
}
```

### 3. Ghi nhận đã tới kho
```
POST /api/driver/warehouse-arrival
Body: {
  vehicle_id: 1,
  order_ids: ["0001", "0002"],
  warehouse_location: "Hà Nội",
  notes: "Đã tới kho"
}
```

### 4. Ghi nhận sự kiện di chuyển/dừng (NEW)
```
POST /api/driver/movement-event
Body: {
  vehicle_id: 1,
  driver_id: 1,
  order_id: "0001",
  event_type: "DEPARTURE" | "ARRIVAL" | "STOP" | "RESUME" | "CHECKPOINT" | "FUEL_STOP" | "REST_STOP",
  latitude: 10.8231,
  longitude: 106.6297,
  address: "TP.HCM",
  location_name: "Kho Hà Nội",
  odometer_km: 1500.5,
  speed_kmh: 60.5,
  fuel_level: 75,
  duration_minutes: 30,
  notes: "Ghi chú",
  driver_notes: "Ghi chú của tài xế"
}
```

### 5. Lấy lịch sử sự kiện di chuyển
```
GET /api/driver/movement-events?vehicle_id=1&limit=50
```

## Cấu Trúc Bảng VehicleMovementEvents

| Column | Type | Description |
|--------|------|-------------|
| event_id | SERIAL | Primary key |
| vehicle_id | INTEGER | ID xe |
| driver_id | INTEGER | ID tài xế |
| order_id | VARCHAR(4) | ID đơn hàng |
| event_type | VARCHAR(50) | Loại sự kiện |
| latitude | NUMERIC | Vĩ độ |
| longitude | NUMERIC | Kinh độ |
| address | TEXT | Địa chỉ |
| location_name | VARCHAR(255) | Tên địa điểm |
| odometer_km | NUMERIC | Số km đã đi |
| speed_kmh | NUMERIC | Tốc độ (km/h) |
| fuel_level | INTEGER | Mức xăng (%) |
| duration_minutes | INTEGER | Thời gian dừng (phút) |
| notes | TEXT | Ghi chú |
| driver_notes | TEXT | Ghi chú của tài xế |
| event_time | TIMESTAMP | Thời gian sự kiện |

## Notes

- Password mặc định cho tất cả driver: `driver123`
- Nếu muốn đổi password, cần hash bằng bcrypt trước khi update
- Vehicle sẽ được tự động gán nếu chưa có trong migration
- Có thể thêm nhiều driver accounts bằng cách chạy lại script


