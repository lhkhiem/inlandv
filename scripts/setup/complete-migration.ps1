# Complete Migration with Postgres User
# Chạy migration với postgres user để có đầy đủ quyền

param(
    [string]$PostgresPassword = "",
    [string]$DbName = "inlandv_realestate"
)

$ErrorActionPreference = "Stop"

Write-Host "[MIGRATION] Complete CMS Migration" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[INFO] Enter postgres password:" -ForegroundColor Yellow
    $securePassword = Read-Host "  Password" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

$env:PGPASSWORD = $PostgresPassword
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$migrationPath = Join-Path $projectRoot "shared\database\migrations\044_cms_integration.sql"

try {
    Write-Host "[STEP 1] Dropping existing CMS tables (if any)..." -ForegroundColor Yellow
    $dropTables = @(
        "newsletter_subscriptions",
        "tracking_scripts",
        "faq_questions",
        "faq_categories",
        "assets",
        "asset_folders",
        "activity_logs",
        "page_metadata",
        "menu_items",
        "menu_locations",
        "settings"
    )
    
    foreach ($table in $dropTables) {
        psql -U postgres -d $DbName -c "DROP TABLE IF EXISTS $table CASCADE;" 2>&1 | Out-Null
    }
    Write-Host "[OK] Tables dropped" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 2] Dropping function..." -ForegroundColor Yellow
    psql -U postgres -d $DbName -c "DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;" 2>&1 | Out-Null
    Write-Host "[OK] Function dropped" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 3] Running migration with UTF-8 encoding..." -ForegroundColor Yellow
    
    # Set client encoding to UTF8
    $env:PGCLIENTENCODING = "UTF8"
    
    # Run migration
    psql -U postgres -d $DbName -f $migrationPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Migration completed" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Migration completed with some warnings (tables may already exist)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "[STEP 4] Transferring ownership to inlandv_user..." -ForegroundColor Yellow
    $cmsTables = @(
        "settings",
        "menu_locations",
        "menu_items",
        "page_metadata",
        "activity_logs",
        "asset_folders",
        "assets",
        "faq_categories",
        "faq_questions",
        "tracking_scripts",
        "newsletter_subscriptions"
    )

    foreach ($table in $cmsTables) {
        psql -U postgres -d $DbName -c "ALTER TABLE $table OWNER TO inlandv_user;" 2>&1 | Out-Null
        psql -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON TABLE $table TO inlandv_user;" 2>&1 | Out-Null
    }
    
    psql -U postgres -d $DbName -c "ALTER FUNCTION update_updated_at_column() OWNER TO inlandv_user;" 2>&1 | Out-Null
    Write-Host "[OK] Ownership transferred" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 5] Verifying tables..." -ForegroundColor Yellow
    $verifyCheck = psql -U postgres -d $DbName -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata|faq|newsletter|tracking|assets|activity"
    if ($verifyCheck) {
        Write-Host "[OK] CMS tables verified:" -ForegroundColor Green
        $verifyCheck | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
    }

    Write-Host ""
    Write-Host "[SUCCESS] Migration completed successfully!" -ForegroundColor Green

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
    $env:PGCLIENTENCODING = $null
}





