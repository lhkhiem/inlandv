-- Migration 064: Create Industrial Park Satellite Tables and Remove Property Satellite Tables
-- Tạo bảng vệ tinh cho industrial_parks và xóa bảng vệ tinh của properties

BEGIN;

-- =====================================================
-- 1. CREATE INDUSTRIAL PARK SATELLITE TABLES
-- =====================================================

-- Bảng vệ tinh: Loại sản phẩm của KCN
CREATE TABLE IF NOT EXISTS industrial_park_product_types (
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  product_type_code VARCHAR(100) NOT NULL REFERENCES product_types(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (industrial_park_id, product_type_code)
);

CREATE INDEX IF NOT EXISTS idx_industrial_park_product_types_park_id 
  ON industrial_park_product_types(industrial_park_id);
CREATE INDEX IF NOT EXISTS idx_industrial_park_product_types_code 
  ON industrial_park_product_types(product_type_code);

COMMENT ON TABLE industrial_park_product_types IS 'Bảng vệ tinh: Loại sản phẩm của KCN (đất, nhà xưởng, đất có nhà xưởng)';

-- Bảng vệ tinh: Loại giao dịch của KCN
CREATE TABLE IF NOT EXISTS industrial_park_transaction_types (
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  transaction_type_code VARCHAR(100) NOT NULL REFERENCES transaction_types(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (industrial_park_id, transaction_type_code)
);

CREATE INDEX IF NOT EXISTS idx_industrial_park_transaction_types_park_id 
  ON industrial_park_transaction_types(industrial_park_id);
CREATE INDEX IF NOT EXISTS idx_industrial_park_transaction_types_code 
  ON industrial_park_transaction_types(transaction_type_code);

COMMENT ON TABLE industrial_park_transaction_types IS 'Bảng vệ tinh: Loại giao dịch của KCN (chuyển nhượng, cho thuê)';

-- Bảng vệ tinh: Loại vị trí của KCN
CREATE TABLE IF NOT EXISTS industrial_park_location_types (
  industrial_park_id UUID NOT NULL REFERENCES industrial_parks(id) ON DELETE CASCADE,
  location_type_code VARCHAR(100) NOT NULL REFERENCES location_types(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (industrial_park_id, location_type_code)
);

CREATE INDEX IF NOT EXISTS idx_industrial_park_location_types_park_id 
  ON industrial_park_location_types(industrial_park_id);
CREATE INDEX IF NOT EXISTS idx_industrial_park_location_types_code 
  ON industrial_park_location_types(location_type_code);

COMMENT ON TABLE industrial_park_location_types IS 'Bảng vệ tinh: Loại vị trí của KCN (trong KCN, ngoài KCN, trong CCN, ngoài CCN)';

-- =====================================================
-- 2. MIGRATE DATA FROM PROPERTIES TO INDUSTRIAL PARKS
-- =====================================================

-- Migrate product types từ properties sang industrial_parks
INSERT INTO industrial_park_product_types (industrial_park_id, product_type_code)
SELECT DISTINCT
  ip.id as industrial_park_id,
  ppt.product_type_code
FROM industrial_parks ip
INNER JOIN properties p ON p.industrial_park_id = ip.id
INNER JOIN property_product_types ppt ON ppt.property_id = p.id
WHERE ip.id NOT IN (SELECT industrial_park_id FROM industrial_park_product_types WHERE product_type_code = ppt.product_type_code)
ON CONFLICT DO NOTHING;

-- Migrate transaction types từ properties sang industrial_parks
INSERT INTO industrial_park_transaction_types (industrial_park_id, transaction_type_code)
SELECT DISTINCT
  ip.id as industrial_park_id,
  ptt.transaction_type_code
FROM industrial_parks ip
INNER JOIN properties p ON p.industrial_park_id = ip.id
INNER JOIN property_transaction_types ptt ON ptt.property_id = p.id
WHERE ip.id NOT IN (SELECT industrial_park_id FROM industrial_park_transaction_types WHERE transaction_type_code = ptt.transaction_type_code)
ON CONFLICT DO NOTHING;

-- Migrate location types từ properties sang industrial_parks
INSERT INTO industrial_park_location_types (industrial_park_id, location_type_code)
SELECT DISTINCT
  ip.id as industrial_park_id,
  plt.location_type_code
FROM industrial_parks ip
INNER JOIN properties p ON p.industrial_park_id = ip.id
INNER JOIN property_location_types plt ON plt.property_id = p.id
WHERE ip.id NOT IN (SELECT industrial_park_id FROM industrial_park_location_types WHERE location_type_code = plt.location_type_code)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. DROP PROPERTY SATELLITE TABLES
-- =====================================================

-- Drop view if exists
DROP VIEW IF EXISTS v_properties_filter;

-- Drop property satellite tables
DROP TABLE IF EXISTS property_location_types CASCADE;
DROP TABLE IF EXISTS property_transaction_types CASCADE;
DROP TABLE IF EXISTS property_product_types CASCADE;

-- =====================================================
-- 4. CREATE VIEW FOR INDUSTRIAL PARKS FILTER
-- =====================================================

CREATE OR REPLACE VIEW v_industrial_parks_filter AS
SELECT 
  ip.id,
  ip.code,
  ip.name,
  ip.slug,
  ip.park_type,
  ip.scope,
  ip.has_rental,
  ip.has_transfer,
  ip.has_factory,
  ip.province,
  ip.ward,
  ip.address,
  ip.total_area,
  ip.available_area,
  ip.rental_price_min,
  ip.rental_price_max,
  ip.transfer_price_min,
  ip.transfer_price_max,
  ip.description,
  ip.created_at,
  ip.updated_at,
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
  ) as location_types
FROM industrial_parks ip;

COMMENT ON VIEW v_industrial_parks_filter IS 'View để filter industrial parks theo product_types, transaction_types, location_types';

COMMIT;
















