# PowerShell script để deploy backend lên VPS (chạy trên VPS)

Write-Host "🚀 Starting backend deployment..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --production

# Check database connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
node -e "require('dotenv').config(); const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.PSQLDB_CONNECTIONSTRING }); pool.query('SELECT NOW()').then(() => { console.log('✅ Database connection OK'); process.exit(0); }).catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    exit 1
}

# Stop existing PM2 process if running
Write-Host "🛑 Stopping existing PM2 process..." -ForegroundColor Yellow
pm2 stop logistics-api 2>$null
pm2 delete logistics-api 2>$null

# Start with PM2
Write-Host "▶️  Starting backend with PM2..." -ForegroundColor Yellow
pm2 start server.js --name logistics-api
pm2 save

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Health check
Write-Host "🏥 Health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/test/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running!" -ForegroundColor Green
        pm2 status
    }
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    pm2 logs logistics-api --lines 50
    exit 1
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green

