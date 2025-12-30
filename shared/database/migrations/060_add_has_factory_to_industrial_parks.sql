-- Migration 060: Add has_factory column to industrial_parks table
-- Adds a boolean field to mark if industrial park has factory/warehouse

-- Add has_factory column
ALTER TABLE industrial_parks
ADD COLUMN IF NOT EXISTS has_factory BOOLEAN DEFAULT false;

-- Add comment
COMMENT ON COLUMN industrial_parks.has_factory IS 'Có nhà xưởng/kho bãi trong khu công nghiệp';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_industrial_parks_has_factory 
ON industrial_parks(has_factory) 
WHERE has_factory = true;
















