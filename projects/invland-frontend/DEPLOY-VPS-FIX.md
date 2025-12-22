# Giải pháp: Không thể copy .next lên VPS

## 🔧 Giải pháp 1: Nén thành ZIP (Khuyến nghị)

### Bước 1: Tạo file ZIP trên máy local

```powershell
# Chạy script tạo ZIP
.\create-deploy-zip.ps1
```

Hoặc tạo ZIP thủ công:
```powershell
Compress-Archive -Path "deploy-package\*" -DestinationPath "deploy-package.zip" -Force
```

### Bước 2: Upload file ZIP lên VPS

```bash
# Upload file ZIP
scp deploy-package.zip user@your-vps-ip:/home/user/
```

### Bước 3: Trên VPS - Giải nén

```bash
# Cài unzip nếu chưa có
sudo apt-get install unzip

# Tạo thư mục và giải nén
mkdir -p /home/user/public-frontend
cd /home/user/public-frontend
unzip ~/deploy-package.zip

# Hoặc giải nén trực tiếp
unzip ~/deploy-package.zip -d /home/user/public-frontend/
```

### Bước 4: Setup và chạy

```bash
cd /home/user/public-frontend
cp .env.example .env
nano .env  # Sửa config

# Chạy với PM2
pm2 start server.js --name "public-frontend" --env production -- --port 4000
pm2 save
```

---

## 🔧 Giải pháp 2: Build trực tiếp trên VPS (Tốt nhất)

### Bước 1: Upload source code (không có node_modules và .next)

Trên máy local, tạo file `.deployignore` hoặc dùng Git:

```bash
# Upload source code (loại trừ node_modules và .next)
rsync -avz --exclude 'node_modules' --exclude '.next' \
  --exclude '.git' --exclude 'deploy-package' \
  ./ user@vps:/home/user/public-frontend-source/
```

Hoặc dùng SCP với exclude:
```bash
# Tạo file .rsyncignore
echo "node_modules" > .rsyncignore
echo ".next" >> .rsyncignore
echo ".git" >> .rsyncignore

# Upload
rsync -avz --exclude-from=.rsyncignore ./ user@vps:/home/user/public-frontend-source/
```

### Bước 2: Trên VPS - Build và chạy

```bash
# Vào thư mục source
cd /home/user/public-frontend-source

# Cài dependencies
npm install --production

# Build production
npm run build

# Tạo file .env
cp .env.example .env
nano .env  # Sửa config

# Chạy với PM2
pm2 start npm --name "public-frontend" -- start
pm2 save
```

---

## 🔧 Giải pháp 3: Dùng Git (Khuyến nghị cho dự án dài hạn)

### Bước 1: Push code lên Git (GitHub/GitLab)

```bash
# Commit và push
git add .
git commit -m "Prepare for production"
git push origin main
```

### Bước 2: Trên VPS - Clone và build

```bash
# Clone repository
cd /home/user
git clone https://github.com/your-username/your-repo.git public-frontend
cd public-frontend

# Cài dependencies
npm install --production

# Build
npm run build

# Tạo .env
cp .env.example .env
nano .env

# Chạy với PM2
pm2 start npm --name "public-frontend" -- start
pm2 save
```

### Bước 3: Update code sau này

```bash
# Trên VPS
cd /home/user/public-frontend
git pull
npm install --production
npm run build
pm2 restart public-frontend
```

---

## 🔧 Giải pháp 4: Dùng tar.gz (Linux/Mac)

### Bước 1: Tạo file tar.gz

```bash
# Trên máy local (Linux/Mac hoặc Git Bash trên Windows)
cd projects/public-frontend
tar -czf deploy-package.tar.gz -C deploy-package .
```

### Bước 2: Upload và giải nén

```bash
# Upload
scp deploy-package.tar.gz user@vps:/home/user/

# Trên VPS - Giải nén
cd /home/user
mkdir -p public-frontend
tar -xzf deploy-package.tar.gz -C public-frontend
cd public-frontend
```

---

## 📋 So sánh các phương pháp

| Phương pháp | Ưu điểm | Nhược điểm |
|------------|---------|------------|
| **ZIP** | Đơn giản, nhanh | File lớn, cần giải nén |
| **Build trên VPS** | Không lo thiếu file | Cần Node.js trên VPS, build lâu |
| **Git** | Dễ update, version control | Cần setup Git, phải push code |
| **tar.gz** | Nén tốt hơn ZIP | Cần Linux/Mac hoặc Git Bash |

---

## ✅ Khuyến nghị

**Cho lần đầu deploy:** Dùng **Giải pháp 1 (ZIP)** - nhanh và đơn giản

**Cho dự án dài hạn:** Dùng **Giải pháp 3 (Git)** - dễ quản lý và update

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module" sau khi giải nén

```bash
# Trên VPS, cài lại dependencies
cd /home/user/public-frontend
npm install --production
```

### Lỗi: "Port already in use"

```bash
# Kiểm tra port
sudo lsof -i :4000

# Hoặc đổi port trong .env
nano .env  # Sửa PORT=4000 thành PORT khác
```

### Lỗi: "Permission denied" khi chạy start.sh

```bash
chmod +x start.sh
```

### File .next quá lớn

Nếu file ZIP vẫn quá lớn, dùng **Giải pháp 2 (Build trên VPS)** thay vì upload .next








