# Hướng dẫn Deploy Đơn Giản - Build trên VPS

## 🎯 Giải pháp tốt nhất: Build trực tiếp trên VPS

Vì standalone build có thể gặp vấn đề, cách tốt nhất là **build trực tiếp trên VPS**.

## 📦 Bước 1: Upload source code lên VPS

### Cách 1: Dùng Git (Khuyến nghị)

```bash
# Trên máy local - Push code lên Git
git add .
git commit -m "Production ready"
git push origin main

# Trên VPS - Clone code
cd /home/user
git clone https://github.com/your-username/your-repo.git public-frontend
cd public-frontend
```

### Cách 2: Upload ZIP source code (không có node_modules và .next)

Trên máy local, tạo file ZIP chỉ source code:

```powershell
# Tạo file .zipignore hoặc dùng PowerShell
Compress-Archive -Path "app","components","lib","public","hooks","*.json","*.js","*.ts","*.md" -DestinationPath "source-code.zip" -Force
```

Upload và giải nén trên VPS:

```bash
scp source-code.zip user@vps:/home/user/
ssh user@vps
cd /home/user
unzip source-code.zip -d public-frontend/
cd public-frontend
```

## 🖥️ Bước 2: Setup trên VPS

```bash
# Cài Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Hoặc dùng nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Cài dependencies
cd /home/user/public-frontend
npm install --production

# Tạo file .env
cp .env.example .env
nano .env  # Sửa NEXT_PUBLIC_API_URL và PORT
```

## 🔨 Bước 3: Build và chạy

```bash
# Build production
npm run build

# Chạy với PM2
npm install -g pm2
pm2 start npm --name "public-frontend" -- start
pm2 save
pm2 startup
```

## 📝 File .env mẫu

```env
NODE_ENV=production
PORT=4000
NEXT_PUBLIC_API_URL=http://your-api-url:4000/api
```

## ✅ Kiểm tra

```bash
# Xem logs
pm2 logs public-frontend

# Kiểm tra status
pm2 status

# Test
curl http://localhost:4000
```

## 🔄 Update code sau này

```bash
cd /home/user/public-frontend
git pull  # Nếu dùng Git
npm install --production
npm run build
pm2 restart public-frontend
```

## 🎯 Ưu điểm của cách này

- ✅ Không cần lo về .next/standalone
- ✅ Build trên môi trường production thực tế
- ✅ Dễ update và maintain
- ✅ Không cần upload file lớn

---

## 📋 Tóm tắt nhanh

```bash
# 1. Trên VPS
git clone your-repo
cd public-frontend
npm install --production
npm run build
cp .env.example .env
nano .env
pm2 start npm --name "public-frontend" -- start
pm2 save
```

Xong! 🎉








