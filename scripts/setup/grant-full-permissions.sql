-- Grant Full Permissions to inlandv_user
-- Cấp toàn bộ quyền cho inlandv_user
-- Chạy với: psql -U postgres -d inlandv_realestate -f scripts/setup/grant-full-permissions.sql

-- Database privileges
GRANT CONNECT, CREATE ON DATABASE inlandv_realestate TO inlandv_user;

-- Schema privileges
GRANT USAGE, CREATE ON SCHEMA public TO inlandv_user;

-- Table privileges (existing tables)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO inlandv_user;

-- Sequence privileges
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;

-- Function privileges
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO inlandv_user;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO inlandv_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO inlandv_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO inlandv_user;

-- Verify
\echo 'Permissions granted successfully!'
\echo 'User: inlandv_user'
\echo 'Database: inlandv_realestate'





