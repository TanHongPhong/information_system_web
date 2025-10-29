# 🧪 Test Webhook Sepay - Các Bước Tiếp Theo

## ✅ Đã Hoàn Thành

- ✅ Webhook đã được cấu hình trong Sepay Dashboard
- ✅ SEPAY_WEBHOOK_SECRET đã có trong `.env`

---

## 📋 Bước Tiếp Theo

### Bước 1: Restart Backend ⭐ **BẮT BUỘC**

Sau khi cập nhật `.env`, cần restart backend để load config mới:

```powershell
# Trong terminal đang chạy backend
Ctrl+C

# Chạy lại
cd backend
npm start
```

**Kiểm tra:**
- Backend logs → Xem có thông báo load Sepay config không
- Không có error về `.env`

---

### Bước 2: Kiểm Tra Database Migrations ⭐ **BẮT BUỘC**

Đảm bảo các bảng đã được tạo:

```sql
-- Kiểm tra bảng Transactions
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'Transactions'
);

-- Kiểm tra bảng CargoOrders
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'CargoOrders'
);
```

**Nếu chưa có, chạy migrations:**
- `backend/migrations/004_create_transactions_table.sql`
- `backend/migrations/003_create_cargo_orders.sql`

---

### Bước 3: Test Webhook Thủ Công 🧪

Test webhook trước khi thanh toán thật:

#### Cách 1: Dùng Script Test (PowerShell)

```powershell
.\test-webhook.ps1 -OrderId 123 -Amount 100000
```

#### Cách 2: Manual Test

```powershell
$body = @{
    order_id = 123  # Thay bằng order_id thật
    amount = 100000
    transaction_code = "TEST-WEBHOOK-$(Get-Date -Format 'yyyyMMddHHmmss')"
    payment_method = "vietqr"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-ngrok-url.ngrok-free.app/api/sepay/webhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

**Kiểm tra sau test:**
1. ✅ Backend logs → Xem "WEBHOOK RECEIVED FROM SEPAY"
2. ✅ Database → Transaction được lưu với status SUCCESS
3. ✅ Order status → Cập nhật từ DRAFT → SUBMITTED

---

### Bước 4: Test với Thanh Toán Thật 💳

1. **Tạo đơn hàng test:**
   - Vào frontend: `http://localhost:5173`
   - Tạo đơn hàng mới
   - Lấy `order_id`

2. **Vào trang thanh toán:**
   - URL: `/payment?orderId={order_id}`
   - Kiểm tra QR code hiển thị đúng

3. **Thanh toán:**
   - Scan QR code bằng app ngân hàng/Sepay
   - Thanh toán (hoặc test mode nếu có)

4. **Quan sát tự động:**
   - **Backend logs:** Webhook được nhận
   - **Database:** Transaction được lưu
   - **Frontend:** Tự động chuyển sang "success" (polling)

---

## 🔍 Kiểm Tra Chi Tiết

### 1. Backend Logs

Khi webhook được nhận, backend sẽ log:
```
=== WEBHOOK RECEIVED FROM SEPAY ===
Time: 2025-01-XX...
Headers: {...}
Body: {...}
📋 Parsed values: { order_id: X, amount: Y, ... }
✅ Transaction saved: {...}
📦 Order updated: X rows
```

### 2. Database Check

```sql
-- Xem transaction mới nhất
SELECT 
  transaction_id,
  order_id,
  amount,
  payment_status,
  transaction_code,
  paid_at,
  created_at
FROM "Transactions"
ORDER BY created_at DESC
LIMIT 5;

-- Xem order đã được cập nhật
SELECT 
  order_id,
  status,
  updated_at
FROM "CargoOrders"
WHERE order_id = YOUR_ORDER_ID;
```

### 3. Frontend Polling

Frontend tự động poll mỗi 3 giây:
- Check `/api/transactions?order_id={id}&payment_status=SUCCESS`
- Nếu tìm thấy → Tự động chuyển sang success
- Xem console logs để verify

---

## 🐛 Troubleshooting

### Webhook không nhận được?

**Kiểm tra:**
1. Ngrok đang chạy chưa?
2. URL trong Sepay Dashboard đúng chưa?
3. Backend có đang chạy không?
4. Xem ngrok dashboard: http://localhost:4040

### Transaction không được lưu?

**Kiểm tra:**
1. Database connection hoạt động?
2. Bảng `Transactions` đã tạo chưa?
3. Backend logs có lỗi gì không?

### Frontend không tự động chuyển success?

**Kiểm tra:**
1. Polling có chạy không? (console logs)
2. Transaction có status SUCCESS không?
3. API `/api/transactions` trả về đúng không?

---

## ✅ Checklist Hoàn Thành

- [ ] Backend đã restart sau khi update `.env`
- [ ] Database migrations đã chạy
- [ ] Test webhook thủ công thành công
- [ ] Backend logs hiển thị webhook received
- [ ] Transaction được lưu vào database
- [ ] Order status tự động cập nhật
- [ ] Frontend polling hoạt động
- [ ] Test với thanh toán thật thành công

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành, hệ thống sẽ **TỰ ĐỘNG**:
- ✅ Nhận webhook từ Sepay
- ✅ Lưu transaction vào database
- ✅ Cập nhật order status
- ✅ Frontend tự động detect và hiển thị success

**Không cần làm gì thêm - mọi thứ tự động! 🎉**

---

**Bắt đầu từ Bước 1: Restart Backend!**

