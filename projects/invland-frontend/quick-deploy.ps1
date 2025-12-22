# Script deploy nhanh - Nhập thông tin khi chạy

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Deploy to VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra deploy-package
if (-not (Test-Path "deploy-package")) {
    Write-Host "❌ Thư mục deploy-package không tồn tại!" -ForegroundColor Red
    Write-Host "   Đang chạy prepare-deploy.ps1..." -ForegroundColor Yellow
    & .\prepare-deploy.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Lỗi khi tạo deploy package" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Package deploy đã sẵn sàng" -ForegroundColor Green
Write-Host ""

# Nhập thông tin VPS
Write-Host "Nhập thông tin kết nối VPS:" -ForegroundColor Yellow
$VpsHost = Read-Host "  VPS IP hoặc Domain"
$VpsUser = Read-Host "  SSH User (mặc định: root)" 
if ([string]::IsNullOrWhiteSpace($VpsUser)) { $VpsUser = "root" }

$VpsPort = Read-Host "  SSH Port (mặc định: 22)"
if ([string]::IsNullOrWhiteSpace($VpsPort)) { $VpsPort = "22" }

$DeployPath = Read-Host "  Đường dẫn deploy (mặc định: /home/$VpsUser/public-frontend)"
if ([string]::IsNullOrWhiteSpace($DeployPath)) { $DeployPath = "/home/$VpsUser/public-frontend" }

$AppPort = Read-Host "  Port ứng dụng (mặc định: 4002)"
if ([string]::IsNullOrWhiteSpace($AppPort)) { $AppPort = "4002" }

$UseSshKey = Read-Host "  Dùng SSH Key? (y/n, mặc định: n)"
$SshKeyPath = ""
if ($UseSshKey -eq "y" -or $UseSshKey -eq "Y") {
    $SshKeyPath = Read-Host "  Đường dẫn SSH private key"
}

Write-Host ""
Write-Host "Thông tin đã nhập:" -ForegroundColor Cyan
Write-Host "  Host: $VpsHost" -ForegroundColor White
Write-Host "  User: $VpsUser" -ForegroundColor White
Write-Host "  Port: $VpsPort" -ForegroundColor White
Write-Host "  Deploy Path: $DeployPath" -ForegroundColor White
Write-Host "  App Port: $AppPort" -ForegroundColor White
if ($SshKeyPath) {
    Write-Host "  SSH Key: $SshKeyPath" -ForegroundColor White
}
Write-Host ""

# Chạy script deploy chính
& .\deploy-to-vps.ps1 -VpsHost $VpsHost -VpsUser $VpsUser -VpsPort $VpsPort -DeployPath $DeployPath -SshKeyPath $SshKeyPath -Port $AppPort

