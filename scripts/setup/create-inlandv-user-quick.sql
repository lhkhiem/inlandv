-- ============================================
-- Quick Create InlandV User
-- ============================================
-- Chạy nhanh: psql -U postgres -d inlandv_realestate -f scripts/setup/create-inlandv-user-quick.sql

-- Tạo user
CREATE USER inlandv_user WITH PASSWORD 'EKYvccPcharP';

-- Cấp quyền
GRANT CONNECT ON DATABASE inlandv_realestate TO inlandv_user;
GRANT USAGE ON SCHEMA public TO inlandv_user;
GRANT CREATE ON SCHEMA public TO inlandv_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO inlandv_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO inlandv_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO inlandv_user;

\echo '✅ User inlandv_user created with password: EKYvccPcharP'
\echo '✅ Database: inlandv_realestate'





