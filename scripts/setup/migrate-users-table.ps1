# Migrate Users Table - Add Missing Columns
# Chạy migration để thêm các cột còn thiếu vào bảng users

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATE USERS TABLE" -ForegroundColor Cyan
Write-Host "  Thêm các cột còn thiếu" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read POSTGRES_PASSWORD
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

if (-not (Test-Path $cmsBackendEnv)) {
    Write-Host "[ERROR] .env.local not found!" -ForegroundColor Red
    exit 1
}

$PostgresPassword = ""
$lines = Get-Content $cmsBackendEnv
foreach ($line in $lines) {
    if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -match "^\s*POSTGRES_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
        $PostgresPassword = $matches[1].Trim()
        break
    }
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[ERROR] POSTGRES_PASSWORD not found!" -ForegroundColor Red
    exit 1
}

$env:PGPASSWORD = $PostgresPassword
$migrationPath = Join-Path $projectRoot "shared\database\migrations\045_update_users_table.sql"

Write-Host "[STEP 1] Running migration..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (-not (Test-Path $migrationPath)) {
    Write-Host "[ERROR] Migration file not found: $migrationPath" -ForegroundColor Red
    exit 1
}

psql -U postgres -d inlandv_realestate -f $migrationPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Migration completed" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Migration failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[STEP 2] Verifying columns..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$columns = psql -U postgres -d inlandv_realestate -c "
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
" 2>&1

Write-Host $columns

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Users table updated!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now create demo user:" -ForegroundColor Cyan
Write-Host "  cd projects\cms-backend" -ForegroundColor White
Write-Host "  npx ts-node src/scripts/create-demo-user.ts" -ForegroundColor White

$env:PGPASSWORD = $null





