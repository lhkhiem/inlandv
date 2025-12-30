# Create Demo User for CMS
# Tạo user demo để test CMS

param(
    [string]$DbName = "inlandv_realestate",
    [string]$DemoEmail = "demo@inland.com",
    [string]$DemoPassword = "demo123",
    [string]$DemoName = "Demo User"
)

$ErrorActionPreference = "Stop"

Write-Host "[DEMO] Creating demo user for CMS..." -ForegroundColor Cyan
Write-Host ""

$env:PGPASSWORD = "EKYvccPcharP"

try {
    # Check if demo user already exists
    Write-Host "[STEP 1] Checking if demo user exists..." -ForegroundColor Yellow
    $existingUser = psql -U inlandv_user -d $DbName -c "SELECT email FROM users WHERE email = '$DemoEmail';" 2>&1 | Select-String -Pattern $DemoEmail
    
    if ($existingUser) {
        Write-Host "[INFO] Demo user already exists" -ForegroundColor Yellow
        $response = Read-Host "  Delete and recreate? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            Write-Host "[DELETE] Deleting existing demo user..." -ForegroundColor Yellow
            psql -U inlandv_user -d $DbName -c "DELETE FROM users WHERE email = '$DemoEmail';" 2>&1 | Out-Null
            Write-Host "[OK] Demo user deleted" -ForegroundColor Green
        } else {
            Write-Host "[SKIP] Keeping existing demo user" -ForegroundColor Yellow
            exit 0
        }
    }

    Write-Host ""
    Write-Host "[STEP 2] Creating demo user..." -ForegroundColor Yellow
    
    # Hash password using bcrypt (need Node.js)
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $hashScript = @"
const bcrypt = require('bcryptjs');
const password = '$DemoPassword';
bcrypt.hash(password, 10).then(hash => {
    console.log(hash);
});
"@
    
    $hashScriptPath = Join-Path $env:TEMP "hash-password.js"
    Set-Content -Path $hashScriptPath -Value $hashScript
    
    # Try to hash password
    $cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"
    if (Test-Path (Join-Path $cmsBackendPath "node_modules")) {
        Set-Location $cmsBackendPath
        $hashedPassword = node $hashScriptPath 2>&1 | Select-Object -Last 1
        Set-Location $projectRoot
        
        if ($hashedPassword -and $hashedPassword.Length -gt 20) {
            Write-Host "[OK] Password hashed" -ForegroundColor Green
            
            # Insert demo user
            $insertSQL = @"
INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at)
VALUES (
    '$DemoEmail',
    '$hashedPassword',
    '$DemoName',
    'admin',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
"@
            psql -U inlandv_user -d $DbName -c $insertSQL 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Demo user created successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Demo Credentials:" -ForegroundColor Cyan
                Write-Host "  Email: $DemoEmail" -ForegroundColor White
                Write-Host "  Password: $DemoPassword" -ForegroundColor White
                Write-Host "  Name: $DemoName" -ForegroundColor White
                Write-Host "  Role: admin" -ForegroundColor White
            } else {
                Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "[ERROR] Failed to hash password" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[ERROR] CMS Backend node_modules not found" -ForegroundColor Red
        Write-Host "  Please run: cd projects\cms-backend && npm install" -ForegroundColor Yellow
        exit 1
    }
    
    # Cleanup
    Remove-Item $hashScriptPath -ErrorAction SilentlyContinue

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "[SUCCESS] Demo user setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To delete demo user later, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\setup\delete-demo-user.ps1" -ForegroundColor Cyan





















