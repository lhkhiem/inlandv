# 🚀 Hướng dẫn các bước tiếp theo

Sau khi đã chạy `setup-quick.ps1` để setup database, đây là các bước tiếp theo:

## ✅ Bước 1: Thiết lập Environment Variables (BẮT BUỘC)

Chạy script để tạo file `.env.local` cho tất cả 4 projects:

```powershell
.\scripts\setup\setup-env.ps1 -PostgresPassword "your_postgres_password"
```

**Lưu ý:** Thay `your_postgres_password` bằng mật khẩu PostgreSQL của bạn.

Script này sẽ tạo:
- ✅ `projects/cms-backend/.env.local`
- ✅ `projects/cms-frontend/.env.local`
- ✅ `projects/inlandv-backend/.env.local`
- ✅ `projects/inlandv-frontend/.env.local`

---

## ✅ Bước 2: Cài đặt Dependencies

Cài đặt npm packages cho tất cả projects:

```powershell
# CMS Backend
cd projects\cms-backend
npm install
cd ..\..

# CMS Frontend
cd projects\cms-frontend
npm install
cd ..\..

# InlandV Backend
cd projects\inlandv-backend
npm install
cd ..\..

# InlandV Frontend
cd projects\inlandv-frontend
npm install
cd ..\..
```

Hoặc chạy từng project một khi cần.

---

## ✅ Bước 3: Kiểm tra Database Migration

Kiểm tra xem migration đã chạy chưa:

```powershell
# Kiểm tra bảng CMS đã tồn tại chưa
psql -U postgres -d inlandv_realestate -c "\dt" | Select-String -Pattern "settings|menu_locations|page_metadata"
```

Nếu chưa có, chạy migration:

```powershell
# Chạy migration CMS integration
psql -U postgres -d inlandv_realestate -f shared\database\migrations\044_cms_integration.sql
```

---

## ✅ Bước 4: Test Backend Connections

### Test CMS Backend (Port 4001)

```powershell
cd projects\cms-backend
npm run dev
```

Mở browser: http://localhost:4001/health

Nếu thấy `{"status":"ok"}` → ✅ Backend hoạt động!

### Test InlandV Backend (Port 4000)

```powershell
cd projects\inlandv-backend
npm run dev
```

Mở browser: http://localhost:4000/health

Nếu thấy `{"status":"ok"}` → ✅ Backend hoạt động!

---

## ✅ Bước 5: Tạo Admin User (CMS)

Sau khi CMS Backend chạy, tạo admin user:

```powershell
# Sử dụng curl hoặc Postman
curl -X POST http://localhost:4001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"password\":\"password123\",\"role\":\"admin\"}'
```

Hoặc dùng PowerShell:

```powershell
$body = @{
    name = "Admin"
    email = "admin@example.com"
    password = "password123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4001/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

---

## ✅ Bước 6: Test Frontend

### Test CMS Frontend (Port 4003)

```powershell
cd projects\cms-frontend
npm run dev
```

Mở browser: http://localhost:4003

Đăng nhập với email/password đã tạo ở bước 5.

### Test InlandV Frontend (Port 4002)

```powershell
cd projects\inlandv-frontend
npm run dev
```

Mở browser: http://localhost:4002

---

## 📋 Checklist tổng hợp

- [ ] ✅ Đã chạy `setup-quick.ps1` (database setup)
- [ ] ✅ Đã chạy `setup-env.ps1` (environment variables)
- [ ] ✅ Đã cài đặt dependencies cho tất cả projects
- [ ] ✅ Đã chạy database migration (044_cms_integration.sql)
- [ ] ✅ CMS Backend chạy được (port 4001)
- [ ] ✅ InlandV Backend chạy được (port 4000)
- [ ] ✅ Đã tạo admin user
- [ ] ✅ CMS Frontend chạy được (port 4003)
- [ ] ✅ InlandV Frontend chạy được (port 4002)

---

## 🐛 Troubleshooting

### Lỗi "Cannot connect to database"
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` trong `.env.local` đúng chưa
- Kiểm tra database `inlandv_realestate` đã tồn tại

### Lỗi "Port already in use"
```powershell
# Tìm process đang dùng port
netstat -ano | findstr :4001
# Kill process (thay <PID> bằng Process ID)
taskkill /PID <PID> /F
```

### Lỗi "Module not found"
```powershell
# Reinstall dependencies
cd projects\<project-name>
rm -r node_modules
npm install
```

### Lỗi "JWT_SECRET not set"
- Kiểm tra file `projects/cms-backend/.env.local` có `JWT_SECRET` chưa
- Nếu chưa, thêm vào file

---

## 🎯 Sau khi setup xong

Bạn có thể:
1. ✅ Quản lý projects qua CMS Dashboard (http://localhost:4003)
2. ✅ Xem website công khai (http://localhost:4002)
3. ✅ Test các API endpoints
4. ✅ Bắt đầu phát triển tính năng mới

---

## 📚 Tài liệu tham khảo

- [SETUP.md](./SETUP.md) - Hướng dẫn setup đầy đủ
- [API Documentation](./API/cms-api.md) - API endpoints
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Xử lý lỗi












