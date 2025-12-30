-- Migration 067: Drop unused projects and listings tables (Manual execution)
-- Chạy file này trực tiếp trong psql với quyền superuser hoặc owner của bảng
-- 
-- Cách chạy:
--   psql -U postgres -d inlandv_realestate -f 067_drop_projects_and_listings_manual.sql
-- 
-- Hoặc chạy từng lệnh:
--   DROP TABLE IF EXISTS listings CASCADE;
--   DROP TABLE IF EXISTS projects CASCADE;

BEGIN;

-- Xóa indexes trước
DROP INDEX IF EXISTS idx_listings_project_id;
DROP INDEX IF EXISTS idx_listings_type;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_slug;
DROP INDEX IF EXISTS idx_projects_location;

-- Xóa foreign key constraint từ listings đến projects
ALTER TABLE IF EXISTS listings DROP CONSTRAINT IF EXISTS listings_project_id_fkey;

-- Xóa bảng listings trước (có foreign key đến projects)
DROP TABLE IF EXISTS listings CASCADE;

-- Xóa bảng projects
DROP TABLE IF EXISTS projects CASCADE;

-- Verify
DO $$
DECLARE
  projects_exists BOOLEAN;
  listings_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) INTO projects_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'listings'
  ) INTO listings_exists;
  
  IF NOT projects_exists AND NOT listings_exists THEN
    RAISE NOTICE '✅ Successfully dropped both projects and listings tables';
  ELSE
    IF projects_exists THEN
      RAISE WARNING '⚠️  Table projects still exists';
    END IF;
    IF listings_exists THEN
      RAISE WARNING '⚠️  Table listings still exists';
    END IF;
  END IF;
END $$;

COMMIT;
















