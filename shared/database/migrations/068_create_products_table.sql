-- Migration 068: Create products table
-- Tạo bảng products - Copy từ industrial_parks, gộp tất cả bảng vệ tinh vào array/JSONB
-- Mục đích: Gom gọn database, tránh quá nhiều bảng vệ tinh

BEGIN;

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- TABLE: products
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại (từ industrial_parks)
  scope VARCHAR(50) NOT NULL CHECK (scope IN ('trong-kcn', 'ngoai-kcn')),
  
  -- Dịch vụ có sẵn
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  has_factory BOOLEAN DEFAULT false,
  
  -- Location
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích
  total_area NUMERIC(12, 2) NOT NULL, -- ha
  available_area NUMERIC(12, 2), -- ha
  occupancy_rate DECIMAL(5, 2), -- %
  
  -- Giá cho thuê
  rental_price_min BIGINT, -- đ/m²/tháng
  rental_price_max BIGINT,
  
  -- Giá chuyển nhượng
  transfer_price_min BIGINT, -- tỷ VND
  transfer_price_max BIGINT,
  land_price BIGINT, -- đ/m²
  
  -- Hạ tầng (JSONB - linh hoạt)
  infrastructure JSONB DEFAULT '{}'::jsonb,
  
  -- Mô tả
  description TEXT,
  description_full TEXT,
  advantages TEXT,
  
  -- Media
  thumbnail_url TEXT,
  video_url TEXT,
  
  -- Liên hệ
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  website_url TEXT,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- =====================================================
  -- ARRAY FIELDS - Thay thế các bảng vệ tinh
  -- =====================================================
  
  -- Thay thế industrial_park_product_types
  product_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Thay thế industrial_park_transaction_types
  transaction_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Thay thế industrial_park_location_types
  location_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Thay thế industrial_park_allowed_industries
  allowed_industries TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Thay thế industrial_park_images (JSONB array)
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Thay thế industrial_park_documents (JSONB array)
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Thay thế industrial_park_tenants (JSONB array)
  tenants JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Full-text search
  search_vector tsvector,
  
  CONSTRAINT check_has_service CHECK (has_rental = true OR has_transfer = true)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_scope ON products(scope);
CREATE INDEX IF NOT EXISTS idx_products_has_rental ON products(has_rental) WHERE has_rental = true;
CREATE INDEX IF NOT EXISTS idx_products_has_transfer ON products(has_transfer) WHERE has_transfer = true;
CREATE INDEX IF NOT EXISTS idx_products_has_factory ON products(has_factory) WHERE has_factory = true;

-- Location indexes
CREATE INDEX IF NOT EXISTS idx_products_province ON products(province);
CREATE INDEX IF NOT EXISTS idx_products_district ON products(district);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(province, district, ward);
CREATE INDEX IF NOT EXISTS idx_products_location_spatial ON products USING GIST(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Price indexes
CREATE INDEX IF NOT EXISTS idx_products_rental_price ON products(rental_price_min, rental_price_max) WHERE has_rental = true;
CREATE INDEX IF NOT EXISTS idx_products_transfer_price ON products(transfer_price_min, transfer_price_max) WHERE has_transfer = true;
CREATE INDEX IF NOT EXISTS idx_products_available_area ON products(available_area);

-- Array indexes (GIN indexes for array operations)
CREATE INDEX IF NOT EXISTS idx_products_product_types ON products USING GIN(product_types);
CREATE INDEX IF NOT EXISTS idx_products_transaction_types ON products USING GIN(transaction_types);
CREATE INDEX IF NOT EXISTS idx_products_location_types ON products USING GIN(location_types);
CREATE INDEX IF NOT EXISTS idx_products_allowed_industries ON products USING GIN(allowed_industries);

-- JSONB indexes (GIN indexes for JSONB operations)
CREATE INDEX IF NOT EXISTS idx_products_infrastructure ON products USING GIN(infrastructure);
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_products_documents ON products USING GIN(documents);
CREATE INDEX IF NOT EXISTS idx_products_tenants ON products USING GIN(tenants);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);

-- Published/Date indexes
CREATE INDEX IF NOT EXISTS idx_products_published_at ON products(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function for search_vector
CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.code, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description_full, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.province, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.district, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.ward, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_search_vector ON products;
CREATE TRIGGER trigger_products_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_products_search_vector();

-- Function for updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_products_updated_at();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE products IS 'Bảng sản phẩm - Copy từ industrial_parks, gộp tất cả bảng vệ tinh vào array/JSONB';
COMMENT ON COLUMN products.scope IS 'trong-kcn hoặc ngoai-kcn';
COMMENT ON COLUMN products.total_area IS 'Diện tích tính bằng hecta (ha)';
COMMENT ON COLUMN products.available_area IS 'Diện tích còn trống để cho thuê/chuyển nhượng';
COMMENT ON COLUMN products.occupancy_rate IS 'Tỷ lệ lấp đầy (ví dụ: 75.5%)';
COMMENT ON COLUMN products.infrastructure IS 'JSONB: {"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}';
COMMENT ON COLUMN products.product_types IS 'Array loại sản phẩm: [dat, nha-xuong, dat-co-nha-xuong]';
COMMENT ON COLUMN products.transaction_types IS 'Array loại giao dịch: [cho-thue, chuyen-nhuong]';
COMMENT ON COLUMN products.location_types IS 'Array loại vị trí: [trong-kcn, ngoai-kcn, trong-ccn, ngoai-ccn]';
COMMENT ON COLUMN products.allowed_industries IS 'Array ngành nghề: [co-khi, dien-tu, thuc-pham]';
COMMENT ON COLUMN products.images IS 'JSONB array hình ảnh với id, url, caption, display_order, is_primary';
COMMENT ON COLUMN products.documents IS 'JSONB array tài liệu với id, title, file_url, file_type, file_size, category, display_order, is_public';
COMMENT ON COLUMN products.tenants IS 'JSONB array doanh nghiệp với id, company_name, industry, logo_url, website, contact_email, contact_phone';

COMMIT;
















