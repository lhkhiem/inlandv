# Script build production và chuẩn bị deploy package
# Đảm bảo build đầy đủ và ổn định cho production

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD PRODUCTION - PUBLIC FRONTEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Clean và cài đặt dependencies
Write-Host "[1/4] Cleaning và cài đặt dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  - Đang cài đặt dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Lỗi khi cài đặt dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ Đã cài đặt dependencies" -ForegroundColor Green
} else {
    Write-Host "  ✓ node_modules đã tồn tại" -ForegroundColor Green
}

# Bước 2: Clean build cũ
Write-Host "[2/4] Cleaning build cũ..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  ✓ Đã xóa .next cũ" -ForegroundColor Green
}

# Bước 3: Build production
Write-Host "[3/4] Building Next.js production..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Lỗi khi build!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Build thành công!" -ForegroundColor Green

# Bước 4: Chuẩn bị deploy package
Write-Host "[4/4] Chuẩn bị deploy package..." -ForegroundColor Yellow
$scriptPath = Join-Path $PSScriptRoot "prepare-deploy.ps1"
& $scriptPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Lỗi khi chuẩn bị deploy package!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ BUILD HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Thư mục deploy: deploy-package" -ForegroundColor Cyan
Write-Host ""
Write-Host "Để upload lên VPS:" -ForegroundColor Yellow
Write-Host "  scp -r deploy-package\* user@vps:/path/to/deploy/" -ForegroundColor White
Write-Host ""
Write-Host "Hoặc tạo file ZIP:" -ForegroundColor Yellow
Write-Host '  Compress-Archive -Path deploy-package\* -DestinationPath deploy-package.zip -Force' -ForegroundColor White
Write-Host ""



