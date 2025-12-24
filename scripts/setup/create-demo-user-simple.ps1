# Create Demo User via API
# Tạo demo user qua API register endpoint

param(
    [string]$ApiUrl = "http://localhost:4001/api",
    [string]$DemoEmail = "demo@inland.com",
    [string]$DemoPassword = "demo123",
    [string]$DemoName = "Demo User"
)

$ErrorActionPreference = "Continue"

Write-Host "[DEMO] Creating demo user via API..." -ForegroundColor Cyan
Write-Host ""

# Check if CMS Backend is running
Write-Host "[STEP 1] Checking CMS Backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$ApiUrl/../health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] CMS Backend is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] CMS Backend is not running!" -ForegroundColor Red
    Write-Host "  Please start CMS Backend first:" -ForegroundColor Yellow
    Write-Host "    cd projects\cms-backend" -ForegroundColor White
    Write-Host "    npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "  Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[STEP 2] Creating demo user..." -ForegroundColor Yellow

$body = @{
    email = $DemoEmail
    password = $DemoPassword
    name = $DemoName
    role = "admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    Write-Host "[OK] Demo user created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Demo Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: $DemoEmail" -ForegroundColor White
    Write-Host "  Password: $DemoPassword" -ForegroundColor White
    Write-Host "  Name: $DemoName" -ForegroundColor White
    Write-Host "  Role: admin" -ForegroundColor White
    Write-Host ""
    Write-Host "User ID: $($response.id)" -ForegroundColor Gray

} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorResponse -and $errorResponse.error -eq "Email already exists") {
        Write-Host "[INFO] Demo user already exists" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Demo Credentials:" -ForegroundColor Cyan
        Write-Host "  Email: $DemoEmail" -ForegroundColor White
        Write-Host "  Password: $DemoPassword" -ForegroundColor White
        Write-Host ""
        Write-Host "To delete and recreate, run:" -ForegroundColor Yellow
        Write-Host "  .\scripts\setup\delete-demo-user-api.ps1" -ForegroundColor Cyan
        Write-Host "  .\scripts\setup\create-demo-user-simple.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($errorResponse) {
            Write-Host "  Details: $($errorResponse.error)" -ForegroundColor Red
        }
        exit 1
    }
}

Write-Host ""
Write-Host "[SUCCESS] Demo user ready!" -ForegroundColor Green
Write-Host ""
Write-Host "To delete demo user later, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\setup\delete-demo-user-api.ps1" -ForegroundColor Cyan





