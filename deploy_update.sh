#!/bin/bash
# Script deploy nhanh sau khi push code (không đụng vào SSL)

set -e

echo "🚀 Bắt đầu deploy update..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get project directory (assume script is in root)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${YELLOW}📦 Project directory: $PROJECT_DIR${NC}"

# ===== BACKEND =====
echo -e "\n${YELLOW}🔧 Deploying Backend...${NC}"
cd backend

# Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
npm install

# Run new migration
echo -e "${YELLOW}🔄 Running migration 055...${NC}"
if [ -f "migrations/055_add_company_areas_4_regions.sql" ]; then
    node scripts/run_migrations.js 055_add_company_areas_4_regions.sql
    echo -e "${GREEN}✅ Migration completed${NC}"
else
    echo -e "${RED}⚠️  Migration file not found, skipping...${NC}"
fi

# Restart PM2
echo -e "${YELLOW}🔄 Restarting backend...${NC}"
pm2 restart logistics-api || pm2 start ecosystem.config.js
pm2 save

# Wait for restart
sleep 3

# Check backend
echo -e "${YELLOW}🏥 Checking backend health...${NC}"
if curl -f http://localhost:5001/api/transport-companies > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
else
    echo -e "${RED}⚠️  Backend health check failed, check logs:${NC}"
    pm2 logs logistics-api --lines 20
fi

# ===== FRONTEND =====
echo -e "\n${YELLOW}🎨 Deploying Frontend...${NC}"
cd ../frontend

# Install dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install

# Build
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Check build
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist folder not found${NC}"
    exit 1
fi

# Copy to web directory
echo -e "${YELLOW}📁 Copying files to web directory...${NC}"
sudo mkdir -p /var/www/html/logistics
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics

echo -e "${GREEN}✅ Frontend files copied${NC}"

# ===== NGINX =====
echo -e "\n${YELLOW}🌐 Reloading Nginx...${NC}"

# Test config
if sudo nginx -t > /dev/null 2>&1; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx config error!${NC}"
    sudo nginx -t
    exit 1
fi

# ===== SUMMARY =====
echo -e "\n${GREEN}✅ Deploy hoàn tất!${NC}"
echo -e "\n📋 Kiểm tra:"
echo -e "  - Backend: ${YELLOW}pm2 status${NC}"
echo -e "  - Backend logs: ${YELLOW}pm2 logs logistics-api${NC}"
echo -e "  - Frontend: ${YELLOW}https://your-domain.com/transport-companies${NC}"
echo -e "\n${GREEN}🎉 Done!${NC}"

