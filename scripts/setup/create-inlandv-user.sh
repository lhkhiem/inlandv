#!/bin/bash

# ============================================
# Create InlandV Database User (Bash)
# ============================================
# Tạo user PostgreSQL: inlandv_user
# Password: EKYvccPcharP

DB_NAME="${DB_NAME:-inlandv_realestate}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

NEW_USER="inlandv_user"
NEW_PASSWORD="EKYvccPcharP"

echo "🔧 Creating PostgreSQL user: $NEW_USER"

# SQL commands
SQL_COMMANDS=$(cat <<EOF
-- Check if user exists and create if not
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

-- Grant permissions
GRANT CONNECT ON DATABASE $DB_NAME TO $NEW_USER;
GRANT USAGE ON SCHEMA public TO $NEW_USER;
GRANT CREATE ON SCHEMA public TO $NEW_USER;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $NEW_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $NEW_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $NEW_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO $NEW_USER;
EOF
)

# Execute SQL
echo "$SQL_COMMANDS" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ User $NEW_USER created successfully!"
    echo "   Username: $NEW_USER"
    echo "   Password: $NEW_PASSWORD"
    echo "   Database: $DB_NAME"
    echo ""
    echo "📝 Connection string example:"
    echo "   postgresql://$NEW_USER:$NEW_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
else
    echo "❌ Failed to create user"
    exit 1
fi

