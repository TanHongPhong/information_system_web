# PowerShell script to remove unused test/debug scripts
Write-Host "🧹 Cleaning up unused test/debug scripts..." -ForegroundColor Cyan

# Remove test scripts
Remove-Item -Path "scripts\test_*.js" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed test scripts" -ForegroundColor Green

# Remove debug scripts
Remove-Item -Path "scripts\debug_*.js" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed debug scripts" -ForegroundColor Green

# Remove check scripts (one-time use)
Remove-Item -Path "scripts\check_*.js" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed check scripts" -ForegroundColor Green

# Remove fix scripts (one-time use, already run)
Remove-Item -Path "scripts\fix_*.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "scripts\auto_fix_*.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "scripts\manual_update_*.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "scripts\update_transactions_*.js" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed fix scripts" -ForegroundColor Green

# Remove setup scripts (one-time use)
Remove-Item -Path "scripts\setup_*.js" -Force -ErrorAction SilentlyContinue
Write-Host "✅ Removed setup scripts" -ForegroundColor Green

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "📋 Remaining scripts:" -ForegroundColor Cyan
Get-ChildItem -Path "scripts" -Filter "*.js" | Select-Object -ExpandProperty Name

