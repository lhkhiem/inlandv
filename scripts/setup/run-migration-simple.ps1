# Simple Migration Runner
# Chạy migration với password được nhập trực tiếp

$ErrorActionPreference = "Stop"

Write-Host "[MIGRATION] CMS Integration Migration" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$migrationPath = Join-Path $projectRoot "shared\database\migrations\044_cms_integration.sql"

if (-not (Test-Path $migrationPath)) {
    Write-Host "[ERROR] Migration file not found: $migrationPath" -ForegroundColor Red
    exit 1
}

# Get database credentials
Write-Host "Database Configuration:" -ForegroundColor Yellow
$DbUser = Read-Host "  PostgreSQL User (default: postgres)"
if ([string]::IsNullOrEmpty($DbUser)) { $DbUser = "postgres" }

$DbPassword = Read-Host "  PostgreSQL Password" -AsSecureString
$DbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword)
)

$DbName = Read-Host "  Database Name (default: inlandv_realestate)"
if ([string]::IsNullOrEmpty($DbName)) { $DbName = "inlandv_realestate" }

Write-Host ""
Write-Host "[STEP 1] Testing database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $DbPasswordPlain

try {
    $testResult = psql -U $DbUser -h localhost -d $DbName -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Cannot connect to database" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "[STEP 2] Running migration..." -ForegroundColor Yellow
    psql -U $DbUser -h localhost -d $DbName -f $migrationPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Migration completed successfully!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "[STEP 3] Verifying tables..." -ForegroundColor Yellow
        $tables = psql -U $DbUser -h localhost -d $DbName -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata|faq|newsletter|tracking"
        if ($tables) {
            Write-Host "[OK] CMS tables found:" -ForegroundColor Green
            $tables | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
        }
    } else {
        Write-Host "[ERROR] Migration failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
    $DbPasswordPlain = $null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[DONE] Migration process completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan





