# Quick Deploy Script - Chạy trên VPS

## 🚀 Quick Start

### 1. Chuẩn bị VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
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

# Tạo .env file
sudo nano .env
# (Nhập các biến môi trường cần thiết)

# Chạy deployment script
chmod +x scripts/deploy_backend.sh
./scripts/deploy_backend.sh
```

### 4. Setup Frontend
```bash
cd ../frontend

# Tạo .env.production
sudo nano .env.production
# VITE_API_URL=https://api.your-domain.com/api

# Chạy deployment script
chmod +x scripts/deploy_frontend.sh
./scripts/deploy_frontend.sh
```

### 5. Setup Nginx
```bash
# Copy config files từ NGINX_CONFIG.md
# Hoặc sử dụng config mẫu

# Enable sites
sudo ln -s /etc/nginx/sites-available/logistics-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/logistics-frontend /etc/nginx/sites-enabled/

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL
```bash
# Get SSL certificates
sudo certbot --nginx -d api.your-domain.com
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 📋 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=<generate-strong-random-string>
JWT_EXPIRES_IN=7d
```

### Frontend (.env.production)
```env
VITE_API_URL=https://api.your-domain.com/api
```

## 🔧 Useful Commands

### PM2
```bash
pm2 status              # Check status
pm2 logs logistics-api  # View logs
pm2 restart logistics-api  # Restart
pm2 stop logistics-api  # Stop
pm2 monit              # Monitor
```

### Nginx
```bash
sudo nginx -t          # Test config
sudo systemctl reload nginx  # Reload
sudo systemctl restart nginx  # Restart
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Database Migrations
```bash
cd backend
node scripts/run_all_migrations.js
```

## 🛠️ Troubleshooting

### Backend không start
```bash
pm2 logs logistics-api --lines 100
# Kiểm tra .env file
# Kiểm tra database connection
```

### Nginx 502
```bash
# Kiểm tra backend
pm2 status
curl http://localhost:5001

# Kiểm tra Nginx config
sudo nginx -t
```

### SSL không hoạt động
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## 📊 Monitoring

### PM2 Dashboard
```bash
pm2 monit
```

### Nginx Status
```bash
sudo systemctl status nginx
```

### Disk Space
```bash
df -h
```

### Memory Usage
```bash
free -h
```

