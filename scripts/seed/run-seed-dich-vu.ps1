# PowerShell script to run seed-dich-vu-page.sql
# This script seeds the dich-vu page with hardcode data from components

$ErrorActionPreference = "Stop"

Write-Host "Seeding dich-vu page with hardcode data..." -ForegroundColor Green

# Get database connection from environment or use defaults
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "inlandv_realestate" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }

# Prompt for password if not in environment
if (-not $env:DB_PASSWORD) {
    $securePassword = Read-Host "Enter database password for user $DB_USER" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
} else {
    $DB_PASSWORD = $env:DB_PASSWORD
}

$scriptPath = Join-Path $PSScriptRoot "seed-dich-vu-page.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: seed-dich-vu-page.sql not found at $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading SQL script: $scriptPath" -ForegroundColor Cyan

try {
    # Read SQL file
    $sqlContent = Get-Content $scriptPath -Raw
    
    # Execute using psql if available
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        Write-Host "Connecting to database: $DB_NAME @ ${DB_HOST}:${DB_PORT}" -ForegroundColor Cyan
        
        $env:PGPASSWORD = $DB_PASSWORD
        $result = $sqlContent | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully seeded dich-vu page!" -ForegroundColor Green
        } else {
            Write-Host "Error running SQL script:" -ForegroundColor Red
            Write-Host $result
            exit 1
        }
    } else {
        Write-Host "psql command not found. Please install PostgreSQL client or run the SQL manually." -ForegroundColor Yellow
        Write-Host "SQL script location: $scriptPath" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can run it manually using:" -ForegroundColor Yellow
        Write-Host "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$scriptPath`"" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Done! The dich-vu page and sections have been seeded." -ForegroundColor Green
