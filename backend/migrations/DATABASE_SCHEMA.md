# 📊 Tài Liệu Database Schema - Hệ Thống Logistics

## 📋 Tổng Quan

Hệ thống quản lý logistics bao gồm các bảng chính sau:

### Bảng Chính (Core Tables)

#### 1. **users** (001)
- Quản lý tài khoản người dùng (khách hàng, công ty vận chuyển, admin)
- **Khóa**: `id` (UUID)
- **Role**: `user`, `transport_company`

#### 2. **LogisticsCompany** (005)
- Thông tin các công ty vận chuyển logistics
- **Khóa**: `company_id` (SERIAL)
- **Liên quan**: `Vehicles`, `CargoOrders`, `Drivers`, `CompanyAreas`, `CompanyRates`

#### 3. **CompanyAreas** (005)
- Khu vực hoạt động của từng công ty
- **Khóa**: `area_id` (SERIAL)
- **Foreign Key**: `company_id` → `LogisticsCompany`

#### 4. **CompanyRates** (005)
- Bảng giá theo loại xe của từng công ty
- **Khóa**: `rate_id` (SERIAL)
- **Foreign Key**: `company_id` → `LogisticsCompany`

#### 5. **Vehicles** (002)
- Đội xe của các công ty
- **Khóa**: `vehicle_id` (SERIAL)
- **Foreign Key**: `company_id` → `LogisticsCompany`

#### 6. **Drivers** (007)
- Thông tin tài xế
- **Khóa**: `driver_id` (SERIAL)
- **Foreign Key**: 
  - `user_id` → `users` (nếu tài xế có tài khoản)
  - `company_id` → `LogisticsCompany`
  - `vehicle_id` → `Vehicles`

#### 7. **CargoOrders** (003, 006)
- Đơn hàng vận chuyển
- **Khóa**: `order_id` (SERIAL)
- **Foreign Key**: 
  - `company_id` → `LogisticsCompany`
  - `vehicle_id` → `Vehicles`
  - `customer_id` → `users` (006 - người đặt hàng)
- **Status**: `DRAFT`, `SUBMITTED`, `CONFIRMED`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED`

#### 8. **Transactions** (004)
- Giao dịch thanh toán
- **Khóa**: `transaction_id` (SERIAL)
- **Foreign Key**: 
  - `order_id` → `CargoOrders`
  - `company_id` → `LogisticsCompany`
- **Payment Status**: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`

---

### Bảng Hỗ Trợ (Support Tables)

#### 9. **LocationHistory** (008)
- Lịch sử vị trí GPS của xe theo thời gian thực
- **Khóa**: `location_id` (SERIAL)
- **Foreign Key**: 
  - `vehicle_id` → `Vehicles`
  - `order_id` → `CargoOrders`
- **Dùng cho**: Theo dõi đơn hàng trên bản đồ

#### 10. **WarehouseOperations** (009)
- Quản lý nhập/xuất kho hàng
- **Khóa**: `operation_id` (SERIAL)
- **Foreign Key**: 
  - `order_id` → `CargoOrders`
  - `warehouse_id` → `Warehouses`
- **Operation Type**: `IN`, `OUT`, `TRANSFER`, `RETURN`
- **Status**: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

#### 11. **Warehouses** (009)
- Thông tin kho hàng
- **Khóa**: `warehouse_id` (SERIAL)
- **Foreign Key**: `company_id` → `LogisticsCompany`
- **Dùng cho**: Quản lý nhiều kho (nếu cần)

#### 12. **Notifications** (010)
- Hệ thống thông báo cho người dùng
- **Khóa**: `notification_id` (SERIAL)
- **Foreign Key**: `user_id` → `users`
- **Type**: `ORDER_STATUS`, `PAYMENT`, `VEHICLE_UPDATE`, `SYSTEM`, etc.

#### 13. **Reviews** (011)
- Đánh giá và nhận xét của khách hàng
- **Khóa**: `review_id` (SERIAL)
- **Foreign Key**: 
  - `company_id` → `LogisticsCompany`
  - `driver_id` → `Drivers`
  - `order_id` → `CargoOrders`
  - `user_id` → `users`
- **Review Type**: `COMPANY`, `DRIVER`, `SERVICE`
- **Rating**: 1-5 sao

---

## 🔗 Sơ Đồ Liên Kết (Entity Relationship)

```
users (id)
  ├── CargoOrders.customer_id
  ├── Drivers.user_id
  └── Notifications.user_id
  └── Reviews.user_id

LogisticsCompany (company_id)
  ├── Vehicles.company_id
  ├── Drivers.company_id
  ├── CargoOrders.company_id
  ├── Transactions.company_id
  ├── CompanyAreas.company_id
  ├── CompanyRates.company_id
  ├── Warehouses.company_id
  └── Reviews.company_id

Vehicles (vehicle_id)
  ├── CargoOrders.vehicle_id
  ├── Drivers.vehicle_id
  └── LocationHistory.vehicle_id

CargoOrders (order_id)
  ├── Transactions.order_id
  ├── LocationHistory.order_id
  ├── WarehouseOperations.order_id
  └── Reviews.order_id

Drivers (driver_id)
  └── Reviews.driver_id
```

---

## 📝 Thứ Tự Chạy Migration

Các file migration cần được chạy theo thứ tự sau:

1. `001_create_users_table.sql` ✅
2. `005_create_logistics_company_tables.sql` ⭐ (MỚI - cần chạy trước các bảng tham chiếu)
3. `002_create_vehicles_table.sql`
4. `007_create_drivers_table.sql` ⭐ (MỚI)
5. `003_create_cargo_orders.sql`
6. `006_add_customer_to_cargo_orders.sql` ⭐ (MỚI - cập nhật CargoOrders)
7. `004_create_transactions_table.sql`
8. `008_create_location_history_table.sql` ⭐ (MỚI)
9. `009_create_warehouse_operations_table.sql` ⭐ (MỚI)
10. `010_create_notifications_table.sql` ⭐ (MỚI)
11. `011_create_reviews_table.sql` ⭐ (MỚI)

---

## 🎯 Chức Năng Hỗ Trợ

### Dashboard Features

#### 1. **User Dashboard** (`/home-page`, `/transport-companies`, etc.)
- ✅ Xem danh sách công ty: `LogisticsCompany`, `CompanyAreas`, `CompanyRates`
- ✅ Chọn xe: `Vehicles`
- ✅ Đặt hàng: `CargoOrders` (với `customer_id`)
- ✅ Thanh toán: `Transactions`
- ✅ Theo dõi đơn hàng: `LocationHistory`, `CargoOrders`
- ✅ Xem lịch sử: `Transactions`, `CargoOrders`
- ✅ Đánh giá: `Reviews`

#### 2. **Supplier Dashboard** (`/suplier`, `/quan-li-doi-xe`, `/order-tracking`)
- ✅ Quản lý đội xe: `Vehicles`, `Drivers`
- ✅ Quản lý đơn hàng: `CargoOrders`
- ✅ Theo dõi vị trí: `LocationHistory`
- ✅ Thống kê: Aggregations từ các bảng trên

#### 3. **Warehouse Dashboard** (`/warehouse`)
- ✅ Nhập/xuất kho: `WarehouseOperations`
- ✅ Quản lý kho: `Warehouses`
- ✅ QR Scanner: Cập nhật `WarehouseOperations`

#### 4. **Driver Dashboard** (`/driver`)
- ✅ Xem đơn hàng: `CargoOrders`
- ✅ Cập nhật vị trí: `LocationHistory`
- ✅ Thông tin xe: `Vehicles`

### Tính Năng Hệ Thống

- ✅ **Notifications**: Thông báo real-time cho tất cả roles
- ✅ **Reviews**: Đánh giá công ty, tài xế
- ✅ **Tracking**: Theo dõi vị trí xe real-time
- ✅ **Warehouse Management**: Quản lý kho hàng chuyên nghiệp

---

## 🚀 Hướng Dẫn Sử Dụng

### 1. Chạy Migrations

```bash
# Kết nối đến PostgreSQL database
psql "your-connection-string"

# Hoặc dùng GUI tool (pgAdmin, DBeaver, etc.)

# Chạy từng file theo thứ tự:
\i backend/migrations/001_create_users_table.sql
\i backend/migrations/005_create_logistics_company_tables.sql
\i backend/migrations/002_create_vehicles_table.sql
\i backend/migrations/007_create_drivers_table.sql
\i backend/migrations/003_create_cargo_orders.sql
\i backend/migrations/006_add_customer_to_cargo_orders.sql
\i backend/migrations/004_create_transactions_table.sql
\i backend/migrations/008_create_location_history_table.sql
\i backend/migrations/009_create_warehouse_operations_table.sql
\i backend/migrations/010_create_notifications_table.sql
\i backend/migrations/011_create_reviews_table.sql
```

### 2. Seed Dữ Liệu Mẫu

- `002_create_vehicles_table.sql` đã có dữ liệu mẫu
- Có thể thêm seed data cho `LogisticsCompany`, `CompanyAreas`, `CompanyRates` trong migration 005

### 3. Kiểm Tra

Sau khi chạy migrations, kiểm tra:

```sql
-- Kiểm tra các bảng đã tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Kiểm tra foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

## 📌 Lưu Ý Quan Trọng

1. **Thứ tự migration**: Phải chạy `005_create_logistics_company_tables.sql` **TRƯỚC** các migration khác vì nhiều bảng tham chiếu đến `LogisticsCompany`.

2. **Cập nhật CargoOrders**: Migration `006` chỉ thêm cột, không ảnh hưởng dữ liệu cũ.

3. **LocationHistory**: Bảng này sẽ có nhiều dữ liệu (theo dõi real-time), nên cần cleanup định kỳ hoặc partition theo thời gian.

4. **Notifications**: Có partial index cho thông báo chưa đọc, giúp truy vấn nhanh hơn.

5. **Reviews**: Có triggers tự động cập nhật rating trung bình của công ty và tài xế.

---

## 🔄 Cập Nhật Trong Tương Lai

Có thể cần thêm:
- Bảng `OrderStatusHistory` (lịch sử thay đổi trạng thái đơn hàng)
- Bảng `UserPreferences` (cài đặt người dùng)
- Bảng `PaymentMethods` (phương thức thanh toán)
- Bảng `DocumentFiles` (quản lý tài liệu, hóa đơn, v.v.)

---

**Tác giả**: Hệ thống Logistics VT  
**Ngày tạo**: 2025  
**Phiên bản**: 1.0

