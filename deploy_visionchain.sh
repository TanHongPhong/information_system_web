#!/bin/bash
# Quick Deploy Script cho visionchain.online
# Chạy script này sau khi đã setup VPS và clone repository

set -e

echo "🚀 Starting deployment for visionchain.online..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with sudo${NC}"
    exit 1
fi

# Step 1: Backend
echo -e "${BLUE}📦 Deploying backend...${NC}"
cd /var/www/logistics-system/backend

# Check .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file first"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --production

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
node scripts/run_all_migrations.js || echo -e "${YELLOW}⚠️  Some migrations may have failed (this is OK if already run)${NC}"

# Create logs directory
mkdir -p logs

# Restart PM2
echo -e "${YELLOW}Restarting PM2...${NC}"
pm2 stop logistics-api 2>/dev/null || true
pm2 delete logistics-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Wait a bit
sleep 3

# Health check
if curl -f http://localhost:5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
else
    echo -e "${RED}❌ Backend health check failed!${NC}"
    pm2 logs logistics-api --lines 20
    exit 1
fi

# Step 2: Frontend
echo -e "${BLUE}📦 Deploying frontend...${NC}"
cd /var/www/logistics-system/frontend

# Check .env.production
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found, creating...${NC}"
    echo "VITE_API_URL=https://api.visionchain.online/api" > .env.production
fi

# Install and build
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Deploy
echo -e "${YELLOW}Deploying to web directory...${NC}"
mkdir -p /var/www/html/visionchain
cp -r dist/* /var/www/html/visionchain/
chown -R www-data:www-data /var/www/html/visionchain
chmod -R 755 /var/www/html/visionchain

echo -e "${GREEN}✅ Frontend deployed!${NC}"

# Step 3: Nginx
echo -e "${BLUE}🔧 Checking Nginx...${NC}"
if sudo nginx -t; then
    echo -e "${YELLOW}Reloading Nginx...${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded!${NC}"
else
    echo -e "${RED}❌ Nginx configuration error!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Ensure DNS is pointing to this VPS IP"
echo "2. Get SSL certificates:"
echo "   sudo certbot --nginx -d api.visionchain.online"
echo "   sudo certbot --nginx -d visionchain.online -d www.visionchain.online"
echo ""
echo -e "${BLUE}🔗 URLs:${NC}"
echo "Frontend: https://visionchain.online"
echo "Backend API: https://api.visionchain.online/api"

