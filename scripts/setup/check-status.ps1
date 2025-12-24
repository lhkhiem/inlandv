# Check Project Status
# Kiểm tra trạng thái setup của dự án

$ErrorActionPreference = "Continue"

Write-Host "[CHECK] Checking project status..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$allGood = $true

# 1. Check .env.local files
Write-Host "[1] Checking .env.local files..." -ForegroundColor Yellow
$envFiles = @(
    "projects\cms-backend\.env.local",
    "projects\cms-frontend\.env.local",
    "projects\inlandv-backend\.env.local",
    "projects\inlandv-frontend\.env.local"
)

foreach ($file in $envFiles) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allGood = $false
    }
}

# 2. Check node_modules
Write-Host ""
Write-Host "[2] Checking dependencies..." -ForegroundColor Yellow
$projects = @("cms-backend", "cms-frontend", "inlandv-backend", "inlandv-frontend")
foreach ($project in $projects) {
    $nodeModules = Join-Path $projectRoot "projects\$project\node_modules"
    if (Test-Path $nodeModules) {
        Write-Host "  [OK] $project - dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $project - run 'npm install'" -ForegroundColor Yellow
    }
}

# 3. Check database connection
Write-Host ""
Write-Host "[3] Checking database..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "postgres"  # Default, user should update
    $dbCheck = psql -U postgres -h localhost -d inlandv_realestate -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Database connection OK" -ForegroundColor Green
        
        # Check if CMS tables exist
        $tablesCheck = psql -U postgres -h localhost -d inlandv_realestate -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata"
        if ($tablesCheck) {
            Write-Host "  [OK] CMS tables exist" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] CMS tables not found - run migration 044_cms_integration.sql" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [ERROR] Cannot connect to database" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "  [WARN] Could not check database (PostgreSQL may not be running)" -ForegroundColor Yellow
} finally {
    $env:PGPASSWORD = $null
}

# 4. Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "[SUCCESS] Setup looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Install dependencies: npm install in each project" -ForegroundColor White
    Write-Host "  2. Run migration: psql -d inlandv_realestate -f shared\database\migrations\044_cms_integration.sql" -ForegroundColor White
    Write-Host "  3. Start backends: npm run dev" -ForegroundColor White
    Write-Host "  4. Create admin user via API" -ForegroundColor White
} else {
    Write-Host "[WARN] Some issues found. Please fix them first." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan

