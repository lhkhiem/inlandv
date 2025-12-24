-- =====================================================
-- Full Database Schema - Inland Real Estate Platform
-- =====================================================
-- Version: 1.0
-- Date: 2025-01-28
-- Description: Complete database schema với tất cả các bảng
--              dựa trên phân tích frontend và requirements
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
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
COMMENT ON COLUMN users.role IS 'admin: quản trị, sale: nhân viên kinh doanh';
COMMENT ON COLUMN users.is_active IS 'Cho phép vô hiệu hóa tài khoản mà không xóa';

-- =====================================================
-- 2. PROJECTS - Dự án bất động sản
-- =====================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price_min BIGINT,
  price_max BIGINT,
  area_min NUMERIC(10, 2),
  area_max NUMERIC(10, 2),
  status VARCHAR(50) CHECK (status IN ('dang-mo-ban', 'sap-mo-ban', 'da-ban-het')),
  thumbnail_url TEXT,
  gallery JSONB DEFAULT '[]',
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_location ON projects(location);
CREATE INDEX idx_projects_price_range ON projects(price_min, price_max);

COMMENT ON TABLE projects IS 'Các dự án bất động sản lớn (ví dụ: Vinhomes Grand Park)';
COMMENT ON COLUMN projects.status IS 'dang-mo-ban: đang mở bán, sap-mo-ban: sắp mở bán, da-ban-het: đã bán hết';
COMMENT ON COLUMN projects.gallery IS 'JSON array chứa URLs hình ảnh';

-- =====================================================
-- 3. PROPERTIES - Bất động sản
-- =====================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Vị trí địa lý
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  street VARCHAR(255),
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
  
  -- Giá cả
  price BIGINT NOT NULL,
  price_per_sqm BIGINT,
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

CREATE INDEX idx_properties_code ON properties(code);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_province ON properties(province);
CREATE INDEX idx_properties_district ON properties(district);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_published ON properties(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);

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

CREATE TRIGGER properties_search_vector_update
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_properties_search_vector();

-- =====================================================
-- 4. PROPERTY_IMAGES - Hình ảnh bất động sản
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

COMMENT ON TABLE property_images IS 'Lưu trữ hình ảnh gallery của từng bất động sản';
COMMENT ON COLUMN property_images.display_order IS 'Thứ tự hiển thị (0 là đầu tiên)';
COMMENT ON COLUMN property_images.is_primary IS 'Hình ảnh chính (thumbnail)';

-- =====================================================
-- 5. PROPERTY_DOCUMENTS - Tài liệu bất động sản
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

COMMENT ON TABLE property_documents IS 'Các file PDF, tài liệu liên quan (sổ hồng, giấy tờ pháp lý...)';
COMMENT ON COLUMN property_documents.type IS 'Loại tài liệu (VD: so-hong, giay-to-phap-ly)';

-- =====================================================
-- 6. AMENITIES - Tiện ích (Lookup Table)
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

COMMENT ON TABLE amenities IS 'Bảng lookup cho các tiện ích (hồ bơi, gym, gara...)';
COMMENT ON COLUMN amenities.code IS 'Mã định danh (VD: ho-boi, gym, gara-oto)';

-- =====================================================
-- 7. PROPERTY_AMENITIES - Quan hệ N:M Properties - Amenities
-- =====================================================
CREATE TABLE property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX idx_property_amenities_amenity ON property_amenities(amenity_id);

COMMENT ON TABLE property_amenities IS 'Junction table liên kết properties với amenities';

-- =====================================================
-- 8. INDUSTRIAL_PARKS - Khu công nghiệp
-- =====================================================
CREATE TABLE industrial_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Vị trí
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Chi tiết khu công nghiệp
  total_area NUMERIC(12, 2) NOT NULL,
  available_area NUMERIC(12, 2),
  occupancy_rate DECIMAL(5, 2),
  
  -- Hạ tầng
  infrastructure_power BOOLEAN DEFAULT false,
  infrastructure_water BOOLEAN DEFAULT false,
  infrastructure_drainage BOOLEAN DEFAULT false,
  infrastructure_waste BOOLEAN DEFAULT false,
  infrastructure_internet BOOLEAN DEFAULT false,
  infrastructure_road BOOLEAN DEFAULT false,
  infrastructure_security BOOLEAN DEFAULT false,
  
  -- Giá cả
  rental_price_min BIGINT,
  rental_price_max BIGINT,
  land_price BIGINT,
  
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
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Full-text search
  search_vector tsvector
);

CREATE INDEX idx_industrial_parks_code ON industrial_parks(code);
CREATE INDEX idx_industrial_parks_slug ON industrial_parks(slug);
CREATE INDEX idx_industrial_parks_province ON industrial_parks(province);
CREATE INDEX idx_industrial_parks_district ON industrial_parks(district);
CREATE INDEX idx_industrial_parks_rental_price ON industrial_parks(rental_price_min, rental_price_max);
CREATE INDEX idx_industrial_parks_available_area ON industrial_parks(available_area);
CREATE INDEX idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);

COMMENT ON TABLE industrial_parks IS 'Quản lý thông tin các khu công nghiệp (KCN) và cụm công nghiệp (CCN)';
COMMENT ON COLUMN industrial_parks.total_area IS 'Diện tích tính bằng hecta (ha)';
COMMENT ON COLUMN industrial_parks.available_area IS 'Diện tích còn trống để cho thuê/chuyển nhượng';
COMMENT ON COLUMN industrial_parks.occupancy_rate IS 'Tỷ lệ lấp đầy (ví dụ: 75.5%)';

-- Trigger cho search_vector
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
-- 9. INDUSTRIAL_PARK_IMAGES - Hình ảnh KCN
-- =====================================================
CREATE TABLE industrial_park_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industrial_park_images_park_id ON industrial_park_images(park_id);
CREATE INDEX idx_industrial_park_images_order ON industrial_park_images(park_id, display_order);

COMMENT ON TABLE industrial_park_images IS 'Hình ảnh gallery của khu công nghiệp';

-- =====================================================
-- 10. INDUSTRIAL_PARK_TENANTS - Doanh nghiệp trong KCN
-- =====================================================
CREATE TABLE industrial_park_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  logo_url TEXT,
  website TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industrial_park_tenants_park_id ON industrial_park_tenants(park_id);
CREATE INDEX idx_industrial_park_tenants_industry ON industrial_park_tenants(industry);

COMMENT ON TABLE industrial_park_tenants IS 'Danh sách các công ty/doanh nghiệp đang hoạt động trong khu công nghiệp';

-- =====================================================
-- 11. INDUSTRIAL_PARK_ALLOWED_INDUSTRIES - Ngành nghề được phép
-- =====================================================
CREATE TABLE industrial_park_allowed_industries (
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  industry_code VARCHAR(100) NOT NULL,
  PRIMARY KEY (park_id, industry_code)
);

CREATE INDEX idx_industrial_park_industries_park ON industrial_park_allowed_industries(park_id);

COMMENT ON TABLE industrial_park_allowed_industries IS 'Lưu danh sách các ngành nghề được phép hoạt động trong KCN';
COMMENT ON COLUMN industrial_park_allowed_industries.industry_code IS 'Mã định danh ngành nghề (VD: dien-tu, co-khi, hoa-chat)';

-- =====================================================
-- 12. NEWS - Tin tức
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
CREATE INDEX idx_news_created_at ON news(created_at DESC);

COMMENT ON TABLE news IS 'Tin tức về thị trường bất động sản, quy hoạch, chính sách, tư vấn';
COMMENT ON COLUMN news.category IS 'Loại tin tức';
COMMENT ON COLUMN news.featured IS 'Tin nổi bật hiển thị ở đầu trang';
COMMENT ON COLUMN news.published_at IS 'Ngày xuất bản (NULL = nháp)';

-- =====================================================
-- 13. NEWS_ACTIVITIES - Tin hoạt động
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

COMMENT ON TABLE news_activities IS 'Tin tức về hoạt động công ty: FDI, sự kiện, dự án mới, CSR';
COMMENT ON COLUMN news_activities.read_time IS 'Ước tính thời gian đọc bài viết (VD: 5 phút đọc)';

-- =====================================================
-- 14. JOBS - Tuyển dụng
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

COMMENT ON TABLE jobs IS 'Các vị trí tuyển dụng';
COMMENT ON COLUMN jobs.deadline IS 'Hạn nộp hồ sơ, NULL = không giới hạn';

-- =====================================================
-- 15. JOB_APPLICATIONS - Đơn ứng tuyển
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

COMMENT ON TABLE job_applications IS 'Lưu thông tin ứng viên đã nộp hồ sơ qua form tuyển dụng';

-- =====================================================
-- 16. CASE_STUDIES - Nghiên cứu tình huống
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

COMMENT ON TABLE case_studies IS 'Case study khách hàng thành công';
COMMENT ON COLUMN case_studies.results IS 'JSON array chứa các metric kết quả';
COMMENT ON COLUMN case_studies.tags IS 'PostgreSQL array để tìm kiếm dễ dàng';

-- =====================================================
-- 17. CASE_STUDY_IMAGES - Hình ảnh case study
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
-- 18. LEADS - Khách hàng tiềm năng
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

COMMENT ON TABLE leads IS 'Form liên hệ, yêu cầu tư vấn từ khách hàng';
COMMENT ON COLUMN leads.source IS 'Nguồn gốc của lead (trang nào khách hàng điền form)';
COMMENT ON COLUMN leads.reference_id IS 'Liên kết đến property hoặc industrial_park nếu lead từ trang chi tiết';
COMMENT ON COLUMN leads.status IS 'Trạng thái xử lý lead trong quy trình sales';
COMMENT ON COLUMN leads.assigned_to IS 'Nhân viên được phân công xử lý';

-- =====================================================
-- 19. LISTINGS - Tin đăng (Optional)
-- =====================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  industrial_park_id UUID REFERENCES industrial_parks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price BIGINT,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_listing_reference CHECK (
    (property_id IS NOT NULL)::int + 
    (industrial_park_id IS NOT NULL)::int + 
    (project_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_listings_property_id ON listings(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX idx_listings_industrial_park_id ON listings(industrial_park_id) WHERE industrial_park_id IS NOT NULL;
CREATE INDEX idx_listings_project_id ON listings(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_listings_slug ON listings(slug);

COMMENT ON TABLE listings IS 'Bảng này có thể không cần thiết nếu properties và industrial_parks đã đủ chi tiết';
COMMENT ON CONSTRAINT check_listing_reference ON listings IS 'Đảm bảo mỗi listing chỉ tham chiếu đến 1 trong 3 loại (property, park, project)';

-- =====================================================
-- TRIGGERS - Tự động cập nhật updated_at
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

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
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

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF SCHEMA
-- =====================================================












