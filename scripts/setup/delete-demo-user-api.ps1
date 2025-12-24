# Delete Demo User via Database
# Xóa demo user trực tiếp từ database

param(
    [string]$DbName = "inlandv_realestate",
    [string]$DemoEmail = "demo@inland.com"
)

$ErrorActionPreference = "Stop"

Write-Host "[DELETE] Deleting demo user from database..." -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "EKYvccPcharP"

try {
    # Check if demo user exists
    Write-Host "[STEP 1] Checking if demo user exists..." -ForegroundColor Yellow
    $existingUser = psql -U inlandv_user -d $DbName -c "SELECT email, name FROM users WHERE email = '$DemoEmail';" 2>&1 | Select-String -Pattern $DemoEmail
    
    if (-not $existingUser) {
        Write-Host "[INFO] Demo user not found" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "[INFO] Found demo user: $DemoEmail" -ForegroundColor Cyan
    
    # Delete demo user
    Write-Host "[STEP 2] Deleting user..." -ForegroundColor Yellow
    psql -U inlandv_user -d $DbName -c "DELETE FROM users WHERE email = '$DemoEmail';" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Demo user deleted successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to delete demo user" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "[SUCCESS] Demo user removed!" -ForegroundColor Green





