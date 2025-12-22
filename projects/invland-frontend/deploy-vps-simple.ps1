# Script deploy đơn giản - Không dùng emoji để tránh lỗi encoding

param(
    [string]$VpsHost = "14.225.205.116",
    [string]$VpsUser = "pressup-cms",
    [string]$VpsPort = "22",
    [string]$DeployPath = "/var/www/inlandv",
    [int]$AppPort = 4002,
    [switch]$AutoConfirm
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Public Frontend to VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra deploy-package
if (-not (Test-Path "deploy-package")) {
    Write-Host "[ERROR] Thu muc deploy-package khong ton tai!" -ForegroundColor Red
    Write-Host "   Chay prepare-deploy.ps1 truoc de tao package." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Tim thay deploy-package" -ForegroundColor Green
Write-Host ""

# Hiển thị thông tin
Write-Host "Thong tin ket noi:" -ForegroundColor Yellow
Write-Host "  Host: $VpsHost" -ForegroundColor White
Write-Host "  User: $VpsUser" -ForegroundColor White
Write-Host "  Port: $VpsPort" -ForegroundColor White
Write-Host "  Deploy Path: $DeployPath" -ForegroundColor White
Write-Host "  App Port: $AppPort" -ForegroundColor White
Write-Host ""

if (-not $AutoConfirm) {
    $confirm = Read-Host "Tiep tuc deploy? (y/n)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Da huy." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "Tu dong xac nhan (AutoConfirm)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Bat dau deploy..." -ForegroundColor Green
Write-Host ""

# Bước 1: Kiểm tra kết nối
Write-Host "[1/5] Kiem tra ket noi VPS..." -ForegroundColor Yellow
try {
    $testResult = ssh -p $VpsPort -o ConnectTimeout=5 -o StrictHostKeyChecking=no $VpsUser@$VpsHost "echo 'Connected'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Khong the ket noi den VPS"
    }
    Write-Host "[OK] Ket noi thanh cong" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Loi ket noi: $_" -ForegroundColor Red
    Write-Host "   Kiem tra lai thong tin ket noi hoac password." -ForegroundColor Yellow
    exit 1
}

# Bước 2: Kiểm tra Node.js
Write-Host "[2/5] Kiem tra Node.js tren VPS..." -ForegroundColor Yellow
$nodeVersion = ssh -p $VpsPort -o StrictHostKeyChecking=no $VpsUser@$VpsHost "node -v 2>/dev/null || echo 'NOT_INSTALLED'"
if ($nodeVersion -match "NOT_INSTALLED") {
    Write-Host "[WARNING] Node.js chua duoc cai dat tren VPS" -ForegroundColor Yellow
    $installNode = Read-Host "Ban co muon cai dat Node.js 18? (y/n)"
    if ($installNode -eq "y" -or $installNode -eq "Y") {
        Write-Host "Dang cai dat Node.js..." -ForegroundColor Yellow
        ssh -p $VpsPort -o StrictHostKeyChecking=no $VpsUser@$VpsHost "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    } else {
        Write-Host "[ERROR] Can Node.js de chay ung dung. Vui long cai dat thu cong." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
}

# Bước 3: Tạo thư mục deploy
Write-Host "[3/5] Tao thu muc deploy tren VPS..." -ForegroundColor Yellow
ssh -p $VpsPort -o StrictHostKeyChecking=no $VpsUser@$VpsHost "mkdir -p $DeployPath"
Write-Host "[OK] Da tao thu muc: $DeployPath" -ForegroundColor Green

# Bước 4: Upload files
Write-Host "[4/5] Upload files len VPS..." -ForegroundColor Yellow
Write-Host "   (Co the mat vai phut tuy vao kich thuoc files...)" -ForegroundColor Gray
Write-Host "   (Ban se duoc yeu cau nhap password)" -ForegroundColor Gray

scp -P $VpsPort -o StrictHostKeyChecking=no -r deploy-package/* "$VpsUser@${VpsHost}:$DeployPath/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Upload thanh cong" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Loi khi upload files" -ForegroundColor Red
    exit 1
}

# Bước 5: Setup trên VPS
Write-Host "[5/5] Setup tren VPS..." -ForegroundColor Yellow

# Tạo file .env nếu chưa có
ssh -p $VpsPort -o StrictHostKeyChecking=no $VpsUser@$VpsHost "cd $DeployPath && if [ ! -f .env ]; then cp .env.example .env && echo 'Da tao file .env'; fi"

# Set quyền thực thi cho start.sh
ssh -p $VpsPort -o StrictHostKeyChecking=no $VpsUser@$VpsHost "cd $DeployPath && chmod +x start.sh"

Write-Host "[OK] Setup hoan tat" -ForegroundColor Green

# Hoàn thành
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy thanh cong!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "De chay ung dung tren VPS, SSH vao va chay:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
Write-Host "  cd $DeployPath" -ForegroundColor White
Write-Host "  NODE_ENV=production PORT=$AppPort node server.js" -ForegroundColor White
Write-Host ""
Write-Host "Hoac dung PM2 (khuyen nghi):" -ForegroundColor Yellow
Write-Host "  npm install -g pm2" -ForegroundColor White
Write-Host "  pm2 start server.js --name public-frontend -- --port $AppPort" -ForegroundColor White
Write-Host "  pm2 save" -ForegroundColor White
Write-Host "  pm2 startup" -ForegroundColor White
Write-Host ""
Write-Host "Truy cap: http://$VpsHost`:$AppPort" -ForegroundColor Cyan
Write-Host ""

