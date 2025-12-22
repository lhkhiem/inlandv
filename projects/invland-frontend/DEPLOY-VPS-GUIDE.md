# Hướng dẫn Deploy lên VPS - Production

## 📦 Bước 1: Chuẩn bị code để deploy

### Trên máy local (Windows):

```powershell
# 1. Vào thư mục project
cd projects/public-frontend

# 2. Build production
npm run build

# 3. Chuẩn bị package deploy
.\prepare-deploy.ps1
```

Sau khi chạy xong, bạn sẽ có thư mục `deploy-package/` chứa tất cả files cần thiết.

## 📤 Bước 2: Upload lên VPS

### Cách 1: Dùng SCP (từ Windows PowerShell hoặc Git Bash)

```bash
# Upload toàn bộ thư mục deploy-package
scp -r deploy-package/* user@your-vps-ip:/home/user/public-frontend/
```

### Cách 2: Dùng WinSCP hoặc FileZilla
- Kết nối đến VPS
- Upload toàn bộ nội dung trong thư mục `deploy-package/` lên VPS

## 🖥️ Bước 3: Setup trên VPS

### 3.1. Kiểm tra Node.js

```bash
node -v  # Cần >= 18.x
npm -v
```

Nếu chưa có Node.js, cài đặt:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Hoặc dùng nvm (khuyến nghị)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

### 3.2. Tạo file .env

```bash
cd /home/user/public-frontend
cp .env.example .env
nano .env
```

Sửa các giá trị trong `.env`:
```env
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_API_URL=http://your-api-url:4000/api
```

### 3.3. Cài đặt PM2 (Process Manager)

```bash
npm install -g pm2
```

## 🚀 Bước 4: Chạy ứng dụng

### Cách 1: Chạy trực tiếp (test)

```bash
cd /home/user/public-frontend
chmod +x start.sh
./start.sh
```

### Cách 2: Dùng PM2 (khuyến nghị cho production)

```bash
cd /home/user/public-frontend

# Chạy với PM2
pm2 start server.js --name "public-frontend" --env production -- --port 4000

# Lưu cấu hình để tự động start khi reboot
pm2 save
pm2 startup  # Chạy lệnh này và làm theo hướng dẫn

# Xem logs
pm2 logs public-frontend

# Xem status
pm2 status

# Restart
pm2 restart public-frontend

# Stop
pm2 stop public-frontend
```

## 🔧 Bước 5: Cấu hình Nginx (tùy chọn)

Nếu muốn dùng domain và HTTPS:

```bash
sudo nano /etc/nginx/sites-available/public-frontend
```

Nội dung file:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt:

```bash
sudo ln -s /etc/nginx/sites-available/public-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔥 Bước 6: Cấu hình Firewall

```bash
# Mở port 4000 (nếu chạy trực tiếp)
sudo ufw allow 4000/tcp

# Hoặc chỉ mở port 80, 443 (nếu dùng Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## ✅ Kiểm tra

1. **Kiểm tra ứng dụng chạy:**
   ```bash
   curl http://localhost:4000
   ```

2. **Truy cập từ browser:**
   - Nếu chạy trực tiếp: `http://your-vps-ip:4000`
   - Nếu dùng Nginx: `http://your-domain.com`

3. **Xem logs nếu có lỗi:**
   ```bash
   pm2 logs public-frontend
   ```

## 📝 Tóm tắt nhanh

```bash
# 1. Trên local: Build và prepare
npm run build
.\prepare-deploy.ps1

# 2. Upload lên VPS
scp -r deploy-package/* user@vps:/home/user/public-frontend/

# 3. Trên VPS: Setup và chạy
cd /home/user/public-frontend
cp .env.example .env
nano .env  # Sửa config
pm2 start server.js --name "public-frontend" -- --port 4000
pm2 save
pm2 startup
```

## 🐛 Troubleshooting

1. **Lỗi "Cannot find module":**
   ```bash
   cd /home/user/public-frontend
   npm install --production
   ```

2. **Port đã được sử dụng:**
   ```bash
   # Kiểm tra port
   sudo lsof -i :4000
   # Hoặc đổi port trong .env và PM2
   ```

3. **PM2 không tự động start:**
   ```bash
   pm2 startup
   # Chạy lại lệnh được output
   pm2 save
   ```

4. **Xem logs chi tiết:**
   ```bash
   pm2 logs public-frontend --lines 100
   ```

## 📦 Files cần upload

Sau khi chạy `prepare-deploy.ps1`, thư mục `deploy-package/` sẽ chứa:
- ✅ `server.js` - Next.js standalone server
- ✅ `.next/static/` - Static assets đã build
- ✅ `public/` - Public files (images, logo, etc.)
- ✅ `package.json` - Dependencies info
- ✅ `start.sh` - Script chạy server
- ✅ `.env.example` - Template environment variables

**Chỉ cần upload nội dung trong `deploy-package/` lên VPS!**








