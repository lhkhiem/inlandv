-- ============================================
-- Create InlandV Database User
-- ============================================
-- Tạo user mới cho InlandV project
-- User: inlandv_user
-- Password: EKYvccPcharP

-- Tạo user (nếu chưa tồn tại)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'inlandv_user') THEN
        CREATE USER inlandv_user WITH PASSWORD 'EKYvccPcharP';
        RAISE NOTICE 'User inlandv_user created successfully';
    ELSE
        RAISE NOTICE 'User inlandv_user already exists';
    END IF;
END
$$;

-- Cấp quyền cho database inlandv_realestate
GRANT CONNECT ON DATABASE inlandv_realestate TO inlandv_user;

-- Cấp quyền trên schema public
GRANT USAGE ON SCHEMA public TO inlandv_user;
GRANT CREATE ON SCHEMA public TO inlandv_user;

-- Cấp quyền trên tất cả tables hiện có
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO inlandv_user;

-- Cấp quyền trên tất cả sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;

-- Cấp quyền cho các tables sẽ được tạo trong tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO inlandv_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO inlandv_user;

-- Cấp quyền tạo tables (cho migrations)
GRANT CREATE ON SCHEMA public TO inlandv_user;

-- Hiển thị thông tin
\echo '✅ User inlandv_user created with password: EKYvccPcharP'
\echo '✅ Permissions granted on database: inlandv_realestate'

