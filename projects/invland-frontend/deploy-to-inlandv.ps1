# Script deploy len VPS /var/www/inlandv
# Thong tin VPS tu vps.md

$ErrorActionPreference = "Stop"

$VpsHost = "14.225.205.116"
$VpsUser = "pressup-cms"
$VpsPort = "22"
$DeployPath = "/var/www/inlandv"
$AppPort = "4002"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Public Frontend to VPS" -ForegroundColor Cyan
Write-Host "  Path: $DeployPath" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Build project (skip neu da build)
Write-Host "[1/4] Building project..." -ForegroundColor Yellow
if (-not (Test-Path ".next")) {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Build thanh cong" -ForegroundColor Green
} else {
    Write-Host "[SKIP] Da co build, bo qua..." -ForegroundColor Gray
}
Write-Host ""

# Buoc 2: Chuan bi deploy package
Write-Host "[2/4] Chuan bi deploy package..." -ForegroundColor Yellow
if (-not (Test-Path "deploy-package")) {
    .\prepare-deploy.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Prepare deploy failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Deploy package da san sang" -ForegroundColor Green
Write-Host ""

# Buoc 3: Upload files len VPS
Write-Host "[3/4] Upload files len VPS..." -ForegroundColor Yellow
Write-Host "   Host: $VpsHost" -ForegroundColor Gray
Write-Host "   Path: $DeployPath" -ForegroundColor Gray
Write-Host "   (Co the mat vai phut...)" -ForegroundColor Gray
Write-Host ""

# Kiem tra ket noi
Write-Host "   Kiem tra ket noi..." -ForegroundColor Gray
$testResult = ssh -p $VpsPort -o ConnectTimeout=5 -o StrictHostKeyChecking=no $VpsUser@$VpsHost "echo 'OK'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Khong the ket noi den VPS" -ForegroundColor Red
    Write-Host "   Vui long kiem tra:" -ForegroundColor Yellow
    Write-Host "   - SSH credentials" -ForegroundColor White
    Write-Host "   - VPS IP: $VpsHost" -ForegroundColor White
    Write-Host "   - SSH Port: $VpsPort" -ForegroundColor White
    exit 1
}
Write-Host "[OK] Ket noi thanh cong" -ForegroundColor Green
Write-Host ""

# Upload files
Write-Host "   Upload files..." -ForegroundColor Gray
scp -P $VpsPort -r deploy-package/* "$VpsUser@${VpsHost}:$DeployPath/" 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Upload co the that bai neu thu muc chua ton tai" -ForegroundColor Yellow
    Write-Host "   Hay SSH vao VPS va tao thu muc truoc:" -ForegroundColor Cyan
    Write-Host "      ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
    Write-Host "      sudo mkdir -p $DeployPath" -ForegroundColor White
    Write-Host "      sudo chown -R $VpsUser`:www-data $DeployPath" -ForegroundColor White
    Write-Host "   Sau do chay lai script nay:" -ForegroundColor Cyan
    Write-Host "      .\deploy-to-inlandv.ps1" -ForegroundColor White
    exit 1
}
Write-Host "[OK] Upload thanh cong" -ForegroundColor Green
Write-Host ""

# Buoc 4: Setup tren VPS
Write-Host "[4/4] Setup tren VPS..." -ForegroundColor Yellow

$setupScript = "cd $DeployPath; if [ ! -f .env ]; then cp .env.example .env; echo 'Da tao .env'; fi; chmod +x start.sh 2>/dev/null || true; if [ ! -d node_modules ]; then echo 'Installing dependencies...'; npm install --production; fi; if command -v pm2 > /dev/null 2>&1; then echo 'PM2 da duoc cai dat'; else echo 'PM2 chua duoc cai dat'; fi; echo 'Setup hoan tat'"

ssh -p $VpsPort $VpsUser@$VpsHost $setupScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Co loi trong qua trinh setup, nhung files da duoc upload" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Setup hoan tat" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy hoan tat!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "De chay ung dung tren VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
Write-Host "  cd $DeployPath" -ForegroundColor White
Write-Host "  pm2 start server.js --name inlandv-frontend -- --port $AppPort" -ForegroundColor White
Write-Host "  pm2 save" -ForegroundColor White
Write-Host ""
Write-Host "Hoac restart neu da chay:" -ForegroundColor Yellow
Write-Host "  pm2 restart inlandv-frontend" -ForegroundColor White
Write-Host ""
Write-Host "URL: http://$VpsHost`:$AppPort" -ForegroundColor Cyan
Write-Host ""







