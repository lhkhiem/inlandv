-- Migration 062: KCN Redesign - Migrate existing data
-- Migrate dữ liệu từ schema cũ sang schema mới
-- Chạy sau migration 061

BEGIN;

-- =====================================================
-- 1. Migrate dữ liệu từ properties sang property_product_types
-- =====================================================

-- Migrate product types từ property_type hoặc type
INSERT INTO property_product_types (property_id, product_type_code)
SELECT 
  id as property_id,
  CASE 
    WHEN COALESCE(property_type, type) LIKE '%dat%' AND COALESCE(property_type, type) LIKE '%nha-xuong%' THEN 'dat-co-nha-xuong'
    WHEN COALESCE(property_type, type) LIKE '%nha-xuong%' OR COALESCE(property_type, type) LIKE '%xuong%' THEN 'nha-xuong'
    WHEN COALESCE(property_type, type) LIKE '%dat%' THEN 'dat'
    WHEN COALESCE(property_type, type) = 'nha-xuong' THEN 'nha-xuong'
    ELSE 'dat'
  END as product_type_code
FROM properties
WHERE COALESCE(main_category, CASE WHEN industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) = 'kcn'
  AND id NOT IN (SELECT property_id FROM property_product_types)
ON CONFLICT DO NOTHING;

-- Nếu property có cả đất và nhà xưởng, thêm cả hai types
INSERT INTO property_product_types (property_id, product_type_code)
SELECT 
  id as property_id,
  'dat' as product_type_code
FROM properties
WHERE COALESCE(main_category, CASE WHEN industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) = 'kcn'
  AND (COALESCE(property_type, type) LIKE '%dat%' OR COALESCE(property_type, type) LIKE '%dat%')
  AND (COALESCE(property_type, type) LIKE '%nha-xuong%' OR COALESCE(property_type, type) LIKE '%xuong%')
  AND id NOT IN (
    SELECT property_id FROM property_product_types WHERE product_type_code = 'dat'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. Migrate dữ liệu từ properties sang property_transaction_types
-- =====================================================

INSERT INTO property_transaction_types (property_id, transaction_type_code)
SELECT 
  id as property_id,
  COALESCE(transaction_type, 
    CASE
      WHEN has_transfer = true AND has_rental = true THEN 'chuyen-nhuong'
      WHEN has_transfer = true THEN 'chuyen-nhuong'
      WHEN has_rental = true THEN 'cho-thue'
      ELSE 'chuyen-nhuong'
    END
  ) as transaction_type_code
FROM properties
WHERE COALESCE(main_category, CASE WHEN industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) = 'kcn'
  AND id NOT IN (SELECT property_id FROM property_transaction_types)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. Migrate dữ liệu từ properties sang property_location_types
-- =====================================================

-- Migrate từ sub_category hoặc industrial_park_id
INSERT INTO property_location_types (property_id, location_type_code)
SELECT 
  id as property_id,
  CASE 
    WHEN sub_category = 'trong-kcn' THEN 'trong-kcn'
    WHEN sub_category = 'ngoai-kcn' THEN 'ngoai-kcn'
    WHEN industrial_park_id IS NOT NULL THEN 'trong-kcn'
    ELSE 'ngoai-kcn-ccn'
  END as location_type_code
FROM properties
WHERE COALESCE(main_category, CASE WHEN industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) = 'kcn'
  AND id NOT IN (SELECT property_id FROM property_location_types)
ON CONFLICT DO NOTHING;


-- =====================================================
-- 4. Verify migration
-- =====================================================

-- Log migration results
DO $$
DECLARE
  v_product_count INTEGER;
  v_transaction_count INTEGER;
  v_location_count INTEGER;
  v_total_kcn INTEGER;
BEGIN
  SELECT COUNT(DISTINCT property_id) INTO v_product_count FROM property_product_types;
  SELECT COUNT(DISTINCT property_id) INTO v_transaction_count FROM property_transaction_types;
  SELECT COUNT(DISTINCT property_id) INTO v_location_count FROM property_location_types;
  SELECT COUNT(*) INTO v_total_kcn FROM properties 
  WHERE COALESCE(main_category, CASE WHEN industrial_park_id IS NOT NULL THEN 'kcn' ELSE 'bds' END) = 'kcn';
  
  RAISE NOTICE 'Migration Results:';
  RAISE NOTICE '  Properties with product types: %', v_product_count;
  RAISE NOTICE '  Properties with transaction types: %', v_transaction_count;
  RAISE NOTICE '  Properties with location types: %', v_location_count;
  RAISE NOTICE '  Total KCN properties: %', v_total_kcn;
END $$;

COMMIT;

