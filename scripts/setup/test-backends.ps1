# Test Backend Connections
# Kiểm tra backend có chạy được không

$ErrorActionPreference = "Continue"

Write-Host "[TEST] Testing Backend Connections" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Test CMS Backend
Write-Host "[TEST 1] CMS Backend (Port 4001)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"

if (Test-Path (Join-Path $cmsBackendPath "node_modules")) {
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
    
    if (Test-Path (Join-Path $cmsBackendPath ".env.local")) {
        Write-Host "[OK] .env.local exists" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start CMS Backend:" -ForegroundColor Cyan
        Write-Host "  cd projects\cms-backend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Then test: http://localhost:4001/health" -ForegroundColor Cyan
    } else {
        Write-Host "[WARN] .env.local missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] Dependencies not installed" -ForegroundColor Yellow
    Write-Host "  Run: cd projects\cms-backend && npm install" -ForegroundColor White
}

Write-Host ""

# Test InlandV Backend
Write-Host "[TEST 2] InlandV Backend (Port 4000)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$inlandvBackendPath = Join-Path $projectRoot "projects\inlandv-backend"

if (Test-Path (Join-Path $inlandvBackendPath "node_modules")) {
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
    
    if (Test-Path (Join-Path $inlandvBackendPath ".env.local")) {
        Write-Host "[OK] .env.local exists" -ForegroundColor Green
        Write-Host ""
        Write-Host "To start InlandV Backend:" -ForegroundColor Cyan
        Write-Host "  cd projects\inlandv-backend" -ForegroundColor White
        Write-Host "  npm run dev" -ForegroundColor White
        Write-Host ""
        Write-Host "Then test: http://localhost:4000/health" -ForegroundColor Cyan
    } else {
        Write-Host "[WARN] .env.local missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] Dependencies not installed" -ForegroundColor Yellow
    Write-Host "  Run: cd projects\inlandv-backend && npm install" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[INFO] Ready to start backends!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start CMS Backend in Terminal 1" -ForegroundColor White
Write-Host "  2. Start InlandV Backend in Terminal 2" -ForegroundColor White
Write-Host "  3. Test health endpoints" -ForegroundColor White
Write-Host "  4. Create admin user via API" -ForegroundColor White





