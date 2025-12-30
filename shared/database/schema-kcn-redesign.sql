-- =====================================================
-- Database Schema Redesign - Khu Công Nghiệp
-- =====================================================
-- Version: 3.0 (KCN Redesign)
-- Date: 2025-01-28
-- Description: Thiết kế lại database cho KCN với filter linh hoạt
--              Sử dụng bảng lookup và vệ tinh để query linh hoạt
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. LOOKUP TABLES - Bảng tra cứu
-- =====================================================

-- Bảng loại sản phẩm (Product Types)
CREATE TABLE product_types (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE product_types IS 'Loại sản phẩm: đất, nhà xưởng, đất có nhà xưởng';

-- Insert default product types
INSERT INTO product_types (code, name_vi, name_en, display_order) VALUES
('dat', 'Đất', 'Land', 1),
('nha-xuong', 'Nhà xưởng', 'Factory', 2),
('dat-co-nha-xuong', 'Đất có nhà xưởng', 'Land with Factory', 3);

-- Bảng loại giao dịch (Transaction Types)
CREATE TABLE transaction_types (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE transaction_types IS 'Loại giao dịch: chuyển nhượng, cho thuê';

-- Insert default transaction types
INSERT INTO transaction_types (code, name_vi, name_en, display_order) VALUES
('chuyen-nhuong', 'Chuyển nhượng', 'Transfer', 1),
('cho-thue', 'Cho thuê', 'Rent', 2);

-- Bảng loại vị trí (Location Types)
CREATE TABLE location_types (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  zone_type VARCHAR(50) CHECK (zone_type IN ('kcn', 'ccn', 'ngoai')), -- KCN, CCN, hoặc ngoài
  location_position VARCHAR(50) CHECK (location_position IN ('trong', 'ngoai')), -- trong hoặc ngoài
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE location_types IS 'Loại vị trí: trong KCN, ngoài KCN, trong CCN, ngoài CCN';

-- Insert default location types
INSERT INTO location_types (code, name_vi, name_en, zone_type, location_position, display_order) VALUES
('trong-kcn', 'Trong KCN', 'Inside Industrial Zone', 'kcn', 'trong', 1),
('ngoai-kcn', 'Ngoài KCN', 'Outside Industrial Zone', 'kcn', 'ngoai', 2),
('trong-ccn', 'Trong CCN', 'Inside Industrial Cluster', 'ccn', 'trong', 3),
('ngoai-ccn', 'Ngoài CCN', 'Outside Industrial Cluster', 'ccn', 'ngoai', 4),
('ngoai-kcn-ccn', 'Ngoài KCN / CCN', 'Outside KCN / CCN', 'ngoai', 'ngoai', 5);

-- =====================================================
-- 2. INDUSTRIAL_PARKS - Khu công nghiệp (Main Entity)
-- =====================================================
CREATE TABLE industrial_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại KCN
  park_type VARCHAR(50) DEFAULT 'kcn' CHECK (park_type IN ('kcn', 'ccn')), -- KCN hoặc CCN
  
  -- Location
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích KCN
  total_area NUMERIC(12, 2) NOT NULL,
  available_area NUMERIC(12, 2),
  
  -- Hạ tầng
  infrastructure_power BOOLEAN DEFAULT false,
  infrastructure_water BOOLEAN DEFAULT false,
  infrastructure_drainage BOOLEAN DEFAULT false,
  infrastructure_waste BOOLEAN DEFAULT false,
  infrastructure_internet BOOLEAN DEFAULT false,
  infrastructure_road BOOLEAN DEFAULT false,
  infrastructure_security BOOLEAN DEFAULT false,
  
  -- Giá thuê tham khảo
  rental_price_min BIGINT,
  rental_price_max BIGINT,
  
  -- Mô tả
  description TEXT,
  description_full TEXT,
  
  -- Media
  thumbnail_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Full-text search
  search_vector tsvector
);

CREATE INDEX idx_industrial_parks_code ON industrial_parks(code);
CREATE INDEX idx_industrial_parks_slug ON industrial_parks(slug);
CREATE INDEX idx_industrial_parks_type ON industrial_parks(park_type);
CREATE INDEX idx_industrial_parks_location ON industrial_parks(province, district);
CREATE INDEX idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);
CREATE INDEX idx_industrial_parks_location_spatial ON industrial_parks USING GIST(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON TABLE industrial_parks IS 'Khu công nghiệp/Cụm công nghiệp - đối tượng chính';

-- =====================================================
-- 3. PROPERTIES - Bảng cơ sở (Base Table)
-- =====================================================
-- Properties là sản phẩm phụ của KCN
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại chính
  main_category VARCHAR(50) NOT NULL CHECK (main_category IN ('kcn', 'bds')),
  -- main_category = 'kcn' cho các sản phẩm trong KCN
  
  -- Reference to Industrial Park (nếu thuộc KCN/CCN)
  industrial_park_id UUID REFERENCES industrial_parks(id) ON DELETE SET NULL,
  industrial_cluster_id UUID REFERENCES industrial_parks(id) ON DELETE SET NULL, -- CCN
  
  -- Location
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích
  total_area NUMERIC(12, 2) NOT NULL,
  area_unit VARCHAR(10) DEFAULT 'm2' CHECK (area_unit IN ('m2', 'ha')),
  land_area NUMERIC(12, 2),
  construction_area NUMERIC(12, 2),
  
  -- Giá cả
  price BIGINT NOT NULL,
  price_unit VARCHAR(10) DEFAULT 'vnd',
  price_per_sqm BIGINT,
  price_range_min BIGINT,
  price_range_max BIGINT,
  negotiable BOOLEAN DEFAULT false,
  
  -- Pháp lý
  legal_status VARCHAR(100),
  
  -- Mô tả
  description TEXT,
  description_full TEXT,
  
  -- Media
  thumbnail_url TEXT,
  video_url TEXT,
  
  -- Contact
  contact_name VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Full-text search
  search_vector tsvector
);

CREATE INDEX idx_properties_code ON properties(code);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_main_category ON properties(main_category);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_industrial_park_id ON properties(industrial_park_id) WHERE industrial_park_id IS NOT NULL;
CREATE INDEX idx_properties_industrial_cluster_id ON properties(industrial_cluster_id) WHERE industrial_cluster_id IS NOT NULL;
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_area ON properties(total_area);
CREATE INDEX idx_properties_published ON properties(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_properties_location_spatial ON properties USING GIST(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);

COMMENT ON TABLE properties IS 'Bảng cơ sở chứa thông tin chung cho tất cả loại bất động sản';

-- =====================================================
-- 4. SATELLITE TABLES - Bảng vệ tinh cho filter linh hoạt
-- =====================================================

-- Bảng kết nối Properties với Product Types
CREATE TABLE property_product_types (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  product_type_code VARCHAR(100) NOT NULL REFERENCES product_types(code) ON DELETE CASCADE,
  PRIMARY KEY (property_id, product_type_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_product_types_property ON property_product_types(property_id);
CREATE INDEX idx_property_product_types_product ON property_product_types(product_type_code);

COMMENT ON TABLE property_product_types IS 'Kết nối properties với product types - cho phép một property có nhiều product types';

-- Bảng kết nối Properties với Transaction Types
CREATE TABLE property_transaction_types (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  transaction_type_code VARCHAR(100) NOT NULL REFERENCES transaction_types(code) ON DELETE CASCADE,
  PRIMARY KEY (property_id, transaction_type_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_transaction_types_property ON property_transaction_types(property_id);
CREATE INDEX idx_property_transaction_types_transaction ON property_transaction_types(transaction_type_code);

COMMENT ON TABLE property_transaction_types IS 'Kết nối properties với transaction types - cho phép một property có nhiều transaction types';

-- Bảng kết nối Properties với Location Types
CREATE TABLE property_location_types (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  location_type_code VARCHAR(100) NOT NULL REFERENCES location_types(code) ON DELETE CASCADE,
  PRIMARY KEY (property_id, location_type_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_location_types_property ON property_location_types(property_id);
CREATE INDEX idx_property_location_types_location ON property_location_types(location_type_code);

COMMENT ON TABLE property_location_types IS 'Kết nối properties với location types - cho phép một property có nhiều location types';

-- =====================================================
-- 5. EXTENSION TABLES - Bảng mở rộng
-- =====================================================

-- Property Land (cho đất)
CREATE TABLE property_land (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  
  width NUMERIC(10, 2),
  length NUMERIC(10, 2),
  frontage_width NUMERIC(10, 2),
  depth NUMERIC(10, 2),
  
  corner_lot BOOLEAN DEFAULT false,
  main_road_access BOOLEAN DEFAULT false,
  road_width NUMERIC(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE property_land IS 'Thông tin đất: đất nền, đất trong/ngoài KCN';

-- Property Factory (cho nhà xưởng)
CREATE TABLE property_factory (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  
  factory_height NUMERIC(10, 2),
  factory_structure VARCHAR(100),
  
  loading_capacity NUMERIC(10, 2),
  crane_capacity NUMERIC(10, 2),
  
  has_office BOOLEAN DEFAULT false,
  office_area NUMERIC(10, 2),
  has_crane BOOLEAN DEFAULT false,
  has_fire_system BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  parking_capacity INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE property_factory IS 'Thông tin nhà xưởng: nhà xưởng, đất có nhà xưởng';

-- Property Residential (cho BDS thông thường)
CREATE TABLE property_residential (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  orientation VARCHAR(50),
  furniture VARCHAR(50) CHECK (furniture IN ('full', 'basic', 'empty')),
  
  -- Căn hộ specific
  building_name VARCHAR(255),
  floor_number INTEGER,
  unit_number VARCHAR(50),
  balcony_area NUMERIC(10, 2),
  
  -- Biệt thự specific
  garden_area NUMERIC(10, 2),
  swimming_pool BOOLEAN DEFAULT false,
  garage_capacity INTEGER,
  
  -- Shophouse specific
  shop_area NUMERIC(10, 2),
  living_area NUMERIC(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE property_residential IS 'Thông tin nhà ở: nhà phố, căn hộ, biệt thự, shophouse';

-- =====================================================
-- 6. SUPPORTING TABLES
-- =====================================================

-- Industries (Ngành nghề)
CREATE TABLE industries (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE industries IS 'Ngành nghề được phép hoạt động trong KCN';

-- Industrial Park Allowed Industries
CREATE TABLE industrial_park_allowed_industries (
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  industry_code VARCHAR(100) NOT NULL REFERENCES industries(code) ON DELETE CASCADE,
  PRIMARY KEY (park_id, industry_code)
);

CREATE INDEX idx_industrial_park_industries_park ON industrial_park_allowed_industries(park_id);
CREATE INDEX idx_industrial_park_industries_industry ON industrial_park_allowed_industries(industry_code);

-- Property Images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_order ON property_images(property_id, display_order);

-- Property Documents
CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  url TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);

-- Amenities
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(100),
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_amenities_code ON amenities(code);

-- Property Amenities
CREATE TABLE property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX idx_property_amenities_amenity ON property_amenities(amenity_id);

-- =====================================================
-- 7. TRIGGERS - Full-text search
-- =====================================================

-- Properties search vector
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

CREATE TRIGGER properties_search_vector_update
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

-- Industrial Parks search vector
CREATE OR REPLACE FUNCTION update_industrial_parks_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.code, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER industrial_parks_search_vector_update
BEFORE INSERT OR UPDATE ON industrial_parks
FOR EACH ROW EXECUTE FUNCTION update_industrial_parks_search_vector();

-- =====================================================
-- 8. TRIGGERS - Auto update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_industrial_parks_updated_at BEFORE UPDATE ON industrial_parks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_residential_updated_at BEFORE UPDATE ON property_residential
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_land_updated_at BEFORE UPDATE ON property_land
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_factory_updated_at BEFORE UPDATE ON property_factory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. VIEWS - Views hỗ trợ query
-- =====================================================

-- View tổng hợp properties với các thông tin filter
CREATE OR REPLACE VIEW v_properties_filter AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.slug,
  p.main_category,
  p.status,
  p.industrial_park_id,
  p.industrial_cluster_id,
  p.province,
  p.district,
  p.total_area,
  p.price,
  p.price_per_sqm,
  p.published_at,
  -- Aggregate product types
  COALESCE(
    array_agg(DISTINCT ppt.product_type_code) FILTER (WHERE ppt.product_type_code IS NOT NULL),
    ARRAY[]::VARCHAR[]
  ) as product_types,
  -- Aggregate transaction types
  COALESCE(
    array_agg(DISTINCT ptt.transaction_type_code) FILTER (WHERE ptt.transaction_type_code IS NOT NULL),
    ARRAY[]::VARCHAR[]
  ) as transaction_types,
  -- Aggregate location types
  COALESCE(
    array_agg(DISTINCT plt.location_type_code) FILTER (WHERE plt.location_type_code IS NOT NULL),
    ARRAY[]::VARCHAR[]
  ) as location_types
FROM properties p
LEFT JOIN property_product_types ppt ON p.id = ppt.property_id
LEFT JOIN property_transaction_types ptt ON p.id = ptt.property_id
LEFT JOIN property_location_types plt ON p.id = plt.property_id
WHERE p.main_category = 'kcn'
GROUP BY p.id, p.code, p.name, p.slug, p.main_category, p.status,
         p.industrial_park_id, p.industrial_cluster_id, p.province, p.district,
         p.total_area, p.price, p.price_per_sqm, p.published_at;

COMMENT ON VIEW v_properties_filter IS 'View tổng hợp properties với các filter types để query nhanh';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
















