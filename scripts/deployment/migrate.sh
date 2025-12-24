#!/bin/bash

echo "🔄 Running database migrations..."

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw inlandv_realestate; then
    echo "❌ Database 'inlandv_realestate' does not exist"
    echo "Please create it first: createdb inlandv_realestate"
    exit 1
fi

# Run migrations in order
echo "Running migration 001: Initial schema..."
psql -d inlandv_realestate -f ../../shared/database/migrations/001_initial_schema.sql

echo "Running migration 002: Add indexes..."
psql -d inlandv_realestate -f ../../shared/database/migrations/002_add_indexes.sql

echo "Running migration 044: CMS Integration..."
psql -d inlandv_realestate -f ../../shared/database/migrations/044_cms_integration.sql

echo "Running migration 045: Update users table..."
psql -d inlandv_realestate -f ../../shared/database/migrations/045_update_users_table.sql

echo "Running migration 046: Create industrial_parks..."
psql -d inlandv_realestate -f ../../shared/database/migrations/046_create_industrial_parks.sql

echo "Running migration 047: Create properties..."
psql -d inlandv_realestate -f ../../shared/database/migrations/047_create_properties.sql

echo "Running migration 048: Add property price fields..."
psql -d inlandv_realestate -f ../../shared/database/migrations/048_add_property_price_fields.sql

echo "Running migration 049: Add Google Maps link to properties..."
psql -d inlandv_realestate -f ../../shared/database/migrations/049_add_google_maps_link_to_properties.sql

echo "Running migration 050: Add video_url to industrial_parks..."
psql -d inlandv_realestate -f ../../shared/database/migrations/050_add_video_url_to_industrial_parks.sql

echo "Running migration 051: Fix administrative units (district -> ward)..."
psql -d inlandv_realestate -f ../../shared/database/migrations/051_fix_administrative_units.sql

echo "Running seeds..."
psql -d inlandv_realestate -f ../../shared/database/seeds/sample_data.sql

echo "✅ Migrations completed!"

