-- Migration 067: Drop unused projects and listings tables
-- Xóa các bảng projects và listings vì không còn sử dụng
-- Hệ thống đã chuyển sang dùng properties và industrial_parks
--
-- LƯU Ý: Migration này cần quyền DROP TABLE
-- Nếu gặp lỗi "must be owner", vui lòng chạy với superuser hoặc owner của bảng
-- Hoặc chạy trực tiếp trong psql với quyền phù hợp:
--   DROP TABLE IF EXISTS listings CASCADE;
--   DROP TABLE IF EXISTS projects CASCADE;

BEGIN;

-- =====================================================
-- 1. DROP FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Listings có foreign key đến projects, cần xóa trước
-- Kiểm tra và xóa constraint nếu tồn tại
DO $$
BEGIN
  -- Xóa foreign key constraint từ listings đến projects
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'listings_project_id_fkey'
    AND table_name = 'listings'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT listings_project_id_fkey;
    RAISE NOTICE 'Dropped foreign key constraint: listings_project_id_fkey';
  END IF;
END $$;

-- =====================================================
-- 2. DROP INDEXES
-- =====================================================

-- Xóa indexes của listings
DROP INDEX IF EXISTS idx_listings_project_id;
DROP INDEX IF EXISTS idx_listings_type;

-- Xóa indexes của projects
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_slug;
DROP INDEX IF EXISTS idx_projects_location;

-- =====================================================
-- 3. DROP TABLES
-- =====================================================

-- Xóa bảng listings trước (có foreign key đến projects)
-- Sử dụng CASCADE để tự động xóa các dependencies
DROP TABLE IF EXISTS listings CASCADE;

-- Xóa bảng projects
DROP TABLE IF EXISTS projects CASCADE;

-- =====================================================
-- 4. VERIFY DELETION
-- =====================================================

-- Kiểm tra xem các bảng đã bị xóa chưa
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
  
  IF projects_exists THEN
    RAISE WARNING 'Table projects still exists';
  ELSE
    RAISE NOTICE 'Table projects dropped successfully';
  END IF;
  
  IF listings_exists THEN
    RAISE WARNING 'Table listings still exists';
  ELSE
    RAISE NOTICE 'Table listings dropped successfully';
  END IF;
END $$;

COMMIT;

