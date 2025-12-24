# Database Setup Scripts

## 🚀 Quick Setup (Recommended)

### Windows (PowerShell)
```powershell
.\scripts\setup\setup-complete.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x scripts/setup/setup-complete.sh
./scripts/setup/setup-complete.sh
```

Script này sẽ tự động:
1. ✅ Tạo database `inlandv_realestate`
2. ✅ Tạo user `inlandv_user` với password `EKYvccPcharP`
3. ✅ Cấp quyền cho user
4. ✅ Chạy tất cả migrations (001, 002, 044)

---

## 📋 Manual Setup

Nếu bạn muốn làm từng bước thủ công:

### 1. Tạo Database
```bash
createdb -U postgres inlandv_realestate
```

### 2. Tạo User
```bash
psql -U postgres -d postgres -c "CREATE USER inlandv_user WITH PASSWORD 'EKYvccPcharP';"
```

### 3. Cấp quyền
```bash
psql -U postgres -d inlandv_realestate -c "GRANT ALL PRIVILEGES ON DATABASE inlandv_realestate TO inlandv_user;"
psql -U postgres -d inlandv_realestate -c "GRANT ALL ON SCHEMA public TO inlandv_user;"
```

### 4. Chạy Migrations
```bash
psql -U postgres -d inlandv_realestate -f shared/database/migrations/001_initial_schema.sql
psql -U postgres -d inlandv_realestate -f shared/database/migrations/002_add_indexes.sql
psql -U postgres -d inlandv_realestate -f shared/database/migrations/044_cms_integration.sql
```

---

## 🔧 Individual Scripts

### Chỉ tạo User
```bash
# PowerShell
.\scripts\setup\create-inlandv-user.ps1

# Bash
./scripts/setup/create-inlandv-user.sh

# SQL
psql -U postgres -d inlandv_realestate -f scripts/setup/create-inlandv-user-quick.sql
```

### Chỉ chạy Migrations
```bash
# Bash
./scripts/deployment/migrate.sh

# Hoặc thủ công
psql -d inlandv_realestate -f shared/database/migrations/001_initial_schema.sql
psql -d inlandv_realestate -f shared/database/migrations/002_add_indexes.sql
psql -d inlandv_realestate -f shared/database/migrations/044_cms_integration.sql
```

---

## 📝 Connection Information

Sau khi setup xong:

**Database:** `inlandv_realestate`  
**User:** `inlandv_user`  
**Password:** `EKYvccPcharP`  
**Host:** `localhost`  
**Port:** `5432`

**Connection String:**
```
postgresql://inlandv_user:EKYvccPcharP@localhost:5432/inlandv_realestate
```

---

## ⚠️ Troubleshooting

### "Database already exists"
- Script sẽ hỏi bạn có muốn recreate không
- Hoặc xóa thủ công: `dropdb -U postgres inlandv_realestate`

### "User already exists"
- Script sẽ bỏ qua và tiếp tục
- Hoặc xóa thủ công: `psql -U postgres -c "DROP USER inlandv_user;"`

### "Permission denied"
- Đảm bảo bạn đang dùng user `postgres` hoặc user có quyền superuser
- Kiểm tra PostgreSQL đang chạy

### "Migration failed"
- Kiểm tra file migration tồn tại
- Kiểm tra database connection
- Xem error message chi tiết

---

## ✅ Verify Setup

Sau khi setup, kiểm tra:

```bash
# Kiểm tra database
psql -U postgres -l | grep inlandv_realestate

# Kiểm tra user
psql -U postgres -c "\du" | grep inlandv_user

# Kiểm tra tables
psql -U inlandv_user -d inlandv_realestate -c "\dt"

# Test connection
psql -U inlandv_user -d inlandv_realestate -c "SELECT version();"
```





