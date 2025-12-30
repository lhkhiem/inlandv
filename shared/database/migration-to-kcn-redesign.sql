-- =====================================================
-- Migration Script - Từ Schema v2 sang KCN Redesign
-- =====================================================
-- Lưu ý: Chạy script này sau khi đã tạo schema mới
-- Backup database trước khi chạy migration!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. Tạo các bảng lookup (nếu chưa có)
-- =====================================================

-- Product Types
INSERT INTO product_types (code, name_vi, name_en, display_order)
SELECT DISTINCT 
  CASE 
    WHEN property_type LIKE '%dat%' AND property_type LIKE '%nha-xuong%' THEN 'dat-co-nha-xuong'
    WHEN property_type LIKE '%nha-xuong%' THEN 'nha-xuong'
    WHEN property_type LIKE '%dat%' THEN 'dat'
    ELSE 'dat'
  END as code,
  CASE 
    WHEN property_type LIKE '%dat%' AND property_type LIKE '%nha-xuong%' THEN 'Đất có nhà xưởng'
    WHEN property_type LIKE '%nha-xuong%' THEN 'Nhà xưởng'
    WHEN property_type LIKE '%dat%' THEN 'Đất'
    ELSE 'Đất'
  END as name_vi,
  CASE 
    WHEN property_type LIKE '%dat%' AND property_type LIKE '%nha-xuong%' THEN 'Land with Factory'
    WHEN property_type LIKE '%nha-xuong%' THEN 'Factory'
    WHEN property_type LIKE '%dat%' THEN 'Land'
    ELSE 'Land'
  END as name_en,
  CASE 
    WHEN property_type LIKE '%dat%' AND property_type LIKE '%nha-xuong%' THEN 3
    WHEN property_type LIKE '%nha-xuong%' THEN 2
    WHEN property_type LIKE '%dat%' THEN 1
    ELSE 1
  END as display_order
FROM properties
WHERE main_category = 'kcn'
ON CONFLICT (code) DO NOTHING;

-- Transaction Types (đã có sẵn trong schema mới)
-- Không cần migrate vì đã insert default values

-- Location Types (đã có sẵn trong schema mới)
-- Không cần migrate vì đã insert default values

-- =====================================================
-- 2. Migrate dữ liệu từ properties sang property_product_types
-- =====================================================

INSERT INTO property_product_types (property_id, product_type_code)
SELECT 
  id as property_id,
  CASE 
    WHEN property_type LIKE '%dat%' AND property_type LIKE '%nha-xuong%' THEN 'dat-co-nha-xuong'
    WHEN property_type LIKE '%nha-xuong%' THEN 'nha-xuong'
    WHEN property_type LIKE '%dat%' THEN 'dat'
    ELSE 'dat'
  END as product_type_code
FROM properties
WHERE main_category = 'kcn'
ON CONFLICT DO NOTHING;

-- Nếu property có cả đất và nhà xưởng, thêm cả hai types
INSERT INTO property_product_types (property_id, product_type_code)
SELECT 
  id as property_id,
  'dat' as product_type_code
FROM properties
WHERE main_category = 'kcn'
  AND property_type LIKE '%dat%'
  AND property_type LIKE '%nha-xuong%'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. Migrate dữ liệu từ properties sang property_transaction_types
-- =====================================================

INSERT INTO property_transaction_types (property_id, transaction_type_code)
SELECT 
  id as property_id,
  transaction_type as transaction_type_code
FROM properties
WHERE main_category = 'kcn'
  AND transaction_type IS NOT NULL
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. Migrate dữ liệu từ properties sang property_location_types
-- =====================================================

-- Migrate từ sub_category
INSERT INTO property_location_types (property_id, location_type_code)
SELECT 
  id as property_id,
  CASE 
    WHEN sub_category = 'trong-kcn' THEN 'trong-kcn'
    WHEN sub_category = 'ngoai-kcn' THEN 'ngoai-kcn'
    ELSE 'ngoai-kcn'
  END as location_type_code
FROM properties
WHERE main_category = 'kcn'
  AND sub_category IS NOT NULL
ON CONFLICT DO NOTHING;

-- Nếu có industrial_park_id thì thêm 'trong-kcn'
INSERT INTO property_location_types (property_id, location_type_code)
SELECT 
  id as property_id,
  'trong-kcn' as location_type_code
FROM properties
WHERE main_category = 'kcn'
  AND industrial_park_id IS NOT NULL
  AND sub_category = 'trong-kcn'
ON CONFLICT DO NOTHING;

-- Nếu không có industrial_park_id và sub_category = 'ngoai-kcn' thì thêm 'ngoai-kcn-ccn'
INSERT INTO property_location_types (property_id, location_type_code)
SELECT 
  id as property_id,
  'ngoai-kcn-ccn' as location_type_code
FROM properties
WHERE main_category = 'kcn'
  AND industrial_park_id IS NULL
  AND sub_category = 'ngoai-kcn'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. Cập nhật industrial_parks.park_type nếu cần
-- =====================================================

-- Nếu có thể phân biệt KCN và CCN từ dữ liệu hiện có
-- UPDATE industrial_parks SET park_type = 'ccn' WHERE ...;

-- =====================================================
-- 6. Thêm industrial_cluster_id nếu property thuộc CCN
-- =====================================================

-- Nếu có thể xác định property thuộc CCN từ dữ liệu hiện có
-- UPDATE properties SET industrial_cluster_id = ... WHERE ...;

-- =====================================================
-- 7. Verify migration
-- =====================================================

-- Kiểm tra số lượng properties đã migrate
SELECT 
  'Properties with product types' as check_name,
  COUNT(DISTINCT property_id) as count
FROM property_product_types
UNION ALL
SELECT 
  'Properties with transaction types' as check_name,
  COUNT(DISTINCT property_id) as count
FROM property_transaction_types
UNION ALL
SELECT 
  'Properties with location types' as check_name,
  COUNT(DISTINCT property_id) as count
FROM property_location_types
UNION ALL
SELECT 
  'Total KCN properties' as check_name,
  COUNT(*) as count
FROM properties
WHERE main_category = 'kcn';

-- Kiểm tra properties chưa có types
SELECT 
  p.id,
  p.code,
  p.name,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM property_product_types WHERE property_id = p.id) THEN 'Missing product type'
    WHEN NOT EXISTS (SELECT 1 FROM property_transaction_types WHERE property_id = p.id) THEN 'Missing transaction type'
    WHEN NOT EXISTS (SELECT 1 FROM property_location_types WHERE property_id = p.id) THEN 'Missing location type'
    ELSE 'OK'
  END as issue
FROM properties p
WHERE p.main_category = 'kcn'
  AND (
    NOT EXISTS (SELECT 1 FROM property_product_types WHERE property_id = p.id)
    OR NOT EXISTS (SELECT 1 FROM property_transaction_types WHERE property_id = p.id)
    OR NOT EXISTS (SELECT 1 FROM property_location_types WHERE property_id = p.id)
  );

COMMIT;

-- =====================================================
-- ROLLBACK Script (nếu cần rollback)
-- =====================================================
-- DELETE FROM property_location_types;
-- DELETE FROM property_transaction_types;
-- DELETE FROM property_product_types;
-- DELETE FROM location_types WHERE code IN ('trong-kcn', 'ngoai-kcn', 'trong-ccn', 'ngoai-ccn', 'ngoai-kcn-ccn');
-- DELETE FROM transaction_types WHERE code IN ('chuyen-nhuong', 'cho-thue');
-- DELETE FROM product_types WHERE code IN ('dat', 'nha-xuong', 'dat-co-nha-xuong');
-- =====================================================
















