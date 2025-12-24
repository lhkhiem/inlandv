# Check Users Table Schema
# Kiểm tra schema thực tế của bảng users

$ErrorActionPreference = "Stop"

Write-Host "[CHECK] Checking users table schema..." -ForegroundColor Cyan
Write-Host ""

# Read DB_PASSWORD from .env.local
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"
$env:PGPASSWORD = ""

if (Test-Path $cmsBackendEnv) {
    $lines = Get-Content $cmsBackendEnv
    foreach ($line in $lines) {
        if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) { continue }
        if ($line -match "^\s*DB_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
            $env:PGPASSWORD = $matches[1].Trim()
            Write-Host "[INFO] Using DB_PASSWORD from .env.local" -ForegroundColor Green
            break
        }
    }
}

if ([string]::IsNullOrEmpty($env:PGPASSWORD)) {
    $env:PGPASSWORD = "EKYvccPcharP"  # Fallback
}

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

