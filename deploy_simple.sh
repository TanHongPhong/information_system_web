#!/bin/bash
# Script deploy nhanh - không chạy database

set -e

echo "🚀 Deploy nhanh (không chạy database)..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd /var/www/logistics-system

# Fix .env conflict
echo -e "${YELLOW}📝 Fixing .env conflict...${NC}"
cp backend/.env backend/.env.backup 2>/dev/null || true
git checkout -- backend/.env 2>/dev/null || true

# Pull code
echo -e "${YELLOW}📥 Pulling code...${NC}"
git pull origin main

# Restore .env
echo -e "${YELLOW}📝 Restoring .env...${NC}"
cp backend/.env.backup backend/.env 2>/dev/null || true

# Backend
echo -e "\n${YELLOW}🔧 Deploying Backend...${NC}"
cd backend
npm install
pm2 restart logistics-api || pm2 start ecosystem.config.js
pm2 save
sleep 2
echo -e "${GREEN}✅ Backend restarted${NC}"

# Frontend
echo -e "\n${YELLOW}🎨 Deploying Frontend...${NC}"
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
echo -e "${GREEN}✅ Frontend deployed${NC}"

# Nginx
echo -e "\n${YELLOW}🌐 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo -e "\n${GREEN}✅ Deploy hoàn tất!${NC}"
pm2 status

