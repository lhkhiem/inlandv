# Fix Table Ownership
# Chuyển ownership của các CMS tables từ postgres sang inlandv_user

param(
    [string]$PostgresPassword = "",
    [string]$DbName = "inlandv_realestate",
    [string]$NewOwner = "inlandv_user"
)

$ErrorActionPreference = "Stop"

Write-Host "[FIX] Fixing table ownership..." -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[INFO] Enter postgres password (to transfer ownership):" -ForegroundColor Yellow
    $securePassword = Read-Host "  Password" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

$env:PGPASSWORD = $PostgresPassword

try {
    # List of CMS tables
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

    Write-Host "[STEP 1] Transferring table ownership..." -ForegroundColor Yellow
    foreach ($table in $cmsTables) {
        Write-Host "  Transferring $table..." -ForegroundColor Cyan
        $sql = "ALTER TABLE $table OWNER TO $NewOwner;"
        psql -U postgres -d $DbName -c $sql 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    [OK] $table" -ForegroundColor Green
        } else {
            Write-Host "    [WARN] $table - may not exist" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "[STEP 2] Transferring function ownership..." -ForegroundColor Yellow
    $sql = "ALTER FUNCTION update_updated_at_column() OWNER TO $NewOwner;"
    psql -U postgres -d $DbName -c $sql 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Function ownership transferred" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "[STEP 3] Granting all privileges..." -ForegroundColor Yellow
    foreach ($table in $cmsTables) {
        $sql = "GRANT ALL PRIVILEGES ON TABLE $table TO $NewOwner;"
        psql -U postgres -d $DbName -c $sql 2>&1 | Out-Null
    }
    Write-Host "  [OK] Privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[SUCCESS] Ownership fixed!" -ForegroundColor Green
    Write-Host "  All CMS tables now owned by: $NewOwner" -ForegroundColor Cyan

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}





















