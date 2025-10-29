#!/bin/bash

# Script để khởi động ngrok và lấy URL cho Sepay webhook

echo "🚀 Đang khởi động ngrok..."

# Kiểm tra ngrok đã cài chưa
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok chưa được cài đặt!"
    echo "📥 Tải tại: https://ngrok.com/download"
    exit 1
fi

# Check if ngrok is already running
if pgrep -x "ngrok" > /dev/null; then
    echo "⚠️  Ngrok đang chạy. Đang lấy URL..."
else
    echo "🔄 Khởi động ngrok..."
    ngrok http 5001 > /dev/null 2>&1 &
    sleep 3
fi

# Get URL from ngrok API
URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok[^"]*' | head -1)

if [ -z "$URL" ]; then
    echo "⚠️  Ngrok đang khởi động..."
    echo "📱 Truy cập http://localhost:4040 để xem URL"
    echo ""
    echo "Sau khi có URL, thêm vào Sepay webhook:"
    echo "   {YOUR_URL}/api/sepay/webhook"
else
    echo ""
    echo "✅ =========================================="
    echo "✅ Ngrok đã sẵn sàng!"
    echo "✅ =========================================="
    echo ""
    echo "🌐 Public URL: $URL"
    echo "🔗 Webhook URL: $URL/api/sepay/webhook"
    echo ""
    echo "📋 Hãy copy URL trên và thêm vào Sepay Dashboard:"
    echo "   1. Đăng nhập Sepay Dashboard"
    echo "   2. Vào phần Webhooks"
    echo "   3. Thêm URL: $URL/api/sepay/webhook"
    echo ""
    echo "📊 Xem requests tại: http://localhost:4040"
    echo ""
fi

