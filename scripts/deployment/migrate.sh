#!/bin/bash

echo "🔄 Running database migrations..."

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw inland_realestate; then
    echo "❌ Database 'inland_realestate' does not exist"
    echo "Please create it first: createdb inland_realestate"
    exit 1
fi

# Run migrations in order
echo "Running migration 001: Initial schema..."
psql -d inland_realestate -f ../../shared/database/migrations/001_initial_schema.sql

echo "Running migration 002: Add indexes..."
psql -d inland_realestate -f ../../shared/database/migrations/002_add_indexes.sql

echo "Running seeds..."
psql -d inland_realestate -f ../../shared/database/seeds/sample_data.sql

echo "✅ Migrations completed!"

