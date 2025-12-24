# ============================================
# Complete Setup Script - Tạo User, Database và Migration
# ============================================
# Script này sẽ:
# 1. Tạo database inlandv_realestate
# 2. Tạo user inlandv_user với password EKYvccPcharP
# 3. Cấp quyền cho user
# 4. Chạy tất cả migrations

param(
    [string]$DbName = "inlandv_realestate",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$NewUser = "inlandv_user",
    [string]$NewPassword = "EKYvccPcharP"
)

Write-Host "[START] Starting complete database setup..." -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "[ERROR] PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Get PostgreSQL password
$DbPassword = Read-Host "Enter PostgreSQL password for user '$DbUser'" -AsSecureString
$DbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword)
)
$env:PGPASSWORD = $DbPasswordPlain

Write-Host ""
Write-Host "[STEP 1] Creating database '$DbName'..." -ForegroundColor Yellow

# Check if database exists
$dbExists = psql -U $DbUser -h $DbHost -p $DbPort -lqt 2>$null | Select-String -Pattern $DbName
if ($dbExists) {
    Write-Host "[WARN] Database '$DbName' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        dropdb -U $DbUser -h $DbHost -p $DbPort $DbName 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to drop database" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Skipping database creation..." -ForegroundColor Yellow
    }
}

# Create database if it doesn't exist
if (-not $dbExists -or ($response -eq "y" -or $response -eq "Y")) {
    createdb -U $DbUser -h $DbHost -p $DbPort $DbName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database '$DbName' created successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create database" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[STEP 2] Creating user '$NewUser'..." -ForegroundColor Yellow

# Create user
$createUserSQL = @"
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
"@

$createUserSQL | psql -U $DbUser -h $DbHost -p $DbPort -d postgres 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] User '$NewUser' created successfully" -ForegroundColor Green
} else {
    Write-Host "[WARN] User might already exist or error occurred" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[STEP 3] Granting permissions..." -ForegroundColor Yellow

# Grant permissions
$grantSQL = @"
GRANT CONNECT ON DATABASE $DbName TO $NewUser;
GRANT USAGE ON SCHEMA public TO $NewUser;
GRANT CREATE ON SCHEMA public TO $NewUser;
GRANT ALL PRIVILEGES ON DATABASE $DbName TO $NewUser;
"@

$grantSQL | psql -U $DbUser -h $DbHost -p $DbPort -d $DbName 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Permissions granted successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to grant permissions" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[STEP 4] Running migrations..." -ForegroundColor Yellow

# Get project root directory
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$migrationsPath = Join-Path $projectRoot "shared\database\migrations"

# Check if migrations directory exists
if (-not (Test-Path $migrationsPath)) {
    Write-Host "[ERROR] Migrations directory not found: $migrationsPath" -ForegroundColor Red
    exit 1
}

# Run migrations in order
$migrations = @(
    "001_initial_schema.sql",
    "002_add_indexes.sql",
    "044_cms_integration.sql"
)

foreach ($migration in $migrations) {
    $migrationFile = Join-Path $migrationsPath $migration
    if (Test-Path $migrationFile) {
        Write-Host "  Running migration: $migration..." -ForegroundColor Cyan
        Get-Content $migrationFile | psql -U $DbUser -h $DbHost -p $DbPort -d $DbName 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $migration completed" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] $migration failed" -ForegroundColor Red
            Write-Host "  Continue anyway? (y/n)" -ForegroundColor Yellow
            $continue = Read-Host
            if ($continue -ne "y" -and $continue -ne "Y") {
                exit 1
            }
        }
    } else {
        Write-Host "  [WARN] Migration file not found: $migration" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[SUCCESS] Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Connection Information:" -ForegroundColor Cyan
Write-Host "   Database: $DbName" -ForegroundColor Yellow
Write-Host "   User: $NewUser" -ForegroundColor Yellow
Write-Host "   Password: $NewPassword" -ForegroundColor Yellow
Write-Host "   Host: $DbHost" -ForegroundColor Yellow
Write-Host "   Port: $DbPort" -ForegroundColor Yellow
Write-Host ""
Write-Host "[INFO] Connection String:" -ForegroundColor Cyan
Write-Host "   postgresql://$NewUser`:$NewPassword@$DbHost`:$DbPort/$DbName" -ForegroundColor Yellow
Write-Host ""

# Clean up
Remove-Variable DbPasswordPlain -ErrorAction SilentlyContinue
$env:PGPASSWORD = $null

