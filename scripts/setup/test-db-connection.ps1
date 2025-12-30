# Test Database Connection
# Kiểm tra kết nối với cả postgres và inlandv_user

param(
    [string]$PostgresPassword = "",
    [string]$InlandvPassword = "EKYvccPcharP"
)

$ErrorActionPreference = "Continue"

Write-Host "[TEST] Testing database connections..." -ForegroundColor Cyan
Write-Host ""

$DbName = "inlandv_realestate"
$DbHost = "localhost"
$DbPort = 5432

# Test 1: postgres user
Write-Host "[TEST 1] Testing with user 'postgres'..." -ForegroundColor Yellow
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $securePass = Read-Host "  Enter postgres password" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    )
}

$env:PGPASSWORD = $PostgresPassword
$test1 = psql -U postgres -h $DbHost -p $DbPort -d $DbName -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] postgres user connection successful!" -ForegroundColor Green
    $postgresWorks = $true
} else {
    Write-Host "  [FAIL] postgres user connection failed" -ForegroundColor Red
    Write-Host "  Error: $test1" -ForegroundColor Red
    $postgresWorks = $false
}
$env:PGPASSWORD = $null

Write-Host ""

# Test 2: inlandv_user
Write-Host "[TEST 2] Testing with user 'inlandv_user'..." -ForegroundColor Yellow
Write-Host "  Using password: $InlandvPassword" -ForegroundColor Gray
$env:PGPASSWORD = $InlandvPassword
$test2 = psql -U inlandv_user -h $DbHost -p $DbPort -d $DbName -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] inlandv_user connection successful!" -ForegroundColor Green
    $inlandvWorks = $true
} else {
    Write-Host "  [FAIL] inlandv_user connection failed" -ForegroundColor Red
    Write-Host "  Error: $test2" -ForegroundColor Red
    $inlandvWorks = $false
}
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($postgresWorks) {
    Write-Host "[OK] Use: postgres user with your password" -ForegroundColor Green
    Write-Host "  Command: psql -U postgres -d $DbName" -ForegroundColor Cyan
} elseif ($inlandvWorks) {
    Write-Host "[OK] Use: inlandv_user with password: $InlandvPassword" -ForegroundColor Green
    Write-Host "  Command: psql -U inlandv_user -d $DbName" -ForegroundColor Cyan
} else {
    Write-Host "[ERROR] Both connections failed!" -ForegroundColor Red
    Write-Host "  Please check:" -ForegroundColor Yellow
    Write-Host "    1. PostgreSQL is running" -ForegroundColor White
    Write-Host "    2. Database '$DbName' exists" -ForegroundColor White
    Write-Host "    3. User credentials are correct" -ForegroundColor White
}

Write-Host "========================================" -ForegroundColor Cyan





















