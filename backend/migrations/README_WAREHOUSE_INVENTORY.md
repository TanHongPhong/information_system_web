# Hướng dẫn Setup Warehouse Inventory

## Tổng quan

Migration này tạo bảng `WarehouseInventory` để lưu trữ hàng hóa trong từng kho riêng với các trạng thái chi tiết.

## Cấu trúc bảng WarehouseInventory

### Các trạng thái hàng hóa:
- **INCOMING**: Đang nhập kho (đã quét QR, đang xử lý)
- **STORED**: Đã lưu kho (đã kiểm tra và lưu vào vị trí)
- **OUTGOING**: Đang xuất kho (đã chuẩn bị, đang chờ xuất)
- **SHIPPED**: Đã xuất kho hoàn tất (đã lên xe, rời kho)

### Các trường chính:
- `inventory_id` - ID inventory
- `order_id` - ID đơn hàng
- `warehouse_id` - ID kho
- `status` - Trạng thái (INCOMING, STORED, OUTGOING, SHIPPED)
- `location_in_warehouse` - Vị trí trong kho (ví dụ: A-01-02)
- `quantity_pallets` - Số pallets
- `weight_kg` - Khối lượng (kg)
- `volume_m3` - Thể tích (m³)
- `temperature_category` - Nhiệt độ (Thường, Mát, Lạnh, Đông lạnh)
- `entered_at` - Thời gian nhập kho
- `stored_at` - Thời gian lưu kho
- `shipped_at` - Thời gian xuất kho

## Các bước thực hiện

### Bước 1: Chạy Migration SQL

Copy toàn bộ nội dung từ file `backend/migrations/029_create_warehouse_inventory_table.sql` và chạy trên Neon SQL Editor.

Migration này sẽ:
- ✅ Tạo bảng `WarehouseInventory`
- ✅ Tạo indexes để tối ưu query
- ✅ Tạo triggers để tự động cập nhật timestamps
- ✅ Tạo trigger để tự động cập nhật `available_capacity_m3` của warehouse
- ✅ Seed dữ liệu mẫu từ `WarehouseOperations`

## API Endpoints

Sau khi setup, các API endpoints sau sẽ hoạt động:

### GET /api/warehouse/inventory
Lấy danh sách hàng hóa trong kho
- Query params: `warehouse_id`, `status`, `location`, `limit`, `offset`

### POST /api/warehouse/inventory/create
Tạo inventory mới khi nhập kho
- Body: `order_id`, `warehouse_id`, `location_in_warehouse`, `quantity_pallets`, `weight_kg`, `volume_m3`, `temperature_category`, `entered_by`, `notes`

### POST /api/warehouse/inventory/update-status
Cập nhật trạng thái inventory
- Body: `inventory_id` hoặc `order_id`, `status`, `location_in_warehouse`, `stored_by`, `shipped_by`, `notes`

## Luồng hoạt động

1. **Quét QR nhập kho** → Tạo inventory với status `INCOMING`
2. **Kiểm tra và lưu vào vị trí** → Cập nhật status `STORED` + set `location_in_warehouse`
3. **Chuẩn bị xuất kho** → Cập nhật status `OUTGOING`
4. **Đã lên xe và rời kho** → Cập nhật status `SHIPPED`

## Tự động cập nhật capacity

Khi inventory status thay đổi:
- `STORED` → Giảm `available_capacity_m3` của warehouse
- `SHIPPED` → Tăng `available_capacity_m3` của warehouse

## Ví dụ sử dụng

### Tạo inventory khi nhập kho:
```javascript
await warehouseAPI.createInventory(
  '1234',           // order_id
  1,                // warehouse_id
  'A-01-02',        // location_in_warehouse
  10,               // quantity_pallets
  500,              // weight_kg
  5.5,              // volume_m3
  'Thường',         // temperature_category
  'Nguyễn Văn A',   // entered_by
  'Nhập từ kho HCM'  // notes
);
```

### Cập nhật status sang STORED:
```javascript
await warehouseAPI.updateInventoryStatus(
  inventory_id,
  null,              // order_id (nếu không có inventory_id)
  'STORED',          // status
  'A-01-02',         // location_in_warehouse
  'Trần Thị B',      // stored_by
  null,              // shipped_by
  'Đã kiểm tra và lưu vào vị trí'
);
```

## Lưu ý

1. Mỗi đơn hàng có thể có nhiều inventory records nếu được chuyển kho
2. Status tự động cập nhật timestamps (`stored_at`, `shipped_at`)
3. Capacity của warehouse tự động cập nhật khi status thay đổi
4. Inventory được seed từ `WarehouseOperations` nếu có dữ liệu sẵn

