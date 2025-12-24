# Run All Migrations
# Chạy tất cả các migration theo thứ tự

param(
    [string]$PostgresPassword = "",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "inlandv_realestate"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running All Database Migrations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Try to read password from .env.local if not provided
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"
    if (Test-Path $cmsBackendEnv) {
        Write-Host "[INFO] Reading database config from .env.local..." -ForegroundColor Yellow
        $envContent = Get-Content $cmsBackendEnv -Raw
        
        # Try to extract DB_PASSWORD
        if ($envContent -match "DB_PASSWORD=(.+)") {
            $PostgresPassword = $matches[1].Trim()
            Write-Host "[INFO] Found DB_PASSWORD in .env.local" -ForegroundColor Green
        }
        # Try to extract from DATABASE_URL
        elseif ($envContent -match "DATABASE_URL=postgresql://[^:]+:([^@]+)@") {
            $PostgresPassword = $matches[1].Trim()
            Write-Host "[INFO] Found password in DATABASE_URL" -ForegroundColor Green
        }
    }
}

# If still no password, ask
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[WARN] Password not found in .env.local" -ForegroundColor Yellow
    $SecurePassword = Read-Host "Enter PostgreSQL password for user $DbUser" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    )
}

# Set password for psql
$env:PGPASSWORD = $PostgresPassword

try {
    # Check database connection
    Write-Host "[STEP 1] Checking database connection..." -ForegroundColor Yellow
    $dbCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Cannot connect to database" -ForegroundColor Red
        Write-Host "  Please check:" -ForegroundColor Yellow
        Write-Host "    - PostgreSQL is running" -ForegroundColor White
        Write-Host "    - Database '$DbName' exists" -ForegroundColor White
        Write-Host "    - Password is correct" -ForegroundColor White
        exit 1
    }
    Write-Host "[OK] Database connection OK" -ForegroundColor Green
    Write-Host ""

    # List of migrations to run in order
    $migrations = @(
        @{ File = "001_initial_schema.sql"; Name = "Initial Schema" },
        @{ File = "002_add_indexes.sql"; Name = "Add Indexes" },
        @{ File = "044_cms_integration.sql"; Name = "CMS Integration" },
        @{ File = "045_update_users_table.sql"; Name = "Update Users Table" },
        @{ File = "046_create_industrial_parks.sql"; Name = "Create Industrial Parks" },
        @{ File = "047_create_properties.sql"; Name = "Create Properties" },
        @{ File = "048_add_property_price_fields.sql"; Name = "Add Property Price Fields" },
        @{ File = "049_add_google_maps_link_to_properties.sql"; Name = "Add Google Maps Link to Properties" },
        @{ File = "050_add_video_url_to_industrial_parks.sql"; Name = "Add Video URL to Industrial Parks" },
        @{ File = "051_fix_administrative_units.sql"; Name = "Fix Administrative Units (district -> ward)" },
        @{ File = "add_news_categories.sql"; Name = "Add News Categories" },
        @{ File = "052_create_news_table.sql"; Name = "Create News Table" }
    )

    Write-Host "[STEP 2] Running migrations..." -ForegroundColor Yellow
    Write-Host ""

    foreach ($migration in $migrations) {
        $migrationPath = Join-Path $projectRoot "shared\database\migrations\$($migration.File)"
        
        if (-not (Test-Path $migrationPath)) {
            Write-Host "[WARN] Migration file not found: $($migration.File)" -ForegroundColor Yellow
            Write-Host "  Skipping..." -ForegroundColor Yellow
            continue
        }

        Write-Host "  Running: $($migration.Name)..." -ForegroundColor Cyan
        $result = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationPath 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Completed" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Failed" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            Write-Host ""
            Write-Host "[ERROR] Migration failed: $($migration.Name)" -ForegroundColor Red
            exit 1
        }
    }

    Write-Host ""
    Write-Host "[STEP 3] Verifying tables..." -ForegroundColor Yellow
    
    $verifyQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'projects', 'properties', 'property_images', 
    'property_documents', 'amenities', 'property_amenities',
    'industrial_parks', 'industrial_park_images'
)
ORDER BY table_name;
"@
    
    $verifyResult = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -t -c $verifyQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Created/Verified tables:" -ForegroundColor Green
        $verifyResult | Where-Object { $_.Trim() -ne '' } | ForEach-Object {
            Write-Host "  ✓ $($_.Trim())" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "[SUCCESS] All migrations completed successfully!" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[DONE] Migration process completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

