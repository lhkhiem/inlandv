# Hướng dẫn Deploy Nhanh - Standalone Build

## ✅ Đã chuẩn bị sẵn

Sau khi chạy `npm run build` và `prepare-deploy.ps1`, bạn đã có thư mục `deploy-package/` chứa:
- ✅ `server.js` - Next.js standalone server
- ✅ `.next/static/` - Static assets
- ✅ `public/` - Public files  
- ✅ `package.json` - Dependencies info
- ✅ `start.sh` - Script chạy server
- ✅ `.env.example` - Template environment variables

## 🚀 Cách deploy lên VPS

### Bước 1: Upload files
```bash
# Từ máy local (Windows PowerShell hoặc Git Bash)
scp -r deploy-package/* user@your-vps-ip:/home/user/public-frontend/
```

### Bước 2: Trên VPS - Cài Node.js (nếu chưa có)
```bash
# Kiểm tra Node.js version
node -v  # Cần >= 18

# Nếu chưa có, cài đặt:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Bước 3: Trên VPS - Setup và chạy
```bash
cd /home/user/public-frontend

# Tạo file .env
cp .env.example .env
nano .env  # Sửa NEXT_PUBLIC_API_URL nếu cần

# Chạy server
chmod +x start.sh
./start.sh

# Hoặc chạy trực tiếp:
NODE_ENV=production PORT=4002 node server.js
```

### Bước 4: Chạy với PM2 (khuyến nghị - tự động restart)
```bash
# Cài PM2
npm install -g pm2

# Chạy với PM2
cd /home/user/public-frontend
pm2 start server.js --name "public-frontend" --env production -- --port 4002

# Lưu cấu hình để tự động start khi reboot
pm2 save
pm2 startup
```

### Bước 5: Cấu hình Nginx (tùy chọn)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 Lưu ý

1. **Port**: Đảm bảo port 4002 không bị firewall chặn
   ```bash
   sudo ufw allow 4002
   ```

2. **Environment Variables**: Sửa file `.env` trên VPS với đúng API URL

3. **Kiểm tra**: Sau khi deploy, truy cập `http://your-vps-ip:4002` để test

4. **Logs**: Nếu dùng PM2, xem logs bằng:
   ```bash
   pm2 logs public-frontend
   ```

## 🎯 Tóm tắt nhanh

```bash
# 1. Upload
scp -r deploy-package/* user@vps:/path/to/deploy/

# 2. Trên VPS
cd /path/to/deploy
cp .env.example .env
pm2 start server.js --name "public-frontend" -- --port 4002
pm2 save
```

Xong! 🎉

