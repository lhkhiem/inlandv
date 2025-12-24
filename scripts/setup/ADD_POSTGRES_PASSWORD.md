# Thêm Postgres Password vào .env.local

## Yêu cầu

Để chạy lệnh cấp quyền, cần **password của user `postgres`** (superuser).

## Cách thêm

Mở file `projects/cms-backend/.env.local` và thêm dòng sau:

```env
# Postgres superuser password (để chạy lệnh GRANT)
POSTGRES_PASSWORD=your_postgres_password_here
```

## Ví dụ

Nếu postgres password của bạn là `postgres`, thêm:

```env
POSTGRES_PASSWORD=postgres
```

Nếu postgres password của bạn là `123456`, thêm:

```env
POSTGRES_PASSWORD=123456
```

## Sau khi thêm

Chạy script:

```powershell
.\scripts\setup\grant-full-permissions-interactive.ps1
```

Script sẽ tự động đọc `POSTGRES_PASSWORD` từ `.env.local`.

## Lưu ý

- `DB_PASSWORD` = password của `inlandv_user` (đã có: EKYvccPcharP)
- `POSTGRES_PASSWORD` = password của `postgres` user (cần thêm)





