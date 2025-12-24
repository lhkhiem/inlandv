-- Migration 047: Create Properties Tables
-- Creates properties, property_images, property_documents, amenities, and property_amenities tables
-- Date: 2025-01-28

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROPERTIES - Bất động sản
-- =====================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Vị trí địa lý
  province VARCHAR(100) NOT NULL,
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Chi tiết bất động sản
  type VARCHAR(50) NOT NULL CHECK (type IN ('nha-pho', 'can-ho', 'dat-nen', 'biet-thu', 'shophouse', 'nha-xuong')),
  category VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  legal_status VARCHAR(100),
  
  -- Kích thước
  area NUMERIC(10, 2) NOT NULL,
  land_area NUMERIC(10, 2),
  construction_area NUMERIC(10, 2),
  width NUMERIC(10, 2),
  length NUMERIC(10, 2),
  
  -- Cấu trúc
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  orientation VARCHAR(50),
  
  -- Dịch vụ có sẵn (1 BDS có thể có cả 2)
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  
  -- Dịch vụ có sẵn (1 BDS có thể có cả 2)
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  
  -- Giá cả
  -- Giá bán/chuyển nhượng (nếu has_transfer = true)
  sale_price BIGINT,
  sale_price_min BIGINT,
  sale_price_max BIGINT,
  sale_price_per_sqm BIGINT,
  -- Giá thuê (nếu has_rental = true)
  rental_price BIGINT,
  rental_price_min BIGINT,
  rental_price_max BIGINT,
  rental_price_per_sqm BIGINT,
  -- Thông tin chung
  negotiable BOOLEAN DEFAULT false,
  
  -- Đặc điểm
  furniture VARCHAR(50) CHECK (furniture IN ('full', 'basic', 'empty')),
  description TEXT,
  description_full TEXT,
  
  -- Media
  thumbnail_url TEXT,
  video_url TEXT,
  
  -- Liên hệ
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Full-text search
  search_vector tsvector
);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_code ON properties(code);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_province ON properties(province);
CREATE INDEX IF NOT EXISTS idx_properties_ward ON properties(ward);
CREATE INDEX IF NOT EXISTS idx_properties_sale_price ON properties(sale_price);
CREATE INDEX IF NOT EXISTS idx_properties_rental_price ON properties(rental_price);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(province, ward);
CREATE INDEX IF NOT EXISTS idx_properties_published ON properties(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN(search_vector);

-- Comments
COMMENT ON TABLE properties IS 'Quản lý chi tiết các bất động sản: nhà phố, căn hộ, biệt thự, đất nền, shophouse, nhà xưởng';
COMMENT ON COLUMN properties.code IS 'Mã định danh duy nhất cho sản phẩm (VD: INL-BDS-001)';
COMMENT ON COLUMN properties.type IS 'Loại hình bất động sản';
COMMENT ON COLUMN properties.status IS 'Trạng thái hiện tại';
COMMENT ON COLUMN properties.legal_status IS 'Tình trạng pháp lý (sổ hồng riêng, sổ chung, hợp lệ...)';
COMMENT ON COLUMN properties.search_vector IS 'Vector full-text search để tìm kiếm nhanh';

-- Trigger để tự động cập nhật search_vector
CREATE OR REPLACE FUNCTION update_properties_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.code, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.address, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS properties_search_vector_update ON properties;
CREATE TRIGGER properties_search_vector_update
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

-- =====================================================
-- PROPERTY_IMAGES - Hình ảnh bất động sản
-- =====================================================
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_order ON property_images(property_id, display_order);

COMMENT ON TABLE property_images IS 'Lưu trữ hình ảnh gallery của từng bất động sản';
COMMENT ON COLUMN property_images.display_order IS 'Thứ tự hiển thị (0 là đầu tiên)';
COMMENT ON COLUMN property_images.is_primary IS 'Hình ảnh chính (thumbnail)';

-- =====================================================
-- PROPERTY_DOCUMENTS - Tài liệu bất động sản
-- =====================================================
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);

COMMENT ON TABLE property_documents IS 'Các file PDF, tài liệu liên quan (sổ hồng, giấy tờ pháp lý...)';
COMMENT ON COLUMN property_documents.type IS 'Loại tài liệu (VD: so-hong, giay-to-phap-ly)';

-- =====================================================
-- AMENITIES - Tiện ích (Lookup Table)
-- =====================================================
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(100),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_amenities_code ON amenities(code);

COMMENT ON TABLE amenities IS 'Bảng lookup cho các tiện ích (hồ bơi, gym, gara...)';
COMMENT ON COLUMN amenities.code IS 'Mã định danh (VD: ho-boi, gym, gara-oto)';

-- =====================================================
-- PROPERTY_AMENITIES - Quan hệ N:M Properties - Amenities
-- =====================================================
CREATE TABLE IF NOT EXISTS property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_amenities_amenity ON property_amenities(amenity_id);

COMMENT ON TABLE property_amenities IS 'Junction table liên kết properties với amenities';

-- =====================================================
-- TRIGGER - Tự động cập nhật updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at 
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

