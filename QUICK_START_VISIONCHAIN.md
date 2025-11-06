# 🚀 Quick Start - Deploy visionchain.online

## ⚡ Quick Commands (Copy & Paste)

### 1. Setup VPS (Chạy một lần)
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs pm2 nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 2. Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> logistics-system
cd logistics-system
```

### 3. Setup Backend
```bash
cd backend
sudo nano .env  # Nhập các biến môi trường (xem bên dưới)
npm install --production
node scripts/run_all_migrations.js
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Copy và chạy lệnh hiển thị
```

### 4. Setup Frontend
```bash
cd ../frontend
echo "VITE_API_URL=https://api.visionchain.online/api" | sudo tee .env.production
npm install
npm run build
sudo mkdir -p /var/www/html/visionchain
sudo cp -r dist/* /var/www/html/visionchain/
sudo chown -R www-data:www-data /var/www/html/visionchain
```

### 5. Configure Nginx
```bash
# Copy configs từ DEPLOY_VISIONCHAIN.md
# Hoặc sử dụng script tự động
sudo nano /etc/nginx/sites-available/visionchain-api
sudo nano /etc/nginx/sites-available/visionchain-frontend
sudo ln -s /etc/nginx/sites-available/visionchain-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/visionchain-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Get SSL
```bash
sudo certbot --nginx -d api.visionchain.online
sudo certbot --nginx -d visionchain.online -d www.visionchain.online
```

## 📋 Backend .env Template

```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://visionchain.online,https://www.visionchain.online
BACKEND_URL=https://api.visionchain.online
```

## 🔍 Verify

```bash
# Backend
curl http://localhost:5001
pm2 status

# Frontend (sau SSL)
curl https://visionchain.online

# API (sau SSL)
curl https://api.visionchain.online/api/transport-companies
```

## 🔄 Update Commands

```bash
# Backend
cd /var/www/logistics-system/backend && git pull && npm install --production && pm2 restart logistics-api

# Frontend
cd /var/www/logistics-system/frontend && git pull && npm install && npm run build && sudo cp -r dist/* /var/www/html/visionchain/
```

## 📚 Full Guide

Xem `DEPLOY_VISIONCHAIN.md` để biết chi tiết từng bước.

