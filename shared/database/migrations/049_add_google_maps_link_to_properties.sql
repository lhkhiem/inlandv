-- Migration 049: Add google_maps_link to properties table
-- Date: 2025-01-28

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

COMMENT ON COLUMN properties.google_maps_link IS 'Link Google Maps đến vị trí bất động sản';



