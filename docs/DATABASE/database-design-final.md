# Database Design - Inland Real Estate Platform
## Thiết kế cuối cùng (Final Design)

## Tổng quan

Database design cho hệ thống bất động sản Inland, hỗ trợ quản lý:
- **Khu công nghiệp (KCN)**: KCN/CCN với các bất động sản (đất, đất có nhà xưởng...)
- **Bất động sản thông thường**: Nhà phố, căn hộ, biệt thự, đất nền, shophouse, nhà xưởng
- **Tất cả đều có thể**: Chuyển nhượng (bán) hoặc Cho thuê

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────┐
│  industrial_     │
│     parks        │ (KCN độc lập)
└────────┬─────────┘
         │ 1:N
         │
┌────────┴─────────────────────────┐
│                                  │
│         properties               │ (Bảng cơ sở)
│    (Base table - Core fields)    │
└────────┬─────────────────────────┘
         │
         ├── 1:0..1 ── property_residential (Nhà ở)
         ├── 1:0..1 ── property_land (Đất)
         └── 1:0..1 ── property_factory (Nhà xưởng)

properties ──1:N── property_images
properties ──1:N── property_documents
properties ──N:M── amenities (via property_amenities)

industrial_parks ──N:M── industries (via industrial_park_allowed_industries)
```

---

## Cấu trúc phân loại

### Main Category (main_category)
- `'kcn'` - Khu công nghiệp
- `'bds'` - Bất động sản thông thường

### Sub Category (sub_category) - Chỉ cho KCN
- `'trong-kcn'` - Trong khu công nghiệp
- `'ngoai-kcn'` - Ngoài khu công nghiệp
- `NULL` - Cho BDS thông thường

### Property Type (property_type)
- **KCN**: `'dat-trong-kcn'`, `'dat-co-nha-xuong-trong-kcn'`, `'dat-ngoai-kcn'`, `'dat-co-nha-xuong-ngoai-kcn'`
- **BDS**: `'nha-pho'`, `'can-ho'`, `'biet-thu'`, `'dat-nen'`, `'shophouse'`, `'nha-xuong'`

### Transaction Type (transaction_type)
- `'chuyen-nhuong'` - Chuyển nhượng (bán)
- `'cho-thue'` - Cho thuê

---

## Bảng 1: `properties` (Bảng cơ sở - Core Fields)

Chứa thông tin chung mà TẤT CẢ loại bất động sản đều có.

```sql
CREATE TABLE properties (
  -- ID & Basic
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại chính
  main_category VARCHAR(50) NOT NULL CHECK (main_category IN ('kcn', 'bds')),
  sub_category VARCHAR(50) CHECK (sub_category IN ('trong-kcn', 'ngoai-kcn')),
  property_type VARCHAR(100) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('chuyen-nhuong', 'cho-thue')),
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  
  -- Reference to Industrial Park (nếu thuộc KCN)
  industrial_park_id UUID REFERENCES industrial_parks(id) ON DELETE SET NULL,
  
  -- Location
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT, -- Link chia sẻ Google Maps (optional)
  
  -- Diện tích
  total_area NUMERIC(12, 2) NOT NULL,
  area_unit VARCHAR(10) DEFAULT 'm2' CHECK (area_unit IN ('m2', 'ha')),
  land_area NUMERIC(12, 2),
  construction_area NUMERIC(12, 2),
  
  -- Giá cả
  price BIGINT NOT NULL,
    -- Chuyển nhượng: giá tổng (VND)
    -- Cho thuê: giá/tháng (VND)
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
```

**Indexes:**

```sql
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

-- Composite indexes cho filter thường dùng
CREATE INDEX idx_properties_category_type ON properties(main_category, sub_category, property_type);
CREATE INDEX idx_properties_type_transaction ON properties(property_type, transaction_type, status);
```

**Triggers:**

```sql
-- Full-text search trigger
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
```

---

## Bảng 2: `property_residential` (Thông tin nhà ở)

Cho: nhà phố, căn hộ, biệt thự, shophouse

```sql
CREATE TABLE property_residential (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Phòng ở
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  orientation VARCHAR(50),
  
  -- Nội thất
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
```

**Indexes:**

```sql
CREATE INDEX idx_property_residential_bedrooms ON property_residential(bedrooms);
CREATE INDEX idx_property_residential_bathrooms ON property_residential(bathrooms);
```

---

## Bảng 3: `property_land` (Thông tin đất)

Cho: đất nền, đất trong/ngoài KCN

```sql
CREATE TABLE property_land (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Kích thước đất
  width NUMERIC(10, 2),
  length NUMERIC(10, 2),
  frontage_width NUMERIC(10, 2),
  depth NUMERIC(10, 2),
  
  -- Đặc điểm đất
  corner_lot BOOLEAN DEFAULT false,
  main_road_access BOOLEAN DEFAULT false,
  road_width NUMERIC(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Bảng 4: `property_factory` (Thông tin nhà xưởng)

Cho: nhà xưởng, đất có nhà xưởng

```sql
CREATE TABLE property_factory (
  property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Kích thước nhà xưởng
  factory_height NUMERIC(10, 2),
  factory_structure VARCHAR(100),
  
  -- Tải trọng
  loading_capacity NUMERIC(10, 2),
  crane_capacity NUMERIC(10, 2),
  
  -- Tiện ích
  has_office BOOLEAN DEFAULT false,
  office_area NUMERIC(10, 2),
  has_crane BOOLEAN DEFAULT false,
  has_fire_system BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  parking_capacity INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Bảng 5: `industrial_parks` (Khu công nghiệp)

KCN là đối tượng độc lập, properties trong KCN reference đến KCN này.

```sql
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
  
  -- Hạ tầng (infrastructure)
  infrastructure_power BOOLEAN DEFAULT false,
  infrastructure_water BOOLEAN DEFAULT false,
  infrastructure_drainage BOOLEAN DEFAULT false,
  infrastructure_waste BOOLEAN DEFAULT false,
  infrastructure_internet BOOLEAN DEFAULT false,
  infrastructure_road BOOLEAN DEFAULT false,
  infrastructure_security BOOLEAN DEFAULT false,
  
  -- Giá thuê tham khảo (cho KCN)
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
```

**Indexes:**

```sql
CREATE INDEX idx_industrial_parks_code ON industrial_parks(code);
CREATE INDEX idx_industrial_parks_slug ON industrial_parks(slug);
CREATE INDEX idx_industrial_parks_location ON industrial_parks(province, district);
CREATE INDEX idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);
CREATE INDEX idx_industrial_parks_location_spatial ON industrial_parks USING GIST(point(longitude, latitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

**Triggers:**

```sql
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
```

---

## Bảng 6: `industries` (Ngành nghề - Lookup table)

```sql
CREATE TABLE industries (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Bảng 7: `industrial_park_allowed_industries` (Ngành nghề được phép trong KCN)

```sql
CREATE TABLE industrial_park_allowed_industries (
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  industry_code VARCHAR(100) NOT NULL REFERENCES industries(code) ON DELETE CASCADE,
  PRIMARY KEY (park_id, industry_code)
);

CREATE INDEX idx_industrial_park_industries_park ON industrial_park_allowed_industries(park_id);
CREATE INDEX idx_industrial_park_industries_industry ON industrial_park_allowed_industries(industry_code);
```

---

## Bảng 8: `property_images` (Hình ảnh)

```sql
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
```

---

## Bảng 9: `property_documents` (Tài liệu)

```sql
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
```

---

## Bảng 10: `amenities` (Tiện ích - Lookup table)

```sql
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
```

---

## Bảng 11: `property_amenities` (Quan hệ N:M)

```sql
CREATE TABLE property_amenities (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX idx_property_amenities_property ON property_amenities(property_id);
CREATE INDEX idx_property_amenities_amenity ON property_amenities(amenity_id);
```

---

## Bảng 12: `users` (Người dùng hệ thống)

```sql
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
```

---

## Bảng 13: `news` (Tin tức)

```sql
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
```

---

## Bảng 14: `news_activities` (Tin hoạt động)

```sql
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
```

---

## Bảng 15: `jobs` (Tuyển dụng)

```sql
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
```

---

## Bảng 16: `job_applications` (Đơn ứng tuyển)

```sql
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
```

---

## Bảng 17: `case_studies` (Nghiên cứu tình huống)

```sql
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
```

---

## Bảng 18: `case_study_images` (Hình ảnh case study)

```sql
CREATE TABLE case_study_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_study_images_case_study_id ON case_study_images(case_study_id);
```

---

## Bảng 19: `leads` (Khách hàng tiềm năng)

```sql
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
```

---

## Triggers tự động cập nhật updated_at

```sql
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
```

---

## Ví dụ dữ liệu

### Ví dụ 1: Đất trong KCN - Chuyển nhượng

```sql
-- 1. Tạo KCN trước
INSERT INTO industrial_parks (code, name, slug, province, district, total_area, available_area)
VALUES ('IP-001', 'KCN Long Hậu', 'kcn-long-hau', 'Long An', 'Đức Hòa', 500, 120);

-- 2. Tạo property
INSERT INTO properties (
  code, name, slug, main_category, sub_category, property_type, 
  transaction_type, status, industrial_park_id,
  province, district, total_area, area_unit,
  price, price_per_sqm, latitude, longitude
)
VALUES (
  'INL-KCN-001', 
  'Đất trong KCN Long Hậu',
  'dat-trong-kcn-long-hau',
  'kcn', 'trong-kcn', 'dat-trong-kcn',
  'chuyen-nhuong', 'available',
  (SELECT id FROM industrial_parks WHERE code = 'IP-001'),
  'Long An', 'Đức Hòa',
  5000, 'm2',
  5000000000, 1000000,
  10.7769, 106.7009
);

-- 3. Thêm thông tin đất
INSERT INTO property_land (property_id, width, length, frontage_width)
VALUES (
  (SELECT id FROM properties WHERE code = 'INL-KCN-001'),
  50, 100, 50
);
```

### Ví dụ 2: Nhà phố - Chuyển nhượng

```sql
-- 1. Tạo property
INSERT INTO properties (
  code, name, slug, main_category, property_type,
  transaction_type, status,
  province, district, total_area, land_area, construction_area,
  price, price_per_sqm, legal_status, latitude, longitude
)
VALUES (
  'INL-BDS-001',
  'Nhà phố Quận 1',
  'nha-pho-quan-1',
  'bds', 'nha-pho',
  'chuyen-nhuong', 'available',
  'TP.HCM', 'Quận 1',
  120, 100, 300,
  4800000000, 40000000,
  'so-do-day-du',
  10.7769, 106.7009
);

-- 2. Thêm thông tin nhà ở
INSERT INTO property_residential (
  property_id, bedrooms, bathrooms, floors, orientation, furniture
)
VALUES (
  (SELECT id FROM properties WHERE code = 'INL-BDS-001'),
  4, 3, 3, 'dong', 'full'
);
```

---

## Tổng kết các bảng

### Core Tables (19 bảng)
1. **properties** - Bất động sản (base table)
2. **property_residential** - Thông tin nhà ở
3. **property_land** - Thông tin đất
4. **property_factory** - Thông tin nhà xưởng
5. **industrial_parks** - Khu công nghiệp
6. **industries** - Ngành nghề (lookup)
7. **industrial_park_allowed_industries** - Ngành nghề được phép
8. **property_images** - Hình ảnh
9. **property_documents** - Tài liệu
10. **amenities** - Tiện ích (lookup)
11. **property_amenities** - Quan hệ N:M
12. **users** - Người dùng
13. **news** - Tin tức
14. **news_activities** - Tin hoạt động
15. **jobs** - Tuyển dụng
16. **job_applications** - Đơn ứng tuyển
17. **case_studies** - Nghiên cứu tình huống
18. **case_study_images** - Hình ảnh case study
19. **leads** - Khách hàng tiềm năng

---

## Notes quan trọng

1. **Google Maps**: Chỉ cần `latitude`, `longitude`, optional `google_maps_link`
2. **Hybrid Design**: Base table + Extension tables cho form gọn và query hiệu quả
3. **KCN độc lập**: `industrial_parks` là entity riêng, properties reference đến
4. **Transaction Type**: Mỗi property có thể bán HOẶC cho thuê (không cả hai)
5. **Area Unit**: Support cả m² và ha (KCN thường dùng ha)





