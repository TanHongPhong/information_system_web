# 🗄️ Hướng Dẫn Tinh Chỉnh Database

## 📋 Tổng Quan

File migration `025_optimize_database.sql` bao gồm các tối ưu hóa sau:

### ✅ Đã Tối Ưu

1. **Constraints** - Đảm bảo data integrity
2. **Indexes** - Tối ưu performance cho các query phổ biến
3. **Triggers** - Tự động cập nhật customer_id và updated_at
4. **Views** - Views hữu ích cho reporting
5. **Comments** - Documentation cho tất cả các cột quan trọng

---

## 🚀 Cách Chạy Migration

### Option 1: Chạy bằng Script (Khuyến nghị)

```bash
cd backend
node scripts/run_database_optimization.js
```

### Option 2: Chạy trực tiếp bằng psql

```bash
# Kết nối đến database
psql "your-connection-string"

# Chạy migration
\i migrations/025_optimize_database.sql
```

### Option 3: Chạy bằng GUI Tool (pgAdmin, DBeaver)

1. Mở file `backend/migrations/025_optimize_database.sql`
2. Copy toàn bộ nội dung
3. Paste vào SQL Editor
4. Execute

---

## 📊 Chi Tiết Các Tối Ưu

### 1. Constraints (Ràng Buộc Dữ Liệu)

#### ✅ `transactions_amount_check`
- Đảm bảo `amount >= 0` trong bảng Transactions
- Tránh số tiền âm

#### ✅ `cargoorders_weight_check`
- Đảm bảo `weight_kg >= 0` (nếu không NULL)
- Tránh trọng lượng âm

#### ✅ `cargoorders_volume_check`
- Đảm bảo `volume_m3 >= 0` (nếu không NULL)
- Tránh thể tích âm

---

### 2. Indexes (Tối Ưu Truy Vấn)

#### ✅ Composite Indexes

**`idx_cargo_orders_customer_status`**
- Tối ưu query: Tìm orders theo customer và status
- Ví dụ: `SELECT * FROM CargoOrders WHERE customer_id = ? AND status = ? ORDER BY created_at DESC`

**`idx_transactions_customer_status`**
- Tối ưu query: Tìm transactions theo customer và payment_status
- Ví dụ: `SELECT * FROM Transactions WHERE customer_id = ? AND payment_status = 'SUCCESS'`

**`idx_cargo_orders_company_status`**
- Tối ưu query: Tìm orders theo company và status (cho dashboard company)
- Ví dụ: `SELECT * FROM CargoOrders WHERE company_id = ? AND status = ?`

**`idx_cargo_orders_vehicle_status`**
- Tối ưu query: Tìm orders theo vehicle và status
- Ví dụ: `SELECT * FROM CargoOrders WHERE vehicle_id = ? AND status = ?`

**`idx_cargo_orders_customer_created`**
- Tối ưu query: Tìm orders theo customer và thời gian
- Ví dụ: `SELECT * FROM CargoOrders WHERE customer_id = ? ORDER BY created_at DESC`

**`idx_transactions_order_status`**
- Tối ưu query: Tìm transactions theo order và payment_status
- Ví dụ: `SELECT * FROM Transactions WHERE order_id = ? AND payment_status = ?`

---

### 3. Triggers (Tự Động Cập Nhật)

#### ✅ `trg_auto_update_transaction_customer_id`
- **Khi nào**: Trước khi INSERT hoặc UPDATE transaction
- **Làm gì**: Tự động lấy `customer_id` từ `CargoOrders` nếu transaction chưa có
- **Lợi ích**: Đảm bảo customer_id luôn được điền đúng

#### ✅ `trg_transactions_updated_at`
- **Khi nào**: Trước khi UPDATE transaction
- **Làm gì**: Tự động cập nhật `updated_at = CURRENT_TIMESTAMP`
- **Lợi ích**: Luôn có thời gian cập nhật chính xác

---

### 4. Views (Views Hữu Ích)

#### ✅ `v_orders_with_details`
- **Mục đích**: Tổng hợp thông tin order với customer, company, và vehicle
- **Sử dụng**: 
  ```sql
  SELECT * FROM v_orders_with_details WHERE customer_id = ?;
  ```

#### ✅ `v_transactions_with_details`
- **Mục đích**: Tổng hợp thông tin transaction với customer, order, và company
- **Sử dụng**: 
  ```sql
  SELECT * FROM v_transactions_with_details WHERE customer_id = ?;
  ```

#### ✅ `v_customer_order_stats`
- **Mục đích**: Thống kê orders theo customer
- **Các cột**:
  - `total_orders`: Tổng số đơn hàng
  - `pending_payment_orders`: Đơn chờ thanh toán
  - `paid_orders`: Đơn đã thanh toán
  - `completed_orders`: Đơn hoàn thành
  - `total_order_value`: Tổng giá trị đơn hàng
  - `completed_order_value`: Giá trị đơn đã hoàn thành
  - `first_order_date`: Ngày đặt đơn đầu tiên
  - `last_order_date`: Ngày đặt đơn cuối cùng
- **Sử dụng**: 
  ```sql
  SELECT * FROM v_customer_order_stats WHERE customer_id = ?;
  ```

---

### 5. Comments (Documentation)

Đã thêm comments cho tất cả các cột quan trọng trong:
- `Transactions` table
- `CargoOrders` table

Xem comments bằng:
```sql
SELECT 
    table_name,
    column_name,
    col_description((table_name::regclass)::oid, ordinal_position)
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('Transactions', 'CargoOrders')
ORDER BY table_name, ordinal_position;
```

---

## 🔍 Kiểm Tra Kết Quả

### 1. Kiểm tra Indexes

```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Transactions', 'CargoOrders')
ORDER BY tablename, indexname;
```

### 2. Kiểm tra Triggers

```sql
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('Transactions', 'CargoOrders');
```

### 3. Kiểm tra Views

```sql
SELECT 
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%';
```

### 4. Kiểm tra Constraints

```sql
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('Transactions', 'CargoOrders')
ORDER BY tc.table_name, tc.constraint_type;
```

---

## 📈 Performance Tips

### 1. Sử dụng Views cho Reporting

Thay vì JOIN nhiều bảng, dùng views:
```sql
-- Thay vì:
SELECT co.*, u.name, lc.company_name 
FROM "CargoOrders" co
LEFT JOIN users u ON co.customer_id = u.id
LEFT JOIN "LogisticsCompany" lc ON co.company_id = lc.company_id
WHERE co.customer_id = ?;

-- Dùng:
SELECT * FROM v_orders_with_details WHERE customer_id = ?;
```

### 2. Sử dụng Indexes hợp lý

Query sẽ tự động sử dụng indexes phù hợp. Đảm bảo:
- WHERE clause khớp với index
- ORDER BY khớp với index

### 3. Monitor Query Performance

```sql
-- Bật query logging
SET log_statement = 'all';
SET log_duration = on;

-- Xem slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🛠️ Maintenance

### 1. Analyze Tables (Cập nhật thống kê)

```sql
ANALYZE "Transactions";
ANALYZE "CargoOrders";
```

### 2. Vacuum (Dọn dẹp)

```sql
VACUUM ANALYZE "Transactions";
VACUUM ANALYZE "CargoOrders";
```

### 3. Reindex (Tối ưu indexes)

```sql
REINDEX TABLE "Transactions";
REINDEX TABLE "CargoOrders";
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Backup Database** trước khi chạy migration
2. **Test trên môi trường dev** trước khi chạy production
3. **Monitor performance** sau khi chạy migration
4. **Review indexes** định kỳ để đảm bảo vẫn tối ưu

---

## 🆘 Troubleshooting

### Lỗi: "relation already exists"
- Index/view/trigger đã tổn tại
- Migration sẽ tự động DROP và tạo lại (safe)

### Lỗi: "permission denied"
- Cần quyền CREATE INDEX, CREATE TRIGGER, CREATE VIEW
- Kiểm tra user role

### Lỗi: "check constraint violation"
- Có dữ liệu vi phạm constraint
- Kiểm tra và fix data trước khi chạy migration

---

## 📚 Tài Liệu Tham Khảo

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Index Best Practices](https://www.postgresql.org/docs/current/indexes.html)
- [Trigger Documentation](https://www.postgresql.org/docs/current/triggers.html)
- [View Documentation](https://www.postgresql.org/docs/current/views.html)

---

**Tác giả**: Database Optimization Script  
**Ngày tạo**: 2025  
**Phiên bản**: 1.0

