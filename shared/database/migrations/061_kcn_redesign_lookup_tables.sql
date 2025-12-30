-- Migration 061: KCN Redesign - Create Lookup Tables and Satellite Tables
-- Thiết kế lại database cho Khu Công Nghiệp với filter linh hoạt
-- Tạo các bảng lookup và vệ tinh

BEGIN;

-- =====================================================
-- 1. LOOKUP TABLES - Bảng tra cứu
-- =====================================================

-- Bảng loại sản phẩm (Product Types)
CREATE TABLE IF NOT EXISTS product_types (
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
('dat-co-nha-xuong', 'Đất có nhà xưởng', 'Land with Factory', 3)
ON CONFLICT (code) DO NOTHING;

-- Bảng loại giao dịch (Transaction Types)
CREATE TABLE IF NOT EXISTS transaction_types (
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
('cho-thue', 'Cho thuê', 'Rent', 2)
ON CONFLICT (code) DO NOTHING;

-- Bảng loại vị trí (Location Types)
CREATE TABLE IF NOT EXISTS location_types (
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
('ngoai-kcn-ccn', 'Ngoài KCN / CCN', 'Outside KCN / CCN', 'ngoai', 'ngoai', 5)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. UPDATE PROPERTIES - Thêm các cột cần thiết nếu chưa có
-- =====================================================

-- Thêm main_category nếu chưa có
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS main_category VARCHAR(50) CHECK (main_category IN ('kcn', 'bds'));

-- Thêm sub_category nếu chưa có
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(50) CHECK (sub_category IN ('trong-kcn', 'ngoai-kcn'));

-- Thêm property_type nếu chưa có (mapping từ type hiện tại)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_type VARCHAR(100);

-- Thêm transaction_type nếu chưa có (mapping từ has_rental/has_transfer)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) CHECK (transaction_type IN ('chuyen-nhuong', 'cho-thue'));

-- Thêm industrial_park_id nếu chưa có
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS industrial_park_id UUID REFERENCES industrial_parks(id) ON DELETE SET NULL;

-- Cập nhật main_category mặc định: nếu có industrial_park_id thì là 'kcn', ngược lại là 'bds'
UPDATE properties
SET main_category = CASE 
  WHEN industrial_park_id IS NOT NULL THEN 'kcn'
  ELSE 'bds'
END
WHERE main_category IS NULL;

-- Cập nhật property_type từ type hiện tại
UPDATE properties
SET property_type = type
WHERE property_type IS NULL AND type IS NOT NULL;

-- Cập nhật transaction_type từ has_rental/has_transfer
UPDATE properties
SET transaction_type = CASE
  WHEN has_transfer = true AND has_rental = true THEN 'chuyen-nhuong' -- Ưu tiên chuyển nhượng
  WHEN has_transfer = true THEN 'chuyen-nhuong'
  WHEN has_rental = true THEN 'cho-thue'
  ELSE 'chuyen-nhuong' -- Mặc định
END
WHERE transaction_type IS NULL;

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_properties_main_category ON properties(main_category);
CREATE INDEX IF NOT EXISTS idx_properties_sub_category ON properties(sub_category);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_industrial_park_id ON properties(industrial_park_id) WHERE industrial_park_id IS NOT NULL;

-- =====================================================
-- 3. UPDATE INDUSTRIAL_PARKS - Thêm park_type
-- =====================================================

-- Thêm cột park_type nếu chưa có
ALTER TABLE industrial_parks
ADD COLUMN IF NOT EXISTS park_type VARCHAR(50) DEFAULT 'kcn' CHECK (park_type IN ('kcn', 'ccn'));

COMMENT ON COLUMN industrial_parks.park_type IS 'Loại khu: KCN hoặc CCN';

-- Tạo index
CREATE INDEX IF NOT EXISTS idx_industrial_parks_park_type ON industrial_parks(park_type);

-- =====================================================
-- 4. UPDATE PROPERTIES - Thêm industrial_cluster_id
-- =====================================================

-- Thêm cột industrial_cluster_id nếu chưa có
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS industrial_cluster_id UUID REFERENCES industrial_parks(id) ON DELETE SET NULL;

COMMENT ON COLUMN properties.industrial_cluster_id IS 'Reference đến CCN nếu property thuộc CCN';

-- Tạo index
CREATE INDEX IF NOT EXISTS idx_properties_industrial_cluster_id 
ON properties(industrial_cluster_id) 
WHERE industrial_cluster_id IS NOT NULL;

-- =====================================================
-- 5. SATELLITE TABLES - Bảng vệ tinh cho filter linh hoạt
-- =====================================================

-- Bảng kết nối Properties với Product Types
CREATE TABLE IF NOT EXISTS property_product_types (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  product_type_code VARCHAR(100) NOT NULL REFERENCES product_types(code) ON DELETE CASCADE,
  PRIMARY KEY (property_id, product_type_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_product_types_property ON property_product_types(property_id);
CREATE INDEX IF NOT EXISTS idx_property_product_types_product ON property_product_types(product_type_code);

COMMENT ON TABLE property_product_types IS 'Kết nối properties với product types - cho phép một property có nhiều product types';

-- Bảng kết nối Properties với Transaction Types
CREATE TABLE IF NOT EXISTS property_transaction_types (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  transaction_type_code VARCHAR(100) NOT NULL REFERENCES transaction_types(code) ON DELETE CASCADE,
  PRIMARY KEY (property_id, transaction_type_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_transaction_types_property ON property_transaction_types(property_id);
CREATE INDEX IF NOT EXISTS idx_property_transaction_types_transaction ON property_transaction_types(transaction_type_code);

COMMENT ON TABLE property_transaction_types IS 'Kết nối properties với transaction types - cho phép một property có nhiều transaction types';

-- Bảng kết nối Properties với Location Types
CREATE TABLE IF NOT EXISTS property_location_types (
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  location_type_code VARCHAR(100) NOT NULL REFERENCES location_types(code) ON DELETE CASCADE,
  PRIMARY KEY (property_id, location_type_code),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_location_types_property ON property_location_types(property_id);
CREATE INDEX IF NOT EXISTS idx_property_location_types_location ON property_location_types(location_type_code);

COMMENT ON TABLE property_location_types IS 'Kết nối properties với location types - cho phép một property có nhiều location types';

-- =====================================================
-- 6. VIEW - View hỗ trợ query
-- =====================================================

-- View tổng hợp properties với các thông tin filter
CREATE OR REPLACE VIEW v_properties_filter AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.slug,
  COALESCE(p.main_category, CASE WHEN p.industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) as main_category,
  p.status,
  p.industrial_park_id,
  p.industrial_cluster_id,
  p.province,
  p.ward as district,
  p.area as total_area,
  COALESCE(p.sale_price, p.rental_price) as price,
  COALESCE(p.sale_price_per_sqm, p.rental_price_per_sqm) as price_per_sqm,
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
WHERE COALESCE(p.main_category, CASE WHEN p.industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) = 'kcn'
GROUP BY p.id, p.code, p.name, p.slug, p.main_category, p.status,
         p.industrial_park_id, p.industrial_cluster_id, p.province, p.ward,
         p.area, p.sale_price, p.rental_price,
         p.sale_price_per_sqm, p.rental_price_per_sqm, p.published_at;

COMMENT ON VIEW v_properties_filter IS 'View tổng hợp properties với các filter types để query nhanh';

COMMIT;

