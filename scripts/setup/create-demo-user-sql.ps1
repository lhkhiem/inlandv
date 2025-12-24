# Create Demo User - SQL Method
# Tạo demo user bằng SQL với bcrypt hash đã tính sẵn

$ErrorActionPreference = "Stop"

Write-Host "[DEMO] Creating demo user via SQL..." -ForegroundColor Cyan
Write-Host ""

# Bcrypt hash for "demo123" (salt rounds: 10)
# This hash is pre-computed for password "demo123"
$bcryptHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

$env:PGPASSWORD = "EKYvccPcharP"
$DbName = "inlandv_realestate"
$DemoEmail = "demo@inland.com"
$DemoName = "Demo User"
$DemoRole = "admin"

try {
    # Check if user exists
    Write-Host "[STEP 1] Checking if demo user exists..." -ForegroundColor Yellow
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

    Write-Host "[OK] User does not exist, proceeding..." -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 2] Creating demo user..." -ForegroundColor Yellow
    
    # Insert demo user
    $insertSQL = @"
INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at)
VALUES (
    '$DemoEmail',
    '$bcryptHash',
    '$DemoName',
    '$DemoRole',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
RETURNING id, email, name, role;
"@

    $result = psql -U inlandv_user -d $DbName -c $insertSQL 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Demo user created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Demo Credentials:" -ForegroundColor Cyan
        Write-Host "  Email: $DemoEmail" -ForegroundColor White
        Write-Host "  Password: demo123" -ForegroundColor White
        Write-Host "  Name: $DemoName" -ForegroundColor White
        Write-Host "  Role: $DemoRole" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📝 Demo credentials are displayed on the login page." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "To delete demo user later, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\setup\delete-demo-user-api.ps1" -ForegroundColor Cyan





