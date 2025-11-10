# 🚀 Deploy nhanh (không chạy database)

## Bước 1: Pull code và fix conflict

```bash
cd /var/www/logistics-system

# Backup .env
cp backend/.env backend/.env.backup

# Discard thay đổi .env
git checkout -- backend/.env

# Pull code mới
git pull origin main

# Restore .env
cp backend/.env.backup backend/.env
```

## Bước 2: Deploy Backend

```bash
cd backend

# Cài dependencies (nếu có package mới)
npm install

# Restart backend
pm2 restart logistics-api

# Kiểm tra
pm2 status
pm2 logs logistics-api --lines 20
```

## Bước 3: Deploy Frontend

```bash
cd ../frontend

# Cài dependencies (nếu có package mới)
npm install

# Build
npm run build

# Copy files
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
```

## Bước 4: Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## ✅ Xong!

Kiểm tra: https://your-domain.com/transport-companies

