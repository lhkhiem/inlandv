# Test Database and Create Demo User
# Kiểm tra và tạo demo user

$ErrorActionPreference = "Stop"

Write-Host "[TEST] Testing database connection and creating demo user..." -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "EKYvccPcharP"
$DbName = "inlandv_realestate"
$DemoEmail = "demo@inland.com"

# Test connection
Write-Host "[STEP 1] Testing database connection..." -ForegroundColor Yellow
$testResult = psql -U inlandv_user -d $DbName -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Cannot connect to database" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Database connection successful" -ForegroundColor Green

# Check if users table exists
Write-Host ""
Write-Host "[STEP 2] Checking users table..." -ForegroundColor Yellow
$tableCheck = psql -U inlandv_user -d $DbName -c "\d users" 2>&1 | Select-String -Pattern "users"
if (-not $tableCheck) {
    Write-Host "[ERROR] Users table not found!" -ForegroundColor Red
    Write-Host "  Please run migration first" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Users table exists" -ForegroundColor Green

# Check if demo user exists
Write-Host ""
Write-Host "[STEP 3] Checking if demo user exists..." -ForegroundColor Yellow
$existingUser = psql -U inlandv_user -d $DbName -c "SELECT email FROM users WHERE email = '$DemoEmail';" 2>&1 | Select-String -Pattern $DemoEmail
if ($existingUser) {
    Write-Host "[INFO] Demo user already exists" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Demo Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: $DemoEmail" -ForegroundColor White
    Write-Host "  Password: demo123" -ForegroundColor White
    Write-Host ""
    Write-Host "To recreate, delete first:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup\delete-demo-user-api.ps1" -ForegroundColor Cyan
    exit 0
}

# Create demo user using Node.js
Write-Host ""
Write-Host "[STEP 4] Creating demo user..." -ForegroundColor Yellow

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"

if (-not (Test-Path (Join-Path $cmsBackendPath "node_modules"))) {
    Write-Host "[ERROR] Dependencies not installed" -ForegroundColor Red
    Write-Host "  Run: cd projects\cms-backend && npm install" -ForegroundColor Yellow
    exit 1
}

Set-Location $cmsBackendPath

# Run the script
Write-Host "  Running Node.js script..." -ForegroundColor Cyan
npx ts-node src/scripts/create-demo-user.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Demo user created!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
    Write-Host "  Check the error above" -ForegroundColor Yellow
    exit 1
}

Set-Location $projectRoot
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Email: demo@inland.com" -ForegroundColor White
Write-Host "  Password: demo123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan





