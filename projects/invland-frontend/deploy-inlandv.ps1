# Script deploy lên VPS /var/www/inlandv
# Thông tin VPS từ vps.md

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

# Bước 1: Build project
Write-Host "[1/4] Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build thành công" -ForegroundColor Green
Write-Host ""

# Bước 2: Chuẩn bị deploy package
Write-Host "[2/4] Chuẩn bị deploy package..." -ForegroundColor Yellow
.\prepare-deploy.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prepare deploy failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deploy package đã sẵn sàng" -ForegroundColor Green
Write-Host ""

# Bước 3: Upload files lên VPS
Write-Host "[3/4] Upload files lên VPS..." -ForegroundColor Yellow
Write-Host "   Host: $VpsHost" -ForegroundColor Gray
Write-Host "   Path: $DeployPath" -ForegroundColor Gray
Write-Host "   (Có thể mất vài phút...)" -ForegroundColor Gray
Write-Host ""

# Tạo thư mục trên VPS (không cần sudo, user có thể tạo trong home hoặc dùng sudo riêng)
Write-Host "   Tạo thư mục trên VPS (nếu chưa có)..." -ForegroundColor Gray
Write-Host "   Lưu ý: Nếu thư mục cần sudo, bạn cần SSH vào VPS và chạy:" -ForegroundColor Cyan
Write-Host "      sudo mkdir -p $DeployPath; sudo chown -R $VpsUser`:www-data $DeployPath" -ForegroundColor White
Write-Host ""

# Thử tạo thư mục không cần sudo trước
ssh -p $VpsPort $VpsUser@$VpsHost "mkdir -p ~/deploy-temp" 2>&1 | Out-Null

# Upload files
Write-Host "   Upload files..." -ForegroundColor Gray
scp -P $VpsPort -r deploy-package/* "$VpsUser@${VpsHost}:$DeployPath/" 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Upload có thể thất bại nếu thư mục chưa tồn tại" -ForegroundColor Yellow
    Write-Host "   Hãy SSH vào VPS và tạo thư mục trước:" -ForegroundColor Cyan
    Write-Host "      ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
    Write-Host "      sudo mkdir -p $DeployPath; sudo chown -R $VpsUser`:www-data $DeployPath" -ForegroundColor White
    Write-Host "   Sau đó chạy lại script này hoặc upload thủ công:" -ForegroundColor Cyan
    Write-Host "      scp -P $VpsPort -r deploy-package/* $VpsUser@${VpsHost}:$DeployPath/" -ForegroundColor White
    exit 1
}
Write-Host "✅ Upload thành công" -ForegroundColor Green
Write-Host ""

# Bước 4: Setup trên VPS
Write-Host "[4/4] Setup trên VPS..." -ForegroundColor Yellow

$setupScript = @"
cd $DeployPath

# Tạo .env nếu chưa có
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Đã tạo .env từ .env.example"
fi

# Set quyền
chmod +x start.sh 2>/dev/null || true

# Install dependencies nếu cần
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Kiểm tra PM2
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 đã được cài đặt"
else
    echo "⚠️  PM2 chưa được cài đặt"
fi

echo "✅ Setup hoàn tất"
"@

ssh -p $VpsPort $VpsUser@$VpsHost $setupScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Có lỗi trong quá trình setup, nhưng files đã được upload" -ForegroundColor Yellow
} else {
    Write-Host "✅ Setup hoàn tất" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy hoàn tất!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Để chạy ứng dụng trên VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
Write-Host "  cd $DeployPath" -ForegroundColor White
Write-Host "  pm2 start server.js --name inlandv-frontend -- --port $AppPort" -ForegroundColor White
Write-Host "  pm2 save" -ForegroundColor White
Write-Host ""
Write-Host "Hoặc restart nếu đã chạy:" -ForegroundColor Yellow
Write-Host "  pm2 restart inlandv-frontend" -ForegroundColor White
Write-Host ""
Write-Host "URL: http://$VpsHost`:$AppPort" -ForegroundColor Cyan
Write-Host ""

