-- Migration 065: Rename product_types to industrial_park_types
-- Đổi tên bảng product_types thành industrial_park_types

BEGIN;

-- =====================================================
-- 1. RENAME TABLE
-- =====================================================

-- Kiểm tra và đổi tên bảng product_types thành industrial_park_types
-- Chỉ đổi tên nếu bảng product_types tồn tại và industrial_park_types chưa tồn tại
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_types') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'industrial_park_types') THEN
      ALTER TABLE product_types RENAME TO industrial_park_types;
      RAISE NOTICE 'Table product_types renamed to industrial_park_types';
    ELSE
      RAISE NOTICE 'Table industrial_park_types already exists, skipping rename';
    END IF;
  ELSE
    RAISE NOTICE 'Table product_types does not exist, skipping rename';
  END IF;
END $$;

-- =====================================================
-- 2. UPDATE FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Xóa foreign key constraint cũ trong industrial_park_product_types
ALTER TABLE IF EXISTS industrial_park_product_types 
  DROP CONSTRAINT IF EXISTS industrial_park_product_types_product_type_code_fkey;

-- Tạo lại foreign key constraint với bảng mới
ALTER TABLE IF EXISTS industrial_park_product_types 
  ADD CONSTRAINT industrial_park_product_types_product_type_code_fkey 
  FOREIGN KEY (product_type_code) 
  REFERENCES industrial_park_types(code) 
  ON DELETE CASCADE;

-- =====================================================
-- 3. UPDATE INDEXES
-- =====================================================

-- Indexes sẽ tự động được cập nhật khi đổi tên bảng
-- Không cần làm gì thêm

-- =====================================================
-- 4. UPDATE VIEWS
-- =====================================================

-- Cập nhật view v_industrial_parks_filter nếu tồn tại
DROP VIEW IF EXISTS v_industrial_parks_filter CASCADE;

CREATE OR REPLACE VIEW v_industrial_parks_filter AS
SELECT 
  ip.*,
  (
    SELECT array_agg(product_type_code ORDER BY product_type_code) 
    FROM industrial_park_product_types 
    WHERE industrial_park_id = ip.id
  ) as product_types,
  (
    SELECT array_agg(transaction_type_code ORDER BY transaction_type_code) 
    FROM industrial_park_transaction_types 
    WHERE industrial_park_id = ip.id
  ) as transaction_types,
  (
    SELECT array_agg(location_type_code ORDER BY location_type_code) 
    FROM industrial_park_location_types 
    WHERE industrial_park_id = ip.id
  ) as location_types
FROM industrial_parks ip;

COMMENT ON VIEW v_industrial_parks_filter IS 'View để filter industrial parks theo product_types, transaction_types, location_types';

-- =====================================================
-- 5. UPDATE COMMENTS
-- =====================================================

COMMENT ON TABLE industrial_park_types IS 'Loại sản phẩm KCN: đất, nhà xưởng, đất có nhà xưởng';

COMMIT;

