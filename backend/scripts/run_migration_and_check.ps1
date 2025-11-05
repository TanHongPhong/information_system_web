# Script PowerShell để chạy migration và kiểm tra dữ liệu
# Yêu cầu: PostgreSQL client (psql) hoặc sử dụng database client khác

param(
    [string]$ConnectionString = $env:PSQLDB_CONNECTIONSTRING
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  CHẠY MIGRATION VÀ KIỂM TRA DỮ LIỆU" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $ConnectionString) {
    Write-Host "⚠️  Chưa có connection string!" -ForegroundColor Yellow
    Write-Host "Vui lòng set biến môi trường PSQLDB_CONNECTIONSTRING hoặc truyền vào parameter" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Ví dụ:" -ForegroundColor Yellow
    Write-Host '  $env:PSQLDB_CONNECTIONSTRING = "postgresql://user:pass@host/dbname"' -ForegroundColor Gray
    Write-Host '  .\run_migration_and_check.ps1' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

$migrationFile = "migrations\022_add_comprehensive_dashboard_data.sql"
$checkFile = "scripts\check_dashboard_data.sql"

Write-Host "📋 Bước 1: Kiểm tra file migration..." -ForegroundColor Blue
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Không tìm thấy file: $migrationFile" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Tìm thấy file migration" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Bước 2: Chạy migration..." -ForegroundColor Blue
Write-Host "File: $migrationFile" -ForegroundColor Gray
Write-Host ""

# Nếu có psql, chạy migration
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "Đang chạy migration..." -ForegroundColor Yellow
    $result = psql $ConnectionString -f $migrationFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration chạy thành công!" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration có lỗi:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Không tìm thấy psql command." -ForegroundColor Yellow
    Write-Host "Vui lòng chạy migration thủ công trong database client của bạn:" -ForegroundColor Yellow
    Write-Host "  File: $migrationFile" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "📋 Bước 3: Kiểm tra dữ liệu..." -ForegroundColor Blue
Write-Host ""

# Nếu có psql, chạy script kiểm tra
if (Get-Command psql -ErrorAction SilentlyContinue) {
    if (Test-Path $checkFile) {
        Write-Host "Đang kiểm tra dữ liệu..." -ForegroundColor Yellow
        psql $ConnectionString -f $checkFile
    } else {
        Write-Host "⚠️  Không tìm thấy file kiểm tra: $checkFile" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Không tìm thấy psql command." -ForegroundColor Yellow
    Write-Host "Vui lòng chạy script kiểm tra thủ công:" -ForegroundColor Yellow
    Write-Host "  File: $checkFile" -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  HOÀN THÀNH" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

