# Hướng dẫn Setup Warehouse

## Tổng quan

Migration này sẽ:
1. Tạo các kho hàng (Warehouses) cho các công ty logistics
2. Seed dữ liệu warehouse operations từ CargoOrders
3. Cập nhật role check để cho phép 'warehouse'
4. Tạo tài khoản warehouse (cần chạy script Node.js)

## Các bước thực hiện

### Bước 1: Chạy Migration SQL

Copy toàn bộ nội dung từ file `backend/migrations/028_create_warehouse_data_and_accounts.sql` và chạy trên Neon SQL Editor.

Migration này sẽ:
- ✅ Tạo các kho hàng cho mỗi công ty logistics
- ✅ Seed dữ liệu warehouse operations từ các đơn hàng hiện có
- ✅ Cập nhật role check để cho phép 'warehouse'
- ✅ Tự động fix order_id type nếu cần (INTEGER → VARCHAR(4))

### Bước 2: Tạo tài khoản warehouse

Chạy script Node.js để tạo tài khoản warehouse với password đã hash:

```bash
cd backend
node scripts/create_warehouse_accounts.js
```

Script sẽ tạo 5 tài khoản warehouse:
1. warehouse1@warehouse.com / warehouse123
2. warehouse2@warehouse.com / warehouse123
3. warehouse3@warehouse.com / warehouse123
4. kho1@vtlogistics.com / warehouse123
5. kho1@gemadept.com / warehouse123

### Bước 3: Kiểm tra kết quả

Chạy các query sau trên Neon Database để kiểm tra:

```sql
-- Kiểm tra warehouses
SELECT * FROM "Warehouses";

-- Kiểm tra warehouse operations
SELECT COUNT(*) FROM "WarehouseOperations";

-- Kiểm tra warehouse accounts
SELECT email, name, role FROM users WHERE role = 'warehouse';
```

## Danh sách tài khoản warehouse

| Email | Password | Ghi chú |
|-------|----------|---------|
| warehouse1@warehouse.com | warehouse123 | Warehouse chung |
| warehouse2@warehouse.com | warehouse123 | Warehouse chung |
| warehouse3@warehouse.com | warehouse123 | Warehouse chung |
| kho1@vtlogistics.com | warehouse123 | VT Logistics warehouse |
| kho1@gemadept.com | warehouse123 | Gemadept Logistics warehouse |

## API Endpoints

Sau khi setup, các API endpoints sau sẽ hoạt động:

- `GET /api/warehouse/operations` - Lấy danh sách warehouse operations
- `GET /api/warehouse/kpis` - Lấy KPI thống kê
- `POST /api/warehouse/scan-qr` - Xử lý QR code scan
- `POST /api/warehouse/update-operation` - Cập nhật warehouse operation

## Cấu trúc dữ liệu

### Warehouses
- `warehouse_id` - ID kho
- `company_id` - ID công ty logistics
- `warehouse_name` - Tên kho
- `address` - Địa chỉ
- `dock_count` - Số cổng kho (D1-D6)

### WarehouseOperations
- `operation_id` - ID operation
- `order_id` - ID đơn hàng (VARCHAR(4))
- `warehouse_id` - ID kho
- `operation_type` - Loại: IN, OUT, TRANSFER, RETURN
- `quantity_pallets` - Số pallets
- `weight_kg` - Khối lượng (kg)
- `dock_number` - Cổng kho (D1-D6)
- `carrier_vehicle` - Biển số xe
- `temperature_category` - Nhiệt độ: Thường, Mát, Lạnh, Đông lạnh
- `status` - Trạng thái: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

## Lưu ý

1. Migration 028 sẽ tự động fix `order_id` type từ INTEGER sang VARCHAR(4) nếu cần
2. Dữ liệu warehouse operations được seed từ các đơn hàng có status: WAREHOUSE_RECEIVED, IN_TRANSIT, LOADING
3. Mỗi công ty logistics sẽ có 1 warehouse mặc định
4. Dock number được tự động gán (D1-D6) dựa trên order_id


