# Hướng dẫn Setup Environment Variables

## 📋 Tổng quan

Tất cả 4 projects sử dụng **`.env.local`** làm file cấu hình chính.

## 🚀 Quick Setup

### 1. CMS Backend
```bash
cd projects/cms-backend
cp env.local.example .env.local
# Chỉnh sửa .env.local với database credentials của bạn
```

### 2. CMS Frontend
```bash
cd projects/cms-frontend
cp env.local.example .env.local
# Kiểm tra NEXT_PUBLIC_API_URL trỏ đúng CMS Backend (port 4001)
```

### 3. InlandV Backend
```bash
cd projects/inlandv-backend
cp env.local.example .env.local
# Chỉnh sửa DATABASE_URL với database credentials của bạn
```

### 4. InlandV Frontend
```bash
cd projects/inlandv-frontend
cp env.local.example .env.local
# Kiểm tra NEXT_PUBLIC_API_URL trỏ đúng InlandV Backend (port 4000)
```

## ⚙️ Cấu hình quan trọng

### Database
- **CMS Backend**: Sử dụng `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` HOẶC `DATABASE_URL`
- **InlandV Backend**: Sử dụng `DATABASE_URL`

### Ports
- **CMS Backend**: Port 4001
- **CMS Frontend**: Port 4003
- **InlandV Backend**: Port 4000
- **InlandV Frontend**: Port 4002

### CORS
- **CMS Backend**: `ADMIN_ORIGIN=http://localhost:4003`
- **InlandV Backend**: `CORS_ORIGIN=http://localhost:4002`

## 📚 Xem thêm

- [System Architecture Documentation](../../docs/ARCHITECTURE_SYSTEM.md)
- [Environment Variables Guide](../../docs/DEVELOPMENT/environment-variables.md)





















