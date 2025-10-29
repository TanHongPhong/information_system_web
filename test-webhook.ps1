# Test Sepay Webhook Script
# Usage: 
#   .\test-webhook.ps1 -OrderId 123 -Amount 100000
#   .\test-webhook.ps1 -OrderId 123 -Amount 100000 -AutoGetUrl

param(
    [Parameter(Mandatory=$true)]
    [int]$OrderId,
    
    [Parameter(Mandatory=$true)]
    [int]$Amount,
    
    [string]$WebhookUrl = "",
    
    [switch]$AutoGetUrl
)

# Đọc BACKEND_URL từ .env nếu không có parameter
if (-not $WebhookUrl) {
    if ($AutoGetUrl) {
        # Thử lấy từ ngrok API
        try {
            $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 2;
            $WebhookUrl = $ngrokApi.tunnels[0].public_url + "/api/sepay/webhook";
            Write-Host "✅ Đã lấy URL từ ngrok: $WebhookUrl" -ForegroundColor Green;
        } catch {
            Write-Host "⚠️  Không lấy được từ ngrok API" -ForegroundColor Yellow;
        }
    }
    
    if (-not $WebhookUrl) {
        if (Test-Path "backend\.env") {
            $envContent = Get-Content "backend\.env" -Raw;
            if ($envContent -match "BACKEND_URL=(.+?)(`r?`n|$)") {
                $WebhookUrl = $matches[1].Trim() + "/api/sepay/webhook";
            }
        }
    }
    
    if (-not $WebhookUrl) {
        Write-Host "❌ Không tìm thấy BACKEND_URL" -ForegroundColor Red;
        Write-Host "💡 Vui lòng:" -ForegroundColor Yellow;
        Write-Host "   1. Cung cấp -WebhookUrl parameter" -ForegroundColor White;
        Write-Host "   2. Hoặc đảm bảo BACKEND_URL trong backend/.env" -ForegroundColor White;
        Write-Host "   3. Hoặc dùng -AutoGetUrl để tự động lấy từ ngrok" -ForegroundColor White;
        exit 1;
    }
}

$transactionCode = "TEST-WEBHOOK-$(Get-Date -Format 'yyyyMMddHHmmss')";

$body = @{
    order_id = $OrderId
    amount = $Amount
    transaction_code = $transactionCode
    payment_method = "vietqr"
} | ConvertTo-Json -Compress;

Write-Host "";
Write-Host "🧪 TEST WEBHOOK SEPAY" -ForegroundColor Cyan;
Write-Host "";
Write-Host "📋 Thông tin:" -ForegroundColor Yellow;
Write-Host "   Order ID: $OrderId" -ForegroundColor White;
Write-Host "   Amount: $($Amount.ToString('N0')) VND" -ForegroundColor White;
Write-Host "   Transaction Code: $transactionCode" -ForegroundColor White;
Write-Host "   Webhook URL: $WebhookUrl" -ForegroundColor White;
Write-Host "";

try {
    Write-Host "📤 Đang gửi webhook..." -ForegroundColor Cyan;
    
    $response = Invoke-RestMethod -Uri $WebhookUrl `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10;
    
    Write-Host "";
    Write-Host "✅ WEBHOOK THÀNH CÔNG!" -ForegroundColor Green;
    Write-Host "";
    Write-Host "📊 Response:" -ForegroundColor Yellow;
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Gray;
    Write-Host "";
    Write-Host "💡 Kiểm tra:" -ForegroundColor Cyan;
    Write-Host "   1. Backend logs → Xem 'WEBHOOK RECEIVED'" -ForegroundColor White;
    Write-Host "   2. Database → SELECT * FROM Transactions WHERE transaction_code = '$transactionCode'" -ForegroundColor White;
    Write-Host "   3. Order status → SELECT order_id, status FROM CargoOrders WHERE order_id = $OrderId" -ForegroundColor White;
    
} catch {
    Write-Host "";
    Write-Host "❌ WEBHOOK THẤT BẠI!" -ForegroundColor Red;
    Write-Host "";
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow;
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__;
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow;
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream());
        $responseBody = $reader.ReadToEnd();
        Write-Host "";
        Write-Host "Response:" -ForegroundColor Yellow;
        Write-Host $responseBody -ForegroundColor Gray;
    }
}

Write-Host "";

