# Hướng dẫn Deploy Public Frontend lên VPS /var/www/inlandv

## Thông tin VPS
- **Host**: 14.225.205.116
- **User**: pressup-cms
- **Port**: 22
- **Deploy Path**: /var/www/inlandv
- **App Port**: 4002

## Cách 1: Deploy tự động (khuyến nghị)

### Bước 1: Tạo thư mục trên VPS (cần sudo)
SSH vào VPS và chạy:
```bash
ssh -p 22 pressup-cms@14.225.205.116
sudo mkdir -p /var/www/inlandv
sudo chown -R pressup-cms:www-data /var/www/inlandv
```

### Bước 2: Chạy script deploy
Từ thư mục `projects/public-frontend`, chạy:
```powershell
.\deploy-inlandv.ps1
```

Script sẽ tự động:
1. Build project
2. Chuẩn bị deploy package
3. Upload files lên VPS
4. Setup trên VPS

### Bước 3: Chạy ứng dụng
SSH vào VPS và chạy:
```bash
cd /var/www/inlandv
chmod +x start.sh
chmod +x setup-on-vps.sh
./setup-on-vps.sh
```

Hoặc chạy thủ công:
```bash
cd /var/www/inlandv

# Tạo .env nếu chưa có
cp .env.example .env

# Install dependencies nếu cần
npm install --production

# Chạy với PM2
pm2 start server.js --name inlandv-frontend -- --port 4002
pm2 save
pm2 startup
```

## Cách 2: Deploy thủ công

### Bước 1: Build và chuẩn bị
```powershell
cd projects/public-frontend
npm run build
.\prepare-deploy.ps1
```

### Bước 2: Tạo thư mục trên VPS
```bash
ssh -p 22 pressup-cms@14.225.205.116
sudo mkdir -p /var/www/inlandv
sudo chown -R pressup-cms:www-data /var/www/inlandv
exit
```

### Bước 3: Upload files
```powershell
scp -P 22 -r deploy-package/* pressup-cms@14.225.205.116:/var/www/inlandv/
scp -P 22 setup-on-vps.sh pressup-cms@14.225.205.116:/var/www/inlandv/
```

### Bước 4: Setup trên VPS
```bash
ssh -p 22 pressup-cms@14.225.205.116
cd /var/www/inlandv
chmod +x setup-on-vps.sh
./setup-on-vps.sh
```

## Kiểm tra và quản lý

### Xem logs
```bash
pm2 logs inlandv-frontend
```

### Restart ứng dụng
```bash
pm2 restart inlandv-frontend
```

### Stop ứng dụng
```bash
pm2 stop inlandv-frontend
```

### Xem status
```bash
pm2 status
```

## URL
- **Local**: http://14.225.205.116:4002
- **Nginx proxy**: Tùy theo cấu hình domain

## Lưu ý
- Đảm bảo port 4002 không bị firewall chặn
- Kiểm tra Node.js version >= 18 trên VPS
- Nếu có lỗi, kiểm tra logs: `pm2 logs inlandv-frontend`


