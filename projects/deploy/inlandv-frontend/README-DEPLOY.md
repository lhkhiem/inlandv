# Hướng dẫn Deploy Inlandv Frontend lên VPS

## ✨ Standalone Package

**Package này là STANDALONE - KHÔNG CẦN `npm install`!**

- ✅ Chỉ sử dụng Node.js built-in modules
- ✅ Không có dependencies bên ngoài
- ✅ Chạy ngay với `node server.js`

## 📦 Cấu trúc Package

```
inlandv-frontend/
├── server.js               # Next.js standalone server
├── .next/                  # Build output (server, static, manifests)
├── public/                 # Public assets
├── package.json            # Metadata (no dependencies)
├── ecosystem.config.js     # PM2 configuration
├── start.sh                # Start script
├── .env.production         # Production env template
├── .env.example            # Env template
└── next.config.js          # Next.js config
```

## 🚀 Cách Deploy

### 1. Upload files lên VPS
```bash
scp -r inlandv-frontend/* user@vps:/path/to/deploy/
```

### 2. Trên VPS - Chỉ cần Node.js!

**KHÔNG CẦN `npm install`** - Chạy ngay:

```bash
cd /path/to/deploy

# Cách 1: Chạy trực tiếp
node server.js

# Cách 2: Với environment variables
PORT=4002 HOSTNAME=0.0.0.0 node server.js

# Cách 3: Dùng start script
chmod +x start.sh
./start.sh
```

### 3. Dùng PM2 (Tùy chọn)

```bash
# Cài PM2 global (chỉ cần 1 lần)
npm install -g pm2

# Start với PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## ⚙️ Environment Variables

Tạo file `.env` (tùy chọn):
```bash
cp .env.example .env
nano .env
```

Hoặc set trực tiếp:
```bash
export PORT=4002
export HOSTNAME=0.0.0.0
export NEXT_PUBLIC_API_URL=http://your-api-url:4000/api
node server.js
```

## 🔧 Yêu cầu

- **Node.js >= 18** (khuyến nghị >= 20)
- **Không cần npm install** - Standalone!

## 📝 Lưu ý

1. **Port mặc định**: 4002 (có thể thay đổi qua PORT env)
2. **Host mặc định**: 0.0.0.0 (listen trên tất cả interfaces)
3. **API URL**: Cấu hình `NEXT_PUBLIC_API_URL` trong .env
4. **Static Files**: Được serve tự động từ `.next/static/`

## 🌐 Cấu hình Nginx (Tùy chọn)

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ Kiểm tra

Sau khi chạy `node server.js`, bạn sẽ thấy:
```
Server running at http://0.0.0.0:4002
```

Truy cập: `http://your-vps-ip:4002`

## 🎯 Ưu điểm Standalone

- ✅ **Không cần npm install** - Tiết kiệm thời gian
- ✅ **Không có dependencies** - Giảm kích thước package
- ✅ **Chạy ngay** - Chỉ cần Node.js
- ✅ **Dễ deploy** - Upload và chạy
- ✅ **An toàn** - Không có external dependencies


