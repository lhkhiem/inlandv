# Script to seed industrial parks data
# This script runs the industrial_parks_seed.sql file

param(
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = $env:DB_NAME,
    [string]$DbUser = $env:DB_USER,
    [string]$DbPassword = $env:DB_PASSWORD
)

# Load environment variables from .env.local if exists
$envLocalPath = Join-Path $PSScriptRoot "..\..\.env.local"
if (Test-Path $envLocalPath) {
    Get-Content $envLocalPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

# Use environment variables if not provided as parameters
if (-not $DbName) { $DbName = $env:DB_NAME }
if (-not $DbUser) { $DbUser = $env:DB_USER }
if (-not $DbPassword) { $DbPassword = $env:DB_PASSWORD }

# Default values if still not set
if (-not $DbName) { $DbName = "inlandv_realestate" }
if (-not $DbUser) { $DbUser = "postgres" }
if (-not $DbPassword) { $DbPassword = "postgres" }

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Seeding Industrial Parks Data" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Database: $DbName" -ForegroundColor Yellow
Write-Host "Host: $DbHost" -ForegroundColor Yellow
Write-Host "User: $DbUser" -ForegroundColor Yellow
Write-Host ""

# Path to seed file
$seedFile = Join-Path $PSScriptRoot "..\..\shared\database\seeds\industrial_parks_seed.sql"

if (-not (Test-Path $seedFile)) {
    Write-Host "Error: Seed file not found at $seedFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading seed file: $seedFile" -ForegroundColor Green
$sqlContent = Get-Content $seedFile -Raw

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "Error: psql command not found. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "You can install it from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $DbPassword

# Build connection string
$connectionString = "host=$DbHost port=$DbPort dbname=$DbName user=$DbUser"

Write-Host "Connecting to database..." -ForegroundColor Green
Write-Host ""

try {
    # Execute SQL file
    $sqlContent | & psql $connectionString
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "✓ Industrial parks data seeded successfully!" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Error: Failed to seed data. Exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

