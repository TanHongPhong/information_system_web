# VPS Deployment - Quick Reference

## 🚀 Quick Commands

### Initial Setup (Chạy một lần)
```bash
# 1. Setup VPS
sudo bash setup_vps.sh

# 2. Clone repo
cd /var/www
sudo git clone <your-repo-url> logistics-system
cd logistics-system

# 3. Setup Backend
cd backend
sudo nano .env  # Configure environment variables
npm install --production
node scripts/run_all_migrations.js
pm2 start ecosystem.config.js
pm2 save

# 4. Setup Frontend
cd ../frontend
sudo nano .env.production  # Set VITE_API_URL
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics

# 5. Configure Nginx
# Copy configs from NGINX_CONFIG.md
sudo ln -s /etc/nginx/sites-available/logistics-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/logistics-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Get SSL
sudo certbot --nginx -d api.your-domain.com
sudo certbot --nginx -d your-domain.com
```

### Daily Operations

```bash
# Check status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs logistics-api
sudo tail -f /var/log/nginx/error.log

# Restart backend
pm2 restart logistics-api

# Update application
cd /var/www/logistics-system/backend && git pull && npm install --production && pm2 restart logistics-api
cd /var/www/logistics-system/frontend && git pull && npm install && npm run build && sudo cp -r dist/* /var/www/html/logistics/
```

## 📋 Environment Variables

### Backend .env
```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://...
JWT_SECRET=<strong-random-string>
```

### Frontend .env.production
```env
VITE_API_URL=https://api.your-domain.com/api
```

## 🔗 Useful Links

- PM2 Docs: https://pm2.keymetrics.io/
- Nginx Docs: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/

