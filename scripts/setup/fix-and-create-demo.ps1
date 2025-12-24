# Fix Permissions and Create Demo User
# Sửa quyền và tạo demo user

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX PERMISSIONS & CREATE DEMO USER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Step 1: Get postgres password
Write-Host "[STEP 1] Database Configuration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$PostgresPassword = ""
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"
if (Test-Path $cmsBackendEnv) {
    $envContent = Get-Content $cmsBackendEnv -Raw
    if ($envContent -match "DB_PASSWORD=(.+)") {
        $PostgresPassword = $matches[1].Trim()
        Write-Host "[OK] Found DB_PASSWORD in .env.local" -ForegroundColor Green
    }
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[INFO] Enter postgres password:" -ForegroundColor Yellow
    $securePassword = Read-Host "  Password" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

$env:PGPASSWORD = $PostgresPassword

# Step 2: Grant permissions
Write-Host ""
Write-Host "[STEP 2] Granting permissions on users table..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    Write-Host "  Granting ALL privileges..." -ForegroundColor Cyan
    psql -U postgres -d inlandv_realestate -c "GRANT ALL PRIVILEGES ON TABLE users TO inlandv_user;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Privileges granted" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] May have failed" -ForegroundColor Yellow
    }

    Write-Host "  Granting sequence privileges..." -ForegroundColor Cyan
    psql -U postgres -d inlandv_realestate -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO inlandv_user;" 2>&1 | Out-Null
    
    Write-Host "  [OK] Sequence privileges granted" -ForegroundColor Green

} catch {
    Write-Host "  [ERROR] Failed to grant permissions" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    $env:PGPASSWORD = $null
    exit 1
}

# Step 3: Create demo user
Write-Host ""
Write-Host "[STEP 3] Creating demo user..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"

if (-not (Test-Path (Join-Path $cmsBackendPath "node_modules"))) {
    Write-Host "[ERROR] Dependencies not installed" -ForegroundColor Red
    Write-Host "  Run: cd projects\cms-backend && npm install" -ForegroundColor Yellow
    $env:PGPASSWORD = $null
    exit 1
}

Set-Location $cmsBackendPath

Write-Host "  Running Node.js script..." -ForegroundColor Cyan
npx ts-node src/scripts/create-demo-user.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Demo user created!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
    Write-Host "  Check the error above" -ForegroundColor Yellow
}

Set-Location $projectRoot
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[DONE] Process completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Email: demo@inland.com" -ForegroundColor White
Write-Host "  Password: demo123" -ForegroundColor White
Write-Host ""





