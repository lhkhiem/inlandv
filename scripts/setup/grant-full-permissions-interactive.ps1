# Grant Full Permissions - Interactive Version
# Cấp toàn bộ quyền cho inlandv_user (tương tác)

param(
    [string]$PostgresPassword = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GRANT FULL PERMISSIONS" -ForegroundColor Cyan
Write-Host "  Cấp toàn bộ quyền cho inlandv_user" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get postgres password
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    # Try to get from .env.local first
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"
    if (Test-Path $cmsBackendEnv) {
        Write-Host "[INFO] Reading .env.local..." -ForegroundColor Yellow
        # Read line by line to handle comments better
        $lines = Get-Content $cmsBackendEnv
        foreach ($line in $lines) {
            # Skip comments and empty lines
            if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) {
                continue
            }
            # Match POSTGRES_PASSWORD=value (priority)
            if ($line -match "^\s*POSTGRES_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
                $PostgresPassword = $matches[1].Trim()
                Write-Host "[OK] Found POSTGRES_PASSWORD in .env.local" -ForegroundColor Green
                break
            }
        }
        
        # If POSTGRES_PASSWORD not found, try DB_PASSWORD as fallback
        if ([string]::IsNullOrEmpty($PostgresPassword)) {
            foreach ($line in $lines) {
                if ($line -match "^\s*#" -or [string]::IsNullOrWhiteSpace($line)) {
                    continue
                }
                if ($line -match "^\s*DB_PASSWORD\s*=\s*(.+?)(\s*#|$)") {
                    $PostgresPassword = $matches[1].Trim()
                    Write-Host "[INFO] Using DB_PASSWORD as fallback (may not work)" -ForegroundColor Yellow
                    break
                }
            }
        }
    }
    
    # If still empty, ask user
    if ([string]::IsNullOrEmpty($PostgresPassword)) {
        Write-Host "[INFO] Enter postgres password:" -ForegroundColor Yellow
        $securePassword = Read-Host "  Password" -AsSecureString
        $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        )
    }
}

# Test password
$env:PGPASSWORD = $PostgresPassword
Write-Host "[TEST] Testing postgres password..." -ForegroundColor Yellow
$testResult = psql -U postgres -d inlandv_realestate -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Password authentication failed!" -ForegroundColor Red
    Write-Host "  Please check your postgres password" -ForegroundColor Yellow
    $env:PGPASSWORD = $null
    exit 1
}
Write-Host "[OK] Password verified" -ForegroundColor Green

$DbName = "inlandv_realestate"
$DbUser = "inlandv_user"

Write-Host ""
Write-Host "[STEP 1] Database privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT CONNECT, CREATE ON DATABASE $DbName TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 2] Schema privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT USAGE, CREATE ON SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 3] Table privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 4] Sequence privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 5] Function privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host "[STEP 6] Default privileges..." -ForegroundColor Yellow
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DbUser;" 2>&1 | Out-Null
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DbUser;" 2>&1 | Out-Null
psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO $DbUser;" 2>&1 | Out-Null
Write-Host "  [OK] Done" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Full permissions granted!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now you can create demo user:" -ForegroundColor Cyan
Write-Host "  cd projects\cms-backend" -ForegroundColor White
Write-Host "  npx ts-node src/scripts/create-demo-user.ts" -ForegroundColor White
Write-Host ""

$env:PGPASSWORD = $null

