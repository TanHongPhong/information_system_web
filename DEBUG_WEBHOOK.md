# 🐛 Debug Webhook Không Nhận Được

## ❌ Vấn Đề

Đã chuyển tiền nhưng webhook không được nhận.

---

## 🔍 Các Bước Kiểm Tra

### Bước 1: Kiểm Tra Ngrok ⭐ **QUAN TRỌNG**

Ngrok phải đang chạy và có URL công khai.

**Kiểm tra:**
```powershell
# Mở http://localhost:4040 trong browser
# Hoặc
Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels"
```

**Nếu ngrok không chạy:**
```powershell
ngrok http 5001
```

**Lưu ý:**
- Ngrok URL sẽ thay đổi mỗi lần restart (trừ khi dùng static domain)
- Nếu ngrok restart → URL thay đổi → Cần update lại trong Sepay Dashboard

---

### Bước 2: Kiểm Tra Backend

Backend phải đang chạy và accessible qua ngrok.

**Kiểm tra:**
```powershell
# Test backend local
Invoke-RestMethod -Uri "http://localhost:5001/api/test"

# Test qua ngrok (thay YOUR_URL)
Invoke-RestMethod -Uri "https://your-ngrok-url.ngrok-free.app/api/test"
```

**Nếu backend không chạy:**
```powershell
cd backend
npm start
```

---

### Bước 3: Kiểm Tra Webhook URL trong Sepay Dashboard ⭐ **QUAN TRỌNG NHẤT**

**URL phải chính xác:**

1. **Truy cập**: https://sepay.vn/dashboard
2. **Vào Webhooks** → Xem webhook URL
3. **Kiểm tra:**
   - ✅ URL có dạng: `https://your-ngrok-url.ngrok-free.app/api/sepay/webhook`
   - ✅ URL có `https://` (không phải `http://`)
   - ✅ URL không có trailing slash: `/api/sepay/webhook` (không có `/` ở cuối)
   - ✅ URL khớp với ngrok URL hiện tại

**Nếu URL sai:**
- Update lại webhook URL trong Sepay Dashboard
- Lấy URL từ ngrok: http://localhost:4040 → Copy URL

---

### Bước 4: Kiểm Tra Ngrok Requests

**Xem có request đến webhook không:**

1. **Mở**: http://localhost:4040
2. **Xem tab "Requests"**
3. **Tìm requests đến `/api/sepay/webhook`**

**Nếu không có request:**
- Sepay chưa gửi webhook
- Nguyên nhân có thể:
  - URL trong Sepay Dashboard sai
  - Sepay chưa xử lý thanh toán
  - Sepay có delay

**Nếu có request nhưng lỗi:**
- Xem response status code
- Xem response body
- Kiểm tra backend logs

---

### Bước 5: Kiểm Tra Backend Logs

**Xem terminal đang chạy backend:**

**Nếu thấy:**
```
=== WEBHOOK RECEIVED FROM SEPAY ===
```
→ ✅ Webhook đã đến backend

**Nếu không thấy:**
→ ❌ Webhook chưa đến → Kiểm tra các bước trên

**Nếu thấy error:**
→ Xem error message và sửa

---

### Bước 6: Kiểm Tra Sepay Thanh Toán Có Thành Công Không

**Xem trong Sepay Dashboard:**
1. Vào **Transactions** hoặc **Lịch sử giao dịch**
2. Kiểm tra transaction vừa chuyển:
   - Status: SUCCESS/COMPLETED?
   - Có thông tin transaction không?

**Nếu transaction chưa thành công:**
- Sepay không gửi webhook vì thanh toán chưa hoàn tất

---

### Bước 7: Test Webhook Thủ Công

**Đảm bảo webhook endpoint hoạt động:**

```powershell
.\test-webhook.ps1 -OrderId YOUR_ORDER_ID -Amount 100000 -AutoGetUrl
```

**Nếu test thành công:**
- Webhook endpoint OK
- Vấn đề có thể ở Sepay hoặc URL configuration

**Nếu test thất bại:**
- Sửa lỗi backend trước

---

## 🎯 Checklist Debug

- [ ] Ngrok đang chạy và có URL công khai
- [ ] Backend đang chạy và accessible
- [ ] URL trong Sepay Dashboard khớp với ngrok URL hiện tại
- [ ] URL có đúng format: `https://...ngrok-free.app/api/sepay/webhook`
- [ ] Transaction trong Sepay đã SUCCESS
- [ ] Ngrok dashboard có request đến webhook (http://localhost:4040)
- [ ] Backend logs có "WEBHOOK RECEIVED"
- [ ] Test webhook thủ công thành công

---

## 🐛 Các Nguyên Nhân Thường Gặp

### 1. Ngrok URL Đã Thay Đổi

**Triệu chứng:**
- Ngrok restart → URL mới
- Sepay vẫn gửi đến URL cũ

**Giải pháp:**
- Update webhook URL trong Sepay Dashboard

### 2. Ngrok Warning Page

**Triệu chứng:**
- Sepay không verify được URL (403/404)

**Giải pháp:**
- Dùng ngrok authtoken để bypass warning

### 3. Backend Không Chạy

**Triệu chứng:**
- Ngrok có request nhưng timeout/error

**Giải pháp:**
- Start backend: `cd backend && npm start`

### 4. URL Format Sai

**Triệu chứng:**
- Sepay báo "URL không hợp lệ"

**Giải pháp:**
- Kiểm tra format: `https://domain/path` (không có space, trailing slash)

### 5. Sepay Chưa Xử Lý Thanh Toán

**Triệu chứng:**
- Transaction chưa SUCCESS trong Sepay Dashboard

**Giải pháp:**
- Đợi Sepay xử lý
- Kiểm tra Sepay Dashboard

### 6. Webhook Secret Sai (Nếu có)

**Triệu chứng:**
- Webhook đến nhưng bị reject với 401

**Giải pháp:**
- Kiểm tra SEPAY_WEBHOOK_SECRET trong `.env`
- Restart backend sau khi update

---

## 💡 Hành Động Ngay

1. **Kiểm tra ngrok có chạy không**: http://localhost:4040
2. **Lấy ngrok URL hiện tại**
3. **So sánh với URL trong Sepay Dashboard**
4. **Update nếu khác nhau**
5. **Xem ngrok requests có đến `/api/sepay/webhook` không**
6. **Xem backend logs có nhận được webhook không**

---

**Sau khi kiểm tra, bạn sẽ biết chính xác vấn đề ở đâu!**

