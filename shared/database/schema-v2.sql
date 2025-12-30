-- =====================================================
-- Database Schema v2 - Inland Real Estate Platform
-- =====================================================
-- Version: 2.0 (Final Design)
-- Date: 2025-01-28
-- Description: Hybrid approach với base table + extension tables
--              Thiết kế đã thống nhất với team
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS - Người dùng hệ thống
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'sale' CHECK (role IN ('admin', 'sale')),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

COMMENT ON TABLE users IS 'Quản lý người dùng CMS và admin';

-- =====================================================
-- 2. INDUSTRIAL_PARKS - Khu công nghiệp
-- =====================================================
CREATE TABLE industrial_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
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
CREATE INDEX idx_industrial_parks_location ON industrial_parks(province, district);
CREATE INDEX idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);
CREATE INDEX idx_industrial_parks_location_spatial ON industrial_parks USING GIST(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON TABLE industrial_parks IS 'Khu công nghiệp độc lập, properties trong KCN reference đến';

-- =====================================================
-- 3. PROPERTIES - Bảng cơ sở (Base Table)
-- =====================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại
  main_category VARCHAR(50) NOT NULL CHECK (main_category IN ('kcn', 'bds')),
  sub_category VARCHAR(50) CHECK (sub_category IN ('trong-kcn', 'ngoai-kcn')),
  property_type VARCHAR(100) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('chuyen-nhuong', 'cho-thue')),
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  
  -- Reference to Industrial Park
  industrial_park_id UUID REFERENCES industrial_parks(id) ON DELETE SET NULL,
  
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
CREATE INDEX idx_properties_sub_category ON properties(sub_category);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_industrial_park_id ON properties(industrial_park_id) WHERE industrial_park_id IS NOT NULL;
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_area ON properties(total_area);
CREATE INDEX idx_properties_published ON properties(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_properties_location_spatial ON properties USING GIST(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_category_type ON properties(main_category, sub_category, property_type);
CREATE INDEX idx_properties_type_transaction ON properties(property_type, transaction_type, status);

COMMENT ON TABLE properties IS 'Bảng cơ sở chứa thông tin chung cho tất cả loại bất động sản';

-- =====================================================
-- 4. PROPERTY_RESIDENTIAL - Thông tin nhà ở
-- =====================================================
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

CREATE INDEX idx_property_residential_bedrooms ON property_residential(bedrooms);
CREATE INDEX idx_property_residential_bathrooms ON property_residential(bathrooms);

COMMENT ON TABLE property_residential IS 'Thông tin nhà ở: nhà phố, căn hộ, biệt thự, shophouse';

-- =====================================================
-- 5. PROPERTY_LAND - Thông tin đất
-- =====================================================
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

-- =====================================================
-- 6. PROPERTY_FACTORY - Thông tin nhà xưởng
-- =====================================================
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

-- =====================================================
-- 7. INDUSTRIES - Ngành nghề (Lookup)
-- =====================================================
CREATE TABLE industries (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE industries IS 'Ngành nghề được phép hoạt động trong KCN';

-- =====================================================
-- 8. INDUSTRIAL_PARK_ALLOWED_INDUSTRIES
-- =====================================================
CREATE TABLE industrial_park_allowed_industries (
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  industry_code VARCHAR(100) NOT NULL REFERENCES industries(code) ON DELETE CASCADE,
  PRIMARY KEY (park_id, industry_code)
);

CREATE INDEX idx_industrial_park_industries_park ON industrial_park_allowed_industries(park_id);
CREATE INDEX idx_industrial_park_industries_industry ON industrial_park_allowed_industries(industry_code);

-- =====================================================
-- 9. PROPERTY_IMAGES
-- =====================================================
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

-- =====================================================
-- 10. PROPERTY_DOCUMENTS
-- =====================================================
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

-- =====================================================
-- 11. AMENITIES
-- =====================================================
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

-- =====================================================
-- 12. PROPERTY_AMENITIES
-- =====================================================
CREATE TABLE property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX idx_property_amenities_amenity ON property_amenities(amenity_id);

-- =====================================================
-- 13. NEWS
-- =====================================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung')),
  thumbnail TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  author VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_featured ON news(featured) WHERE featured = true;
CREATE INDEX idx_news_published ON news(published_at) WHERE published_at IS NOT NULL;

-- =====================================================
-- 14. NEWS_ACTIVITIES
-- =====================================================
CREATE TABLE news_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'thi-truong-bds-cong-nghiep',
    'tin-tuc-fdi',
    'su-kien-tham-gia',
    'du-an-moi',
    'hoat-dong-csr'
  )),
  thumbnail TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  author VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  read_time VARCHAR(50),
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_news_activities_slug ON news_activities(slug);
CREATE INDEX idx_news_activities_category ON news_activities(category);
CREATE INDEX idx_news_activities_featured ON news_activities(featured) WHERE featured = true;
CREATE INDEX idx_news_activities_published ON news_activities(published_at) WHERE published_at IS NOT NULL;

-- =====================================================
-- 15. JOBS
-- =====================================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),
  quantity INTEGER DEFAULT 1,
  deadline DATE,
  description_overview TEXT,
  description_responsibilities TEXT,
  description_requirements TEXT,
  description_benefits TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_status ON jobs(status) WHERE status = 'active';
CREATE INDEX idx_jobs_deadline ON jobs(deadline) WHERE deadline >= CURRENT_DATE;

-- =====================================================
-- 16. JOB_APPLICATIONS
-- =====================================================
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cv_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);

-- =====================================================
-- 17. CASE_STUDIES
-- =====================================================
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  location VARCHAR(255),
  year INTEGER,
  challenge TEXT,
  solution TEXT,
  results JSONB,
  testimonial_quote TEXT,
  testimonial_author VARCHAR(255),
  testimonial_role VARCHAR(255),
  testimonial_company VARCHAR(255),
  video_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_industry ON case_studies(industry);
CREATE INDEX idx_case_studies_tags ON case_studies USING GIN(tags);

-- =====================================================
-- 18. CASE_STUDY_IMAGES
-- =====================================================
CREATE TABLE case_study_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_study_images_case_study_id ON case_study_images(case_study_id);

-- =====================================================
-- 19. LEADS
-- =====================================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  message TEXT,
  source VARCHAR(50) NOT NULL CHECK (source IN ('homepage', 'property', 'industrial_park', 'contact', 'news', 'job')),
  reference_id UUID,
  reference_type VARCHAR(50) CHECK (reference_type IN ('property', 'industrial_park')),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  contacted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_reference ON leads(reference_type, reference_id) WHERE reference_id IS NOT NULL;
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- =====================================================
-- TRIGGERS - Full-text search
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
-- TRIGGERS - Auto update updated_at
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

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_activities_updated_at BEFORE UPDATE ON news_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF SCHEMA
-- =====================================================




























