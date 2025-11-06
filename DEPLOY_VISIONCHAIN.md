# 🚀 Hướng Dẫn Deploy Lên VPS - visionchain.online

## 📋 Domain Setup

**Domain chính**: `visionchain.online`  
**API Subdomain**: `api.visionchain.online`  
**Frontend**: `visionchain.online` và `www.visionchain.online`

## 🔧 Bước 1: Chuẩn Bị VPS

### 1.1. Kết nối VPS
```bash
ssh root@your-vps-ip
# hoặc
ssh username@your-vps-ip
```

### 1.2. Setup VPS (Chạy một lần)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
node --version  # Should be v18.x or higher
npm --version

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Install PostgreSQL client (optional, for testing)
sudo apt install -y postgresql-client
```

### 1.3. Cấu hình Firewall
```bash
# Nếu dùng UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 🌐 Bước 2: Cấu Hình DNS

### 2.1. Trỏ Domain về VPS IP

Vào DNS management của domain `visionchain.online` và thêm các records:

```
Type    Name    Value              TTL
A       @       YOUR_VPS_IP        3600
A       www     YOUR_VPS_IP        3600
A       api     YOUR_VPS_IP        3600
```

**Lưu ý**: Thay `YOUR_VPS_IP` bằng IP thực tế của VPS

### 2.2. Kiểm tra DNS đã trỏ chưa
```bash
# Kiểm tra từ máy local
nslookup visionchain.online
nslookup api.visionchain.online
nslookup www.visionchain.online
```

## 📦 Bước 3: Clone Repository

```bash
# Tạo thư mục
cd /var/www
sudo mkdir -p logistics-system
cd logistics-system

# Clone repository (thay URL bằng repo thực tế)
sudo git clone <your-repo-url> .

# Hoặc nếu đã có code, upload lên VPS
# Sử dụng scp, sftp, hoặc git clone
```

## 🔧 Bước 4: Setup Backend

### 4.1. Vào thư mục backend
```bash
cd /var/www/logistics-system/backend
```

### 4.2. Tạo file .env
```bash
sudo nano .env
```

**Nội dung file `.env`**:
```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=<generate-strong-random-string-here-min-32-chars>
JWT_EXPIRES_IN=7d

# CORS - Cho phép frontend domain
ALLOWED_ORIGINS=https://visionchain.online,https://www.visionchain.online

# Backend URL
BACKEND_URL=https://api.visionchain.online

# Sepay (nếu dùng)
SEPAY_API_KEY=
SEPAY_API_SECRET=
SEPAY_WEBHOOK_SECRET=
SEPAY_WEBHOOK_URL=https://api.visionchain.online/api/sepay/webhook
```

**Lưu ý quan trọng**:
- Thay `PSQLDB_CONNECTIONSTRING` bằng connection string thực tế từ Neon hoặc PostgreSQL
- Generate `JWT_SECRET` mạnh: `openssl rand -base64 32`

### 4.3. Generate JWT Secret
```bash
# Tạo JWT secret mạnh
openssl rand -base64 32
# Copy kết quả vào JWT_SECRET trong .env
```

### 4.4. Install Dependencies
```bash
npm install --production
```

### 4.5. Chạy Database Migrations
```bash
node scripts/run_all_migrations.js
```

### 4.6. Tạo thư mục logs
```bash
mkdir -p logs
```

### 4.7. Start với PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Copy và chạy lệnh mà PM2 hiển thị để auto-start khi reboot
```

### 4.8. Kiểm tra Backend
```bash
# Check status
pm2 status

# Check logs
pm2 logs logistics-api

# Test API
curl http://localhost:5001/api/transport-companies
```

## 🌐 Bước 5: Setup Frontend

### 5.1. Vào thư mục frontend
```bash
cd /var/www/logistics-system/frontend
```

### 5.2. Tạo file .env.production
```bash
sudo nano .env.production
```

**Nội dung**:
```env
VITE_API_URL=https://api.visionchain.online/api
```

### 5.3. Build Frontend
```bash
npm install
npm run build
```

### 5.4. Deploy Build Files
```bash
# Tạo thư mục web
sudo mkdir -p /var/www/html/visionchain

# Copy build files
sudo cp -r dist/* /var/www/html/visionchain/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/visionchain
sudo chmod -R 755 /var/www/html/visionchain
```

## 🔒 Bước 6: Cấu Hình Nginx

### 6.1. Cấu hình Backend API
```bash
sudo nano /etc/nginx/sites-available/visionchain-api
```

**Nội dung**:
```nginx
server {
    listen 80;
    server_name api.visionchain.online;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.visionchain.online;

    # SSL Configuration (sẽ được cập nhật bởi Certbot)
    ssl_certificate /etc/letsencrypt/live/api.visionchain.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.visionchain.online/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Increase body size for file uploads
    client_max_body_size 10M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 6.2. Cấu hình Frontend
```bash
sudo nano /etc/nginx/sites-available/visionchain-frontend
```

**Nội dung**:
```nginx
server {
    listen 80;
    server_name visionchain.online www.visionchain.online;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name visionchain.online www.visionchain.online;

    root /var/www/html/visionchain;
    index index.html;

    # SSL Configuration (sẽ được cập nhật bởi Certbot)
    ssl_certificate /etc/letsencrypt/live/visionchain.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/visionchain.online/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 6.3. Enable Sites
```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/visionchain-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/visionchain-frontend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔐 Bước 7: Setup SSL với Let's Encrypt

### 7.1. Lấy SSL Certificate cho API
```bash
sudo certbot --nginx -d api.visionchain.online
```

### 7.2. Lấy SSL Certificate cho Frontend
```bash
sudo certbot --nginx -d visionchain.online -d www.visionchain.online
```

### 7.3. Test Auto-Renewal
```bash
sudo certbot renew --dry-run
```

## ✅ Bước 8: Kiểm Tra

### 8.1. Kiểm tra Backend
```bash
# Test từ VPS
curl https://api.visionchain.online/api/transport-companies

# Test từ browser
# Mở: https://api.visionchain.online/api/transport-companies
```

### 8.2. Kiểm tra Frontend
```bash
# Mở browser và truy cập
https://visionchain.online
https://www.visionchain.online
```

### 8.3. Kiểm tra PM2
```bash
pm2 status
pm2 logs logistics-api
```

### 8.4. Kiểm tra Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

## 🔄 Bước 9: Update Application (Khi cần)

### Update Backend
```bash
cd /var/www/logistics-system/backend
git pull
npm install --production
pm2 restart logistics-api
```

### Update Frontend
```bash
cd /var/www/logistics-system/frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/visionchain/
sudo chown -R www-data:www-data /var/www/html/visionchain
```

## 🛠️ Troubleshooting

### Backend không start
```bash
# Check logs
pm2 logs logistics-api --lines 100

# Check .env
cat .env

# Test database connection
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.PSQLDB_CONNECTIONSTRING }); pool.query('SELECT NOW()').then(() => console.log('OK')).catch(e => console.error(e));"
```

### Nginx 502 Bad Gateway
```bash
# Check backend running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test backend directly
curl http://localhost:5001
```

### SSL Issues
```bash
# Check certificates
sudo certbot certificates

# Renew manually
sudo certbot renew
```

### CORS Errors
- Kiểm tra `ALLOWED_ORIGINS` trong backend `.env`
- Đảm bảo frontend URL đúng trong `ALLOWED_ORIGINS`

## 📊 Monitoring

### PM2 Dashboard
```bash
pm2 monit
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

## 📝 Checklist

- [ ] VPS setup hoàn tất
- [ ] DNS đã trỏ về VPS IP
- [ ] Backend .env configured
- [ ] Database migrations run
- [ ] Backend running với PM2
- [ ] Frontend built và deployed
- [ ] Nginx configured
- [ ] SSL certificates installed
- [ ] Backend API accessible: https://api.visionchain.online
- [ ] Frontend accessible: https://visionchain.online
- [ ] CORS configured correctly

## 🎉 Hoàn Tất!

Sau khi hoàn tất các bước trên, ứng dụng sẽ accessible tại:
- **Frontend**: https://visionchain.online
- **Backend API**: https://api.visionchain.online/api

Chúc bạn deploy thành công! 🚀

