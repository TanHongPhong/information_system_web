# Complete VPS Deployment Guide

## 📋 Prerequisites

- VPS với Ubuntu 20.04+ hoặc Debian 11+
- Domain name trỏ về IP VPS
- Quyền root hoặc sudo
- Port 80, 443 mở

## 🚀 Quick Deploy (Tất cả trong một)

### Option 1: Tự động (Recommended)

```bash
# 1. Clone repository
cd /var/www
sudo git clone <your-repo-url> logistics-system
cd logistics-system

# 2. Chạy setup script
chmod +x setup_vps.sh
sudo ./setup_vps.sh
```

### Option 2: Manual Step-by-Step

Xem `VPS_DEPLOYMENT_GUIDE.md` để biết chi tiết từng bước.

## 📝 Step-by-Step Guide

### Bước 1: Chuẩn Bị VPS

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

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Install PostgreSQL client (optional)
sudo apt install -y postgresql-client
```

### Bước 2: Deploy Backend

```bash
cd /var/www/logistics-system/backend

# 1. Tạo .env file
sudo nano .env
```

**Nội dung .env**:
```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=<generate-strong-random-string-here>
JWT_EXPIRES_IN=7d
```

```bash
# 2. Install dependencies
npm install --production

# 3. Run migrations
node scripts/run_all_migrations.js

# 4. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Tạo startup script để tự động start khi reboot
```

### Bước 3: Deploy Frontend

```bash
cd /var/www/logistics-system/frontend

# 1. Tạo .env.production
sudo nano .env.production
```

**Nội dung .env.production**:
```env
VITE_API_URL=https://api.your-domain.com/api
```

```bash
# 2. Build
npm install
npm run build

# 3. Copy to web directory
sudo mkdir -p /var/www/html/logistics
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
```

### Bước 4: Cấu Hình Nginx

#### 4.1. Backend API Config

```bash
sudo nano /etc/nginx/sites-available/logistics-api
```

**Nội dung** (xem `NGINX_CONFIG.md`):
```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    
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
    }
}
```

#### 4.2. Frontend Config

```bash
sudo nano /etc/nginx/sites-available/logistics-frontend
```

**Nội dung** (xem `NGINX_CONFIG.md`):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/html/logistics;
    index index.html;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4.3. Enable và Test

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/logistics-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/logistics-frontend /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

### Bước 5: Setup SSL

```bash
# Get SSL certificates
sudo certbot --nginx -d api.your-domain.com
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (đã tự động setup)
sudo certbot renew --dry-run
```

### Bước 6: Firewall

```bash
# Nếu dùng UFW
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 🔧 Useful Commands

### PM2 Management
```bash
pm2 status                    # Check status
pm2 logs logistics-api       # View logs
pm2 logs logistics-api --lines 100  # Last 100 lines
pm2 restart logistics-api    # Restart
pm2 stop logistics-api        # Stop
pm2 delete logistics-api      # Remove
pm2 monit                     # Monitor dashboard
pm2 save                      # Save current process list
```

### Nginx Management
```bash
sudo nginx -t                 # Test configuration
sudo systemctl status nginx   # Check status
sudo systemctl reload nginx   # Reload config
sudo systemctl restart nginx  # Restart
sudo tail -f /var/log/nginx/error.log   # View errors
sudo tail -f /var/log/nginx/access.log  # View access logs
```

### Database Migrations
```bash
cd /var/www/logistics-system/backend
node scripts/run_all_migrations.js
```

### Update Application
```bash
# Backend
cd /var/www/logistics-system/backend
git pull
npm install --production
pm2 restart logistics-api

# Frontend
cd /var/www/logistics-system/frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
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
curl http://localhost:5001

# Check Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Issues
```bash
# Check certificates
sudo certbot certificates

# Renew manually
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Permission Issues
```bash
# Fix frontend permissions
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics

# Fix backend logs
sudo mkdir -p /var/www/logistics-system/backend/logs
sudo chown -R $USER:$USER /var/www/logistics-system/backend/logs
```

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
```

### System Resources
```bash
htop          # CPU, Memory
df -h         # Disk space
free -h       # Memory
```

### Application Logs
```bash
# PM2 logs
pm2 logs logistics-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Auto-Update Script

Tạo script để update tự động:

```bash
#!/bin/bash
# /var/www/logistics-system/update.sh

cd /var/www/logistics-system

# Update backend
cd backend
git pull
npm install --production
pm2 restart logistics-api

# Update frontend
cd ../frontend
git pull
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/

echo "✅ Update complete!"
```

## 📝 Checklist

- [ ] VPS prepared (Node.js, PM2, Nginx installed)
- [ ] Repository cloned
- [ ] Backend .env configured
- [ ] Database migrations run
- [ ] Backend running với PM2
- [ ] Frontend built và deployed
- [ ] Nginx configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Firewall configured
- [ ] Monitoring setup

## 🎯 Next Steps

1. **Test Application**:
   - Frontend: https://your-domain.com
   - Backend API: https://api.your-domain.com/api/test/health

2. **Setup Monitoring**:
   - PM2 monitoring
   - Nginx logs
   - System resources

3. **Backup Strategy**:
   - Database backups
   - Code backups
   - Configuration backups

4. **Security**:
   - Regular updates
   - Firewall rules
   - SSL certificates auto-renewal

