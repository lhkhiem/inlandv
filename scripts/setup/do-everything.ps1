# Do Everything - Cấp quyền và tạo demo user
# Chạy tất cả trong một lần

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CẤP QUYỀN VÀ TẠO DEMO USER" -ForegroundColor Cyan
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

Write-Host "[OK] Found POSTGRES_PASSWORD" -ForegroundColor Green
$env:PGPASSWORD = $PostgresPassword

# Step 1: Grant permissions
Write-Host ""
Write-Host "[STEP 1] Cấp quyền cho inlandv_user..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$commands = @(
    "GRANT CONNECT, CREATE ON DATABASE inlandv_realestate TO inlandv_user;",
    "GRANT USAGE, CREATE ON SCHEMA public TO inlandv_user;",
    "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO inlandv_user;",
    "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;",
    "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO inlandv_user;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO inlandv_user;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO inlandv_user;",
    "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO inlandv_user;"
)

foreach ($cmd in $commands) {
    $result = psql -U postgres -d inlandv_realestate -c $cmd 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [WARN] Command may have failed" -ForegroundColor Yellow
    }
}

Write-Host "  [OK] Quyền đã được cấp" -ForegroundColor Green

# Step 2: Create demo user
Write-Host ""
Write-Host "[STEP 2] Tạo demo user..." -ForegroundColor Yellow
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
    Write-Host "[ERROR] Không tạo được demo user" -ForegroundColor Red
}

Set-Location $projectRoot
$env:PGPASSWORD = $null





















