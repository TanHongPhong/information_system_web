# 🚀 Deploy - Sửa lỗi Route Filter

## Vấn đề đã sửa
- ✅ API `/api/transport-companies/available-regions` trả về lỗi 500
- ✅ Trang transport-companies không hiển thị companies khi chọn route
- ✅ Filter routes không hoạt động đúng

## Đã sửa
- ✅ Sửa API endpoint regions (loại bỏ function không tồn tại)
- ✅ Cải thiện logic filter routes trong backend
- ✅ Tự động filter khi chọn route (không cần nhấn nút)
- ✅ Bỏ filter quá strict ở frontend

---

## Bước 1: Pull code mới

```bash
cd /var/www/logistics-system
git pull origin main
```

---

## Bước 2: Kiểm tra và tạo Routes (QUAN TRỌNG)

```bash
cd backend

# Kiểm tra và tạo routes cho tất cả công ty
node scripts/check_and_create_routes.js
```

Script này sẽ:
- Kiểm tra routes hiện có cho tất cả công ty ACTIVE
- Tạo 12 routes giữa 4 điểm chính nếu thiếu:
  - Hà Nội ↔ HCM
  - Hà Nội ↔ Đà Nẵng
  - HCM ↔ Cần Thơ
  - HCM ↔ Đà Nẵng
  - Hà Nội ↔ Cần Thơ
  - Đà Nẵng ↔ Cần Thơ
  - (cả 2 chiều)

**Lưu ý:** Nếu script báo lỗi, có thể bảng Routes chưa có dữ liệu. Kiểm tra logs để xem chi tiết.

---

## Bước 3: Deploy Backend

```bash
cd backend

# Cài dependencies (nếu có package mới)
npm install

# Restart backend với PM2
pm2 restart logistics-api

# Kiểm tra logs
pm2 logs logistics-api --lines 50
```

**Kiểm tra API:**
```bash
# Test regions API
curl http://localhost:5001/api/transport-companies/available-regions

# Kết quả mong đợi:
# {"regions":["Cần Thơ","HCM","Hà Nội","Đà Nẵng"]}

# Test companies API với route filter
curl "http://localhost:5001/api/transport-companies?origin_region=HCM&destination_region=Hà%20Nội"

# Kết quả phải có danh sách companies
```

---

## Bước 4: Deploy Frontend

```bash
cd ../frontend

# Cài dependencies
npm install

# Build production
npm run build

# Copy files
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
```

---

## Bước 5: Reload Nginx

```bash
# Kiểm tra cấu hình
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Bước 6: Kiểm tra

### 1. Test API endpoints

```bash
# Test regions
curl https://visionchain.online/api/transport-companies/available-regions

# Test companies với route
curl "https://visionchain.online/api/transport-companies?origin_region=HCM&destination_region=Hà%20Nội"
```

### 2. Test trang web

1. Truy cập: https://visionchain.online/transport-companies
2. Kiểm tra dropdown "Từ" và "Đến" có hiển thị 4 điểm:
   - Hà Nội
   - Đà Nẵng
   - Cần Thơ
   - HCM
3. Chọn "Từ: HCM" và "Đến: Hà Nội"
4. **Companies phải hiển thị ngay** (không cần nhấn nút "Tìm kiếm")
5. Kiểm tra console (F12) để xem logs:
   - `📍 CompanyDirectory: Auto-setting activeRoute`
   - `🔍 CompanyDirectory: Fetching companies`
   - `✅ CompanyDirectory: Found X companies`

---

## Troubleshooting

### Nếu không có companies hiển thị:

1. **Kiểm tra routes trong database:**
   ```sql
   SELECT company_id, route_name, origin_region, destination_region, is_active
   FROM "Routes"
   WHERE is_active = TRUE
   ORDER BY company_id, origin_region;
   ```

2. **Kiểm tra CompanyAreas:**
   ```sql
   SELECT company_id, area
   FROM "CompanyAreas"
   ORDER BY company_id, area;
   ```

3. **Kiểm tra backend logs:**
   ```bash
   pm2 logs logistics-api --lines 100
   ```
   Tìm các dòng:
   - `🔍 GET /api/transport-companies - Filter by route:`
   - `✅ GET /api/transport-companies: Found X companies`

4. **Kiểm tra browser console:**
   - Mở F12 → Console
   - Xem các log từ CompanyDirectory
   - Kiểm tra Network tab để xem API response

### Nếu API trả về lỗi 500:

1. Kiểm tra database connection
2. Kiểm tra bảng Routes và CompanyAreas có tồn tại không
3. Chạy lại script `check_and_create_routes.js`

---

## ✅ Hoàn tất!

Sau khi deploy, trang transport-companies sẽ:
- ✅ Hiển thị 4 điểm: Hà Nội, Đà Nẵng, Cần Thơ, HCM
- ✅ Tự động filter companies khi chọn route
- ✅ Hiển thị companies ngay khi chọn đủ "Từ" và "Đến"
- ✅ Không cần nhấn nút "Tìm kiếm"

---

## Quick Deploy Script

Nếu muốn deploy nhanh, có thể chạy:

```bash
cd /var/www/logistics-system
git pull origin main

# Backend
cd backend
npm install
node scripts/check_and_create_routes.js
pm2 restart logistics-api

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics

# Nginx
sudo systemctl reload nginx

echo "✅ Deploy completed!"
```

