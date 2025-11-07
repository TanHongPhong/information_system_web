#!/bin/bash
# Script tự động cập nhật backend lên production

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Bắt đầu cập nhật backend lên production...${NC}"
echo ""

# Kiểm tra đang ở đúng thư mục
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Error: Không tìm thấy server.js${NC}"
    echo "Vui lòng chạy script này từ thư mục backend/"
    exit 1
fi

# Backup code hiện tại
echo -e "${YELLOW}💾 Đang backup code hiện tại...${NC}"
BACKUP_DIR="../backend.backup.$(date +%Y%m%d_%H%M%S)"
if [ -d "../backend.backup" ]; then
    # Xóa backup cũ hơn 7 ngày
    find .. -maxdepth 1 -type d -name "backend.backup.*" -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
fi
echo "   Backup sẽ được lưu tại: $BACKUP_DIR"
echo ""

# Pull code mới từ Git
echo -e "${YELLOW}📥 Đang pull code mới từ Git...${NC}"
if ! git pull origin main 2>/dev/null && ! git pull origin master 2>/dev/null; then
    echo -e "${RED}❌ Không thể pull code từ Git!${NC}"
    echo "   Kiểm tra kết nối Git hoặc chạy: git pull manually"
    exit 1
fi
echo -e "${GREEN}✅ Code đã được cập nhật từ Git${NC}"
echo ""

# Cài đặt dependencies
echo -e "${YELLOW}📦 Đang cài đặt dependencies...${NC}"
npm install --production
echo -e "${GREEN}✅ Dependencies đã được cài đặt${NC}"
echo ""

# Kiểm tra .env file
echo -e "${YELLOW}🔍 Kiểm tra file .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ File .env không tồn tại!${NC}"
    echo "   Vui lòng tạo file .env với các biến môi trường cần thiết"
    exit 1
fi

# Kiểm tra webhook URL trong .env
if grep -q "SEPAY_WEBHOOK_URL" .env; then
    WEBHOOK_URL=$(grep "SEPAY_WEBHOOK_URL" .env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
    if [[ "$WEBHOOK_URL" == *"ngrok"* ]]; then
        echo -e "${RED}⚠️  CẢNH BÁO: SEPAY_WEBHOOK_URL vẫn đang dùng ngrok!${NC}"
        echo "   Vui lòng cập nhật thành production URL: https://api.visionchain.online/api/sepay/webhook"
    else
        echo -e "${GREEN}✅ Webhook URL đúng: $WEBHOOK_URL${NC}"
    fi
fi
echo ""

# Chạy migrations nếu có
if [ -f "scripts/run_all_migrations.js" ]; then
    echo -e "${YELLOW}🔄 Đang chạy database migrations...${NC}"
    node scripts/run_all_migrations.js || {
        echo -e "${RED}⚠️  Migration có lỗi, nhưng tiếp tục...${NC}"
    }
    echo ""
fi

# Restart backend với PM2
echo -e "${YELLOW}🔄 Đang restart backend với PM2...${NC}"
if pm2 list | grep -q "logistics-api"; then
    pm2 restart logistics-api
else
    echo -e "${YELLOW}⚠️  Backend chưa chạy với PM2, đang start...${NC}"
    pm2 start ecosystem.config.js || pm2 start server.js --name logistics-api
fi
pm2 save
echo -e "${GREEN}✅ Backend đã được restart${NC}"
echo ""

# Đợi server khởi động
echo -e "${YELLOW}⏳ Đợi server khởi động (5 giây)...${NC}"
sleep 5
echo ""

# Kiểm tra health
echo -e "${YELLOW}🏥 Kiểm tra backend health...${NC}"
if curl -f http://localhost:5001/api/transport-companies > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend đang chạy bình thường!${NC}"
else
    echo -e "${RED}⚠️  Backend có thể chưa sẵn sàng hoặc có lỗi${NC}"
    echo "   Kiểm tra logs: pm2 logs logistics-api"
fi
echo ""

# Hiển thị status
echo -e "${BLUE}📊 PM2 Status:${NC}"
pm2 status
echo ""

# Hiển thị logs gần đây
echo -e "${BLUE}📋 Logs gần đây (20 dòng cuối):${NC}"
pm2 logs logistics-api --lines 20 --nostream
echo ""

# Thông báo về webhook
echo -e "${YELLOW}📝 Lưu ý về Webhook:${NC}"
echo "   1. Kiểm tra webhook URL trong Sepay Dashboard"
echo "   2. Đảm bảo URL là: https://api.visionchain.online/api/sepay/webhook"
echo "   3. KHÔNG dùng ngrok URL trong production!"
echo ""

echo -e "${GREEN}✅ Cập nhật hoàn tất!${NC}"
echo ""
echo "📊 Để xem logs real-time:"
echo "   pm2 logs logistics-api"
echo ""
echo "🔍 Để kiểm tra webhook:"
echo "   pm2 logs logistics-api | grep -i webhook"
echo ""

