# 🔧 Hướng dẫn sửa lỗi: "violates check constraint CargoOrders_status_check"

## ❌ Lỗi
```
new row for relation "CargoOrders" violates check constraint "CargoOrders_status_check"
```

## 🔍 Nguyên nhân
Constraint `CargoOrders_status_check` trong database chưa có giá trị `PENDING_PAYMENT`, nhưng code đang cố gắng tạo order với status `PENDING_PAYMENT`.

## ✅ Giải pháp

### Cách 1: Chạy script sửa nhanh (Khuyến nghị)
1. Mở **Neon SQL Editor** (https://console.neon.tech)
2. Copy toàn bộ nội dung file `backend/fix_constraint_now.sql`
3. Paste và chạy trong SQL Editor
4. ✅ Xong! Bây giờ có thể tạo order mới

### Cách 2: Chạy migration đầy đủ
1. Mở **Neon SQL Editor**
2. Copy toàn bộ nội dung file `backend/migrations/013_add_pending_payment_status.sql`
3. Paste và chạy trong SQL Editor
4. Migration sẽ tự động:
   - Xóa constraint cũ
   - Thêm constraint mới với `PENDING_PAYMENT`
   - Tạo index và function cleanup

### Cách 3: Chạy migration mới (nếu cách 1, 2 không được)
1. Mở **Neon SQL Editor**
2. Copy toàn bộ nội dung file `backend/migrations/014_fix_pending_payment_constraint.sql`
3. Paste và chạy trong SQL Editor

## 🧪 Kiểm tra sau khi sửa

Chạy query này để kiểm tra constraint:
```sql
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'cargoorders_status_check';
```

Kết quả phải có `PENDING_PAYMENT` trong `check_clause`.

## 📝 Lưu ý
- Script `fix_constraint_now.sql` là cách nhanh nhất để sửa lỗi
- Sau khi sửa, tất cả order mới sẽ có status `PENDING_PAYMENT` khi chưa thanh toán
- Order sẽ tự động bị xóa sau 15 phút nếu không thanh toán (nếu đã chạy migration 013)

