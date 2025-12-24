# Run CMS Migration
# Chạy migration CMS integration

param(
    [string]$PostgresPassword = "",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "inlandv_realestate"
)

$ErrorActionPreference = "Stop"

Write-Host "[MIGRATION] Running CMS integration migration..." -ForegroundColor Cyan

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

# If still no password, try default or ask
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[WARN] Password not found in .env.local" -ForegroundColor Yellow
    $PostgresPassword = Read-Host "Enter PostgreSQL password (or press Enter for 'postgres')"
    if ([string]::IsNullOrEmpty($PostgresPassword)) {
        $PostgresPassword = "postgres"
    }
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

    # Check if CMS tables already exist
    Write-Host "[STEP 2] Checking if CMS tables exist..." -ForegroundColor Yellow
    $tablesCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata"
    if ($tablesCheck) {
        Write-Host "[INFO] CMS tables already exist" -ForegroundColor Yellow
        $response = Read-Host "Do you want to run migration anyway? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "[SKIP] Migration skipped" -ForegroundColor Yellow
            exit 0
        }
    }

    # Run migration
    Write-Host "[STEP 3] Running migration 044_cms_integration.sql..." -ForegroundColor Yellow
    $migrationPath = Join-Path $projectRoot "shared\database\migrations\044_cms_integration.sql"
    
    if (-not (Test-Path $migrationPath)) {
        Write-Host "[ERROR] Migration file not found: $migrationPath" -ForegroundColor Red
        exit 1
    }

    psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Migration completed successfully!" -ForegroundColor Green
        
        # Verify tables were created
        Write-Host "[STEP 4] Verifying tables..." -ForegroundColor Yellow
        $verifyCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata"
        if ($verifyCheck) {
            Write-Host "[OK] CMS tables verified" -ForegroundColor Green
        } else {
            Write-Host "[WARN] Tables may not have been created. Please check manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ERROR] Migration failed" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[DONE] Migration process completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan





