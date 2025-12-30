#!/bin/bash
# Bash script to run KCN Redesign migration
# Usage: ./scripts/run-kcn-migration.sh

# Load .env.local if exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Set defaults
DB_NAME=${DB_NAME:-cms_db}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-cms_user}
DB_PASSWORD=${DB_PASSWORD:-cms_password}

echo "🔄 Running KCN Redesign Migration..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

# Migration 061: Create lookup tables
echo "📋 Running migration 061: Create lookup tables..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f shared/database/migrations/061_kcn_redesign_lookup_tables.sql
if [ $? -ne 0 ]; then
    echo "❌ Migration 061 failed"
    exit 1
fi
echo "✅ Migration 061 completed"
echo ""

# Migration 062: Migrate data
echo "📋 Running migration 062: Migrate existing data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f shared/database/migrations/062_kcn_redesign_migrate_data.sql
if [ $? -ne 0 ]; then
    echo "❌ Migration 062 failed"
    exit 1
fi
echo "✅ Migration 062 completed"
echo ""

echo "✅ All migrations completed successfully!"

# Clear password
unset PGPASSWORD
















