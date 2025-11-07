# Hướng dẫn cấu hình Sepay Webhook

## Vấn đề thường gặp

Khi deploy lên production, webhook có thể không hoạt động vì:
1. **Webhook URL vẫn trỏ đến ngrok** (chỉ dùng cho development)
2. **Webhook URL không thể truy cập từ internet**
3. **CORS chặn request từ Sepay**
4. **Firewall/security group chặn incoming requests**

## Giải pháp

### 1. Cập nhật Webhook URL trong Sepay Dashboard

**QUAN TRỌNG**: Khi deploy lên production, bạn **KHÔNG** được dùng ngrok URL. Thay vào đó:

1. Đăng nhập vào **Sepay Dashboard**
2. Vào phần **Webhooks** hoặc **Cài đặt**
3. Cập nhật Webhook URL thành production URL của bạn:
   ```
   https://your-domain.com/api/sepay/webhook
   ```
   hoặc
   ```
   https://api.your-domain.com/api/sepay/webhook
   ```

### 2. Cấu hình Environment Variables

Trong file `backend/.env` (production), đảm bảo có:

```env
# Backend URL (production)
BACKEND_URL=https://your-domain.com
# hoặc
BACKEND_URL=https://api.your-domain.com

# Webhook URL (tự động build từ BACKEND_URL + /api/sepay/webhook)
# Hoặc set trực tiếp:
SEPAY_WEBHOOK_URL=https://your-domain.com/api/sepay/webhook

# Webhook API Key (từ Sepay Dashboard)
SEPAY_WEBHOOK_APIKEY=your-webhook-api-key-from-sepay
```

### 3. Kiểm tra Firewall/Security Group

Đảm bảo server của bạn cho phép incoming requests trên port backend (thường là 5001 hoặc 443 nếu dùng HTTPS):

- **Nếu dùng Nginx reverse proxy**: Đảm bảo Nginx forward requests đến backend
- **Nếu deploy trực tiếp**: Đảm bảo firewall cho phép port backend
- **Nếu dùng cloud provider (AWS, GCP, Azure)**: Kiểm tra Security Groups/Network Rules

### 4. Test Webhook

Sau khi cấu hình, test webhook bằng cách:

1. **Test từ Sepay Dashboard**: Sepay thường có nút "Test Webhook" trong dashboard
2. **Test bằng curl**:
   ```bash
   curl -X POST https://your-domain.com/api/sepay/webhook \
     -H "Content-Type: application/json" \
     -H "Authorization: Apikey YOUR_WEBHOOK_APIKEY" \
     -d '{
       "transferAmount": 100000,
       "referenceCode": "TEST-123",
       "content": "GMD0000000001",
       "gateway": "vietqr",
       "transactionDate": "2025-01-15 10:00:00"
     }'
   ```

3. **Kiểm tra logs**: Xem logs của backend để đảm bảo webhook được nhận:
   ```bash
   # Nếu dùng PM2
   pm2 logs backend
   
   # Nếu chạy trực tiếp
   # Logs sẽ hiển thị trong console
   ```

### 5. Debug Webhook Issues

Nếu webhook vẫn không hoạt động:

1. **Kiểm tra logs backend**: Xem có request nào đến `/api/sepay/webhook` không
2. **Kiểm tra Sepay Dashboard**: Xem có error logs từ Sepay không
3. **Test endpoint trực tiếp**: Dùng Postman hoặc curl để test endpoint
4. **Kiểm tra CORS**: Đảm bảo CORS không chặn request từ Sepay
5. **Kiểm tra SSL/HTTPS**: Sepay thường yêu cầu HTTPS (không dùng HTTP)

### 6. Common Issues

#### Issue: "ERR_NGROK_3200 - Endpoint is offline"
**Nguyên nhân**: Webhook URL vẫn trỏ đến ngrok URL
**Giải pháp**: Cập nhật webhook URL trong Sepay Dashboard thành production URL

#### Issue: "CORS Error"
**Nguyên nhân**: CORS chặn request từ Sepay
**Giải pháp**: Code đã được cập nhật để tự động cho phép Sepay origins

#### Issue: "Empty payload"
**Nguyên nhân**: Body không được parse đúng
**Giải pháp**: Code đã được cập nhật để xử lý nhiều format payload

#### Issue: "Connection timeout"
**Nguyên nhân**: Firewall/security group chặn incoming requests
**Giải pháp**: Kiểm tra firewall rules và đảm bảo port backend mở

## Checklist trước khi deploy

- [ ] Đã cập nhật `BACKEND_URL` trong `.env` (production)
- [ ] Đã cập nhật `SEPAY_WEBHOOK_URL` trong `.env` (production)
- [ ] Đã cập nhật webhook URL trong Sepay Dashboard
- [ ] Đã kiểm tra firewall/security group cho phép incoming requests
- [ ] Đã test webhook endpoint bằng curl/Postman
- [ ] Đã kiểm tra logs để đảm bảo webhook hoạt động

## Lưu ý

- **KHÔNG** dùng ngrok URL trong production
- **LUÔN** dùng HTTPS trong production (Sepay yêu cầu HTTPS)
- **KIỂM TRA** logs thường xuyên để phát hiện vấn đề sớm
- **BACKUP** webhook API key ở nơi an toàn

