# Hướng dẫn chạy thủ công

## Bước 1: Chạy Migration

Mở PowerShell và chạy:

```powershell
cd d:\PROJECT\Cursor\inlandv

# Đọc password từ .env.local (thay bằng password thực tế của bạn)
$env:PGPASSWORD = "1hkhiem1990"  # Postgres password

# Chạy migration
psql -U postgres -d inlandv_realestate -f shared\database\migrations\045_update_users_table.sql
```

## Bước 2: Tạo Demo User

```powershell
cd projects\cms-backend
npx ts-node src/scripts/create-demo-user.ts
```

## Hoặc chạy tất cả trong một lệnh:

```powershell
cd d:\PROJECT\Cursor\inlandv

# Migration
$env:PGPASSWORD = "1hkhiem1990"
psql -U postgres -d inlandv_realestate -f shared\database\migrations\045_update_users_table.sql

# Create demo user
cd projects\cms-backend
npx ts-node src/scripts/create-demo-user.ts
```

## Demo Credentials

Sau khi tạo thành công:
- **Email:** `demo@inland.com`
- **Password:** `demo123`





