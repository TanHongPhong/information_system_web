# 🚀 Deploy nhanh - Sửa lỗi Regions API

## Vấn đề
- API `/api/transport-companies/available-regions` trả về lỗi 500
- Trang transport-companies không hiển thị các điểm: Hà Nội, Đà Nẵng, Cần Thơ, HCM

## Đã sửa
- ✅ Sửa query SQL (loại bỏ ORDER BY trong UNION)
- ✅ Thêm NULL checks
- ✅ Cải thiện error handling
- ✅ Luôn trả về 4 điểm chính nếu có lỗi

---

## Bước 1: Pull code mới

```bash
cd /var/www/logistics-system
git pull origin main
```

---

## Bước 2: Kiểm tra và tạo Routes (nếu cần)

```bash
cd backend

# Kiểm tra routes hiện có
node scripts/check_and_create_routes.js
```

Script này sẽ:
- Kiểm tra routes cho tất cả công ty
- Tạo routes mới nếu thiếu (giữa 4 điểm: Hà Nội, Đà Nẵng, Cần Thơ, HCM)

## Bước 3: Deploy Backend

```bash
cd backend

# Cài dependencies
npm install

# Restart backend
pm2 restart logistics-api

# Kiểm tra logs
pm2 logs logistics-api --lines 30
```

**Kiểm tra API:**
```bash
curl http://localhost:5001/api/transport-companies/available-regions
```

Kết quả phải có:
```json
{"regions":["Cần Thơ","HCM","Hà Nội","Đà Nẵng"]}
```

---

## Bước 4: Deploy Frontend

```bash
cd ../frontend

# Cài dependencies
npm install

# Build
npm run build

# Copy files
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
```

---

## Bước 5: Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Bước 6: Kiểm tra

1. **Test API:**
   ```bash
   curl https://visionchain.online/api/transport-companies/available-regions
   ```

2. **Test trang web:**
   - Truy cập: https://visionchain.online/transport-companies
   - Kiểm tra dropdown "Từ" và "Đến" có hiển thị 4 điểm:
     - Hà Nội
     - Đà Nẵng
     - Cần Thơ
     - HCM

---

## ✅ Xong!

Nếu vẫn còn lỗi, kiểm tra:
- Backend logs: `pm2 logs logistics-api`
- Browser console (F12)
- Network tab để xem response từ API

