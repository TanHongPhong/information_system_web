# Hướng dẫn Setup Warehouse theo Khu vực

## Tổng quan

Migration này sẽ:
1. Xóa tất cả tài khoản warehouse cũ
2. Tạo warehouse mới cho từng khu vực (HCM, Cần Thơ, Đà Nẵng, Hà Nội)
3. Tạo tài khoản user cho mỗi warehouse với warehouse_id link
4. Tự động filter đơn hàng theo warehouse_id của user đang login

## Các bước thực hiện

### Bước 1: Chạy Migration SQL

Copy toàn bộ nội dung từ file `backend/migrations/039_create_regional_warehouse_accounts.sql` và chạy trên Neon SQL Editor.

Migration này sẽ:
- ✅ Thêm cột `warehouse_id` vào bảng `users`
- ✅ Xóa tất cả tài khoản warehouse cũ
- ✅ Tạo 4 warehouse mới cho HCM, Cần Thơ, Đà Nẵng, Hà Nội
- ✅ Cập nhật WarehouseOperations và WarehouseInventory để gắn với warehouse theo khu vực

### Bước 2: Tạo tài khoản warehouse

Chạy script Node.js để tạo tài khoản warehouse với password đã hash:

```bash
cd backend
node scripts/create_regional_warehouse_accounts.js
```

Script sẽ tạo 4 tài khoản warehouse:
1. `kho.hcm@warehouse.com` / `warehouse123` → Kho HCM
2. `kho.cantho@warehouse.com` / `warehouse123` → Kho Cần Thơ
3. `kho.danang@warehouse.com` / `warehouse123` → Kho Đà Nẵng
4. `kho.hanoi@warehouse.com` / `warehouse123` → Kho Hà Nội

### Bước 3: Kiểm tra kết quả

Chạy các query sau trên Neon Database để kiểm tra:

```sql
-- Kiểm tra warehouses
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  w.address,
  get_region_from_address(w.address) as region,
  w.status
FROM "Warehouses" w
WHERE w.company_id IS NULL
ORDER BY w.warehouse_id;

-- Kiểm tra warehouse accounts
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.warehouse_id,
  w.warehouse_name
FROM users u
LEFT JOIN "Warehouses" w ON u.warehouse_id = w.warehouse_id
WHERE u.role = 'warehouse'
ORDER BY u.warehouse_id;
```

## Danh sách tài khoản warehouse

| Email | Password | Warehouse | Khu vực |
|-------|----------|-----------|---------|
| kho.hcm@warehouse.com | warehouse123 | Kho HCM | HCM |
| kho.cantho@warehouse.com | warehouse123 | Kho Cần Thơ | Cần Thơ |
| kho.danang@warehouse.com | warehouse123 | Kho Đà Nẵng | Đà Nẵng |
| kho.hanoi@warehouse.com | warehouse123 | Kho Hà Nội | Hà Nội |

## Logic tự động filter

Sau khi login, mỗi warehouse user sẽ tự động chỉ thấy đơn hàng của warehouse của mình:

- **GET /api/warehouse/operations** - Tự động filter theo warehouse_id của user
- **GET /api/warehouse/inventory** - Tự động filter theo warehouse_id của user
- **GET /api/warehouse/kpis** - Tự động filter theo warehouse_id của user

Warehouse_id được lấy từ JWT token (được thêm vào khi login).

## Cấu trúc Database

### Bảng `users`
- Thêm cột `warehouse_id` (INTEGER, nullable, foreign key → Warehouses)
- Chỉ user có `role = 'warehouse'` mới có `warehouse_id`

### Bảng `Warehouses`
- Tạo 4 warehouse mới với `company_id = NULL` (không gắn với company cụ thể)
- Mỗi warehouse được gắn với một khu vực cụ thể (HCM, Cần Thơ, Đà Nẵng, Hà Nội)

## Lưu ý

1. **Xóa warehouse cũ**: Migration mặc định KHÔNG xóa các warehouse cũ (để giữ lại dữ liệu). Nếu muốn xóa hết warehouse cũ, uncomment phần xóa trong migration.

2. **Cập nhật đơn hàng**: Migration sẽ tự động cập nhật `WarehouseOperations` và `WarehouseInventory` để gắn với warehouse mới dựa trên `dropoff_address` của đơn hàng.

3. **JWT Token**: Khi warehouse user login, `warehouse_id` sẽ được thêm vào JWT token để các API có thể tự động filter.

4. **Backward Compatibility**: Nếu user không có `warehouse_id` trong token, API vẫn hoạt động bình thường (không filter).

