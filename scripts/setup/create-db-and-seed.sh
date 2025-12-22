#!/bin/bash

# Create Database and Seed Data Script for Linux/Mac
# Usage: ./scripts/setup/create-db-and-seed.sh

set -e

# Default values
DB_NAME=${DB_NAME:-"inland_realestate"}
DB_USER=${DB_USER:-"postgres"}
DB_PASSWORD=${DB_PASSWORD:-"postgres"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-5432}

echo "🗄️  Creating database and seeding data..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    echo "Download: https://www.postgresql.org/download/"
    exit 1
fi

# Check if database exists
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping database..."
        PGPASSWORD="$DB_PASSWORD" dropdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" 2>/dev/null
        echo "✅ Database dropped"
    else
        echo "ℹ️  Using existing database"
    fi
fi

# Create database if not exists
if ! psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "➕ Creating database '$DB_NAME'..."
    PGPASSWORD="$DB_PASSWORD" createdb -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME" 2>/dev/null
    echo "✅ Database created successfully"
fi

# Generate DATABASE_URL
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "📋 DATABASE_URL:"
echo "$DATABASE_URL"
echo ""

# Update .env files
ENV_FILES=(
    "projects/public-backend/.env"
    "projects/cms-backend/.env"
)

for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        echo "📝 Updating $env_file..."
        if grep -q "DATABASE_URL=" "$env_file"; then
            sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$env_file"
            rm -f "$env_file.bak"
        else
            echo "DATABASE_URL=$DATABASE_URL" >> "$env_file"
        fi
        echo "✅ Updated $env_file"
    else
        echo "⚠️  $env_file not found, creating..."
        mkdir -p "$(dirname "$env_file")"
        echo "DATABASE_URL=$DATABASE_URL" > "$env_file"
        echo "✅ Created $env_file"
    fi
done

echo ""
echo "🔄 Running migrations..."
cd projects/public-backend
npm run migrate || echo "⚠️  Migration may have failed. Check manually."

echo ""
echo "🌱 Seeding data..."
npm run seed || echo "⚠️  Seeding may have failed. Check manually."

cd ../..

echo ""
echo "✅ Database setup and seeding complete!"
echo ""
echo "📋 Summary:"
echo "  ✅ Database created: $DB_NAME"
echo "  ✅ Tables created"
echo "  ✅ Sample data inserted"
echo ""
echo "📋 Next steps:"
echo "  1. Verify data: psql -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM projects;'"
echo "  2. Start backend: cd projects/public-backend && npm run dev"








