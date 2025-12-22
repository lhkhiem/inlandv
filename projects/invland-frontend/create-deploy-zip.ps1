# Script tạo file ZIP để deploy lên VPS
# Giải quyết vấn đề không copy được .next

$deployDir = "deploy-package"
$zipFile = "deploy-package.zip"

Write-Host "Tao file ZIP de deploy..." -ForegroundColor Green

# Xóa file zip cũ nếu có
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
    Write-Host "Da xoa file zip cu" -ForegroundColor Yellow
}

# Kiểm tra thư mục deploy-package
if (-not (Test-Path $deployDir)) {
    Write-Host "Thu muc $deployDir khong ton tai!" -ForegroundColor Red
    Write-Host "Chay prepare-deploy.ps1 truoc" -ForegroundColor Yellow
    exit 1
}

# Tạo file ZIP
Write-Host "Dang nen thu muc $deployDir..." -ForegroundColor Yellow
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipFile -Force

$zipSize = (Get-Item $zipFile).Length / 1MB
Write-Host ""
Write-Host "Hoan thanh! File ZIP da duoc tao: $zipFile" -ForegroundColor Green
Write-Host "Kich thuoc: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "De upload len VPS:" -ForegroundColor Cyan
Write-Host "   scp $zipFile user@vps:/home/user/" -ForegroundColor White
Write-Host ""
Write-Host "Tren VPS, giai nen:" -ForegroundColor Cyan
Write-Host "   unzip deploy-package.zip -d /home/user/public-frontend/" -ForegroundColor White
Write-Host ""








