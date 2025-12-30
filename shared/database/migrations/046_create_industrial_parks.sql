-- Migration 046: Create industrial_parks and industrial_park_images tables
-- Creates tables for industrial parks (Khu công nghiệp) management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- TABLE: industrial_parks (KCN)
-- ============================================

CREATE TABLE IF NOT EXISTS industrial_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại
  scope VARCHAR(50) NOT NULL CHECK (scope IN ('trong-kcn', 'ngoai-kcn')),
  
  -- Dịch vụ có sẵn (1 KCN có thể có cả 2)
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  has_factory BOOLEAN DEFAULT false, -- Có nhà xưởng/kho bãi
  
  -- Location
  province VARCHAR(100) NOT NULL,
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích
  total_area NUMERIC(12, 2) NOT NULL, -- ha
  available_area NUMERIC(12, 2), -- ha (diện tích còn trống)
  
  -- Giá cho thuê (nếu has_rental = true)
  rental_price_min BIGINT, -- đ/m²/tháng
  rental_price_max BIGINT,
  
  -- Giá chuyển nhượng (nếu has_transfer = true)
  transfer_price_min BIGINT, -- tỷ VND
  transfer_price_max BIGINT,
  
  -- Hạ tầng (JSONB - linh hoạt)
  -- Ví dụ: {"power": true, "water": true, "internet": true, ...}
  infrastructure JSONB DEFAULT '{}'::jsonb,
  
  -- Ngành nghề (cho filter)
  allowed_industries TEXT[],
  
  -- Mô tả
  description TEXT,
  description_full TEXT,
  thumbnail_url TEXT,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Search
  search_vector tsvector,
  
  CONSTRAINT check_has_service CHECK (has_rental = true OR has_transfer = true)
);

COMMENT ON TABLE industrial_parks IS 'Khu công nghiệp - có thể có cả 2 dịch vụ: cho thuê và chuyển nhượng';
COMMENT ON COLUMN industrial_parks.scope IS 'trong-kcn hoặc ngoai-kcn';
COMMENT ON COLUMN industrial_parks.infrastructure IS 'JSONB: {"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}';
COMMENT ON COLUMN industrial_parks.allowed_industries IS 'Array ngành nghề: [co-khi, dien-tu, thuc-pham]';

-- ============================================
-- TABLE: industrial_park_images
-- ============================================

CREATE TABLE IF NOT EXISTS industrial_park_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE industrial_park_images IS 'Hình ảnh của khu công nghiệp';
COMMENT ON COLUMN industrial_park_images.display_order IS 'Thứ tự hiển thị (0 là đầu tiên)';
COMMENT ON COLUMN industrial_park_images.is_primary IS 'Hình ảnh chính (thumbnail)';

-- ============================================
-- INDEXES: industrial_parks
-- ============================================

CREATE INDEX IF NOT EXISTS idx_industrial_parks_scope ON industrial_parks(scope);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_has_rental ON industrial_parks(has_rental) WHERE has_rental = true;
CREATE INDEX IF NOT EXISTS idx_industrial_parks_has_transfer ON industrial_parks(has_transfer) WHERE has_transfer = true;
CREATE INDEX IF NOT EXISTS idx_industrial_parks_location ON industrial_parks(province, ward);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_rental_price ON industrial_parks(rental_price_min, rental_price_max) WHERE has_rental = true;
CREATE INDEX IF NOT EXISTS idx_industrial_parks_transfer_price ON industrial_parks(transfer_price_min, transfer_price_max) WHERE has_transfer = true;
CREATE INDEX IF NOT EXISTS idx_industrial_parks_area ON industrial_parks(available_area);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_infrastructure ON industrial_parks USING GIN (infrastructure);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_industries ON industrial_parks USING GIN(allowed_industries);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_slug ON industrial_parks(slug);
CREATE INDEX IF NOT EXISTS idx_industrial_parks_code ON industrial_parks(code);

-- ============================================
-- INDEXES: industrial_park_images
-- ============================================

CREATE INDEX IF NOT EXISTS idx_industrial_park_images_park_id ON industrial_park_images(industrial_park_id);
CREATE INDEX IF NOT EXISTS idx_industrial_park_images_order ON industrial_park_images(industrial_park_id, display_order);

-- ============================================
-- TRIGGERS: Full-text Search
-- ============================================

-- Function for industrial_parks search_vector
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

CREATE TRIGGER trigger_industrial_parks_search_vector
  BEFORE INSERT OR UPDATE ON industrial_parks
  FOR EACH ROW EXECUTE FUNCTION update_industrial_parks_search_vector();

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

-- Function for updated_at (create or replace)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_industrial_parks_updated_at
  BEFORE UPDATE ON industrial_parks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

