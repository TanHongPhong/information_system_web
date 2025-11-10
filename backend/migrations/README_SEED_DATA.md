# Hướng dẫn chạy Seed Data cho Multi-Company Logistics

## File: `045_seed_vt_logistics_test_data.sql`

### Mô tả
Script này tạo bộ dữ liệu test lớn cho nhiều công ty logistics với các đặc điểm:

- **Công ty**: 3 công ty (VT Logistics, FastShip Logistics, Central Express)
- **Admin**: Mỗi công ty có 1 tài khoản admin
- **Xe**: 60 xe đa dạng kích thước (Xe tải nhỏ, trung, lớn, Container, Đầu kéo, Xe lạnh) - thuộc VT Logistics
- **Tài xế**: 60 tài xế (mỗi xe 1 tài xế)
- **Đơn hàng**: 250 đơn hàng tuyến giữa 4 thành phố (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ)
- **Khách hàng**: 15 khách hàng (phân bổ đều đơn hàng)
- **Kho hàng**: 4 kho (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ)
- **Giao dịch**: 250 giao dịch (gán cho customer_id của đơn hàng tương ứng)
- **Quản lý kho**: 4 tài khoản (mỗi kho 1 người)

### Cách chạy

#### Option 1: Chạy trực tiếp với psql
```bash
psql -U your_username -d your_database -f backend/migrations/045_seed_vt_logistics_test_data.sql
```

#### Option 2: Chạy trong PostgreSQL client
```sql
\i backend/migrations/045_seed_vt_logistics_test_data.sql
```

#### Option 3: Copy-paste vào pgAdmin hoặc DBeaver
Mở file và chạy toàn bộ script.

### Lưu ý

1. **Phone Numbers**: Tất cả số điện thoại đã được tạo theo format hợp lệ: `^[0-9+][0-9\- ]{5,}$`
2. **Order IDs**: Tất cả order_id là 4 chữ số (1000-1249)
3. **Order Codes**: Format `GMD0000001`, `GMD0000002`, ...
4. **Transaction Codes**: Format `TXN-00000001`, `TXN-00000002`, ...
5. **License Plates**: Format `29A-00001`, `29A-00002`, ...
6. **Email**: Tất cả email là unique và case-insensitive (CITEXT)

### Dữ liệu được tạo

#### 1. Công ty
- **VT Logistics**: Công ty chính với 60 xe
- **FastShip Logistics**: Công ty vận tải miền Nam
- **Central Express**: Công ty vận tải miền Trung

#### 2. Tài khoản Admin
- **admin@vtlogistics.com**: Admin của VT Logistics
- **admin@fastship.com**: Admin của FastShip Logistics
- **admin@centralexpress.com**: Admin của Central Express

#### 3. Tài khoản người dùng
- **customer1@example.com** đến **customer15@example.com**: 15 khách hàng (phân bổ đều đơn hàng)
- **driver1@vtlogistics.com** đến **driver60@vtlogistics.com**: 60 tài xế
- **warehouse1@vtlogistics.com**: Quản lý kho Hà Nội
- **warehouse2@vtlogistics.com**: Quản lý kho TP.HCM
- **warehouse3@vtlogistics.com**: Quản lý kho Đà Nẵng
- **warehouse4@vtlogistics.com**: Quản lý kho Cần Thơ

#### 4. Xe và Tài xế
- 60 xe với biển số `29A-00001` đến `29A-00060`
- 6 loại xe: Xe tải nhỏ (1.5 tấn), Xe tải trung (3.5 tấn), Xe tải lớn (7.5 tấn), Container (20 tấn), Xe đầu kéo (15 tấn), Xe lạnh (5 tấn)
- Mỗi xe có 1 tài xế tương ứng

#### 5. Kho hàng
- **Kho Hà Nội**: 50,000 m³, 20 dock
- **Kho TP.HCM**: 60,000 m³, 25 dock
- **Kho Đà Nẵng**: 40,000 m³, 18 dock
- **Kho Cần Thơ**: 45,000 m³, 22 dock

#### 6. Đơn hàng
- 250 đơn hàng với order_id từ `1000` đến `1249`
- Tuyến đường: Ngẫu nhiên giữa 4 thành phố (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ)
- Trạng thái đa dạng: PENDING_PAYMENT, PAID, ACCEPTED, LOADING, IN_TRANSIT, WAREHOUSE_RECEIVED, COMPLETED
- **Phân bổ đều cho 15 khách hàng** (mỗi khách hàng có khoảng 16-17 đơn hàng)

#### 7. Giao dịch
- 250 giao dịch tương ứng với 250 đơn hàng
- **Gán cho customer_id của đơn hàng tương ứng** (không còn user12345)
- Payment methods: vietqr (40%), bank_transfer (30%), credit_card (30%)
- Payment status phụ thuộc vào order status

### Kiểm tra dữ liệu sau khi chạy

```sql
-- Kiểm tra công ty
SELECT * FROM "LogisticsCompany" WHERE company_name = 'VT Logistics';

-- Kiểm tra các công ty
SELECT company_id, company_name, status FROM "LogisticsCompany";

-- Kiểm tra số lượng admin
SELECT lc.company_name, COUNT(tca.admin_id) as admin_count
FROM "LogisticsCompany" lc
LEFT JOIN "TransportCompanyAdmin" tca ON lc.company_id = tca.company_id
GROUP BY lc.company_id, lc.company_name;

-- Kiểm tra số lượng xe
SELECT COUNT(*) FROM "Vehicles" WHERE company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics');

-- Kiểm tra số lượng đơn hàng
SELECT COUNT(*) FROM "CargoOrders" WHERE company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics');

-- Kiểm tra phân bổ đơn hàng theo khách hàng
SELECT 
  u.name as customer_name,
  u.email,
  COUNT(co.order_id) as order_count
FROM users u
INNER JOIN "CargoOrders" co ON u.id = co.customer_id
WHERE u.email LIKE 'customer%@example.com'
GROUP BY u.id, u.name, u.email
ORDER BY order_count DESC;

-- Kiểm tra đơn hàng theo tuyến đường
SELECT 
  CASE 
    WHEN pickup_address LIKE '%Hà Nội%' THEN 'Hà Nội'
    WHEN pickup_address LIKE '%TP.HCM%' THEN 'TP.HCM'
    WHEN pickup_address LIKE '%Đà Nẵng%' THEN 'Đà Nẵng'
    WHEN pickup_address LIKE '%Cần Thơ%' THEN 'Cần Thơ'
    ELSE 'Khác'
  END as pickup_city,
  CASE 
    WHEN dropoff_address LIKE '%Hà Nội%' THEN 'Hà Nội'
    WHEN dropoff_address LIKE '%TP.HCM%' THEN 'TP.HCM'
    WHEN dropoff_address LIKE '%Đà Nẵng%' THEN 'Đà Nẵng'
    WHEN dropoff_address LIKE '%Cần Thơ%' THEN 'Cần Thơ'
    ELSE 'Khác'
  END as delivery_city,
  COUNT(*) as count
FROM "CargoOrders"
WHERE company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics')
GROUP BY pickup_city, delivery_city
ORDER BY count DESC;

-- Kiểm tra số lượng kho
SELECT warehouse_name, address, status FROM "Warehouses" 
WHERE company_id = (SELECT company_id FROM "LogisticsCompany" WHERE company_name = 'VT Logistics');
```

### Xóa dữ liệu (nếu cần)

**CẨN THẬN**: Chỉ chạy trên môi trường test!

```sql
BEGIN;

-- Xóa theo thứ tự (tránh foreign key constraint)
DELETE FROM "Transactions" WHERE company_id IN (SELECT company_id FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express'));
DELETE FROM "CargoOrders" WHERE company_id IN (SELECT company_id FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express'));
DELETE FROM "Drivers" WHERE company_id IN (SELECT company_id FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express'));
DELETE FROM "Vehicles" WHERE company_id IN (SELECT company_id FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express'));
DELETE FROM "Warehouses" WHERE company_id IN (SELECT company_id FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express'));
DELETE FROM "TransportCompanyAdmin" WHERE company_id IN (SELECT company_id FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express'));
DELETE FROM users WHERE email LIKE '%@vtlogistics.com' OR email LIKE '%@fastship.com' OR email LIKE '%@centralexpress.com' OR email LIKE 'customer%@example.com';
DELETE FROM "LogisticsCompany" WHERE company_name IN ('VT Logistics', 'FastShip Logistics', 'Central Express');

COMMIT;
```

### Troubleshooting

1. **Lỗi duplicate key**: Script sử dụng `ON CONFLICT DO NOTHING`, nên có thể chạy lại an toàn
2. **Lỗi phone format**: Đảm bảo constraint `chk_users_phone_fmt` đã được tạo trong schema
3. **Lỗi order_id format**: Đảm bảo constraint `chk_order_id_format` đã được tạo
4. **Thời gian chạy**: Script có thể mất 1-2 phút để tạo 250 đơn hàng và giao dịch

