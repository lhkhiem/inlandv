-- Migration 048: Add price fields for sale and rental to properties table
-- Adds has_rental, has_transfer, and related price fields
-- Date: 2025-01-28

-- Add service flags
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS has_rental BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_transfer BOOLEAN DEFAULT false;

-- Add sale price fields
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS sale_price BIGINT,
ADD COLUMN IF NOT EXISTS sale_price_min BIGINT,
ADD COLUMN IF NOT EXISTS sale_price_max BIGINT,
ADD COLUMN IF NOT EXISTS sale_price_per_sqm BIGINT;

-- Add rental price fields
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS rental_price BIGINT,
ADD COLUMN IF NOT EXISTS rental_price_min BIGINT,
ADD COLUMN IF NOT EXISTS rental_price_max BIGINT,
ADD COLUMN IF NOT EXISTS rental_price_per_sqm BIGINT;

-- Make price optional (was required before)
ALTER TABLE properties 
ALTER COLUMN price DROP NOT NULL;

-- Add indexes for new price fields
CREATE INDEX IF NOT EXISTS idx_properties_sale_price ON properties(sale_price);
CREATE INDEX IF NOT EXISTS idx_properties_rental_price ON properties(rental_price);
CREATE INDEX IF NOT EXISTS idx_properties_has_rental ON properties(has_rental);
CREATE INDEX IF NOT EXISTS idx_properties_has_transfer ON properties(has_transfer);

-- Add comments
COMMENT ON COLUMN properties.has_rental IS 'Có dịch vụ cho thuê';
COMMENT ON COLUMN properties.has_transfer IS 'Có dịch vụ bán/chuyển nhượng';
COMMENT ON COLUMN properties.sale_price IS 'Giá bán/chuyển nhượng (VND)';
COMMENT ON COLUMN properties.sale_price_min IS 'Giá bán tối thiểu (VND)';
COMMENT ON COLUMN properties.sale_price_max IS 'Giá bán tối đa (VND)';
COMMENT ON COLUMN properties.sale_price_per_sqm IS 'Giá bán/m² (VND)';
COMMENT ON COLUMN properties.rental_price IS 'Giá thuê (VND/tháng)';
COMMENT ON COLUMN properties.rental_price_min IS 'Giá thuê tối thiểu (VND/tháng)';
COMMENT ON COLUMN properties.rental_price_max IS 'Giá thuê tối đa (VND/tháng)';
COMMENT ON COLUMN properties.rental_price_per_sqm IS 'Giá thuê/m² (VND/tháng)';



















