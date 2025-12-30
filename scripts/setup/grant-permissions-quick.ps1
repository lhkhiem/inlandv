# Grant Permissions - Quick Version
# Sử dụng DB_PASSWORD từ .env.local làm postgres password

$ErrorActionPreference = "Stop"

Write-Host "[PERMISSIONS] Granting full permissions..." -ForegroundColor Cyan
Write-Host ""

# Read DB_PASSWORD from .env.local
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

if (-not (Test-Path $cmsBackendEnv)) {
    Write-Host "[ERROR] .env.local not found at: $cmsBackendEnv" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Reading .env.local..." -ForegroundColor Yellow
$PostgresPassword = ""

# Read line by line
$lines = Get-Content $cmsBackendEnv
foreach ($line in $lines) {
    # Skip comments and empty lines
    if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }
    # Match DB_PASSWORD=value
    if ($line -match "^\s*DB_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
        $PostgresPassword = $matches[1].Trim()
        Write-Host "[OK] Found DB_PASSWORD: $PostgresPassword" -ForegroundColor Green
        break
    }
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[ERROR] DB_PASSWORD not found in .env.local" -ForegroundColor Red
    Write-Host "  Please check your .env.local file" -ForegroundColor Yellow
    exit 1
}

# Note: DB_PASSWORD is for inlandv_user, but we need postgres password
# Try using DB_PASSWORD as postgres password (might be the same)
Write-Host "[INFO] Using DB_PASSWORD as postgres password..." -ForegroundColor Yellow
Write-Host "[WARN] If this fails, postgres password might be different" -ForegroundColor Yellow
Write-Host ""

$env:PGPASSWORD = $PostgresPassword
$DbName = "inlandv_realestate"
$DbUser = "inlandv_user"

# Test connection
Write-Host "[TEST] Testing postgres connection..." -ForegroundColor Yellow
$testResult = psql -U postgres -d $DbName -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Password authentication failed!" -ForegroundColor Red
    Write-Host "  DB_PASSWORD ($PostgresPassword) is not the postgres password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run with postgres password:" -ForegroundColor Cyan
    Write-Host "  .\scripts\setup\grant-full-permissions-interactive.ps1" -ForegroundColor White
    $env:PGPASSWORD = $null
    exit 1
}

Write-Host "[OK] Connection successful" -ForegroundColor Green
Write-Host ""

# Grant permissions
Write-Host "[STEP 1] Database privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT CONNECT, CREATE ON DATABASE $DbName TO $DbUser;" 2>&1 | Out-Null

Write-Host "[STEP 2] Schema privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT USAGE, CREATE ON SCHEMA public TO $DbUser;" 2>&1 | Out-Null

Write-Host "[STEP 3] Table privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null

Write-Host "[STEP 4] Sequence privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null

Write-Host "[STEP 5] Function privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null

Write-Host "[STEP 6] Default privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DbUser;" 2>&1 | Out-Null
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DbUser;" 2>&1 | Out-Null
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO $DbUser;" 2>&1 | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Full permissions granted!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now create demo user:" -ForegroundColor Cyan
Write-Host "  cd projects\cms-backend" -ForegroundColor White
Write-Host "  npx ts-node src/scripts/create-demo-user.ts" -ForegroundColor White

$env:PGPASSWORD = $null





















