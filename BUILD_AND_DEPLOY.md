# Production Build Configuration

## Frontend Build

### Environment Variables
Tạo file `.env.production` trong thư mục `frontend/`:

```env
VITE_API_URL=https://api.your-domain.com/api
```

### Build Command
```bash
cd frontend
npm install
npm run build
```

Build output sẽ ở trong thư mục `frontend/dist/`

### Deploy Build
```bash
# Copy to web directory
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics
```

## Backend Configuration

### PM2 Start
```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Check Status
```bash
pm2 status
pm2 logs logistics-api
```

## Nginx Configuration

Xem `NGINX_CONFIG.md` để biết chi tiết cấu hình Nginx.

### Quick Setup
1. Copy config từ `NGINX_CONFIG.md`
2. Replace `your-domain.com` với domain thực tế
3. Enable sites
4. Test và reload

## SSL Setup

```bash
sudo certbot --nginx -d api.your-domain.com
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Verification

```bash
# Backend
curl http://localhost:5001

# Frontend (sau khi setup Nginx)
curl https://your-domain.com

# API (sau khi setup Nginx)
curl https://api.your-domain.com/api/transport-companies
```

