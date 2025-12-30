# Check Users Table Schema - Fixed
# Đọc password từ .env.local

$ErrorActionPreference = "Stop"

Write-Host "[CHECK] Checking users table schema..." -ForegroundColor Cyan
Write-Host ""

# Read DB_PASSWORD from .env.local
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

if (-not (Test-Path $cmsBackendEnv)) {
    Write-Host "[ERROR] .env.local not found!" -ForegroundColor Red
    exit 1
}

$DBPassword = ""
$lines = Get-Content $cmsBackendEnv
foreach ($line in $lines) {
    if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -match "^\s*DB_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
        $DBPassword = $matches[1].Trim()
        break
    }
}

if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Host "[ERROR] DB_PASSWORD not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Using DB_PASSWORD from .env.local" -ForegroundColor Green
$env:PGPASSWORD = $DBPassword

Write-Host ""
Write-Host "Columns in users table:" -ForegroundColor Yellow
psql -U inlandv_user -d inlandv_realestate -c "
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
"

$env:PGPASSWORD = $null





















