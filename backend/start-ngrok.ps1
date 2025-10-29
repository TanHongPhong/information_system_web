# PowerShell script để khởi động ngrok cho Sepay webhook

Write-Host "🚀 Đang kiểm tra ngrok..." -ForegroundColor Cyan

# Kiểm tra ngrok đã cài chưa
$ngrokExists = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokExists) {
    Write-Host "❌ ngrok chưa được cài đặt!" -ForegroundColor Red
    Write-Host "📥 Tải tại: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# Check if ngrok is already running
$ngrokRunning = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrokRunning) {
    Write-Host "⚠️  Ngrok đang chạy. Đang lấy URL..." -ForegroundColor Yellow
} else {
    Write-Host "🔄 Khởi động ngrok..." -ForegroundColor Green
    Start-Process ngrok -ArgumentList "http 5001" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# Get URL from ngrok API
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $url = $response.tunnels[0].public_url
    
    Write-Host ""
    Write-Host "✅ ==========================================" -ForegroundColor Green
    Write-Host "✅ Ngrok đã sẵn sàng!" -ForegroundColor Green
    Write-Host "✅ ==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Public URL: $url" -ForegroundColor Cyan
    Write-Host "🔗 Webhook URL: $url/api/sepay/webhook" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Hãy copy URL trên và thêm vào Sepay Dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Đăng nhập Sepay Dashboard"
    Write-Host "   2. Vào phần Webhooks"
    Write-Host "   3. Thêm URL: $url/api/sepay/webhook"
    Write-Host ""
    Write-Host "📊 Xem requests tại: http://localhost:4040" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "⚠️  Ngrok đang khởi động hoặc không thể kết nối..." -ForegroundColor Yellow
    Write-Host "📱 Truy cập http://localhost:4040 để xem URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sau khi có URL, thêm vào Sepay webhook:" -ForegroundColor Yellow
    Write-Host "   {YOUR_URL}/api/sepay/webhook" -ForegroundColor Gray
}

