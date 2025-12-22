# Hướng dẫn fix lỗi Internal Server Error

## Vấn đề:
- Domain `https://inlandv-demo.pressup.vn` trả về 500 Internal Server Error
- Lỗi: `Cannot find module './vendor-chunks/next.js'`
- Nguyên nhân: Build không đầy đủ, thiếu vendor-chunks

## Giải pháp:

### Cách 1: Rebuild và redeploy từ local (Khuyến nghị)

```powershell
cd projects/public-frontend

# 1. Build lại
npm run build

# 2. Chuẩn bị deploy package
.\prepare-deploy.ps1

# 3. Deploy lại lên VPS
.\deploy-to-inlandv.ps1

# 4. SSH vào VPS và restart
ssh -p 22 pressup-cms@14.225.205.116
cd /var/www/inlandv
pm2 restart inlandv-frontend
```

### Cách 2: Rebuild trực tiếp trên VPS

```bash
ssh -p 22 pressup-cms@14.225.205.116
cd /var/www/inlandv

# Stop process
pm2 stop inlandv-frontend

# Install đầy đủ dependencies
npm install

# Build lại
npm run build

# Restart
pm2 restart inlandv-frontend
```

## Kiểm tra:

1. Kiểm tra process:
```bash
pm2 list | grep inlandv
```

2. Kiểm tra port:
```bash
curl -I http://localhost:4002
```

3. Kiểm tra domain:
```bash
curl -I https://inlandv-demo.pressup.vn
```







