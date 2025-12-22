# Database Design - Inland Real Estate Platform
## Thiết kế đơn giản hóa (Simplified Design)

## Tổng quan

Database design đơn giản, tập trung vào **filter requirements** cho:
- **Khu công nghiệp (KCN)**: Giới thiệu dịch vụ + giá tham khảo
- **Bất động sản thông thường (BDS)**: Khu vực/cụm/lô đất có diện tích và giá tham khảo

**Logic chính:**
- KCN và BDS đều có thể **cho thuê** và/hoặc **chuyển nhượng**
- Mỗi record có cả 2 loại giá (nếu có cả 2 dịch vụ)
- Dùng JSONB cho hạ tầng (KCN) và đặc điểm (BDS) để linh hoạt

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐
│ industrial_parks    │
│ (KCN)               │
└─────────────────────┘

┌─────────────────────┐
│ properties          │
│ (BDS thông thường)  │
└─────────────────────┘

Both have:
- has_rental / has_transfer
- rental_price_* / transfer_price_*
- infrastructure JSONB (KCN) / features JSONB (BDS)
```

---

## Bảng 1: `industrial_parks` (KCN)

```sql
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
  
  -- Location (cho filter)
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích (cho filter)
  total_area NUMERIC(12, 2) NOT NULL, -- ha
  available_area NUMERIC(12, 2), -- ha (diện tích còn trống)
  
  -- Giá cho thuê (nếu has_rental = true)
  rental_price_min BIGINT, -- đ/m²/tháng
  rental_price_max BIGINT,
  
  -- Giá chuyển nhượng (nếu has_transfer = true)
  transfer_price_min BIGINT, -- tỷ VND
  transfer_price_max BIGINT,
  
  -- Hạ tầng (JSONB - linh hoạt)
  infrastructure JSONB DEFAULT '{}'::jsonb,
    -- Ví dụ: {
    --   "power": true,
    --   "water": true,
    --   "drainage": false,
    --   "waste": true,
    --   "internet": true,
    --   "road": true,
    --   "security": true
    -- }
  
  -- Ngành nghề (cho filter)
  allowed_industries TEXT[],
    -- Ví dụ: ['co-khi', 'dien-tu', 'thuc-pham']
  
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
```

**Ví dụ dữ liệu `infrastructure` JSONB:**
```json
{
  "power": true,
  "water": true,
  "drainage": true,
  "waste": true,
  "internet": true,
  "road": true,
  "security": true,
  "custom_field": "Giá trị tùy chỉnh"
}
```

---

## Bảng 2: `properties` (BDS)

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- Phân loại (cho filter)
  property_type VARCHAR(100) NOT NULL, 
    -- 'nha-pho', 'can-ho', 'biet-thu', 'dat-nen', 'shophouse', 'nha-xuong'
  
  -- Dịch vụ có sẵn (1 BDS có thể có cả 2)
  has_rental BOOLEAN DEFAULT false,
  has_transfer BOOLEAN DEFAULT false,
  
  status VARCHAR(50) NOT NULL DEFAULT 'available' 
    CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  
  -- Location (cho filter)
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  google_maps_link TEXT,
  
  -- Diện tích (cho filter)
  total_area NUMERIC(12, 2) NOT NULL, -- m²
  
  -- Giá cho thuê (nếu has_rental = true)
  rental_price_min BIGINT, -- VND/tháng
  rental_price_max BIGINT,
  
  -- Giá chuyển nhượng (nếu has_transfer = true)
  transfer_price_min BIGINT, -- VND
  transfer_price_max BIGINT,
  
  -- Pháp lý (cho filter)
  legal_status VARCHAR(100),
  
  -- Đặc điểm (JSONB - linh hoạt, chỉ cho BDS có áp dụng)
  features JSONB DEFAULT '{}'::jsonb,
    -- Ví dụ cho nhà ở:
    -- {
    --   "bedrooms": 4,
    --   "bathrooms": 3,
    --   "orientation": "Đông Nam",
    --   "furniture": "full"
    -- }
    -- 
    -- Ví dụ cho đất nền:
    -- {
    --   "width": 10,
    --   "length": 20,
    --   "frontage_width": 10,
    --   "corner_lot": true
    -- }
    --
    -- Ví dụ cho nhà xưởng:
    -- {
    --   "factory_height": 8,
    --   "factory_structure": "Khung thép",
    --   "has_office": true,
    --   "office_area": 100
    -- }
  
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
```

**Ví dụ dữ liệu `features` JSONB:**

```json
// Nhà phố / Căn hộ / Biệt thự
{
  "bedrooms": 4,
  "bathrooms": 3,
  "floors": 3,
  "orientation": "Đông Nam",
  "furniture": "full"
}

// Đất nền
{
  "width": 10,
  "length": 20,
  "frontage_width": 10,
  "depth": 20,
  "corner_lot": true,
  "main_road_access": true,
  "road_width": 20
}

// Nhà xưởng
{
  "factory_height": 8,
  "factory_structure": "Khung thép",
  "loading_capacity": 5,
  "has_office": true,
  "office_area": 100,
  "has_crane": true,
  "crane_capacity": 10,
  "has_fire_system": true,
  "has_parking": true,
  "parking_capacity": 20
}

// Shophouse
{
  "shop_area": 50,
  "living_area": 80,
  "bedrooms": 3,
  "bathrooms": 2
}

// Biệt thự
{
  "bedrooms": 5,
  "bathrooms": 4,
  "garden_area": 200,
  "swimming_pool": true,
  "garage_capacity": 3
}
```

---

## Indexes

### Industrial Parks:

```sql
-- Basic indexes
CREATE INDEX idx_industrial_parks_scope ON industrial_parks(scope);
CREATE INDEX idx_industrial_parks_has_rental ON industrial_parks(has_rental) WHERE has_rental = true;
CREATE INDEX idx_industrial_parks_has_transfer ON industrial_parks(has_transfer) WHERE has_transfer = true;
CREATE INDEX idx_industrial_parks_location ON industrial_parks(province, district);

-- Price indexes (filter)
CREATE INDEX idx_industrial_parks_rental_price ON industrial_parks(rental_price_min, rental_price_max) WHERE has_rental = true;
CREATE INDEX idx_industrial_parks_transfer_price ON industrial_parks(transfer_price_min, transfer_price_max) WHERE has_transfer = true;

-- Area index
CREATE INDEX idx_industrial_parks_area ON industrial_parks(available_area);

-- JSONB infrastructure index (for common keys)
CREATE INDEX idx_industrial_parks_infra_power ON industrial_parks USING GIN ((infrastructure->>'power')) WHERE (infrastructure->>'power')::boolean = true;
CREATE INDEX idx_industrial_parks_infra_water ON industrial_parks USING GIN ((infrastructure->>'water')) WHERE (infrastructure->>'water')::boolean = true;
CREATE INDEX idx_industrial_parks_infra_internet ON industrial_parks USING GIN ((infrastructure->>'internet')) WHERE (infrastructure->>'internet')::boolean = true;

-- Full infrastructure GIN index (for all keys)
CREATE INDEX idx_industrial_parks_infrastructure ON industrial_parks USING GIN (infrastructure);

-- Industries array index
CREATE INDEX idx_industrial_parks_industries ON industrial_parks USING GIN(allowed_industries);

-- Full-text search
CREATE INDEX idx_industrial_parks_search ON industrial_parks USING GIN(search_vector);
```

### Properties:

```sql
-- Basic indexes
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_has_rental ON properties(has_rental) WHERE has_rental = true;
CREATE INDEX idx_properties_has_transfer ON properties(has_transfer) WHERE has_transfer = true;
CREATE INDEX idx_properties_location ON properties(province, district);
CREATE INDEX idx_properties_status ON properties(status);

-- Price indexes (filter)
CREATE INDEX idx_properties_rental_price ON properties(rental_price_min, rental_price_max) WHERE has_rental = true;
CREATE INDEX idx_properties_transfer_price ON properties(transfer_price_min, transfer_price_max) WHERE has_transfer = true;

-- Area index
CREATE INDEX idx_properties_area ON properties(total_area);

-- Legal status
CREATE INDEX idx_properties_legal_status ON properties(legal_status) WHERE legal_status IS NOT NULL;

-- JSONB features index (for common keys)
CREATE INDEX idx_properties_features_bedrooms ON properties ((features->>'bedrooms')) WHERE (features->>'bedrooms') IS NOT NULL;
CREATE INDEX idx_properties_features_bathrooms ON properties ((features->>'bathrooms')) WHERE (features->>'bathrooms') IS NOT NULL;

-- Full features GIN index
CREATE INDEX idx_properties_features ON properties USING GIN (features);

-- Full-text search
CREATE INDEX idx_properties_search ON properties USING GIN(search_vector);
```

---

## Query Examples với JSONB

### Filter KCN theo hạ tầng:

```sql
-- KCN có điện và nước
SELECT * FROM industrial_parks
WHERE scope = 'trong-kcn'
  AND has_rental = true
  AND (infrastructure->>'power')::boolean = true
  AND (infrastructure->>'water')::boolean = true;

-- KCN có internet
SELECT * FROM industrial_parks
WHERE (infrastructure->>'internet')::boolean = true;
```

### Filter BDS theo đặc điểm:

```sql
-- Nhà phố có 3+ phòng ngủ
SELECT * FROM properties
WHERE property_type = 'nha-pho'
  AND has_transfer = true
  AND (features->>'bedrooms')::integer >= 3;

-- Căn hộ có nội thất đầy đủ
SELECT * FROM properties
WHERE property_type = 'can-ho'
  AND has_rental = true
  AND features->>'furniture' = 'full';

-- Đất nền góc (corner lot)
SELECT * FROM properties
WHERE property_type = 'dat-nen'
  AND (features->>'corner_lot')::boolean = true;

-- Nhà xưởng có cầu trục
SELECT * FROM properties
WHERE property_type = 'nha-xuong'
  AND (features->>'has_crane')::boolean = true;
```

### Query với multiple JSONB conditions:

```sql
-- KCN có điện, nước, và internet
SELECT * FROM industrial_parks
WHERE (infrastructure->>'power')::boolean = true
  AND (infrastructure->>'water')::boolean = true
  AND (infrastructure->>'internet')::boolean = true;

-- Nhà phố có 4 phòng ngủ, 3 phòng tắm, hướng Đông Nam
SELECT * FROM properties
WHERE property_type = 'nha-pho'
  AND (features->>'bedrooms')::integer = 4
  AND (features->>'bathrooms')::integer = 3
  AND features->>'orientation' = 'Đông Nam';
```

### JSONB với @> operator (contains):

```sql
-- KCN có cả điện và nước (any order)
SELECT * FROM industrial_parks
WHERE infrastructure @> '{"power": true, "water": true}'::jsonb;

-- BDS có bedrooms = 4 và furniture = 'full'
SELECT * FROM properties
WHERE features @> '{"bedrooms": 4, "furniture": "full"}'::jsonb;
```

---

## Supporting Tables

### property_images
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

### industrial_park_images
```sql
CREATE TABLE industrial_park_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(500),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industrial_park_images_park_id ON industrial_park_images(industrial_park_id);
CREATE INDEX idx_industrial_park_images_order ON industrial_park_images(industrial_park_id, display_order);
```

**Lưu ý về Amenities (Tiện ích):**

Amenities được lưu trực tiếp trong `properties.features.amenities` dạng JSONB array, không cần bảng riêng.

Ví dụ:
```json
{
  "bedrooms": 4,
  "bathrooms": 3,
  "orientation": "Đông Nam",
  "furniture": "full",
  "amenities": ["ho-boi", "gym", "thang-may", "an-ninh-24-7"]
}
```

Query filter:
```sql
-- Filter properties có amenities cụ thể
SELECT * FROM properties
WHERE (features->'amenities')::jsonb ?| ARRAY['ho-boi', 'gym'];
```

### users
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

### leads
```sql
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

CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_reference ON leads(reference_type, reference_id);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at);
```

---

## Full-text Search Setup

### Trigger functions:

```sql
-- Update search_vector for industrial_parks
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

-- Update search_vector for properties
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
```

---

## Auto-update Timestamps

```sql
-- Function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
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
```

---

## Tổng kết

### Ưu điểm thiết kế:

1. **Đơn giản**: Chỉ 2 bảng chính, không cần extension tables
2. **Linh hoạt**: JSONB cho hạ tầng và đặc điểm, dễ thêm/bớt fields
3. **Hiệu quả**: Indexes tốt cho filter, JSONB indexes hỗ trợ query
4. **Phù hợp**: Đáp ứng đúng yêu cầu filter và hiển thị
5. **Dễ maintain**: Ít bảng, logic rõ ràng

### Cấu trúc:

- **2 bảng chính**: `industrial_parks`, `properties`
- **Cả 2 có thể**: cho thuê và/hoặc chuyển nhượng
- **JSONB fields**: `infrastructure` (KCN), `features` (BDS)
- **Filter-ready**: Tất cả fields cần thiết cho filter đều có index

---

## So sánh với thiết kế cũ

| Tiêu chí | Hybrid Approach | Simplified Design |
|----------|-----------------|-------------------|
| Số bảng | 19 bảng | ~10 bảng |
| Extension tables | Có (3 bảng) | Không |
| Hạ tầng | 7 boolean fields | 1 JSONB field |
| Đặc điểm | Nhiều fields riêng | 1 JSONB field |
| Độ phức tạp | Cao | Thấp |
| Linh hoạt | Thấp (cần migration) | Cao (tự do thêm key) |
| Query performance | Tốt | Tốt (với indexes) |




