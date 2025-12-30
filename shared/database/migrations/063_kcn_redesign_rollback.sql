-- Migration 063: KCN Redesign - Rollback Script
-- Script để rollback migration 061 và 062 nếu cần
-- CHỈ CHẠY KHI CẦN ROLLBACK!

BEGIN;

-- =====================================================
-- 1. Drop View
-- =====================================================
DROP VIEW IF EXISTS v_properties_filter;

-- =====================================================
-- 2. Drop Satellite Tables
-- =====================================================
DROP TABLE IF EXISTS property_location_types CASCADE;
DROP TABLE IF EXISTS property_transaction_types CASCADE;
DROP TABLE IF EXISTS property_product_types CASCADE;

-- =====================================================
-- 3. Drop Lookup Tables
-- =====================================================
DROP TABLE IF EXISTS location_types CASCADE;
DROP TABLE IF EXISTS transaction_types CASCADE;
DROP TABLE IF EXISTS product_types CASCADE;

-- =====================================================
-- 4. Remove columns from existing tables
-- =====================================================
ALTER TABLE properties DROP COLUMN IF EXISTS industrial_cluster_id;
ALTER TABLE industrial_parks DROP COLUMN IF EXISTS park_type;

-- =====================================================
-- 5. Drop indexes
-- =====================================================
DROP INDEX IF EXISTS idx_properties_industrial_cluster_id;
DROP INDEX IF EXISTS idx_industrial_parks_park_type;

COMMIT;
















