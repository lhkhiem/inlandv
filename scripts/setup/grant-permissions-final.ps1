# Grant Full Permissions - Final Version
# Đọc POSTGRES_PASSWORD từ .env.local

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GRANT FULL PERMISSIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read POSTGRES_PASSWORD from .env.local
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

if (-not (Test-Path $cmsBackendEnv)) {
    Write-Host "[ERROR] .env.local not found!" -ForegroundColor Red
    Write-Host "  Path: $cmsBackendEnv" -ForegroundColor Yellow
    exit 1
}

Write-Host "[INFO] Reading POSTGRES_PASSWORD from .env.local..." -ForegroundColor Yellow
$PostgresPassword = ""

$lines = Get-Content $cmsBackendEnv
foreach ($line in $lines) {
    # Skip comments and empty lines
    if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) {
        continue
    }
    # Match POSTGRES_PASSWORD=value
    if ($line -match "^\s*POSTGRES_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
        $PostgresPassword = $matches[1].Trim()
        Write-Host "[OK] Found POSTGRES_PASSWORD" -ForegroundColor Green
        break
    }
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[ERROR] POSTGRES_PASSWORD not found in .env.local!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add to projects\cms-backend\.env.local:" -ForegroundColor Yellow
    Write-Host "  POSTGRES_PASSWORD=your_postgres_password" -ForegroundColor White
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host "  POSTGRES_PASSWORD=postgres" -ForegroundColor White
    exit 1
}

# Test password
$env:PGPASSWORD = $PostgresPassword
Write-Host "[TEST] Testing postgres connection..." -ForegroundColor Yellow
$testResult = psql -U postgres -d inlandv_realestate -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Password authentication failed!" -ForegroundColor Red
    Write-Host "  Please check POSTGRES_PASSWORD in .env.local" -ForegroundColor Yellow
    $env:PGPASSWORD = $null
    exit 1
}
Write-Host "[OK] Connection successful" -ForegroundColor Green

$DbName = "inlandv_realestate"
$DbUser = "inlandv_user"

Write-Host ""
Write-Host "[STEP 1] Database privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT CONNECT, CREATE ON DATABASE $DbName TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 2] Schema privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT USAGE, CREATE ON SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 3] Table privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 4] Sequence privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 5] Function privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 6] Default privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DbUser;" 2>&1 | Out-Null
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DbUser;" 2>&1 | Out-Null
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Full permissions granted!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now create demo user:" -ForegroundColor Cyan
Write-Host "  cd projects\cms-backend" -ForegroundColor White
Write-Host "  npx ts-node src/scripts/create-demo-user.ts" -ForegroundColor White

$env:PGPASSWORD = $null





