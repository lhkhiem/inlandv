# Setup Guide

Hướng dẫn setup đầy đủ cho dự án Inland Real Estate.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm hoặc yarn

## 1. Database Setup

### Tạo Database
```bash
# Option 1: Using createdb
createdb inland_realestate

# Option 2: Using psql
psql -U postgres
CREATE DATABASE inland_realestate;
\q
```

### Chạy Migration
```bash
# From public-backend
cd projects/public-backend
npm run migrate

# Or manually
psql -d inland_realestate -f ../../shared/database/schema.sql
```

## 2. Backend Setup

### Public Backend (Port 4000)
```bash
cd projects/public-backend
npm install

# Create .env file
cp .env.example .env
# Update DATABASE_URL and other values

npm run dev
```

### CMS Backend (Port 4001)
```bash
cd projects/cms-backend
npm install

# Create .env file
# Update DATABASE_URL, JWT_SECRET, etc.

npm run dev
```

## 3. Frontend Setup

### Public Frontend (Port 4002)
```bash
cd projects/public-frontend
npm install

# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm run dev
```

### CMS Frontend (Port 4003)
```bash
cd projects/cms-frontend
npm install

# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:4001/api

npm run dev
```

## 4. Verification

### Check Backends
- Public Backend: http://localhost:4000/health
- CMS Backend: http://localhost:4001/health

### Check Frontends
- Public Frontend: http://localhost:4002
- CMS Frontend: http://localhost:4003

## 5. Create Admin User

```bash
# Using API
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database exists

### Port Already in Use
- Change PORT in .env files
- Kill process using the port

### Migration Fails
- Check database exists
- Verify schema.sql path
- Check PostgreSQL version

