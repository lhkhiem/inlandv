# File cấu hình deploy - Đổi tên thành deploy-config.ps1 và điền thông tin

# Thông tin VPS
$VPS_HOST = "your-vps-ip-or-domain"      # Ví dụ: "123.456.789.0" hoặc "vps.example.com"
$VPS_USER = "root"                        # User SSH, thường là "root" hoặc "ubuntu"
$VPS_PORT = "22"                          # Port SSH, mặc định là 22
$DEPLOY_PATH = "/home/$VPS_USER/public-frontend"  # Đường dẫn deploy trên VPS
$SSH_KEY_PATH = ""                        # Đường dẫn đến SSH private key (nếu dùng key, để trống nếu dùng password)
$APP_PORT = 4002                          # Port chạy ứng dụng

# Cách sử dụng:
# 1. Copy file này: Copy-Item deploy-config.example.ps1 deploy-config.ps1
# 2. Sửa thông tin VPS ở trên
# 3. Chạy: .\deploy-to-vps.ps1 -VpsHost $VPS_HOST -VpsUser $VPS_USER -VpsPort $VPS_PORT -DeployPath $DEPLOY_PATH -SshKeyPath $SSH_KEY_PATH -Port $APP_PORT
# 
# Hoặc đơn giản hơn, chạy trực tiếp:
# .\deploy-to-vps.ps1 -VpsHost "123.456.789.0" -VpsUser "root" -Port 4002

