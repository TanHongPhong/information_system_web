# 🚀 Hướng dẫn Deploy lại sau khi push code

## Bước 1: Pull code mới từ Git

```bash
cd /var/www/logistics-system  # hoặc đường dẫn project của bạn
git pull origin main  # hoặc branch của bạn
```

## Bước 2: Deploy Backend

```bash
cd backend

# 1. Cài đặt dependencies (nếu có package mới)
npm install

# 2. Chạy migration mới (055_add_company_areas_4_regions.sql)
node scripts/run_migrations.js 055_add_company_areas_4_regions.sql

# 3. Restart backend với PM2
pm2 restart logistics-api

# 4. Kiểm tra logs
pm2 logs logistics-api --lines 50
```

**Hoặc dùng script tự động:**
```bash
cd backend
chmod +x scripts/deploy_backend.sh
./scripts/deploy_backend.sh
```

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

## Bước 4: Reload Nginx (không restart, chỉ reload)

```bash
# Test config trước
sudo nginx -t

# Reload (không restart để không ảnh hưởng SSL)
sudo systemctl reload nginx
```

## Bước 5: Kiểm tra

```bash
# Kiểm tra backend
pm2 status
curl http://localhost:5001/api/transport-companies

# Kiểm tra frontend (từ browser)
# Truy cập: https://your-domain.com/transport-companies
```

## ⚠️ Lưu ý

- **KHÔNG chạy lại certbot** - SSL đã được cài đặt
- **KHÔNG restart nginx** - chỉ dùng `reload` để không ảnh hưởng SSL
- **Kiểm tra logs** nếu có lỗi: `pm2 logs logistics-api`

## 🔧 Troubleshooting

### Backend không start
```bash
pm2 logs logistics-api --lines 100
# Kiểm tra .env file
# Kiểm tra database connection
```

### Migration lỗi
```bash
cd backend
# Kiểm tra migration file có tồn tại không
ls migrations/055_add_company_areas_4_regions.sql
# Chạy lại migration
node scripts/run_migrations.js 055_add_company_areas_4_regions.sql
```

### Frontend không update
```bash
# Xóa cache browser (Ctrl + Shift + R)
# Hoặc clear cache Nginx
sudo rm -rf /var/www/html/logistics/*
sudo cp -r frontend/dist/* /var/www/html/logistics/
```

## 📋 Checklist nhanh

- [ ] Pull code mới
- [ ] Chạy migration 055
- [ ] Restart backend (pm2 restart)
- [ ] Build frontend
- [ ] Copy frontend files
- [ ] Reload nginx
- [ ] Test trang web

