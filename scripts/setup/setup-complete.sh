#!/bin/bash

# ============================================
# Complete Setup Script - Tạo User, Database và Migration
# ============================================
# Script này sẽ:
# 1. Tạo database inlandv_realestate
# 2. Tạo user inlandv_user với password EKYvccPcharP
# 3. Cấp quyền cho user
# 4. Chạy tất cả migrations

DB_NAME="${DB_NAME:-inlandv_realestate}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
NEW_USER="${NEW_USER:-inlandv_user}"
NEW_PASSWORD="${NEW_PASSWORD:-EKYvccPcharP}"

echo "🚀 Starting complete database setup..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    echo "Download: https://www.postgresql.org/download/"
    exit 1
fi

# Get PostgreSQL password
read -sp "Enter PostgreSQL password for user '$DB_USER': " DB_PASSWORD
echo ""
export PGPASSWORD="$DB_PASSWORD"

echo ""
echo "📦 Step 1: Creating database '$DB_NAME'..."

# Check if database exists
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to recreate it? (y/n): " response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        echo "Dropping existing database..."
        dropdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "❌ Failed to drop database"
            exit 1
        fi
    else
        echo "Skipping database creation..."
    fi
fi

# Create database if it doesn't exist
if ! psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
    if [ $? -eq 0 ]; then
        echo "✅ Database '$DB_NAME' created successfully"
    else
        echo "❌ Failed to create database"
        exit 1
    fi
fi

echo ""
echo "👤 Step 2: Creating user '$NEW_USER'..."

# Create user
CREATE_USER_SQL=$(cat <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$NEW_USER') THEN
        CREATE USER $NEW_USER WITH PASSWORD '$NEW_PASSWORD';
        RAISE NOTICE 'User $NEW_USER created successfully';
    ELSE
        RAISE NOTICE 'User $NEW_USER already exists';
    END IF;
END
\$\$;
EOF
)

echo "$CREATE_USER_SQL" | psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ User '$NEW_USER' created successfully"
else
    echo "⚠️  User might already exist or error occurred"
fi

echo ""
echo "🔐 Step 3: Granting permissions..."

# Grant permissions
GRANT_SQL=$(cat <<EOF
GRANT CONNECT ON DATABASE $DB_NAME TO $NEW_USER;
GRANT USAGE ON SCHEMA public TO $NEW_USER;
GRANT CREATE ON SCHEMA public TO $NEW_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $NEW_USER;
EOF
)

echo "$GRANT_SQL" | psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Permissions granted successfully"
else
    echo "❌ Failed to grant permissions"
    exit 1
fi

echo ""
echo "🔄 Step 4: Running migrations..."

# Get project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_PATH="$PROJECT_ROOT/shared/database/migrations"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_PATH" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_PATH"
    exit 1
fi

# Run migrations in order
MIGRATIONS=(
    "001_initial_schema.sql"
    "002_add_indexes.sql"
    "044_cms_integration.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    MIGRATION_FILE="$MIGRATIONS_PATH/$migration"
    if [ -f "$MIGRATION_FILE" ]; then
        echo "  Running migration: $migration..."
        psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$MIGRATION_FILE" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "  ✅ $migration completed"
        else
            echo "  ❌ $migration failed"
            read -p "  Continue anyway? (y/n): " continue_response
            if [ "$continue_response" != "y" ] && [ "$continue_response" != "Y" ]; then
                exit 1
            fi
        fi
    else
        echo "  ⚠️  Migration file not found: $migration"
    fi
done

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Connection Information:"
echo "   Database: $DB_NAME"
echo "   User: $NEW_USER"
echo "   Password: $NEW_PASSWORD"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://$NEW_USER:$NEW_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Clean up
unset PGPASSWORD





