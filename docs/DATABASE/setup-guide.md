# Database Setup Guide

Hướng dẫn setup database và DATABASE_URL.

## 📋 DATABASE_URL Format

### Format chuẩn:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Example:
```
postgresql://postgres:postgres@localhost:5432/inland_realestate
```

## 🔧 Cách Setup Database

### Option 1: Sử dụng Script (Khuyến nghị)

#### Windows (PowerShell)
```powershell
# Default (postgres/postgres)
.\scripts\setup\setup-database.ps1

# Custom values
.\scripts\setup\setup-database.ps1 -DbUser "myuser" -DbPassword "mypassword"
```

#### Linux/Mac (Bash)
```bash
# Default (postgres/postgres)
chmod +x scripts/setup/setup-database.sh
./scripts/setup/setup-database.sh

# Custom values
DB_USER=myuser DB_PASSWORD=mypassword ./scripts/setup/setup-database.sh
```

### Option 2: Manual Setup

#### 1. Install PostgreSQL
- Windows: https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

#### 2. Start PostgreSQL Service

**Windows:**
```powershell
# Start PostgreSQL service
Start-Service postgresql-x64-15

# Or use pg_ctl
pg_ctl start -D "C:\Program Files\PostgreSQL\15\data"
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Mac:**
```bash
brew services start postgresql
```

#### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE inland_realestate;

# Exit
\q
```

Hoặc dùng command line:
```bash
createdb -U postgres inland_realestate
```

#### 4. Update DATABASE_URL trong .env

**Backend .env files:**
- `projects/public-backend/.env`
- `projects/cms-backend/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate
```

**Format:**
- `postgres` - username
- `postgres` - password
- `localhost` - host
- `5432` - port
- `inland_realestate` - database name

#### 5. Run Migrations

```bash
cd projects/public-backend
npm run migrate
```

---

## 🔐 DATABASE_URL Configuration

### Development (Local)

```env
# Default PostgreSQL installation
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate

# Custom user/password
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/inland_realestate

# Custom port
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/inland_realestate
```

### Production

```env
# Remote database
DATABASE_URL=postgresql://user:password@db.example.com:5432/inland_realestate

# With SSL
DATABASE_URL=postgresql://user:password@db.example.com:5432/inland_realestate?sslmode=require

# Connection pool
DATABASE_URL=postgresql://user:password@db.example.com:5432/inland_realestate?max=20
```

---

## 📝 Environment Variables

### Backend .env Files

**`projects/public-backend/.env`:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4002
```

**`projects/cms-backend/.env`:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate
PORT=4001
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4003
```

---

## 🧪 Testing Database Connection

### Option 1: Test từ Backend

```bash
cd projects/public-backend
npm run dev

# Should see: "✅ Connected to PostgreSQL database"
```

### Option 2: Test trực tiếp

```bash
# Connect to database
psql -U postgres -d inland_realestate

# Check tables
\dt

# Check data
SELECT * FROM projects LIMIT 5;

# Exit
\q
```

### Option 3: Test với Node.js

```javascript
// test-db.js
const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err)
  } else {
    console.log('✅ Connected successfully:', res.rows[0])
  }
  pool.end()
})
```

Run: `node test-db.js`

---

## 🆘 Troubleshooting

### "Connection refused"
**Nguyên nhân:** PostgreSQL chưa chạy

**Giải pháp:**
```bash
# Windows
Start-Service postgresql-x64-15

# Linux
sudo systemctl start postgresql

# Mac
brew services start postgresql
```

### "Password authentication failed"
**Nguyên nhân:** Sai password hoặc username

**Giải pháp:**
1. Kiểm tra username/password trong DATABASE_URL
2. Reset password:
```bash
psql -U postgres
ALTER USER postgres PASSWORD 'newpassword';
```

### "Database does not exist"
**Nguyên nhân:** Database chưa được tạo

**Giải pháp:**
```bash
createdb -U postgres inland_realestate
```

### "Permission denied"
**Nguyên nhân:** User không có quyền

**Giải pháp:**
```sql
GRANT ALL PRIVILEGES ON DATABASE inland_realestate TO postgres;
```

---

## 📋 Checklist

### Before Development
- [ ] PostgreSQL đã được cài đặt
- [ ] PostgreSQL service đang chạy
- [ ] Database `inland_realestate` đã được tạo
- [ ] DATABASE_URL đã được cấu hình trong .env files
- [ ] Migrations đã được chạy thành công
- [ ] Connection test thành công

### Before Production
- [ ] Production database đã được setup
- [ ] DATABASE_URL đã được update (không dùng localhost)
- [ ] SSL connection đã được enable
- [ ] Database backup đã được setup
- [ ] Connection pool đã được cấu hình

---

## 📚 More Information

- [Schema Documentation](./schema.md)
- [Migrations Guide](./migrations.md)
- [ERD Diagram](./ERD.md)








