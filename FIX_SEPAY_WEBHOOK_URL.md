# 🔧 Sửa Lỗi "URL Không Hợp Lệ" khi Cấu Hình Sepay Webhook

## ❌ Vấn Đề

Sepay Dashboard báo "URL không hợp lệ" khi điền webhook URL.

## 🔍 Nguyên Nhân Có Thể

1. **Ngrok Warning Page** ⭐ **NHIỀU KHẢ NĂNG NHẤT**
   - Ngrok-free có warning page khiến Sepay không verify được URL
   - Sepay thử test request nhưng bị chặn bởi warning page

2. **URL Format**
   - URL có khoảng trắng hoặc ký tự đặc biệt
   - URL không có HTTPS
   - URL có trailing slash không cần thiết

3. **SSL Certificate**
   - Sepay yêu cầu SSL valid, ngrok có thể có issue

4. **Domain Verification**
   - Sepay có thể yêu cầu domain được verify

## ✅ Giải Pháp

### Giải Pháp 1: Bypass Ngrok Warning Page (Quan Trọng)

Ngrok có warning page, Sepay không thể test được. Có 2 cách:

#### Cách A: Dùng Ngrok Header (Nếu Sepay hỗ trợ)

Nếu Sepay Dashboard có option thêm headers, thêm:
```
ngrok-skip-browser-warning: true
```

#### Cách B: Dùng Ngrok Authtoken (Tốt nhất)

1. Đăng ký ngrok account miễn phí: https://dashboard.ngrok.com
2. Lấy authtoken từ dashboard
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTHTOKEN
   ```
4. Restart ngrok:
   ```bash
   ngrok http 5001
   ```
5. Ngrok authenticated sẽ không có warning page

### Giải Pháp 2: Kiểm Tra Format URL

**URL ĐÚNG:**
```
https://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook
```

**Các dạng SAI:**
- ❌ `http://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook` (thiếu s)
- ❌ `https://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook/` (trailing slash)
- ❌ `https://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook ` (có space cuối)
- ❌ `https://understatedly-unspeakable-tamala.ngrok-free.dev /api/sepay/webhook` (có space)

### Giải Pháp 3: Test URL Trước Khi Điền

1. Mở browser → Paste URL webhook
2. Nếu thấy ngrok warning page → Cần bypass (xem Giải pháp 1)
3. Nếu thấy backend response → URL OK

### Giải Pháp 4: Thử Các Format Khác Nhau

Nếu Sepay vẫn không chấp nhận, thử:

**Format 1 (Full path - Khuyến nghị):**
```
https://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook
```

**Format 2 (Nếu Sepay yêu cầu trailing slash):**
```
https://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook/
```

**Format 3 (Nếu Sepay không cần /api):**
```
https://understatedly-unspeakable-tamala.ngrok-free.dev/sepay/webhook
```

### Giải Pháp 5: Liên Hệ Sepay Support

Nếu tất cả trên không được:
1. Liên hệ Sepay support
2. Hỏi: "Webhook URL requirements là gì?"
3. Hỏi: "Có hỗ trợ ngrok URL không?"
4. Có thể họ yêu cầu domain thật (không phải ngrok)

## 🎯 Hành Động Ngay

### Bước 1: Copy URL Chính Xác

```powershell
# Copy URL này (không có space, không có trailing slash)
https://understatedly-unspeakable-tamala.ngrok-free.dev/api/sepay/webhook
```

### Bước 2: Test URL trong Browser

1. Mở browser
2. Paste URL
3. Nếu thấy warning page → Cần bypass bằng authtoken (xem trên)

### Bước 3: Điền vào Sepay Dashboard

1. **Chọn mục**: Webhook URL hoặc Callback URL
2. **Paste URL**: Chính xác như trên (copy-paste, không type)
3. **Method**: POST
4. **Lưu**

### Bước 4: Nếu Vẫn Lỗi

1. Kiểm tra console/network tab xem có error gì
2. Thử format khác (có/không trailing slash)
3. Đăng ký ngrok account và dùng authtoken
4. Liên hệ Sepay support

## 📝 Lưu Ý Quan Trọng

- **Ngrok warning page** là vấn đề phổ biến nhất
- **Dùng ngrok authtoken** là giải pháp tốt nhất để bypass warning
- **Test URL trước** để đảm bảo accessible
- **Copy-paste** thay vì type để tránh sai sót

---

**Sau khi sửa, Sepay sẽ có thể verify và gửi webhook thành công!**

