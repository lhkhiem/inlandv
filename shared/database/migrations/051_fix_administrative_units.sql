-- Migration 051: Fix Administrative Units
-- Đổi district thành ward trong industrial_parks
-- Xóa cột district khỏi properties (chỉ giữ province và ward)
-- Date: 2025-12-23

-- ============================================
-- 1. INDUSTRIAL_PARKS: Đổi district thành ward
-- ============================================

-- Thêm cột ward nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'industrial_parks' AND column_name = 'ward'
  ) THEN
    ALTER TABLE industrial_parks ADD COLUMN ward VARCHAR(100);
  END IF;
END $$;

-- Copy dữ liệu từ district sang ward (nếu có)
UPDATE industrial_parks 
SET ward = district 
WHERE district IS NOT NULL AND ward IS NULL;

-- Xóa index cũ nếu có
DROP INDEX IF EXISTS idx_industrial_parks_location;

-- Tạo index mới với ward
CREATE INDEX IF NOT EXISTS idx_industrial_parks_location ON industrial_parks(province, ward);

-- Xóa cột district
ALTER TABLE industrial_parks DROP COLUMN IF EXISTS district;

-- Cập nhật trigger search_vector để dùng ward thay vì district
CREATE OR REPLACE FUNCTION update_industrial_parks_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.code, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description_full, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.province, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.ward, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. PROPERTIES: Xóa cột district
-- ============================================

-- Xóa index cũ
DROP INDEX IF EXISTS idx_properties_district;
DROP INDEX IF EXISTS idx_properties_location;

-- Xóa cột district
ALTER TABLE properties DROP COLUMN IF EXISTS district;

-- Tạo index mới với province và ward
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(province, ward);
CREATE INDEX IF NOT EXISTS idx_properties_ward ON properties(ward);

-- Cập nhật comment
COMMENT ON COLUMN properties.province IS 'Tỉnh/Thành phố (mã từ API provinces.open-api.vn)';
COMMENT ON COLUMN properties.ward IS 'Phường/Xã (mã từ API provinces.open-api.vn)';
COMMENT ON COLUMN properties.address IS 'Địa chỉ chi tiết (nhập tay)';

-- ============================================
-- 3. Cập nhật comments cho industrial_parks
-- ============================================

COMMENT ON COLUMN industrial_parks.province IS 'Tỉnh/Thành phố (mã từ API provinces.open-api.vn)';
COMMENT ON COLUMN industrial_parks.ward IS 'Phường/Xã (mã từ API provinces.open-api.vn)';
COMMENT ON COLUMN industrial_parks.address IS 'Địa chỉ chi tiết (nhập tay)';


