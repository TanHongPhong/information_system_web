# 🚀 Hướng dẫn Deploy lại sau khi sửa Warehouse Status Constraint

## ⚠️ QUAN TRỌNG: Chạy Migration Database trước!

**Bước này BẮT BUỘC** để sửa lỗi constraint trong database.

### Bước 0: Chạy Migration Database

1. **Kết nối với database** (Neon, pgAdmin, hoặc bất kỳ SQL editor nào)

2. **Chạy migration mới:**
   - Mở file: `backend/fix_warehouse_constraint_now.sql`
   - Copy toàn bộ nội dung
   - Paste và chạy trong SQL editor

3. **Kiểm tra migration thành công:**
   ```sql
   SELECT 
       constraint_name,
       check_clause
   FROM information_schema.check_constraints
   WHERE constraint_name = 'CargoOrders_status_check';
   ```
   
   Kết quả phải có các status: `WAREHOUSE_RECEIVED`, `WAREHOUSE_STORED`, `WAREHOUSE_OUTBOUND`

---

## Bước 1: Pull code mới từ Git

```bash
cd /var/www/logistics-system  # hoặc đường dẫn project của bạn

# Backup .env nếu cần
cp backend/.env backend/.env.backup

# Pull code mới
git pull origin main

# Restore .env nếu đã backup
cp backend/.env.backup backend/.env
```

---

## Bước 2: Deploy Backend

```bash
cd backend

# 1. Cài đặt dependencies (nếu có package mới)
npm install

# 2. Chạy migration 055 (nếu chưa chạy) - Thêm CompanyAreas
# Mở file: backend/migrations/055_add_company_areas_4_regions.sql
# Copy và chạy trong database SQL editor

# 3. Kiểm tra regions (optional)
node scripts/check_regions.js

# 4. Restart backend với PM2
pm2 restart logistics-api

# 5. Kiểm tra logs
pm2 logs logistics-api --lines 50
```

**Hoặc dùng script tự động:**
```bash
cd backend
chmod +x scripts/deploy_backend.sh
./scripts/deploy_backend.sh
```

---

## Bước 3: Deploy Frontend

```bash
cd ../frontend

# 1. Cài đặt dependencies (nếu có package mới)
npm install

# 2. Build production
npm run build

# 3. Copy files vào web directory
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics
```

**Hoặc dùng script tự động:**
```bash
cd frontend
chmod +x scripts/deploy_frontend.sh
./scripts/deploy_frontend.sh
```

---

## Bước 4: Reload Nginx

```bash
# Test config trước
sudo nginx -t

# Reload (không restart để không ảnh hưởng SSL)
sudo systemctl reload nginx
```

---

## Bước 5: Kiểm tra

### Kiểm tra Backend:
```bash
# Kiểm tra PM2 status
pm2 status

# Test API
curl http://localhost:5001/api/cargo-orders?status=WAREHOUSE_STORED&limit=1
```

### Kiểm tra Frontend:
- Truy cập: `https://your-domain.com/warehouse`
- Truy cập: `https://your-domain.com/warehouse-in-out`
- Thử chức năng nhập kho/xuất kho

---

## 📋 Checklist Deploy

- [ ] **BẮT BUỘC**: Chạy migration `fix_warehouse_constraint_now.sql` trong database
- [ ] Pull code mới từ Git
- [ ] Cài dependencies backend (`npm install` trong `backend/`)
- [ ] Restart backend (`pm2 restart logistics-api`)
- [ ] Cài dependencies frontend (`npm install` trong `frontend/`)
- [ ] Build frontend (`npm run build`)
- [ ] Copy frontend files vào `/var/www/html/logistics/`
- [ ] Reload nginx (`sudo systemctl reload nginx`)
- [ ] Test trang warehouse
- [ ] Test chức năng nhập kho/xuất kho

---

## 🔧 Troubleshooting

### Lỗi: "violates check constraint CargoOrders_status_check"
**Nguyên nhân:** Chưa chạy migration database  
**Giải pháp:** Chạy lại Bước 0 (Migration Database)

### Backend không start
```bash
pm2 logs logistics-api --lines 100
# Kiểm tra .env file
# Kiểm tra database connection
```

### Frontend không update
```bash
# Xóa cache browser (Ctrl + Shift + R)
# Hoặc clear cache Nginx
sudo rm -rf /var/www/html/logistics/*
sudo cp -r frontend/dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
```

### Migration lỗi
- Kiểm tra file `backend/fix_warehouse_constraint_now.sql` có tồn tại không
- Kiểm tra quyền truy cập database
- Kiểm tra constraint cũ đã được xóa chưa

---

## ⚠️ Lưu ý quan trọng

1. **KHÔNG chạy lại certbot** - SSL đã được cài đặt
2. **KHÔNG restart nginx** - chỉ dùng `reload` để không ảnh hưởng SSL
3. **BẮT BUỘC chạy migration** trước khi deploy backend
4. **Kiểm tra logs** nếu có lỗi: `pm2 logs logistics-api`

---

## ✅ Sau khi deploy xong

1. Test trang `/warehouse` - phải hiển thị đơn hàng với status WAREHOUSE_STORED
2. Test trang `/warehouse-in-out`:
   - Tab "Nhập kho": Hiển thị đơn hàng WAREHOUSE_RECEIVED
   - Tab "Xuất kho": Hiển thị đơn hàng WAREHOUSE_STORED
3. Test chức năng nhập kho: WAREHOUSE_RECEIVED → WAREHOUSE_STORED
4. Test chức năng xuất kho: WAREHOUSE_STORED → COMPLETED

---

## 🎉 Hoàn tất!

Nếu tất cả các bước trên thành công, hệ thống warehouse đã sẵn sàng hoạt động!

