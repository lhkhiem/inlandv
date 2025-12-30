-- Migration 066: Create Industrial Park Supporting Tables
-- Tạo các bảng hỗ trợ cho industrial_parks: industries, allowed_industries, documents

BEGIN;

-- =====================================================
-- 1. CREATE INDUSTRIES LOOKUP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS industries (
  code VARCHAR(100) PRIMARY KEY,
  name_vi VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  icon VARCHAR(100),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industries_active ON industries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_industries_display_order ON industries(display_order);

COMMENT ON TABLE industries IS 'Ngành nghề được phép hoạt động trong KCN';
COMMENT ON COLUMN industries.code IS 'Mã ngành nghề (VD: co-khi, dien-tu, thuc-pham)';
COMMENT ON COLUMN industries.name_vi IS 'Tên tiếng Việt';
COMMENT ON COLUMN industries.name_en IS 'Tên tiếng Anh';
COMMENT ON COLUMN industries.icon IS 'Icon/logo của ngành nghề';
COMMENT ON COLUMN industries.display_order IS 'Thứ tự hiển thị';

-- Insert default industries
INSERT INTO industries (code, name_vi, name_en, display_order) VALUES
  ('co-khi', 'Cơ khí', 'Mechanical Engineering', 1),
  ('dien-tu', 'Điện tử', 'Electronics', 2),
  ('thuc-pham', 'Thực phẩm', 'Food Processing', 3),
  ('hoa-chat', 'Hóa chất', 'Chemicals', 4),
  ('det-may', 'Dệt may', 'Textiles & Garments', 5),
  ('go', 'Gỗ', 'Wood Processing', 6),
  ('bao-bi', 'Bao bì', 'Packaging', 7),
  ('logistics', 'Logistics', 'Logistics & Warehousing', 8),
  ('nang-luong', 'Năng lượng', 'Energy', 9),
  ('cong-nghe-cao', 'Công nghệ cao', 'High Technology', 10)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 2. CREATE INDUSTRIAL_PARK_ALLOWED_INDUSTRIES
-- =====================================================

CREATE TABLE IF NOT EXISTS industrial_park_allowed_industries (
  park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  industry_code VARCHAR(100) NOT NULL REFERENCES industries(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (park_id, industry_code)
);

CREATE INDEX IF NOT EXISTS idx_industrial_park_industries_park 
  ON industrial_park_allowed_industries(park_id);
CREATE INDEX IF NOT EXISTS idx_industrial_park_industries_industry 
  ON industrial_park_allowed_industries(industry_code);

COMMENT ON TABLE industrial_park_allowed_industries IS 'Junction table: KCN ↔ Ngành nghề được phép (N:M)';
COMMENT ON COLUMN industrial_park_allowed_industries.park_id IS 'ID của KCN';
COMMENT ON COLUMN industrial_park_allowed_industries.industry_code IS 'Mã ngành nghề';

-- =====================================================
-- 3. CREATE INDUSTRIAL_PARK_DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS industrial_park_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- PDF, DOC, DOCX, XLS, XLSX, etc.
  file_size BIGINT, -- bytes
  description TEXT,
  category VARCHAR(100), -- 'phap-ly', 'quy-hoach', 'thuyet-minh', 'khac'
  display_order INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_industrial_park_documents_park_id 
  ON industrial_park_documents(industrial_park_id);
CREATE INDEX IF NOT EXISTS idx_industrial_park_documents_category 
  ON industrial_park_documents(category);
CREATE INDEX IF NOT EXISTS idx_industrial_park_documents_order 
  ON industrial_park_documents(industrial_park_id, display_order);

COMMENT ON TABLE industrial_park_documents IS 'Tài liệu của KCN (PDF, giấy tờ pháp lý, quy hoạch, thuyết minh)';
COMMENT ON COLUMN industrial_park_documents.title IS 'Tên tài liệu';
COMMENT ON COLUMN industrial_park_documents.file_url IS 'URL của file tài liệu';
COMMENT ON COLUMN industrial_park_documents.file_type IS 'Loại file: PDF, DOC, DOCX, XLS, XLSX';
COMMENT ON COLUMN industrial_park_documents.file_size IS 'Kích thước file (bytes)';
COMMENT ON COLUMN industrial_park_documents.category IS 'Danh mục: phap-ly, quy-hoach, thuyet-minh, khac';
COMMENT ON COLUMN industrial_park_documents.is_public IS 'Có hiển thị công khai không';

-- =====================================================
-- 4. UPDATE VIEW v_industrial_parks_filter
-- =====================================================

DROP VIEW IF EXISTS v_industrial_parks_filter CASCADE;

CREATE OR REPLACE VIEW v_industrial_parks_filter AS
SELECT 
  ip.id,
  ip.code,
  ip.name,
  ip.slug,
  ip.scope,
  ip.has_rental,
  ip.has_transfer,
  ip.has_factory,
  ip.province,
  ip.ward,
  ip.address,
  ip.latitude,
  ip.longitude,
  ip.google_maps_link,
  ip.total_area,
  ip.available_area,
  ip.rental_price_min,
  ip.rental_price_max,
  ip.transfer_price_min,
  ip.transfer_price_max,
  ip.infrastructure,
  ip.description,
  ip.description_full,
  ip.thumbnail_url,
  ip.meta_title,
  ip.meta_description,
  ip.created_at,
  ip.updated_at,
  ip.published_at,
  ip.search_vector,
  -- Aggregate product types
  COALESCE(
    (SELECT array_agg(product_type_code ORDER BY product_type_code) 
     FROM industrial_park_product_types 
     WHERE industrial_park_id = ip.id),
    ARRAY[]::VARCHAR[]
  ) as product_types,
  -- Aggregate transaction types
  COALESCE(
    (SELECT array_agg(transaction_type_code ORDER BY transaction_type_code) 
     FROM industrial_park_transaction_types 
     WHERE industrial_park_id = ip.id),
    ARRAY[]::VARCHAR[]
  ) as transaction_types,
  -- Aggregate location types
  COALESCE(
    (SELECT array_agg(location_type_code ORDER BY location_type_code) 
     FROM industrial_park_location_types 
     WHERE industrial_park_id = ip.id),
    ARRAY[]::VARCHAR[]
  ) as location_types,
  -- Aggregate allowed industries (from junction table, not from column)
  COALESCE(
    (SELECT array_agg(industry_code ORDER BY industry_code) 
     FROM industrial_park_allowed_industries 
     WHERE park_id = ip.id),
    ARRAY[]::VARCHAR[]
  ) as allowed_industries
FROM industrial_parks ip;

COMMENT ON VIEW v_industrial_parks_filter IS 'View để filter industrial parks theo product_types, transaction_types, location_types, allowed_industries';

-- =====================================================
-- 5. CREATE TRIGGER FOR updated_at
-- =====================================================

-- Function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for industries
DROP TRIGGER IF EXISTS trigger_industries_updated_at ON industries;
CREATE TRIGGER trigger_industries_updated_at
  BEFORE UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for industrial_park_documents
DROP TRIGGER IF EXISTS trigger_industrial_park_documents_updated_at ON industrial_park_documents;
CREATE TRIGGER trigger_industrial_park_documents_updated_at
  BEFORE UPDATE ON industrial_park_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

