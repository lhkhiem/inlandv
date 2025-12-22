# Database Design - Inland Real Estate Platform
## ⚠️ Tài liệu này đã được cập nhật

**📌 Tài liệu mới nhất:** Vui lòng xem `database-design-final.md` để có thiết kế cuối cùng đã thống nhất.

File này giữ lại để tham khảo lịch sử, nhưng **không nên dùng làm tài liệu chính thức**.

---

## Thiết kế mới (Final Design)

Xem file: **[database-design-final.md](./database-design-final.md)**

### Tóm tắt thiết kế mới:

- **Hybrid Approach**: Base table + Extension tables
  - `properties` (base table) - thông tin chung
  - `property_residential` - nhà ở
  - `property_land` - đất
  - `property_factory` - nhà xưởng
- **Industrial Parks**: Bảng độc lập
- **Google Maps**: Chỉ cần lat/lng, optional link share
- **19 bảng** tổng cộng

### Files quan trọng:
- **Thiết kế chi tiết**: `database-design-final.md`
- **SQL Schema**: `shared/database/schema-v2.sql`
- **ERD**: `ERD.md`
- **Schema docs**: `schema.md`

---

## Tài liệu cũ (Giữ lại để tham khảo)

Database design cho hệ thống bất động sản Inland, hỗ trợ quản lý:
- **Bất động sản (Properties)**: Nhà phố, căn hộ, biệt thự, đất nền, shophouse, nhà xưởng
- **Khu công nghiệp (Industrial Parks)**: KCN/CCN với hạ tầng và doanh nghiệp thuê
- **Dự án (Projects)**: Các dự án bất động sản lớn
- **Tin tức (News)**: Tin thị trường, quy hoạch, tư vấn
- **Tin hoạt động (News Activities)**: Tin tức FDI, sự kiện, dự án mới, CSR
- **Tuyển dụng (Jobs)**: Vị trí tuyển dụng
- **Nghiên cứu tình huống (Case Studies)**: Case study khách hàng
- **Leads**: Khách hàng tiềm năng
- **Users**: Quản trị viên và nhân viên

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│   users     │
└─────────────┘
       │
       │ 1:N
       │
┌─────────────┐
│  projects   │
└─────────────┘
       │
       │ 1:N
       └─────────┐
                 │
       ┌─────────┴──────────┐
       │                    │
┌─────────────┐      ┌─────────────┐
│ properties  │      │industrial_  │
│             │      │   parks     │
└─────────────┘      └─────────────┘
       │                    │
       │ 1:N                │ 1:N
       │                    │
┌─────────────┐      ┌─────────────┐
│ property_   │      │industrial_  │
│  images     │      │park_images  │
└─────────────┘      └─────────────┘
       │                    │
┌─────────────┐      ┌─────────────┐
│ property_   │      │industrial_  │
│ documents   │      │park_tenants │
└─────────────┘      └─────────────┘
       │
       │ N:M
       │
┌─────────────┐
│ property_   │
│ amenities   │
└─────────────┘

┌─────────────┐      ┌─────────────┐
│   leads     │      │    jobs     │
│             │──────│             │
└─────────────┘      └─────────────┘
       │
       │ N:1 (optional)
       │
       ├── properties
       └── industrial_parks

┌─────────────┐      ┌─────────────┐
│    news     │      │news_        │
│             │      │activities   │
└─────────────┘      └─────────────┘

┌─────────────┐
│ case_       │
│ studies     │
└─────────────┘
```

---

## 1. Bảng USERS (Người dùng hệ thống)

Quản lý người dùng CMS và admin.

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

**Chú thích:**
- `id`: UUID primary key
- `role`: 'admin' (quản trị) hoặc 'sale' (nhân viên kinh doanh)
- `password_hash`: Mật khẩu đã được hash (bcrypt/argon2)
- `is_active`: Cho phép vô hiệu hóa tài khoản mà không xóa

---

## 2. Bảng PROJECTS (Dự án bất động sản)

Các dự án bất động sản lớn (ví dụ: Vinhomes Grand Park).

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price_min BIGINT,              -- Giá tối thiểu (VND)
  price_max BIGINT,              -- Giá tối đa (VND)
  area_min NUMERIC(10, 2),       -- Diện tích tối thiểu (m²)
  area_max NUMERIC(10, 2),       -- Diện tích tối đa (m²)
  status VARCHAR(50) CHECK (status IN ('dang-mo-ban', 'sap-mo-ban', 'da-ban-het')),
  thumbnail_url TEXT,
  gallery JSONB DEFAULT '[]',    -- Mảng URL hình ảnh
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
```

**Chú thích:**
- `status`: 'dang-mo-ban' (đang mở bán), 'sap-mo-ban' (sắp mở bán), 'da-ban-het' (đã bán hết)
- `gallery`: JSON array chứa URLs hình ảnh

---

## 3. Bảng PROPERTIES (Bất động sản)

Quản lý chi tiết các bất động sản: nhà phố, căn hộ, biệt thự, đất nền, shophouse, nhà xưởng.

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,          -- Mã sản phẩm (VD: INL-BDS-001)
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
  category VARCHAR(100),                     -- Danh mục phụ
  status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  legal_status VARCHAR(100),                 -- Pháp lý (VD: 'so-hong-rieng', 'so-chung', 'hop-le')
  
  -- Kích thước
  area NUMERIC(10, 2) NOT NULL,              -- Diện tích (m²)
  land_area NUMERIC(10, 2),                  -- Diện tích đất (m²)
  construction_area NUMERIC(10, 2),          -- Diện tích xây dựng (m²)
  width NUMERIC(10, 2),                      -- Mặt tiền (m)
  length NUMERIC(10, 2),                     -- Chiều dài (m)
  
  -- Cấu trúc
  bedrooms INTEGER,                          -- Số phòng ngủ
  bathrooms INTEGER,                         -- Số phòng tắm
  floors INTEGER,                            -- Số tầng
  orientation VARCHAR(50),                   -- Hướng nhà (VD: 'dong', 'nam', 'dong-nam')
  
  -- Giá cả
  price BIGINT NOT NULL,                     -- Giá bán/thuê (VND)
  price_per_sqm BIGINT,                      -- Giá/m² (VND)
  negotiable BOOLEAN DEFAULT false,          -- Có thể thương lượng
  
  -- Đặc điểm
  furniture VARCHAR(50) CHECK (furniture IN ('full', 'basic', 'empty')),  -- Nội thất
  description TEXT,                          -- Mô tả ngắn
  description_full TEXT,                     -- Mô tả chi tiết (HTML)
  
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
```

**Chú thích:**
- `code`: Mã định danh duy nhất cho sản phẩm (VD: INL-BDS-001)
- `type`: Loại hình bất động sản
- `status`: Trạng thái hiện tại
- `legal_status`: Tình trạng pháp lý (sổ hồng riêng, sổ chung, hợp lệ...)
- `search_vector`: Vector full-text search để tìm kiếm nhanh

---

## 4. Bảng PROPERTY_IMAGES (Hình ảnh bất động sản)

Lưu trữ hình ảnh gallery của từng bất động sản.

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

**Chú thích:**
- `display_order`: Thứ tự hiển thị (0 là đầu tiên)
- `is_primary`: Hình ảnh chính (thumbnail)

---

## 5. Bảng PROPERTY_DOCUMENTS (Tài liệu bất động sản)

Các file PDF, tài liệu liên quan (sổ hồng, giấy tờ pháp lý...).

```sql
CREATE TABLE property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),                         -- Loại tài liệu (VD: 'so-hong', 'giay-to-phap-ly')
  url TEXT NOT NULL,
  file_size BIGINT,                          -- Kích thước file (bytes)
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);
```

---

## 6. Bảng AMENITIES (Tiện ích)

Bảng lookup cho các tiện ích (hồ bơi, gym, gara...).

```sql
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,         -- VD: 'ho-boi', 'gym', 'gara-oto'
  name_vi VARCHAR(255) NOT NULL,             -- Tên tiếng Việt
  name_en VARCHAR(255),
  icon VARCHAR(100),                         -- Icon class hoặc URL
  category VARCHAR(100),                     -- Nhóm tiện ích
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_amenities_code ON amenities(code);
```

**Chú thích:**
- Bảng này để quản lý danh sách tiện ích, có thể dùng cho nhiều properties

---

## 7. Bảng PROPERTY_AMENITIES (Quan hệ N:M Properties - Amenities)

Junction table liên kết properties với amenities.

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

## 8. Bảng INDUSTRIAL_PARKS (Khu công nghiệp)

Quản lý thông tin các khu công nghiệp (KCN) và cụm công nghiệp (CCN).

```sql
CREATE TABLE industrial_parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,          -- Mã KCN (VD: INL-KCN-001)
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Vị trí
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Chi tiết khu công nghiệp
  total_area NUMERIC(12, 2) NOT NULL,        -- Tổng diện tích (ha)
  available_area NUMERIC(12, 2),             -- Diện tích còn trống (ha)
  occupancy_rate DECIMAL(5, 2),              -- Tỷ lệ lấp đầy (%)
  
  -- Hạ tầng
  infrastructure_power BOOLEAN DEFAULT false,
  infrastructure_water BOOLEAN DEFAULT false,
  infrastructure_drainage BOOLEAN DEFAULT false,
  infrastructure_waste BOOLEAN DEFAULT false,
  infrastructure_internet BOOLEAN DEFAULT false,
  infrastructure_road BOOLEAN DEFAULT false,
  infrastructure_security BOOLEAN DEFAULT false,
  
  -- Giá cả
  rental_price_min BIGINT,                   -- Giá thuê tối thiểu (VND/m²/tháng)
  rental_price_max BIGINT,                   -- Giá thuê tối đa (VND/m²/tháng)
  land_price BIGINT,                         -- Giá chuyển nhượng đất (VND/m²)
  
  -- Mô tả
  description TEXT,
  description_full TEXT,
  advantages TEXT,                           -- Ưu điểm nổi bật
  
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

-- Trigger cho search_vector
CREATE TRIGGER industrial_parks_search_vector_update
BEFORE INSERT OR UPDATE ON industrial_parks
FOR EACH ROW EXECUTE FUNCTION update_industrial_parks_search_vector();

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
```

**Chú thích:**
- `total_area`: Diện tích tính bằng hecta (ha)
- `available_area`: Diện tích còn trống để cho thuê/chuyển nhượng
- `occupancy_rate`: Tỷ lệ lấp đầy (ví dụ: 75.5%)

---

## 9. Bảng INDUSTRIAL_PARK_IMAGES (Hình ảnh KCN)

```sql
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
```

---

## 10. Bảng INDUSTRIAL_PARK_TENANTS (Doanh nghiệp trong KCN)

Danh sách các công ty/doanh nghiệp đang hoạt động trong khu công nghiệp.

```sql
CREATE TABLE industrial_park_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),                     -- Ngành nghề
  logo_url TEXT,
  website TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industrial_park_tenants_park_id ON industrial_park_tenants(park_id);
CREATE INDEX idx_industrial_park_tenants_industry ON industrial_park_tenants(industry);
```

**Chú thích:**
- Lưu thông tin các công ty đang thuê đất trong KCN
- Dùng để hiển thị danh sách doanh nghiệp trên trang chi tiết KCN

---

## 11. Bảng INDUSTRIAL_PARK_ALLOWED_INDUSTRIES (Ngành nghề được phép)

Junction table cho các ngành nghề được phép hoạt động trong KCN.

```sql
CREATE TABLE industrial_park_allowed_industries (
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  industry_code VARCHAR(100) NOT NULL,       -- VD: 'dien-tu', 'co-khi', 'hoa-chat'
  PRIMARY KEY (park_id, industry_code)
);

CREATE INDEX idx_industrial_park_industries_park ON industrial_park_allowed_industries(park_id);
```

**Chú thích:**
- Lưu danh sách các ngành nghề được phép hoạt động trong KCN
- `industry_code`: Mã định danh ngành nghề (có thể tham chiếu bảng lookup riêng nếu cần)

---

## 12. Bảng NEWS (Tin tức)

Tin tức về thị trường bất động sản, quy hoạch, chính sách, tư vấn.

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung')),
  thumbnail TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,                     -- Nội dung HTML
  author VARCHAR(255),
  featured BOOLEAN DEFAULT false,            -- Tin nổi bật
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
```

**Chú thích:**
- `category`: Loại tin tức
- `featured`: Tin nổi bật hiển thị ở đầu trang
- `published_at`: Ngày xuất bản (NULL = nháp)

---

## 13. Bảng NEWS_ACTIVITIES (Tin hoạt động)

Tin tức về hoạt động công ty: FDI, sự kiện, dự án mới, CSR.

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
  read_time VARCHAR(50),                     -- VD: '5 phút đọc'
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

**Chú thích:**
- Tương tự bảng `news` nhưng dành riêng cho tin hoạt động công ty
- `read_time`: Ước tính thời gian đọc bài viết

---

## 14. Bảng JOBS (Tuyển dụng)

Các vị trí tuyển dụng.

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255),
  salary_range VARCHAR(100),                 -- VD: '12-18 triệu', 'Thỏa thuận'
  quantity INTEGER DEFAULT 1,                -- Số lượng cần tuyển
  deadline DATE,                             -- Hạn nộp hồ sơ
  
  -- Mô tả chi tiết (JSON hoặc TEXT)
  description_overview TEXT,                 -- Tổng quan
  description_responsibilities TEXT,         -- Trách nhiệm (có thể JSON array)
  description_requirements TEXT,             -- Yêu cầu (có thể JSON array)
  description_benefits TEXT,                 -- Quyền lợi (có thể JSON array)
  
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

**Chú thích:**
- `description_responsibilities`, `description_requirements`, `description_benefits`: Có thể lưu dạng JSON array hoặc TEXT tùy backend xử lý
- `deadline`: Hạn nộp hồ sơ, NULL = không giới hạn

---

## 15. Bảng JOB_APPLICATIONS (Đơn ứng tuyển)

Lưu đơn ứng tuyển từ form.

```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cv_url TEXT,                               -- Link đến file CV
  cover_letter TEXT,                         -- Thư xin việc
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected')),
  notes TEXT,                                -- Ghi chú của HR
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);
```

**Chú thích:**
- Lưu thông tin ứng viên đã nộp hồ sơ qua form tuyển dụng

---

## 16. Bảng CASE_STUDIES (Nghiên cứu tình huống)

Case study khách hàng thành công.

```sql
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  location VARCHAR(255),
  year INTEGER,
  challenge TEXT,                            -- Thách thức
  solution TEXT,                             -- Giải pháp
  results JSONB,                             -- Kết quả (array of {metric, value, description})
  testimonial_quote TEXT,                    -- Lời chứng thực
  testimonial_author VARCHAR(255),
  testimonial_role VARCHAR(255),
  testimonial_company VARCHAR(255),
  video_url TEXT,
  tags TEXT[],                               -- Array of tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_industry ON case_studies(industry);
CREATE INDEX idx_case_studies_tags ON case_studies USING GIN(tags);
```

**Chú thích:**
- `results`: JSON array chứa các metric kết quả
- `tags`: PostgreSQL array để tìm kiếm dễ dàng

---

## 17. Bảng CASE_STUDY_IMAGES (Hình ảnh case study)

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

## 18. Bảng LEADS (Khách hàng tiềm năng)

Form liên hệ, yêu cầu tư vấn từ khách hàng.

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  message TEXT,
  
  -- Nguồn lead
  source VARCHAR(50) NOT NULL CHECK (source IN ('homepage', 'property', 'industrial_park', 'contact', 'news', 'job')),
  
  -- Reference (nếu lead liên quan đến property hoặc park)
  reference_id UUID,                         -- ID của property hoặc industrial_park
  reference_type VARCHAR(50) CHECK (reference_type IN ('property', 'industrial_park')),
  
  -- Trạng thái xử lý
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,                                -- Ghi chú của sales
  
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

**Chú thích:**
- `source`: Nguồn gốc của lead (trang nào khách hàng điền form)
- `reference_id` + `reference_type`: Liên kết đến property hoặc industrial_park nếu lead từ trang chi tiết
- `status`: Trạng thái xử lý lead trong quy trình sales
- `assigned_to`: Nhân viên được phân công xử lý

---

## 19. Bảng LISTINGS (Tin đăng)

Có thể dùng để quản lý các listing liên quan đến projects (nếu cần).

```sql
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
  
  -- Đảm bảo chỉ có một trong 3 reference
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
```

**Chú thích:**
- Bảng này có thể không cần thiết nếu properties và industrial_parks đã đủ chi tiết
- `check_listing_reference`: Đảm bảo mỗi listing chỉ tham chiếu đến 1 trong 3 loại (property, park, project)

---

## 20. Trigger tự động cập nhật updated_at

Tạo function chung để tự động cập nhật `updated_at`:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng trigger cho các bảng cần thiết
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
```

---

## Tổng kết các bảng

### Core Entities (19 bảng chính)
1. **users** - Người dùng hệ thống
2. **projects** - Dự án bất động sản
3. **properties** - Bất động sản
4. **property_images** - Hình ảnh bất động sản
5. **property_documents** - Tài liệu bất động sản
6. **amenities** - Tiện ích (lookup table)
7. **property_amenities** - Quan hệ N:M properties - amenities
8. **industrial_parks** - Khu công nghiệp
9. **industrial_park_images** - Hình ảnh KCN
10. **industrial_park_tenants** - Doanh nghiệp trong KCN
11. **industrial_park_allowed_industries** - Ngành nghề được phép
12. **news** - Tin tức
13. **news_activities** - Tin hoạt động
14. **jobs** - Tuyển dụng
15. **job_applications** - Đơn ứng tuyển
16. **case_studies** - Nghiên cứu tình huống
17. **case_study_images** - Hình ảnh case study
18. **leads** - Khách hàng tiềm năng
19. **listings** - Tin đăng (optional)

### Relationships chính:
- **properties** ↔ **property_images** (1:N)
- **properties** ↔ **property_documents** (1:N)
- **properties** ↔ **amenities** (N:M qua property_amenities)
- **industrial_parks** ↔ **industrial_park_images** (1:N)
- **industrial_parks** ↔ **industrial_park_tenants** (1:N)
- **leads** → **properties** hoặc **industrial_parks** (N:1, optional)
- **users** → **news/news_activities/jobs** (1:N, created_by)

---

## Notes

1. **UUID vs INTEGER**: Tất cả ID sử dụng UUID để:
   - Tránh conflict khi merge data từ nhiều nguồn
   - Bảo mật tốt hơn (không dễ đoán)
   - Phù hợp với distributed systems

2. **Full-text Search**: Sử dụng PostgreSQL tsvector cho tìm kiếm nhanh trên properties và industrial_parks.

3. **JSON/JSONB**: Sử dụng JSONB cho các field linh hoạt (gallery, results, tags) để dễ query và index.

4. **Soft Delete**: Có thể thêm field `deleted_at` cho các bảng quan trọng thay vì hard delete.

5. **Audit Trail**: Có thể thêm các bảng audit log nếu cần tracking thay đổi.

6. **Multilingual**: Có thể mở rộng với bảng translations nếu cần hỗ trợ đa ngôn ngữ.

