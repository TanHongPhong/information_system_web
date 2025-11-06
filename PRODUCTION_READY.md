# Production Deployment Checklist

## ✅ Code đã được tinh chỉnh cho Production

### 1. Server Configuration
- ✅ CORS configured với environment variables
- ✅ Static files serving disabled (dùng Nginx riêng)
- ✅ Server listen trên 0.0.0.0 (cho phép external access)
- ✅ Environment validation với exit on error trong production
- ✅ PM2 ecosystem config với graceful shutdown

### 2. Environment Variables Required

#### Backend (.env)
```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=<strong-random-string-min-32-chars>
JWT_EXPIRES_IN=7d

# Optional - CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Optional - Sepay
SEPAY_API_KEY=
SEPAY_API_SECRET=
SEPAY_WEBHOOK_SECRET=
SEPAY_WEBHOOK_URL=https://api.your-domain.com/api/sepay/webhook
BACKEND_URL=https://api.your-domain.com

# Optional - Serve static files với Express (không khuyến nghị)
# SERVE_STATIC=false
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.your-domain.com/api
```

### 3. PM2 Configuration
- ✅ Auto restart enabled
- ✅ Memory limit: 500M
- ✅ Logs configured
- ✅ Graceful shutdown

### 4. Database
- ✅ Connection pool configured
- ✅ Error handling improved
- ✅ Timeout settings optimized

## 🚀 Deployment Steps

### Step 1: Prepare VPS
```bash
sudo bash setup_vps.sh
```

### Step 2: Clone & Setup
```bash
cd /var/www
sudo git clone <repo-url> logistics-system
cd logistics-system/backend
```

### Step 3: Configure Environment
```bash
sudo nano .env
# Nhập các biến môi trường (xem trên)
```

### Step 4: Install & Deploy
```bash
npm install --production
node scripts/run_all_migrations.js
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 5: Frontend
```bash
cd ../frontend
sudo nano .env.production
# VITE_API_URL=https://api.your-domain.com/api
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
```

### Step 6: Nginx (xem NGINX_CONFIG.md)

### Step 7: SSL
```bash
sudo certbot --nginx -d api.your-domain.com
sudo certbot --nginx -d your-domain.com
```

## 🔧 Important Notes

1. **CORS**: Set `ALLOWED_ORIGINS` trong .env để cho phép frontend domain
2. **Static Files**: Không dùng Express serve static, dùng Nginx riêng
3. **Database**: Đảm bảo connection string có `sslmode=require` cho Neon
4. **JWT_SECRET**: PHẢI là string mạnh, không dùng default value
5. **Port**: Backend chạy trên port 5001, Nginx proxy từ 80/443

## ✅ Verification

Sau khi deploy, kiểm tra:
```bash
# Backend health
curl http://localhost:5001/api/test/health

# PM2 status
pm2 status
pm2 logs logistics-api

# Nginx status
sudo systemctl status nginx
sudo nginx -t
```

## 🛠️ Troubleshooting

### Backend không start
- Check .env file
- Check database connection
- Check PM2 logs: `pm2 logs logistics-api`

### CORS errors
- Check `ALLOWED_ORIGINS` trong .env
- Verify frontend URL matches allowed origins

### 502 Bad Gateway
- Check backend running: `pm2 status`
- Check Nginx config: `sudo nginx -t`
- Check backend logs: `pm2 logs`

