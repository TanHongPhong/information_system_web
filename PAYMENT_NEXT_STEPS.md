# 💳 Hướng Dẫn Tiếp Theo - Hệ Thống Thanh Toán

## ✅ Trạng Thái Hiện Tại

Dựa trên kiểm tra:
- ✅ SEPAY_ACCOUNT đã cấu hình
- ✅ SEPAY_BANK: VPBank
- ✅ BACKEND_URL (ngrok) đã có
- ✅ Backend webhook handler đã sẵn sàng
- ✅ Frontend PaymentPage có polling để check status
- ✅ QR code generation đã có

---

## 📋 Checklist - Các Bước Tiếp Theo

### Bước 1: Kiểm Tra Database Migrations ⭐ **BẮT BUỘC**

Đảm bảo các bảng sau đã được tạo:

```sql
-- Kiểm tra bảng Transactions
SELECT * FROM "Transactions" LIMIT 1;

-- Kiểm tra bảng CargoOrders
SELECT * FROM "CargoOrders" LIMIT 1;
```

**Nếu chưa có, chạy migrations:**
- `backend/migrations/004_create_transactions_table.sql`
- `backend/migrations/003_create_cargo_orders.sql`
- `backend/migrations/005_create_logistics_company_tables.sql`

---

### Bước 2: Cấu Hình Webhook trong Sepay Dashboard ⭐ **BẮT BUỘC**

1. **Truy cập Sepay Dashboard**: https://sepay.vn/dashboard
2. **Đăng nhập** tài khoản
3. **Vào phần Webhooks** hoặc **Tích hợp Webhook**
4. **Thêm Webhook mới:**
   - **URL**: `https://your-ngrok-url.ngrok-free.app/api/sepay/webhook`
     (Lấy từ file `.env` → `BACKEND_URL`)
   - **Method**: `POST`
   - **Events**: Chọn events thanh toán thành công
5. **Copy Webhook Secret** (nếu có)
6. **Cập nhật vào `.env`**:
   ```env
   SEPAY_WEBHOOK_SECRET=webhook_secret_from_sepay
   ```
7. **Restart backend** sau khi update

---

### Bước 3: Kiểm Tra QR Code Generation

Test QR code có generate đúng không:

```powershell
# Test API Sepay Config
Invoke-RestMethod -Uri "http://localhost:5001/api/sepay/config"
```

**Kết quả mong đợi:**
```json
{
  "account": "your_account",
  "bank": "VPBank",
  "qrTemplate": "compact"
}
```

---

### Bước 4: Test Flow Thanh Toán End-to-End

#### 4.1. Tạo Đơn Hàng Test

1. **Vào frontend**: `http://localhost:5173`
2. **Tạo đơn hàng mới**
3. **Lấy `order_id`**

#### 4.2. Kiểm Tra Payment Page

1. **Vào trang thanh toán** với `order_id` vừa tạo
2. **Kiểm tra:**
   - QR code hiển thị chưa?
   - Số tiền đúng chưa?
   - Countdown timer chạy chưa?

#### 4.3. Test Webhook Thủ Công (Trước khi thanh toán thật)

```powershell
$body = @{
    order_id = 123  # Thay bằng order_id thật
    amount = 100000
    transaction_code = "TEST-WEBHOOK-$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-ngrok-url.ngrok-free.app/api/sepay/webhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

**Kiểm tra:**
- Backend logs → Thấy "WEBHOOK RECEIVED"
- Database → Transaction được lưu
- Order status → Cập nhật từ DRAFT → SUBMITTED

#### 4.4. Test với Thanh Toán Thật

1. **Scan QR code** trên PaymentPage
2. **Thanh toán** qua app ngân hàng/Sepay
3. **Quan sát:**
   - Backend logs → Webhook được nhận
   - Frontend → Tự động chuyển sang trạng thái "success"
   - Database → Transaction status = SUCCESS

---

### Bước 5: Kiểm Tra Polling Status (Tự Động)

Frontend đã có polling để tự động check payment status mỗi 3 giây:

- Polling endpoint: `/api/transactions?order_id={id}&payment_status=SUCCESS`
- Nếu tìm thấy transaction với status SUCCESS → Tự động chuyển sang "success"
- Modal thành công hiển thị

**Kiểm tra console logs:**
```
[PaymentPage] Polling transaction status (attempt X) for order_id=123
[PaymentPage] Poll response: X transactions found
[PaymentPage] Payment confirmed! Transaction: {...}
```

---

## 🐛 Troubleshooting

### QR Code không hiển thị?

**Kiểm tra:**
1. Backend `/api/sepay/config` trả về đúng không?
2. `SEPAY_ACCOUNT` và `SEPAY_BANK` trong `.env` đúng chưa?
3. Console có lỗi JavaScript không?

### Webhook không nhận được?

**Kiểm tra:**
1. Ngrok đang chạy chưa?
2. URL trong Sepay Dashboard đúng chưa? (phải có `https://` và kết thúc `/api/sepay/webhook`)
3. Backend logs có log webhook không?
4. Xem ngrok dashboard: http://localhost:4040 → Xem requests đến webhook endpoint

### Transaction không được lưu?

**Kiểm tra:**
1. Database connection hoạt động chưa?
2. Bảng `Transactions` đã được tạo chưa?
3. Backend logs có lỗi khi insert không?

### Frontend không tự động chuyển sang success?

**Kiểm tra:**
1. Polling có chạy không? (xem console logs)
2. API `/api/transactions?order_id=X&payment_status=SUCCESS` trả về đúng không?
3. Transaction có được lưu với status SUCCESS không?

---

## 📝 Flow Hoàn Chỉnh

```
1. Khách hàng tạo đơn hàng
   ↓
2. Chuyển đến trang thanh toán
   ↓
3. Frontend fetch Sepay config → Generate QR code
   ↓
4. Khách hàng scan QR và thanh toán
   ↓
5. Sepay xử lý thanh toán
   ↓
6. Sepay gửi webhook về backend
   ↓
7. Backend nhận webhook:
   - Lưu transaction với status SUCCESS
   - Cập nhật order status: DRAFT → SUBMITTED → CONFIRMED
   ↓
8. Frontend polling detect transaction SUCCESS
   ↓
9. Frontend tự động chuyển sang trạng thái "success"
   ↓
10. Hiển thị modal thành công
```

---

## ✅ Checklist Hoàn Thành

- [ ] Database migrations đã chạy (Transactions, CargoOrders)
- [ ] Webhook URL đã được cấu hình trong Sepay Dashboard
- [ ] SEPAY_WEBHOOK_SECRET đã được thêm vào `.env` (nếu có)
- [ ] Backend đang chạy và kết nối database thành công
- [ ] Ngrok đang chạy và URL công khai
- [ ] Test webhook thủ công thành công
- [ ] QR code hiển thị đúng trên PaymentPage
- [ ] Test với thanh toán thật thành công
- [ ] Frontend polling hoạt động và tự động chuyển sang success

---

## 🎯 Ưu Tiên

1. **Quan trọng nhất**: Cấu hình webhook trong Sepay Dashboard ⭐
2. **Quan trọng**: Chạy database migrations ⭐
3. **Cần thiết**: Test webhook thủ công trước khi thanh toán thật
4. **Nên làm**: Test flow end-to-end với thanh toán thật

---

**Sau khi hoàn thành các bước trên, hệ thống thanh toán sẽ hoạt động tự động! 🎉**

