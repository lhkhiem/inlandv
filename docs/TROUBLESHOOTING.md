# Troubleshooting Guide

Hướng dẫn xử lý lỗi thường gặp.

## Database Issues

### Connection Error
**Lỗi:** `Connection refused` hoặc `ECONNREFUSED`

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy:
   ```bash
   # Windows
   Get-Service postgresql*

   # Linux
   sudo systemctl status postgresql
   ```

2. Kiểm tra DATABASE_URL trong .env:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate
   ```

3. Kiểm tra database đã được tạo:
   ```bash
   psql -l | grep inland_realestate
   ```

### Migration Fails
**Lỗi:** Migration script fails

**Giải pháp:**
1. Kiểm tra schema.sql path
2. Kiểm tra database permissions
3. Chạy migration thủ công:
   ```bash
   psql -d inland_realestate -f shared/database/schema.sql
   ```

## Backend Issues

### Port Already in Use
**Lỗi:** `EADDRINUSE: address already in use`

**Giải pháp:**
1. Tìm process đang dùng port:
   ```bash
   # Windows
   netstat -ano | findstr :4000

   # Linux
   lsof -i :4000
   ```

2. Kill process hoặc đổi PORT trong .env

### CORS Error
**Lỗi:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Giải pháp:**
1. Kiểm tra CORS_ORIGIN trong .env backend
2. Đảm bảo frontend URL match với CORS_ORIGIN

## Frontend Issues

### Build Fails
**Lỗi:** Build errors

**Giải pháp:**
1. Xóa .next folder:
   ```bash
   rm -rf .next
   ```

2. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Kiểm tra TypeScript errors:
   ```bash
   npm run lint
   ```

### API Calls Fail
**Lỗi:** `Failed to fetch` hoặc `Network error`

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Kiểm tra NEXT_PUBLIC_API_URL trong .env.local
3. Kiểm tra CORS configuration

## Authentication Issues

### JWT Token Invalid
**Lỗi:** `Invalid or expired token`

**Giải pháp:**
1. Clear localStorage và login lại
2. Kiểm tra JWT_SECRET trong backend .env
3. Kiểm tra token expiration

## Common Solutions

### Clear All and Reinstall
```bash
# Backend
cd projects/public-backend
rm -rf node_modules dist
npm install
npm run build

# Frontend
cd projects/public-frontend
rm -rf node_modules .next
npm install
npm run build
```

### Reset Database
```bash
dropdb inland_realestate
createdb inland_realestate
cd projects/public-backend
npm run migrate
```

