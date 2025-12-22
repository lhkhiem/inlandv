# Quick Database Setup - Hướng dẫn Nhanh

## 🚀 Cách nhanh nhất

### 1. Tạo Database
```powershell
# Windows
createdb -U postgres inland_realestate

# Hoặc nếu cần password
$env:PGPASSWORD="postgres"
createdb -U postgres inland_realestate
```

### 2. Setup DATABASE_URL trong .env

Tạo file `projects/public-backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4002
```

Tạo file `projects/cms-backend/.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate
PORT=4001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4003
```

### 3. Chạy Migration và Seed

```powershell
cd projects/public-backend
npm run migrate
npm run seed
```

## ✅ Xong!

Database đã được tạo và có sample data.

## 🧪 Test

```powershell
# Test connection
psql -U postgres -d inland_realestate -c "SELECT COUNT(*) FROM projects;"
```
