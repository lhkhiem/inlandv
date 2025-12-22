# Script tự động deploy lên VPS
# Sử dụng: .\deploy-to-vps.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [string]$VpsUser,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsPort = "22",
    
    [Parameter(Mandatory=$false)]
    [string]$DeployPath = "/home/$VpsUser/public-frontend",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKeyPath = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 4002
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Public Frontend to VPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra deploy-package
if (-not (Test-Path "deploy-package")) {
    Write-Host "❌ Thư mục deploy-package không tồn tại!" -ForegroundColor Red
    Write-Host "   Chạy prepare-deploy.ps1 trước để tạo package." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Tìm thấy deploy-package" -ForegroundColor Green
Write-Host ""

# Xác nhận thông tin
Write-Host "Thông tin kết nối:" -ForegroundColor Yellow
Write-Host "  Host: $VpsHost" -ForegroundColor White
Write-Host "  User: $VpsUser" -ForegroundColor White
Write-Host "  Port: $VpsPort" -ForegroundColor White
Write-Host "  Deploy Path: $DeployPath" -ForegroundColor White
Write-Host "  App Port: $Port" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Tiếp tục deploy? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Đã hủy." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Bắt đầu deploy..." -ForegroundColor Green
Write-Host ""

# Tạo SSH command prefix
$sshCmd = if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    "ssh -i `"$SshKeyPath`" -p $VpsPort $VpsUser@$VpsHost"
} else {
    "ssh -p $VpsPort $VpsUser@$VpsHost"
}

$scpCmd = if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    "scp -i `"$SshKeyPath`" -P $VpsPort -r"
} else {
    "scp -P $VpsPort -r"
}

# Bước 1: Kiểm tra kết nối
Write-Host "[1/6] Kiểm tra kết nối VPS..." -ForegroundColor Yellow
try {
    $testConnection = if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
        ssh -i "$SshKeyPath" -p $VpsPort -o ConnectTimeout=5 $VpsUser@$VpsHost "echo 'Connected'"
    } else {
        ssh -p $VpsPort -o ConnectTimeout=5 $VpsUser@$VpsHost "echo 'Connected'"
    }
    
    if ($LASTEXITCODE -ne 0) {
        throw "Không thể kết nối đến VPS"
    }
    Write-Host "✅ Kết nối thành công" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi kết nối: $_" -ForegroundColor Red
    Write-Host "   Kiểm tra lại thông tin kết nối hoặc SSH key." -ForegroundColor Yellow
    exit 1
}

# Bước 2: Kiểm tra Node.js trên VPS
Write-Host "[2/6] Kiểm tra Node.js trên VPS..." -ForegroundColor Yellow
$nodeVersion = if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    ssh -i "$SshKeyPath" -p $VpsPort $VpsUser@$VpsHost "node -v 2>/dev/null || echo 'NOT_INSTALLED'"
} else {
    ssh -p $VpsPort $VpsUser@$VpsHost "node -v 2>/dev/null || echo 'NOT_INSTALLED'"
}

if ($nodeVersion -match "NOT_INSTALLED") {
    Write-Host "⚠️  Node.js chưa được cài đặt trên VPS" -ForegroundColor Yellow
    $installNode = Read-Host "Bạn có muốn cài đặt Node.js 18? (y/n)"
    if ($installNode -eq "y" -or $installNode -eq "Y") {
        Write-Host "Đang cài đặt Node.js..." -ForegroundColor Yellow
        if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
            ssh -i "$SshKeyPath" -p $VpsPort $VpsUser@$VpsHost "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        } else {
            ssh -p $VpsPort $VpsUser@$VpsHost "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        }
    } else {
        Write-Host "❌ Cần Node.js để chạy ứng dụng. Vui lòng cài đặt thủ công." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
}

# Bước 3: Tạo thư mục deploy trên VPS
Write-Host "[3/6] Tạo thư mục deploy trên VPS..." -ForegroundColor Yellow
if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    ssh -i "$SshKeyPath" -p $VpsPort $VpsUser@$VpsHost "mkdir -p $DeployPath"
} else {
    ssh -p $VpsPort $VpsUser@$VpsHost "mkdir -p $DeployPath"
}
Write-Host "✅ Đã tạo thư mục: $DeployPath" -ForegroundColor Green

# Bước 4: Upload files
Write-Host "[4/6] Upload files lên VPS..." -ForegroundColor Yellow
Write-Host "   (Có thể mất vài phút tùy vào kích thước files...)" -ForegroundColor Gray

if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    & scp -i "$SshKeyPath" -P $VpsPort -r deploy-package/* "$VpsUser@${VpsHost}:$DeployPath/"
} else {
    & scp -P $VpsPort -r deploy-package/* "$VpsUser@${VpsHost}:$DeployPath/"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Upload thành công" -ForegroundColor Green
} else {
    Write-Host "❌ Lỗi khi upload files" -ForegroundColor Red
    exit 1
}

# Bước 5: Setup trên VPS
Write-Host "[5/6] Setup trên VPS..." -ForegroundColor Yellow

# Tạo file .env nếu chưa có
$envSetup = @"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Đã tạo file .env từ .env.example"
fi
"@

if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    ssh -i "$SshKeyPath" -p $VpsPort $VpsUser@$VpsHost "cd $DeployPath && $envSetup"
} else {
    ssh -p $VpsPort $VpsUser@$VpsHost "cd $DeployPath && $envSetup"
}

# Set quyền thực thi cho start.sh
if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
    ssh -i "$SshKeyPath" -p $VpsPort $VpsUser@$VpsHost "cd $DeployPath && chmod +x start.sh"
} else {
    ssh -p $VpsPort $VpsUser@$VpsHost "cd $DeployPath && chmod +x start.sh"
}

Write-Host "✅ Setup hoàn tất" -ForegroundColor Green

# Bước 6: Hướng dẫn chạy
Write-Host ""
Write-Host "[6/6] Hoàn thành!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy thành công!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Để chạy ứng dụng trên VPS, SSH vào và chạy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ssh -p $VpsPort $VpsUser@$VpsHost" -ForegroundColor White
Write-Host "  cd $DeployPath" -ForegroundColor White
Write-Host "  NODE_ENV=production PORT=$Port node server.js" -ForegroundColor White
Write-Host ""
Write-Host "Hoặc dùng PM2 (khuyến nghị):" -ForegroundColor Yellow
Write-Host "  npm install -g pm2" -ForegroundColor White
Write-Host "  pm2 start server.js --name public-frontend -- --port $Port" -ForegroundColor White
Write-Host "  pm2 save" -ForegroundColor White
Write-Host "  pm2 startup" -ForegroundColor White
Write-Host ""
Write-Host "Truy cập: http://$VpsHost`:$Port" -ForegroundColor Cyan
Write-Host ""

