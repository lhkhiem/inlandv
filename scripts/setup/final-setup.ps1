# Final Setup - Migrate và tạo demo user
# Chạy migration và tạo demo user

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FINAL SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read passwords from .env.local
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

if (-not (Test-Path $cmsBackendEnv)) {
    Write-Host "[ERROR] .env.local not found!" -ForegroundColor Red
    exit 1
}

$PostgresPassword = ""
$DBPassword = ""

$lines = Get-Content $cmsBackendEnv
foreach ($line in $lines) {
    if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -match "^\s*POSTGRES_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
        $PostgresPassword = $matches[1].Trim()
    }
    if ($line -match "^\s*DB_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
        $DBPassword = $matches[1].Trim()
    }
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[ERROR] POSTGRES_PASSWORD not found!" -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Host "[ERROR] DB_PASSWORD not found!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Passwords loaded from .env.local" -ForegroundColor Green
Write-Host ""

# Step 1: Run migration
Write-Host "[STEP 1] Running migration 045..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$env:PGPASSWORD = $PostgresPassword
$migrationPath = Join-Path $projectRoot "shared\database\migrations\045_update_users_table.sql"

if (-not (Test-Path $migrationPath)) {
    Write-Host "[ERROR] Migration file not found!" -ForegroundColor Red
    exit 1
}

# Run migration and capture output
$migrationOutput = psql -U postgres -d inlandv_realestate -f $migrationPath 2>&1 | Out-String

# Check for actual errors (not NOTICE messages)
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Migration completed" -ForegroundColor Green
    # Show NOTICE messages as info
    if ($migrationOutput -match "NOTICE:") {
        Write-Host "  Migration notices:" -ForegroundColor Cyan
        $migrationOutput -split "`n" | Where-Object { $_ -match "NOTICE:" } | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "[ERROR] Migration failed" -ForegroundColor Red
    Write-Host $migrationOutput -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[STEP 2] Verifying columns..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$env:PGPASSWORD = $DBPassword
$columnsOutput = psql -U inlandv_user -d inlandv_realestate -c "
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
" 2>&1 | Out-String

if ($LASTEXITCODE -eq 0) {
    Write-Host $columnsOutput
} else {
    Write-Host "[WARN] Could not verify columns" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[STEP 3] Creating demo user..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"
Set-Location $cmsBackendPath

npx ts-node src/scripts/create-demo-user.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[SUCCESS] Hoàn tất!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Demo Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: demo@inland.com" -ForegroundColor White
    Write-Host "  Password: demo123" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
}

Set-Location $projectRoot
$env:PGPASSWORD = $null

