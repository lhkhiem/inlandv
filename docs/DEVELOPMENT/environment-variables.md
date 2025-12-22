# Environment Variables Guide

Hướng dẫn về các biến môi trường trong dự án.

## 📋 Tổng quan

Dự án có **4 projects** riêng biệt, mỗi project cần file `.env` riêng:

| Project | File `.env` | Mục đích |
|---------|-------------|----------|
| **public-backend** | `projects/public-backend/.env` | Backend API công khai |
| **cms-backend** | `projects/cms-backend/.env` | Backend API cho CMS |
| **public-frontend** | `projects/public-frontend/.env.local` | Website công khai |
| **cms-frontend** | `projects/cms-frontend/.env.local` | CMS Dashboard |

## 📁 `.env.example` ở Root Level

**KHÔNG chỉ là biến môi trường frontend!**

`.env.example` ở root là **template chung** chứa TẤT CẢ biến môi trường cho:
- ✅ Backend (public-backend, cms-backend)
- ✅ Frontend (public-frontend, cms-frontend)
- ✅ Database
- ✅ API URLs
- ✅ Authentication

**Mục đích:**
- Template chung để tham khảo
- Developers copy các biến cần thiết vào project của mình
- Không commit file `.env` thật vào Git (đã ignore)

---

## 🔧 Backend Environment Variables

### Public Backend (`projects/public-backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4002

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CMS Backend (`projects/cms-backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate

# Server
PORT=4001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4003

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Rate Limiting (stricter for CMS)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

---

## 🎨 Frontend Environment Variables

### Public Frontend (`projects/public-frontend/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Object Storage (optional)
NEXT_PUBLIC_STORAGE_URL=https://storage.example.com
```

### CMS Frontend (`projects/cms-frontend/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4001/api

# Object Storage (optional)
NEXT_PUBLIC_STORAGE_URL=https://storage.example.com
```

**Lưu ý:** Next.js sử dụng `.env.local` (không phải `.env`)

---

## 📝 Setup Environment Variables

### Cách 1: Manual Setup

1. Copy từ `.env.example` ở root
2. Tạo file `.env` hoặc `.env.local` trong từng project
3. Copy các biến cần thiết
4. Update values

### Cách 2: Sử dụng Script

```bash
# Tự động tạo tất cả .env files
./scripts/setup/setup-env.sh

# Sau đó update DATABASE_URL và JWT_SECRET
```

---

## 🔒 Security Notes

### Development
- ✅ Có thể dùng giá trị mặc định
- ✅ Localhost URLs OK
- ⚠️ Vẫn nên đổi `JWT_SECRET`

### Production
- ❌ **KHÔNG** dùng giá trị mặc định
- ❌ **KHÔNG** commit `.env` vào Git
- ✅ Dùng strong `JWT_SECRET`
- ✅ Dùng production database URL
- ✅ CORS_ORIGIN = production domain
- ✅ `NODE_ENV=production`

---

## 📋 Checklist

### Before Development
- [ ] Copy `.env.example` → từng project
- [ ] Update `DATABASE_URL`
- [ ] Update `JWT_SECRET` (CMS backend)
- [ ] Update `CORS_ORIGIN` nếu cần
- [ ] Update `NEXT_PUBLIC_API_URL` (frontend)

### Before Production
- [ ] Tạo file `.env` production riêng
- [ ] Update tất cả URLs → production
- [ ] Set `NODE_ENV=production`
- [ ] Dùng strong `JWT_SECRET`
- [ ] Kiểm tra tất cả biến đã đúng

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Kiểm tra `DATABASE_URL`
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra user/password

### "CORS error"
- Kiểm tra `CORS_ORIGIN` match với frontend URL
- Kiểm tra `NEXT_PUBLIC_API_URL` trong frontend

### "Authentication failed"
- Kiểm tra `JWT_SECRET` đã đúng chưa
- Kiểm tra token expiration
