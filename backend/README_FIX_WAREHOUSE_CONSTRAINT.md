# 🔧 Hướng dẫn sửa lỗi: "violates check constraint CargoOrders_status_check" cho Warehouse Status

## ❌ Lỗi
```
new row for relation "CargoOrders" violates check constraint "CargoOrders_status_check"
Error: new row for relation "CargoOrders" violates check constraint "CargoOrders_status_check"
```

## 🔍 Nguyên nhân
Constraint `CargoOrders_status_check` trong database chưa có các giá trị warehouse status:
- `WAREHOUSE_RECEIVED`
- `WAREHOUSE_STORED`
- `WAREHOUSE_OUTBOUND`

Nhưng code đang cố gắng cập nhật order với các status này.

## ✅ Giải pháp

### Cách 1: Chạy script sửa nhanh (Khuyến nghị) ⚡

1. Mở **Database SQL Editor** (Neon, pgAdmin, DBeaver, hoặc bất kỳ tool nào)
2. Copy toàn bộ nội dung file `backend/fix_warehouse_constraint_now.sql`
3. Paste và chạy trong SQL Editor
4. ✅ Xong! Bây giờ có thể cập nhật order với warehouse status

### Cách 2: Chạy migration đầy đủ

1. Mở **Database SQL Editor**
2. Copy toàn bộ nội dung file `backend/migrations/053_fix_warehouse_status_constraint.sql`
3. Paste và chạy trong SQL Editor
4. Migration sẽ tự động:
   - Xóa constraint cũ
   - Thêm constraint mới với tất cả warehouse statuses
   - Verify constraint đã được tạo

## 🧪 Kiểm tra sau khi sửa

Chạy query này để kiểm tra constraint:

```sql
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'CargoOrders_status_check';
```

Kết quả phải có các status sau trong `check_clause`:
- `PENDING_PAYMENT`
- `PAID`
- `ACCEPTED`
- `LOADING`
- `IN_TRANSIT`
- `WAREHOUSE_RECEIVED` ✅
- `WAREHOUSE_STORED` ✅
- `WAREHOUSE_OUTBOUND` ✅
- `COMPLETED`

## 📝 Lưu ý

- Script `fix_warehouse_constraint_now.sql` là cách nhanh nhất để sửa lỗi
- Sau khi sửa, có thể cập nhật order với các warehouse status
- Không ảnh hưởng đến dữ liệu hiện có
- Chỉ cần chạy 1 lần

## 🔄 Workflow sau khi sửa

1. **Nhập kho**: `WAREHOUSE_RECEIVED` → `WAREHOUSE_STORED` ✅
2. **Xuất kho**: `WAREHOUSE_STORED` → `COMPLETED` ✅
3. **Xem đơn hàng tại kho**: Hiển thị đơn hàng với status `WAREHOUSE_STORED` ✅

