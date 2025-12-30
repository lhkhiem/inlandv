# Grant Full Permissions - Hướng dẫn

## Cấp toàn bộ quyền cho inlandv_user

### Cách 1: Chạy script PowerShell (Tự động)

```powershell
.\scripts\setup\grant-full-permissions-simple.ps1
```

Script sẽ tự động:
- Tìm password từ `.env.local`
- Cấp tất cả quyền cần thiết

### Cách 2: Chạy SQL file trực tiếp

```powershell
# Thay "your_postgres_password" bằng password của bạn
$env:PGPASSWORD = "your_postgres_password"
psql -U postgres -d inlandv_realestate -f scripts\setup\grant-full-permissions.sql
```

### Cách 3: Chạy từng lệnh SQL

```powershell
$env:PGPASSWORD = "your_postgres_password"

# Database privileges
psql -U postgres -d inlandv_realestate -c "GRANT CONNECT, CREATE ON DATABASE inlandv_realestate TO inlandv_user;"

# Schema privileges
psql -U postgres -d inlandv_realestate -c "GRANT USAGE, CREATE ON SCHEMA public TO inlandv_user;"

# Table privileges
psql -U postgres -d inlandv_realestate -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO inlandv_user;"

# Sequence privileges
psql -U postgres -d inlandv_realestate -c "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;"

# Function privileges
psql -U postgres -d inlandv_realestate -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO inlandv_user;"

# Default privileges
psql -U postgres -d inlandv_realestate -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO inlandv_user;"
psql -U postgres -d inlandv_realestate -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO inlandv_user;"
psql -U postgres -d inlandv_realestate -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO inlandv_user;"
```

## Sau khi cấp quyền

Tạo demo user:

```powershell
cd projects\cms-backend
npx ts-node src/scripts/create-demo-user.ts
```

## Kiểm tra quyền

```powershell
$env:PGPASSWORD = "EKYvccPcharP"
psql -U inlandv_user -d inlandv_realestate -c "SELECT current_user, has_database_privilege('inlandv_realestate', 'CREATE');"
```





















