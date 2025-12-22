-- ============================================
-- Database Schema - Simplified Design
-- Inland Real Estate Platform
-- ============================================
-- 
-- Thiết kế đơn giản hóa:
-- - 2 bảng chính: industrial_parks, properties
-- - Mỗi bảng có thể có cả 2 dịch vụ: cho thuê và chuyển nhượng
-- - Dùng JSONB cho hạ tầng (KCN) và đặc điểm (BDS)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- TABLE: industrial_parks (KCN)
-- ============================================

CREATE TABLE industrial_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại
  scope VARCHAR(50) NOT NULL CHECK (scope IN ('trong-kcn', 'ngoai-kcn')),
  
  -- Dịch vụ có sẵn (1 KCN có thể có cả 2)
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  
  -- Location
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
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
-- TABLE: properties (BDS)
-- ============================================

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại
  property_type VARCHAR(100) NOT NULL, 
    -- 'nha-pho', 'can-ho', 'biet-thu', 'dat-nen', 'shophouse', 'nha-xuong'
  
  -- Dịch vụ có sẵn (1 BDS có thể có cả 2)
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  
  status VARCHAR(50) NOT NULL DEFAULT 'available' 
    CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  
  -- Location
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích
  total_area NUMERIC(12, 2) NOT NULL, -- m²
  
  -- Giá cho thuê (nếu has_rental = true)
  rental_price_min BIGINT, -- VND/tháng
  rental_price_max BIGINT,
  
  -- Giá chuyển nhượng (nếu has_transfer = true)
  transfer_price_min BIGINT, -- VND
  transfer_price_max BIGINT,
  
  -- Pháp lý (cho filter)
  legal_status VARCHAR(100),
  
  -- Đặc điểm (JSONB - linh hoạt)
  -- Ví dụ nhà ở: {"bedrooms": 4, "bathrooms": 3, "orientation": "Đông Nam", "furniture": "full"}
  -- Ví dụ đất: {"width": 10, "length": 20, "corner_lot": true}
  -- Ví dụ nhà xưởng: {"factory_height": 8, "has_crane": true, "has_office": true}
  features JSONB DEFAULT '{}'::jsonb,
  
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

COMMENT ON TABLE properties IS 'Bất động sản thông thường - có thể có cả 2 dịch vụ: cho thuê và chuyển nhượng';
COMMENT ON COLUMN properties.property_type IS 'nha-pho, can-ho, biet-thu, dat-nen, shophouse, nha-xuong';
COMMENT ON COLUMN properties.features IS 'JSONB: Tùy theo loại BDS (bedrooms, bathrooms, width, length, factory_height, amenities: ["ho-boi", "gym", ...], ...)';

-- ============================================
-- TABLE: industrial_park_images
-- ============================================

CREATE TABLE industrial_park_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: property_images
-- ============================================

CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: users
-- ============================================

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

-- ============================================
-- TABLE: leads
-- ============================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  message TEXT,
  source VARCHAR(100), -- 'homepage', 'property', 'industrial_park', 'contact'
  reference_type VARCHAR(50), -- 'property', 'industrial_park'
  reference_id UUID, -- ID của property hoặc industrial_park
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES: industrial_parks
-- ============================================

CREATE INDEX idx_industrial_parks_scope ON industrial_parks(scope);
CREATE INDEX idx_industrial_parks_has_rental ON industrial_parks(has_rental) WHERE has_rental = true;
CREATE INDEX idx_industrial_parks_has_transfer ON industrial_parks(has_transfer) WHERE has_transfer = true;
CREATE INDEX idx_industrial_parks_location ON industrial_parks(province, district);
CREATE INDEX idx_industrial_parks_rental_price ON industrial_parks(rental_price_min, rental_price_max) WHERE has_rental = true;
CREATE INDEX idx_industrial_parks_transfer_price ON industrial_parks(transfer_price_min, transfer_price_max) WHERE has_transfer = true;
CREATE INDEX idx_industrial_parks_area ON industrial_parks(available_area);
CREATE INDEX idx_industrial_parks_infrastructure ON industrial_parks USING GIN (infrastructure);
CREATE INDEX idx_industrial_parks_industries ON industrial_parks USING GIN(allowed_industries);
CREATE INDEX idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);
CREATE INDEX idx_industrial_parks_slug ON industrial_parks(slug);
CREATE INDEX idx_industrial_parks_code ON industrial_parks(code);

-- ============================================
-- INDEXES: properties
-- ============================================

CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_has_rental ON properties(has_rental) WHERE has_rental = true;
CREATE INDEX idx_properties_has_transfer ON properties(has_transfer) WHERE has_transfer = true;
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_rental_price ON properties(rental_price_min, rental_price_max) WHERE has_rental = true;
CREATE INDEX idx_properties_transfer_price ON properties(transfer_price_min, transfer_price_max) WHERE has_transfer = true;
CREATE INDEX idx_properties_area ON properties(total_area);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_legal_status ON properties(legal_status) WHERE legal_status IS NOT NULL;
CREATE INDEX idx_properties_features ON properties USING GIN (features);
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_code ON properties(code);

-- ============================================
-- INDEXES: Other tables
-- ============================================

CREATE INDEX idx_industrial_park_images_park_id ON industrial_park_images(industrial_park_id);
CREATE INDEX idx_industrial_park_images_order ON industrial_park_images(industrial_park_id, display_order);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_order ON property_images(property_id, display_order);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_reference ON leads(reference_type, reference_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at);

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
    setweight(to_tsvector('simple', COALESCE(NEW.district, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_industrial_parks_search_vector
  BEFORE INSERT OR UPDATE ON industrial_parks
  FOR EACH ROW EXECUTE FUNCTION update_industrial_parks_search_vector();

-- Function for properties search_vector
CREATE OR REPLACE FUNCTION update_properties_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.code, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description_full, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.province, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.district, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_properties_search_vector
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

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

CREATE TRIGGER trigger_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: news
-- ============================================

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung')),
  thumbnail_url TEXT,
  excerpt TEXT,
  content TEXT,
  author VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: news_activities
-- ============================================

CREATE TABLE news_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('thi-truong-bds-cong-nghiep', 'tin-tuc-fdi', 'su-kien-tham-gia', 'du-an-moi', 'hoat-dong-csr')),
  thumbnail TEXT,
  excerpt TEXT,
  content TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  author VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  read_time VARCHAR(50),
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: insights
-- ============================================

CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('phan-tich-thi-truong', 'cam-nang-dau-tu', 'tin-tuc-fdi')),
  thumbnail TEXT,
  excerpt TEXT,
  content TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  author VARCHAR(255) NOT NULL,
  featured BOOLEAN DEFAULT false,
  read_time VARCHAR(50),
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: case_studies
-- ============================================

CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  industry VARCHAR(255),
  location VARCHAR(255),
  year INTEGER,
  challenge TEXT,
  solution TEXT,
  results JSONB DEFAULT '[]'::jsonb,
  testimonial JSONB,
  video TEXT,
  tags TEXT[],
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON COLUMN case_studies.results IS 'Array: [{"metric": "...", "value": "...", "description": "..."}]';
COMMENT ON COLUMN case_studies.testimonial IS 'Object: {"quote": "...", "author": "...", "role": "...", "company": "..."}';

-- ============================================
-- TABLE: case_study_images
-- ============================================

CREATE TABLE case_study_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: jobs
-- ============================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  deadline DATE,
  description JSONB DEFAULT '{}'::jsonb,
  meta_title VARCHAR(255),
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON COLUMN jobs.description IS '{overview: string, responsibilities: string[], requirements: string[], benefits: string[]}';

-- ============================================
-- TABLE: job_applications
-- ============================================

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cv_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: pages
-- ============================================

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  page_type VARCHAR(100) NOT NULL DEFAULT 'static' CHECK (page_type IN ('static', 'homepage')),
  published BOOLEAN DEFAULT true,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE pages IS 'Trang tĩnh/Homepage: gioi-thieu, dich-vu, lien-he, etc.';
COMMENT ON COLUMN pages.page_type IS 'static: trang tĩnh, homepage: trang chủ';

-- ============================================
-- TABLE: page_sections
-- ============================================

CREATE TABLE page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  section_type VARCHAR(100) NOT NULL CHECK (section_type IN ('hero', 'content', 'team', 'clients', 'service', 'form', 'info')),
  display_order INTEGER NOT NULL DEFAULT 0,
  content TEXT,
  images TEXT[],
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_page_section_key UNIQUE (page_id, section_key)
);

COMMENT ON TABLE page_sections IS 'Sections của mỗi trang - quản lý text và images cho CMS';
COMMENT ON COLUMN page_sections.section_key IS 'Key của section: hero, cau-chuyen, doi-ngu, etc.';
COMMENT ON COLUMN page_sections.section_type IS 'hero, content, team, clients, service, form, info';
COMMENT ON COLUMN page_sections.content IS 'Nội dung text (HTML hoặc plain text)';
COMMENT ON COLUMN page_sections.images IS 'Mảng URL hình ảnh';

-- ============================================
-- INDEXES: Content Tables
-- ============================================

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_date ON news(date);
CREATE INDEX idx_news_featured ON news(featured) WHERE featured = true;
CREATE INDEX idx_news_search ON news USING GIN(search_vector);
CREATE INDEX idx_news_created_by ON news(created_by);

CREATE INDEX idx_news_activities_slug ON news_activities(slug);
CREATE INDEX idx_news_activities_category ON news_activities(category);
CREATE INDEX idx_news_activities_date ON news_activities(date);
CREATE INDEX idx_news_activities_featured ON news_activities(featured) WHERE featured = true;
CREATE INDEX idx_news_activities_search ON news_activities USING GIN(search_vector);
CREATE INDEX idx_news_activities_created_by ON news_activities(created_by);

CREATE INDEX idx_insights_slug ON insights(slug);
CREATE INDEX idx_insights_category ON insights(category);
CREATE INDEX idx_insights_date ON insights(date);
CREATE INDEX idx_insights_featured ON insights(featured) WHERE featured = true;
CREATE INDEX idx_insights_search ON insights USING GIN(search_vector);
CREATE INDEX idx_insights_created_by ON insights(created_by);

CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_search ON case_studies USING GIN(search_vector);
CREATE INDEX idx_case_studies_created_by ON case_studies(created_by);
CREATE INDEX idx_case_study_images_case_study_id ON case_study_images(case_study_id);
CREATE INDEX idx_case_study_images_order ON case_study_images(case_study_id, display_order);

CREATE INDEX idx_jobs_slug ON jobs(slug);
CREATE INDEX idx_jobs_search ON jobs USING GIN(search_vector);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_email ON job_applications(email);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_type ON pages(page_type);
CREATE INDEX idx_pages_published ON pages(published);
CREATE INDEX idx_pages_created_by ON pages(created_by);
CREATE INDEX idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX idx_page_sections_order ON page_sections(page_id, display_order);
CREATE INDEX idx_page_sections_published ON page_sections(published);

-- ============================================
-- TRIGGERS: Full-text Search for Content Tables
-- ============================================

-- Function for news search_vector
CREATE OR REPLACE FUNCTION update_news_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_search_vector
  BEFORE INSERT OR UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_news_search_vector();

-- Function for news_activities search_vector
CREATE OR REPLACE FUNCTION update_news_activities_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_news_activities_search_vector
  BEFORE INSERT OR UPDATE ON news_activities
  FOR EACH ROW EXECUTE FUNCTION update_news_activities_search_vector();

-- Function for insights search_vector
CREATE OR REPLACE FUNCTION update_insights_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_insights_search_vector
  BEFORE INSERT OR UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_insights_search_vector();

-- Function for case_studies search_vector
CREATE OR REPLACE FUNCTION update_case_studies_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.project_name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.client, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.challenge, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.solution, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_case_studies_search_vector
  BEFORE INSERT OR UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_case_studies_search_vector();

-- Function for jobs search_vector
CREATE OR REPLACE FUNCTION update_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_jobs_search_vector
  BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_jobs_search_vector();

-- ============================================
-- TRIGGERS: Auto-update updated_at for Content Tables
-- ============================================

CREATE TRIGGER trigger_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_news_activities_updated_at
  BEFORE UPDATE ON news_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CMS TABLES - CMS Integration
-- ============================================

-- ============================================
-- TABLE: settings
-- ============================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_namespace ON settings(namespace);

COMMENT ON TABLE settings IS 'CMS settings với namespace-based organization';
COMMENT ON COLUMN settings.namespace IS 'Namespace: general, seo, appearance, security, advanced, email, social';

-- ============================================
-- TABLE: menu_locations
-- ============================================

CREATE TABLE menu_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: menu_items
-- ============================================

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_location_id UUID NOT NULL REFERENCES menu_locations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  icon VARCHAR(100),
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  entity_id UUID,
  target VARCHAR(20) DEFAULT '_self',
  rel VARCHAR(100),
  css_classes TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_location ON menu_items(menu_location_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_sort ON menu_items(menu_location_id, sort_order);
CREATE INDEX idx_menu_items_type ON menu_items(type);

COMMENT ON TABLE menu_locations IS 'Menu locations: header, footer, mobile, etc.';
COMMENT ON TABLE menu_items IS 'Menu items với nested structure và drag-drop ordering';

-- ============================================
-- TABLE: page_metadata
-- ============================================

CREATE TABLE page_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(500) NOT NULL UNIQUE,
    title VARCHAR(500),
    description TEXT,
    og_image VARCHAR(1000),
    keywords TEXT[],
    enabled BOOLEAN DEFAULT TRUE,
    auto_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_metadata_path ON page_metadata(path);
CREATE INDEX idx_page_metadata_auto_generated ON page_metadata(auto_generated);

COMMENT ON TABLE page_metadata IS 'SEO metadata cho từng page (static pages, properties, news, etc.)';

-- ============================================
-- TABLE: activity_logs
-- ============================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    entity_name VARCHAR(255),
    description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_recent ON activity_logs(created_at DESC, user_id);

COMMENT ON TABLE activity_logs IS 'Activity tracking và audit trail cho CMS';

-- ============================================
-- TABLE: asset_folders
-- ============================================

CREATE TABLE asset_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
    path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: assets
-- ============================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) DEFAULT 'local',
    url VARCHAR(1024) NOT NULL,
    cdn_url VARCHAR(1024),
    filename VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    width INTEGER,
    height INTEGER,
    format VARCHAR(50),
    sizes JSONB,
    alt_text TEXT,
    caption TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_folders_parent_id ON asset_folders(parent_id);
CREATE INDEX idx_assets_folder_id ON assets(folder_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_provider ON assets(provider);

COMMENT ON TABLE asset_folders IS 'Media folders với nested structure';
COMMENT ON TABLE assets IS 'Unified media library - có thể dùng cho tất cả entities';

-- ============================================
-- TABLE: faq_categories
-- ============================================

CREATE TABLE faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: faq_questions
-- ============================================

CREATE TABLE faq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faq_categories_slug ON faq_categories(slug);
CREATE INDEX idx_faq_categories_sort_order ON faq_categories(sort_order);
CREATE INDEX idx_faq_categories_is_active ON faq_categories(is_active);
CREATE INDEX idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX idx_faq_questions_sort_order ON faq_questions(sort_order);
CREATE INDEX idx_faq_questions_is_active ON faq_questions(is_active);

COMMENT ON TABLE faq_categories IS 'FAQ categories để tổ chức questions';
COMMENT ON TABLE faq_questions IS 'FAQ questions và answers';

-- ============================================
-- TABLE: tracking_scripts
-- ============================================

CREATE TABLE tracking_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  provider VARCHAR(100),
  position VARCHAR(10) NOT NULL DEFAULT 'head',
  script_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  load_strategy VARCHAR(20) DEFAULT 'sync',
  pages JSONB DEFAULT '["all"]'::jsonb,
  priority INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (position IN ('head', 'body')),
  CHECK (load_strategy IN ('sync', 'async', 'defer')),
  CHECK (type IN ('analytics', 'pixel', 'custom', 'tag-manager', 'heatmap', 'live-chat'))
);

CREATE INDEX idx_tracking_scripts_active ON tracking_scripts(is_active);
CREATE INDEX idx_tracking_scripts_position ON tracking_scripts(position);
CREATE INDEX idx_tracking_scripts_pages ON tracking_scripts USING GIN(pages);
CREATE INDEX idx_tracking_scripts_priority ON tracking_scripts(priority);

COMMENT ON TABLE tracking_scripts IS 'Quản lý tracking scripts (Google Analytics, Facebook Pixel, etc.)';

-- ============================================
-- TABLE: newsletter_subscriptions
-- ============================================

CREATE TABLE newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  source VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);

COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions từ website visitors';

-- ============================================
-- TRIGGERS: Auto-update updated_at for CMS Tables
-- ============================================

CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_menu_locations_updated_at
  BEFORE UPDATE ON menu_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_page_metadata_updated_at
  BEFORE UPDATE ON page_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_asset_folders_updated_at
  BEFORE UPDATE ON asset_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_faq_categories_updated_at
  BEFORE UPDATE ON faq_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_faq_questions_updated_at
  BEFORE UPDATE ON faq_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tracking_scripts_updated_at
  BEFORE UPDATE ON tracking_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default menu locations
INSERT INTO menu_locations (name, slug, description, is_active) VALUES
  ('Header Menu', 'header', 'Main navigation menu displayed in the header', true),
  ('Footer Menu', 'footer', 'Links displayed in the footer', true),
  ('Mobile Menu', 'mobile', 'Mobile navigation menu', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Industrial Park
INSERT INTO industrial_parks (
  code, name, slug, scope,
  has_rental, has_transfer,
  province, district,
  total_area, available_area,
  rental_price_min, rental_price_max,
  transfer_price_min, transfer_price_max,
  infrastructure,
  allowed_industries,
  description
) VALUES (
  'IP-001',
  'KCN Long Hậu',
  'kcn-long-hau',
  'trong-kcn',
  true,
  true,
  'Long An',
  'Đức Hòa',
  500,
  120,
  35000,
  45000,
  1000000000,
  50000000000,
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['co-khi', 'dien-tu', 'thuc-pham'],
  'KCN Long Hậu với diện tích 500ha, còn trống 120ha'
);

-- Sample Property (Nhà phố)
INSERT INTO properties (
  code, name, slug, property_type,
  has_rental, has_transfer,
  province, district,
  total_area,
  rental_price_min, rental_price_max,
  transfer_price_min, transfer_price_max,
  features,
  description
) VALUES (
  'INL-BDS-001',
  'Nhà phố Quận 1',
  'nha-pho-quan-1',
  'nha-pho',
  true,
  true,
  'TP.HCM',
  'Quận 1',
  120,
  15000000,
  30000000,
  4800000000,
  5000000000,
  '{"bedrooms": 4, "bathrooms": 3, "orientation": "Đông Nam", "furniture": "full"}'::jsonb,
  'Nhà phố 4 phòng ngủ, 3 phòng tắm, đầy đủ nội thất'
);


