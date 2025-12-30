-- Migration 050: Add video_url column to industrial_parks table
-- Date: 2025-12-23

ALTER TABLE industrial_parks
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN industrial_parks.video_url IS 'URL của video giới thiệu khu công nghiệp';


















