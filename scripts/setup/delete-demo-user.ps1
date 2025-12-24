# Delete Demo User
# Xóa user demo

param(
    [string]$DbName = "inlandv_realestate",
    [string]$DemoEmail = "demo@inland.com"
)

$ErrorActionPreference = "Stop"

Write-Host "[DELETE] Deleting demo user..." -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "EKYvccPcharP"

try {
    # Check if demo user exists
    $existingUser = psql -U inlandv_user -d $DbName -c "SELECT email FROM users WHERE email = '$DemoEmail';" 2>&1 | Select-String -Pattern $DemoEmail
    
    if (-not $existingUser) {
        Write-Host "[INFO] Demo user not found" -ForegroundColor Yellow
        exit 0
    }
    
    # Delete demo user
    Write-Host "[DELETE] Deleting user: $DemoEmail..." -ForegroundColor Yellow
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





