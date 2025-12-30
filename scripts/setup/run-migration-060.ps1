# Run Migration 060: Add has_factory to industrial_parks
# Chạy migration để thêm trường has_factory vào bảng industrial_parks

param(
    [string]$PostgresPassword = "",
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "inlandv_realestate"
)

$ErrorActionPreference = "Stop"

Write-Host "[MIGRATION] Running migration 060: Add has_factory to industrial_parks..." -ForegroundColor Cyan

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Try to read password from .env.local if not provided
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $backendEnv = Join-Path $projectRoot "projects\inlandv-backend\.env.local"
    if (Test-Path $backendEnv) {
        Write-Host "[INFO] Reading database config from .env.local..." -ForegroundColor Yellow
        $envContent = Get-Content $backendEnv -Raw
        
        # Try to extract from DATABASE_URL
        if ($envContent -match "DATABASE_URL=postgresql://[^:]+:([^@]+)@") {
            $PostgresPassword = $matches[1].Trim()
            Write-Host "[INFO] Found password in DATABASE_URL" -ForegroundColor Green
        }
    }
}

# If still no password, ask user
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[WARN] Password not found in .env.local" -ForegroundColor Yellow
    $SecurePassword = Read-Host "Enter PostgreSQL password for user $DbUser" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    $PostgresPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
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

    # Check if column already exists
    Write-Host "[STEP 2] Checking if has_factory column exists..." -ForegroundColor Yellow
    $columnCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -t -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'industrial_parks' AND column_name = 'has_factory';" 2>&1
    if ($columnCheck -match "has_factory") {
        Write-Host "[INFO] Column 'has_factory' already exists" -ForegroundColor Yellow
        $response = Read-Host "Do you want to run migration anyway? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "[SKIP] Migration skipped" -ForegroundColor Yellow
            exit 0
        }
    }

    # Run migration
    Write-Host "[STEP 3] Running migration 060_add_has_factory_to_industrial_parks.sql..." -ForegroundColor Yellow
    $migrationPath = Join-Path $projectRoot "shared\database\migrations\060_add_has_factory_to_industrial_parks.sql"
    
    if (-not (Test-Path $migrationPath)) {
        Write-Host "[ERROR] Migration file not found: $migrationPath" -ForegroundColor Red
        exit 1
    }

    Write-Host "Migration file: $migrationPath" -ForegroundColor Green
    $result = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Migration completed successfully!" -ForegroundColor Green
        
        # Verify column was created
        Write-Host "[STEP 4] Verifying column..." -ForegroundColor Yellow
        $verifyCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -t -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'industrial_parks' AND column_name = 'has_factory';" 2>&1
        if ($verifyCheck -match "has_factory") {
            Write-Host "[OK] Column 'has_factory' verified" -ForegroundColor Green
            Write-Host $verifyCheck -ForegroundColor White
        } else {
            Write-Host "[WARN] Column may not have been created. Please check manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ERROR] Migration failed" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
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
















