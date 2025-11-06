#!/bin/bash
# Script tự động deploy backend lên VPS

set -e

echo "🚀 Starting backend deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo "Please create .env file with required variables"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

# Check database connection
echo -e "${YELLOW}🔍 Checking database connection...${NC}"
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.PSQLDB_CONNECTIONSTRING });
pool.query('SELECT NOW()').then(() => {
    console.log('✅ Database connection OK');
    process.exit(0);
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database connection failed!${NC}"
    exit 1
fi

# Run migrations (if migration runner exists)
if [ -f "scripts/run_all_migrations.js" ]; then
    echo -e "${YELLOW}🔄 Running database migrations...${NC}"
    node scripts/run_all_migrations.js
fi

# Stop existing PM2 process if running
echo -e "${YELLOW}🛑 Stopping existing PM2 process...${NC}"
pm2 stop logistics-api 2>/dev/null || true
pm2 delete logistics-api 2>/dev/null || true

# Start with PM2
echo -e "${YELLOW}▶️  Starting backend with PM2...${NC}"
pm2 start server.js --name logistics-api
pm2 save

# Wait a bit for server to start
sleep 3

# Health check
echo -e "${YELLOW}🏥 Health check...${NC}"
if curl -f http://localhost:5001/api/test/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running!${NC}"
    pm2 status
else
    echo -e "${RED}❌ Health check failed!${NC}"
    pm2 logs logistics-api --lines 50
    exit 1
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"

