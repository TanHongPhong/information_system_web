#!/bin/bash
# Script để deploy frontend lên VPS

set -e

echo "🚀 Starting frontend deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production not found, using defaults...${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build for production
echo -e "${YELLOW}🔨 Building for production...${NC}"
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist folder not found${NC}"
    exit 1
fi

# Copy to web directory
echo -e "${YELLOW}📁 Copying files to web directory...${NC}"
sudo mkdir -p /var/www/html/logistics
sudo cp -r dist/* /var/www/html/logistics/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics

echo -e "${GREEN}✅ Frontend deployment complete!${NC}"
echo "📁 Files deployed to: /var/www/html/logistics"

