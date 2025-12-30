# Run Products Migration and Seed Data
# Usage: .\scripts\run-products-migration.ps1

param(
    [string]$DbUser = "postgres",
    [string]$DbPassword = "",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "inlandv_realestate"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Products Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get project root (assuming script is in scripts/ folder)
$scriptPath = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptPath)) {
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
}
$projectRoot = Split-Path -Parent $scriptPath

# Try to read password from .env files
$PostgresPassword = $DbPassword
$envFiles = @(
    "$projectRoot\projects\cms-backend\.env.local",
    "$projectRoot\projects\cms-backend\.env",
    "$projectRoot\projects\inlandv-backend\.env.local",
    "$projectRoot\projects\inlandv-backend\.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "[INFO] Reading database config from $envFile..." -ForegroundColor Yellow
        $envContent = Get-Content $envFile -Raw
        
        # Try to extract DB_PASSWORD
        if ($envContent -match "DB_PASSWORD=(.+)") {
            $PostgresPassword = $matches[1].Trim()
            Write-Host "[INFO] Found DB_PASSWORD" -ForegroundColor Green
            break
        }
        # Try to extract from DATABASE_URL
        elseif ($envContent -match "DATABASE_URL=postgresql://[^:]+:([^@]+)@") {
            $PostgresPassword = $matches[1].Trim()
            Write-Host "[INFO] Found password in DATABASE_URL" -ForegroundColor Green
            break
        }
    }
}

# If still no password, use default or exit
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[WARN] Password not found. Trying default 'postgres'..." -ForegroundColor Yellow
    $PostgresPassword = "postgres"
    Write-Host "[INFO] If this fails, run: .\scripts\run-products-migration.ps1 -DbPassword 'your_password'" -ForegroundColor Yellow
}

# Set password for psql
$env:PGPASSWORD = $PostgresPassword

# Migration file path
$migrationFile = "$projectRoot\shared\database\migrations\068_create_products_table.sql"
$seedFile = "$projectRoot\shared\database\seeds\products_seed.sql"

# Check if files exist
if (-not (Test-Path $migrationFile)) {
    Write-Host "[ERROR] Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $seedFile)) {
    Write-Host "[ERROR] Seed file not found: $seedFile" -ForegroundColor Red
    exit 1
}

# Run migration
Write-Host ""
Write-Host "Running migration: 068_create_products_table.sql" -ForegroundColor Yellow
try {
    $migrationResult = & psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Migration failed:" -ForegroundColor Red
        Write-Host $migrationResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error running migration: $_" -ForegroundColor Red
    exit 1
}

# Run seed data
Write-Host ""
Write-Host "Running seed data: products_seed.sql" -ForegroundColor Yellow
try {
    $seedResult = & psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $seedFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Seed data completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Seed data failed:" -ForegroundColor Red
        Write-Host $seedResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error running seed data: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All done! Products table created and seeded." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Verify
Write-Host ""
Write-Host "Verifying products table..." -ForegroundColor Yellow
$verifyResult = & psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "SELECT COUNT(*) as count FROM products;" 2>&1
Write-Host $verifyResult

