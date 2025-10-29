# 🚀 Hướng Dẫn Test Webhook Nhanh

## ✅ Code Đã Hoàn Thiện

- ✅ Webhook handler đã sẵn sàng
- ✅ Script test đã được cải thiện
- ✅ Error handling đầy đủ

---

## 📋 Các Bước Test

### Bước 1: Tạo Đơn Hàng Test

1. **Vào frontend**: `http://localhost:5173`
2. **Tạo đơn hàng mới** (điền đầy đủ thông tin)
3. **Lấy `order_id`** từ đơn hàng vừa tạo
   - Xem trong URL: `/payment?orderId=123`
   - Hoặc trong database

### Bước 2: Test Webhook

**Cách 1: Dùng Script (Khuyến nghị)**

```powershell
# Tự động lấy URL từ ngrok
.\test-webhook.ps1 -OrderId 123 -Amount 100000 -AutoGetUrl

# Hoặc dùng URL cố định
.\test-webhook.ps1 -OrderId 123 -Amount 100000
```

**Cách 2: Manual Test**

```powershell
$body = @{
    order_id = YOUR_ORDER_ID
    amount = 100000
    transaction_code = "TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
    payment_method = "vietqr"
} | ConvertTo-Json -Compress

Invoke-RestMethod -Uri "https://your-ngrok-url.ngrok-free.app/api/sepay/webhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Bước 3: Kiểm Tra Kết Quả

#### ✅ Backend Logs (Terminal đang chạy backend)

Bạn sẽ thấy:
```
=== WEBHOOK RECEIVED FROM SEPAY ===
Time: 2025-01-XX...
Headers: {...}
Body: {...}
📋 Parsed values: { order_id: X, amount: Y, ... }
✅ Transaction saved: {...}
📦 Order updated: X rows
```

#### ✅ Response từ API

```json
{
  "ok": true,
  "success": true,
  "transaction_id": 123,
  "message": "Webhook processed successfully"
}
```

#### ✅ Database

```sql
-- Kiểm tra transaction
SELECT * FROM "Transactions" 
WHERE transaction_code LIKE 'TEST-%' 
ORDER BY created_at DESC LIMIT 1;

-- Kiểm tra order status
SELECT order_id, status, updated_at 
FROM "CargoOrders" 
WHERE order_id = YOUR_ORDER_ID;
```

**Kết quả mong đợi:**
- Transaction có `payment_status = 'SUCCESS'`
- Order status chuyển từ `DRAFT` → `SUBMITTED` hoặc `SUBMITTED` → `CONFIRMED`

---

## 🎯 Flow Hoàn Chỉnh

```
1. Bạn tạo đơn hàng mới
   ↓
2. Lấy order_id
   ↓
3. Test webhook với script
   ↓
4. Backend nhận webhook:
   - Lưu transaction SUCCESS
   - Cập nhật order status
   ↓
5. Kiểm tra database → Thấy transaction và order đã cập nhật
   ↓
6. ✅ Test thành công!
```

---

## 🐛 Troubleshooting

### Lỗi: Order ID không tồn tại

**Giải pháp:**
- Đảm bảo bạn dùng `order_id` thật từ database
- Tạo đơn hàng mới nếu chưa có

### Lỗi: Webhook không nhận được

**Kiểm tra:**
1. Backend có đang chạy không?
2. Ngrok có đang chạy không?
3. URL webhook có đúng không?

### Lỗi: Transaction không được lưu

**Kiểm tra:**
1. Database connection hoạt động?
2. Bảng `Transactions` đã tạo chưa?
3. Backend logs có error gì không?

---

## ✅ Checklist Test

- [ ] Đã tạo đơn hàng test
- [ ] Đã lấy `order_id` thật
- [ ] Đã test webhook với script
- [ ] Backend logs hiển thị "WEBHOOK RECEIVED"
- [ ] Response trả về `ok: true`
- [ ] Transaction được lưu vào database
- [ ] Order status được cập nhật

---

**Sau khi test thành công, hệ thống sẵn sàng nhận webhook từ Sepay khi thanh toán thật! 🎉**

