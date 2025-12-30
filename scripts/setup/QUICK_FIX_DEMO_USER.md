# Quick Fix: Tạo Demo User

## Vấn đề
Lỗi: `permission denied for table users`

## Giải pháp nhanh

### Cách 1: Chạy script tự động (Khuyến nghị)

```powershell
.\scripts\setup\fix-and-create-demo.ps1
```

Script này sẽ:
1. Tự động lấy password từ .env.local
2. Cấp quyền cho `inlandv_user` trên bảng `users`
3. Tạo demo user

### Cách 2: Chạy thủ công từng bước

#### Bước 1: Cấp quyền (cần postgres password)

```powershell
# Thay "your_postgres_password" bằng password của bạn
$env:PGPASSWORD = "your_postgres_password"
psql -U postgres -d inlandv_realestate -c "GRANT ALL PRIVILEGES ON TABLE users TO inlandv_user;"
psql -U postgres -d inlandv_realestate -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;"
```

#### Bước 2: Tạo demo user

```powershell
cd projects\cms-backend
npx ts-node src/scripts/create-demo-user.ts
```

## Demo Credentials

- **Email:** `demo@inland.com`
- **Password:** `demo123`
- **Role:** `admin`

## Kiểm tra

```powershell
$env:PGPASSWORD = "EKYvccPcharP"
psql -U inlandv_user -d inlandv_realestate -c "SELECT email, name, role FROM users WHERE email = 'demo@inland.com';"
```

## Xóa demo user

```powershell
.\scripts\setup\delete-demo-user-api.ps1
```





















