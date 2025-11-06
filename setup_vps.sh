#!/bin/bash
# Complete VPS Setup Script - Chạy một lần để setup toàn bộ hệ thống

set -e

echo "🚀 Starting complete VPS setup..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "${BLUE}📦 Step 1: Updating system...${NC}"
apt update && apt upgrade -y

# Step 2: Install Node.js
echo -e "${BLUE}📦 Step 2: Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
else
    echo -e "${YELLOW}Node.js already installed: $(node --version)${NC}"
fi

# Step 3: Install PM2
echo -e "${BLUE}📦 Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo -e "${YELLOW}PM2 already installed${NC}"
fi

# Step 4: Install Nginx
echo -e "${BLUE}📦 Step 4: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo -e "${YELLOW}Nginx already installed${NC}"
fi

# Step 5: Install Certbot
echo -e "${BLUE}📦 Step 5: Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
else
    echo -e "${YELLOW}Certbot already installed${NC}"
fi

# Step 6: Create directories
echo -e "${BLUE}📁 Step 6: Creating directories...${NC}"
mkdir -p /var/www/html/logistics
mkdir -p /var/www/logistics-system/backend/logs

# Step 7: Setup firewall
echo -e "${BLUE}🔥 Step 7: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${YELLOW}Firewall rules added. Run 'ufw enable' to activate.${NC}"
fi

echo -e "${GREEN}✅ VPS setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone your repository to /var/www/logistics-system"
echo "2. Configure .env files (backend/.env and frontend/.env.production)"
echo "3. Run database migrations"
echo "4. Deploy backend and frontend"
echo "5. Configure Nginx (see NGINX_CONFIG.md)"
echo "6. Get SSL certificates with certbot"

