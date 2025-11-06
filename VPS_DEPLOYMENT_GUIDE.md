# Hướng Dẫn Deploy Lên VPS

## 📋 Yêu Cầu

- VPS với Ubuntu 20.04+ hoặc Debian 11+
- Quyền root hoặc sudo
- Domain name trỏ về IP VPS (cho SSL)
- Port 80, 443 mở trong firewall

## 🔧 Bước 1: Chuẩn Bị VPS

### 1.1. Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2. Cài đặt Node.js (v18+)
```bash
# Sử dụng NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 1.3. Cài đặt PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 1.4. Cài đặt Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5. Cài đặt PostgreSQL Client (nếu cần)
```bash
sudo apt install -y postgresql-client
```

## 🚀 Bước 2: Deploy Backend

### 2.1. Clone Repository
```bash
cd /var/www
sudo git clone <your-repo-url> logistics-system
cd logistics-system/backend
```

### 2.2. Cài đặt Dependencies
```bash
npm install --production
```

### 2.3. Tạo File .env
```bash
sudo nano .env
```

Nội dung `.env`:
```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=<your-strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=7d

# Sepay (nếu dùng)
SEPAY_API_KEY=
SEPAY_API_SECRET=
SEPAY_WEBHOOK_SECRET=
SEPAY_WEBHOOK_URL=https://your-domain.com/api/sepay/webhook
BACKEND_URL=https://your-domain.com

# CORS (nếu cần)
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2.4. Chạy Database Migrations
```bash
# Kết nối database và chạy migrations theo thứ tự
# Hoặc sử dụng script tự động (nếu có)
```

### 2.5. Start với PM2
```bash
pm2 start server.js --name logistics-api
pm2 save
pm2 startup  # Tạo startup script
```

### 2.6. Kiểm tra
```bash
pm2 status
pm2 logs logistics-api
curl http://localhost:5001/api/test/health
```

## 🌐 Bước 3: Deploy Frontend

### 3.1. Build Frontend
```bash
cd /var/www/logistics-system/frontend
npm install
npm run build
```

### 3.2. Tạo .env.production
```bash
sudo nano .env.production
```

Nội dung:
```env
VITE_API_URL=https://api.your-domain.com/api
```

Rebuild sau khi set env:
```bash
npm run build
```

### 3.3. Copy Build Files
```bash
sudo cp -r dist/* /var/www/html/logistics/
# Hoặc
sudo mkdir -p /var/www/html/logistics
sudo cp -r dist/* /var/www/html/logistics/
```

## 🔒 Bước 4: Setup Nginx

### 4.1. Cấu hình Backend (API)
```bash
sudo nano /etc/nginx/sites-available/logistics-api
```

Nội dung:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.2. Cấu hình Frontend
```bash
sudo nano /etc/nginx/sites-available/logistics-frontend
```

Nội dung:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/html/logistics;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4.3. Enable Sites
```bash
sudo ln -s /etc/nginx/sites-available/logistics-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/logistics-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Bước 5: Setup SSL với Let's Encrypt

### 5.1. Cài đặt Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2. Lấy SSL Certificate
```bash
# Cho backend API
sudo certbot --nginx -d api.your-domain.com

# Cho frontend
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 5.3. Auto-renewal
```bash
sudo certbot renew --dry-run
```

## 📊 Bước 6: Monitoring

### 6.1. PM2 Monitoring
```bash
pm2 monit
pm2 logs logistics-api --lines 100
```

### 6.2. Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Bước 7: Update & Maintenance

### 7.1. Update Backend
```bash
cd /var/www/logistics-system/backend
git pull
npm install --production
pm2 restart logistics-api
```

### 7.2. Update Frontend
```bash
cd /var/www/logistics-system/frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
```

## 🛠️ Troubleshooting

### Backend không start
```bash
pm2 logs logistics-api
# Kiểm tra .env file
# Kiểm tra database connection
```

### Nginx 502 Bad Gateway
```bash
# Kiểm tra backend có chạy không
pm2 status
curl http://localhost:5001

# Kiểm tra Nginx config
sudo nginx -t
```

### Database connection error
```bash
# Test connection
psql $PSQLDB_CONNECTIONSTRING
```

## 📝 Checklist

- [ ] Node.js installed
- [ ] PM2 installed và configured
- [ ] Nginx installed và configured
- [ ] Backend .env configured
- [ ] Database migrations run
- [ ] Backend running với PM2
- [ ] Frontend built và deployed
- [ ] Nginx reverse proxy configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Firewall ports opened (80, 443)
- [ ] Monitoring setup

