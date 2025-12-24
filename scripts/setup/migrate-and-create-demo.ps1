# Migrate và tạo demo user - Simple version

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MIGRATE & CREATE DEMO USER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Read passwords
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

Write-Host "[DEBUG] Looking for .env.local at: $cmsBackendEnv" -ForegroundColor Gray

$PostgresPassword = ""
$DBPassword = ""

if (Test-Path $cmsBackendEnv) {
    Write-Host "[OK] .env.local file found" -ForegroundColor Green
    $lines = Get-Content $cmsBackendEnv -Encoding UTF8
    Write-Host "[DEBUG] Reading $($lines.Count) lines..." -ForegroundColor Gray
    
    foreach ($line in $lines) {
        # Skip comments and empty lines
        if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) { continue }
        
        # Match POSTGRES_PASSWORD (more flexible pattern)
        if ($line -match "POSTGRES_PASSWORD\s*=\s*(.+)") {
            $PostgresPassword = ($matches[1] -split '#')[0].Trim()
            Write-Host "[DEBUG] Found POSTGRES_PASSWORD" -ForegroundColor Gray
        }
        
        # Match DB_PASSWORD (more flexible pattern)
        if ($line -match "DB_PASSWORD\s*=\s*(.+)") {
            $DBPassword = ($matches[1] -split '#')[0].Trim()
            Write-Host "[DEBUG] Found DB_PASSWORD" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "[ERROR] .env.local file not found at: $cmsBackendEnv" -ForegroundColor Red
    Write-Host "  Please check the file exists" -ForegroundColor Yellow
    exit 1
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[ERROR] POSTGRES_PASSWORD not found in .env.local" -ForegroundColor Red
    Write-Host "  Please add: POSTGRES_PASSWORD=your_password" -ForegroundColor Yellow
    exit 1
}

if ([string]::IsNullOrEmpty($DBPassword)) {
    Write-Host "[ERROR] DB_PASSWORD not found in .env.local" -ForegroundColor Red
    Write-Host "  Please add: DB_PASSWORD=your_password" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Passwords loaded successfully" -ForegroundColor Green

Write-Host "[OK] Passwords loaded" -ForegroundColor Green
Write-Host ""

# Step 1: Migration
Write-Host "[1/3] Running migration..." -ForegroundColor Yellow
$env:PGPASSWORD = $PostgresPassword
$migrationPath = Join-Path $projectRoot "shared\database\migrations\045_update_users_table.sql"

psql -U postgres -d inlandv_realestate -f $migrationPath -q 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Migration completed" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Migration may have issues" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Verify
Write-Host "[2/3] Verifying columns..." -ForegroundColor Yellow
$env:PGPASSWORD = $DBPassword
$columnCount = psql -U inlandv_user -d inlandv_realestate -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users';" 2>&1 | ForEach-Object { $_.Trim() }

if ($columnCount -match "^\d+$") {
    Write-Host "  [OK] Found $columnCount columns in users table" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Could not verify" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Create demo user
Write-Host "[3/3] Creating demo user..." -ForegroundColor Yellow
$cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"
Set-Location $cmsBackendPath

npx ts-node src/scripts/create-demo-user.ts

Set-Location $projectRoot
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[DONE]" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

