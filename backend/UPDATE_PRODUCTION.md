# 🔄 Hướng Dẫn Cập Nhật Code Lên Production

## 📋 Tóm Tắt Nhanh

Khi bạn đã có code mới (ví dụ: sửa webhook), cần cập nhật lên production server.

## 🚀 Các Bước Cập Nhật

### Bước 1: Commit và Push Code Lên Git

```bash
# Trên máy local
git add .
git commit -m "Fix webhook handler và cải thiện error handling"
git push origin main
```

### Bước 2: SSH Vào VPS

```bash
ssh root@your-vps-ip
# hoặc
ssh username@your-vps-ip
```

### Bước 3: Cập Nhật Backend Code

```bash
# Vào thư mục backend
cd /var/www/logistics-system/backend

# Pull code mới từ Git
git pull origin main

# Cài đặt dependencies mới (nếu có)
npm install --production

# Restart backend với PM2
pm2 restart logistics-api

# Kiểm tra logs để đảm bảo không có lỗi
pm2 logs logistics-api --lines 50
```

### Bước 4: Kiểm Tra Backend Hoạt Động

```bash
# Kiểm tra status
pm2 status

# Test API endpoint
curl https://api.visionchain.online/api/transport-companies

# Kiểm tra webhook endpoint (nếu có)
curl -X POST https://api.visionchain.online/api/sepay/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Bước 5: Cập Nhật Frontend (Nếu Cần)

```bash
# Vào thư mục frontend
cd /var/www/logistics-system/frontend

# Pull code mới
git pull origin main

# Cài đặt dependencies
npm install

# Build lại frontend
npm run build

# Copy build files lên web directory
sudo cp -r dist/* /var/www/html/visionchain/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/visionchain
sudo chmod -R 755 /var/www/html/visionchain
```

### Bước 6: Cập Nhật Webhook URL trong Sepay Dashboard

**QUAN TRỌNG**: Sau khi cập nhật code webhook, đảm bảo webhook URL trong Sepay Dashboard đúng:

1. **Đăng nhập Sepay Dashboard**
2. **Vào phần Webhooks** hoặc **Cài đặt**
3. **Kiểm tra/Cập nhật Webhook URL**:
   ```
   https://api.visionchain.online/api/sepay/webhook
   ```
   (KHÔNG dùng ngrok URL!)

4. **Lưu cấu hình**

### Bước 7: Kiểm Tra Webhook Hoạt Động

```bash
# Xem logs backend để kiểm tra webhook có nhận được request không
pm2 logs logistics-api | grep -i webhook

# Hoặc xem toàn bộ logs
pm2 logs logistics-api --lines 100
```

## 🔧 Script Tự Động (Tùy Chọn)

Bạn có thể tạo script để tự động hóa quá trình update:

### Tạo file `update_backend.sh`:

```bash
#!/bin/bash

echo "🔄 Đang cập nhật backend..."

cd /var/www/logistics-system/backend

echo "📥 Pulling code từ Git..."
git pull origin main

echo "📦 Installing dependencies..."
npm install --production

echo "🔄 Restarting backend..."
pm2 restart logistics-api

echo "✅ Backend đã được cập nhật!"
echo "📊 Kiểm tra logs:"
pm2 logs logistics-api --lines 20
```

**Sử dụng:**
```bash
chmod +x update_backend.sh
./update_backend.sh
```

## ⚠️ Lưu Ý Quan Trọng

### 1. Backup Trước Khi Update

```bash
# Backup code hiện tại
cd /var/www/logistics-system
cp -r backend backend.backup.$(date +%Y%m%d_%H%M%S)
```

### 2. Kiểm Tra Environment Variables

Đảm bảo file `.env` vẫn đúng sau khi pull code:

```bash
cd /var/www/logistics-system/backend
cat .env | grep -E "SEPAY_WEBHOOK_URL|BACKEND_URL"
```

**Phải có:**
```env
BACKEND_URL=https://api.visionchain.online
SEPAY_WEBHOOK_URL=https://api.visionchain.online/api/sepay/webhook
```

### 3. Kiểm Tra Database Migrations

Nếu có migration mới:

```bash
cd /var/www/logistics-system/backend
node scripts/run_all_migrations.js
```

### 4. Kiểm Tra Nginx Config

Đảm bảo Nginx vẫn hoạt động:

```bash
sudo nginx -t
sudo systemctl status nginx
```

## 🐛 Troubleshooting

### Backend không start sau khi update

```bash
# Xem logs chi tiết
pm2 logs logistics-api --err --lines 100

# Kiểm tra .env
cat .env

# Test chạy thủ công
cd /var/www/logistics-system/backend
node server.js
```

### Webhook vẫn không hoạt động

1. **Kiểm tra webhook URL trong Sepay Dashboard**
   - Phải là: `https://api.visionchain.online/api/sepay/webhook`
   - KHÔNG phải ngrok URL

2. **Kiểm tra logs backend**
   ```bash
   pm2 logs logistics-api | grep -i webhook
   ```

3. **Test webhook endpoint trực tiếp**
   ```bash
   curl -X POST https://api.visionchain.online/api/sepay/webhook \
     -H "Content-Type: application/json" \
     -H "Authorization: Apikey YOUR_WEBHOOK_APIKEY" \
     -d '{"transferAmount": 100000, "referenceCode": "TEST", "content": "GMD0000000001"}'
   ```

4. **Kiểm tra CORS và firewall**
   - Đảm bảo Sepay có thể gọi đến server
   - Kiểm tra firewall không chặn incoming requests

### Rollback Nếu Có Lỗi

```bash
# Dừng backend
pm2 stop logistics-api

# Restore backup
cd /var/www/logistics-system
rm -rf backend
mv backend.backup.YYYYMMDD_HHMMSS backend

# Restart
cd backend
pm2 start ecosystem.config.js
```

## 📊 Checklist Sau Khi Update

- [ ] Code đã được pull từ Git
- [ ] Dependencies đã được cài đặt
- [ ] Backend đã restart với PM2
- [ ] Backend logs không có lỗi
- [ ] API endpoint hoạt động (test bằng curl)
- [ ] Webhook URL trong Sepay Dashboard đúng
- [ ] Webhook endpoint có thể truy cập
- [ ] Frontend (nếu update) đã được build và deploy
- [ ] Nginx vẫn hoạt động bình thường

## 🎯 Quick Reference

```bash
# Update backend
cd /var/www/logistics-system/backend && git pull && npm install --production && pm2 restart logistics-api

# Update frontend  
cd /var/www/logistics-system/frontend && git pull && npm install && npm run build && sudo cp -r dist/* /var/www/html/visionchain/

# Check status
pm2 status
pm2 logs logistics-api --lines 50

# Test API
curl https://api.visionchain.online/api/transport-companies
```

## 📝 Ghi Chú

- **Luôn backup** trước khi update
- **Kiểm tra logs** sau khi update
- **Test endpoints** để đảm bảo hoạt động
- **Cập nhật webhook URL** trong Sepay Dashboard nếu cần
- **Không dùng ngrok URL** trong production

