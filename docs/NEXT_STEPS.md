# Bước tiếp theo - Next Steps

## 📋 Checklist Setup & Testing

### ✅ Đã hoàn thành
- [x] Tạo migration CMS integration (044_cms_integration.sql)
- [x] Tạo Sequelize models cho các bảng CMS mới
- [x] Tạo controllers cho CMS APIs
- [x] Tạo routes cho CMS endpoints
- [x] Thiết lập environment variables (.env.local.example)
- [x] Cập nhật code để sử dụng .env.local
- [x] Dọn dẹp các file không cần thiết

### 🔄 Bước tiếp theo

#### 1. **Setup Environment Variables** (Ưu tiên cao)
```bash
# Tạo .env.local cho tất cả 4 projects
cd projects/cms-backend && cp env.local.example .env.local
cd projects/cms-frontend && cp env.local.example .env.local
cd projects/inlandv-backend && cp env.local.example .env.local
cd projects/inlandv-frontend && cp env.local.example .env.local

# Cập nhật giá trị trong mỗi file .env.local:
# - Database credentials
# - JWT_SECRET (cho CMS Backend)
# - API URLs (cho frontends)
```

#### 2. **Chạy Database Migration** (Ưu tiên cao)
```bash
# Chạy migration CMS integration
psql -d inlandv_realestate -f shared/database/migrations/044_cms_integration.sql

# Hoặc nếu có migration script
cd projects/cms-backend
npm run migrate  # (nếu có script này)
```

#### 3. **Kiểm tra Database Connection**
```bash
# Test CMS Backend connection
cd projects/cms-backend
npm run dev
# Kiểm tra: http://localhost:4001/health

# Test InlandV Backend connection
cd projects/inlandv-backend
npm run dev
# Kiểm tra: http://localhost:4000/health
```

#### 4. **Test CMS API Endpoints** (Ưu tiên trung bình)
```bash
# Test Settings API
curl http://localhost:4001/api/settings

# Test Menu Locations API
curl http://localhost:4001/api/menu-locations

# Test Page Metadata API
curl http://localhost:4001/api/page-metadata

# Test Assets API
curl http://localhost:4001/api/assets

# Test FAQ API
curl http://localhost:4001/api/faq/categories

# Test Tracking Scripts API
curl http://localhost:4001/api/tracking-scripts/active

# Test Newsletter API
curl http://localhost:4001/api/newsletter
```

#### 5. **Tạo Admin User** (Nếu chưa có)
```bash
# Register admin user qua API
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

#### 6. **Test Authentication Flow** (Ưu tiên trung bình)
```bash
# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Sử dụng token từ response để test protected endpoints
curl http://localhost:4001/api/settings \
  -H "Authorization: Bearer <token>"
```

#### 7. **Tạo Seed Data** (Tùy chọn)
- Tạo sample data cho:
  - Menu locations và items
  - Settings (general, seo, appearance)
  - FAQ categories và questions
  - Sample assets
  - Tracking scripts

#### 8. **Frontend Integration** (Ưu tiên thấp - sau khi backend ổn định)
- [ ] CMS Frontend: Tích hợp Settings management UI
- [ ] CMS Frontend: Tích hợp Menu management UI
- [ ] CMS Frontend: Tích hợp Assets management UI
- [ ] CMS Frontend: Tích hợp FAQ management UI
- [ ] CMS Frontend: Tích hợp Tracking Scripts UI
- [ ] CMS Frontend: Tích hợp Newsletter management UI

#### 9. **Testing & Bug Fixes** (Ưu tiên cao)
- [ ] Test tất cả CRUD operations
- [ ] Test validation và error handling
- [ ] Test authentication và authorization
- [ ] Test CORS configuration
- [ ] Test rate limiting
- [ ] Fix các lỗi phát hiện được

#### 10. **Documentation** (Tùy chọn)
- [ ] Cập nhật API documentation với các endpoints mới
- [ ] Tạo user guide cho CMS features
- [ ] Cập nhật README với hướng dẫn sử dụng

---

## 🚀 Quick Start Commands

### Setup môi trường
```bash
# 1. Tạo .env.local files
./scripts/setup/setup-env.sh  # Hoặc làm thủ công

# 2. Chạy migration
psql -d inlandv_realestate -f shared/database/migrations/044_cms_integration.sql

# 3. Start tất cả services
# Terminal 1: CMS Backend
cd projects/cms-backend && npm run dev

# Terminal 2: CMS Frontend
cd projects/cms-frontend && npm run dev

# Terminal 3: InlandV Backend
cd projects/inlandv-backend && npm run dev

# Terminal 4: InlandV Frontend
cd projects/inlandv-frontend && npm run dev
```

### Verify Setup
```bash
# Check health endpoints
curl http://localhost:4001/health  # CMS Backend
curl http://localhost:4000/health  # InlandV Backend

# Check frontends
# http://localhost:4003 - CMS Frontend
# http://localhost:4002 - InlandV Frontend
```

---

## ⚠️ Lưu ý quan trọng

1. **Database Migration**: Phải chạy migration 044 trước khi test các CMS APIs
2. **Environment Variables**: Phải tạo .env.local và cập nhật giá trị thực tế
3. **JWT Secret**: Phải đổi JWT_SECRET trong CMS Backend .env.local (không dùng giá trị mặc định)
4. **CORS**: Đảm bảo CORS_ORIGIN và ADMIN_ORIGIN đúng với frontend URLs
5. **Database**: Đảm bảo database `inlandv_realestate` đã tồn tại và có quyền truy cập

---

## 🐛 Troubleshooting

### Migration fails
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra database tồn tại
- Kiểm tra user có quyền CREATE TABLE

### API returns 500 error
- Kiểm tra database connection trong .env.local
- Kiểm tra logs trong console
- Kiểm tra migration đã chạy thành công

### CORS error
- Kiểm tra CORS_ORIGIN/ADMIN_ORIGIN trong .env.local
- Kiểm tra frontend URL match với backend config

### Authentication fails
- Kiểm tra JWT_SECRET đã set
- Kiểm tra token được gửi đúng format: `Authorization: Bearer <token>`

---

## 📚 Tài liệu tham khảo

- [System Architecture](./ARCHITECTURE_SYSTEM.md)
- [Environment Variables Setup](../projects/SETUP_ENV.md)
- [Database Migrations](./DATABASE/migrations.md)
- [API Documentation](./API/cms-api.md)

