# ============================================
# Create InlandV Database User (PowerShell)
# ============================================
# Tạo user PostgreSQL: inlandv_user
# Password: EKYvccPcharP

param(
    [string]$DbName = "inlandv_realestate",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432"
)

$NewUser = "inlandv_user"
$NewPassword = "EKYvccPcharP"

Write-Host "🔧 Creating PostgreSQL user: $NewUser" -ForegroundColor Cyan

# SQL commands
$sqlCommands = @"
-- Check if user exists and create if not
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$NewUser') THEN
        CREATE USER $NewUser WITH PASSWORD '$NewPassword';
        RAISE NOTICE 'User $NewUser created successfully';
    ELSE
        RAISE NOTICE 'User $NewUser already exists';
    END IF;
END
`$`$;

-- Grant permissions
GRANT CONNECT ON DATABASE $DbName TO $NewUser;
GRANT USAGE ON SCHEMA public TO $NewUser;
GRANT CREATE ON SCHEMA public TO $NewUser;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO $NewUser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $NewUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO $NewUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO $NewUser;
"@

try {
    # Execute SQL
    $env:PGPASSWORD = (Read-Host "Enter PostgreSQL password for user $DbUser" -AsSecureString | ConvertFrom-SecureString -AsPlainText)
    
    $sqlCommands | psql -h $DbHost -p $DbPort -U $DbUser -d $DbName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ User $NewUser created successfully!" -ForegroundColor Green
        Write-Host "   Username: $NewUser" -ForegroundColor Yellow
        Write-Host "   Password: $NewPassword" -ForegroundColor Yellow
        Write-Host "   Database: $DbName" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create user" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Connection string example:" -ForegroundColor Cyan
Write-Host "   postgresql://$NewUser`:$NewPassword@$DbHost`:$DbPort/$DbName" -ForegroundColor Yellow

