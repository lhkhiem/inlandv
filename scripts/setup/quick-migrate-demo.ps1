# Quick Migrate and Create Demo - Simple version
# Đọc trực tiếp từ file

$ErrorActionPreference = "Continue"

Write-Host "Quick Migrate & Create Demo User" -ForegroundColor Cyan
Write-Host ""

# Direct path
$envFile = "projects\cms-backend\.env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "[ERROR] File not found: $envFile" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Reading $envFile" -ForegroundColor Green

# Read all content
$content = Get-Content $envFile -Raw

# Extract passwords using simple regex
$PostgresPassword = ""
$DBPassword = ""

if ($content -match "POSTGRES_PASSWORD\s*=\s*([^\r\n]+)") {
    $PostgresPassword = ($matches[1] -split '#')[0].Trim()
    Write-Host "[OK] POSTGRES_PASSWORD found" -ForegroundColor Green
}

if ($content -match "DB_PASSWORD\s*=\s*([^\r\n]+)") {
    $DBPassword = ($matches[1] -split '#')[0].Trim()
    Write-Host "[OK] DB_PASSWORD found" -ForegroundColor Green
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[ERROR] POSTGRES_PASSWORD not found" -ForegroundColor Red
    Write-Host "  Add to $envFile : POSTGRES_PASSWORD=your_password" -ForegroundColor Yellow
    exit 1
}

if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Host "[ERROR] DB_PASSWORD not found" -ForegroundColor Red
    Write-Host "  Add to $envFile : DB_PASSWORD=your_password" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[1/3] Running migration..." -ForegroundColor Yellow
$env:PGPASSWORD = $PostgresPassword
psql -U postgres -d inlandv_realestate -f shared\database\migrations\045_update_users_table.sql -q 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Migration done" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Check migration output" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[2/3] Creating demo user..." -ForegroundColor Yellow
Set-Location projects\cms-backend
npx ts-node src/scripts/create-demo-user.ts
Set-Location ..\..

Write-Host ""
Write-Host "[DONE]" -ForegroundColor Green
$env:PGPASSWORD = $null





