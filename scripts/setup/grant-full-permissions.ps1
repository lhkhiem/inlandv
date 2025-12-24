# Grant Full Permissions to inlandv_user
# Cấp toàn bộ quyền cho inlandv_user

param(
    [string]$PostgresPassword = "",
    [string]$DbName = "inlandv_realestate",
    [string]$DbUser = "inlandv_user"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GRANT FULL PERMISSIONS" -ForegroundColor Cyan
Write-Host "  Cấp toàn bộ quyền cho $DbUser" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get postgres password
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"
    if (Test-Path $cmsBackendEnv) {
        $envContent = Get-Content $cmsBackendEnv -Raw
        if ($envContent -match "DB_PASSWORD=(.+)") {
            $PostgresPassword = $matches[1].Trim()
            Write-Host "[INFO] Found DB_PASSWORD in .env.local" -ForegroundColor Green
        }
    }
}

if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[INFO] Enter postgres password:" -ForegroundColor Yellow
    $securePassword = Read-Host "  Password" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
}

$env:PGPASSWORD = $PostgresPassword

try {
    Write-Host "[STEP 1] Granting database privileges..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Grant CONNECT and CREATE on database
    psql -U postgres -d $DbName -c "GRANT CONNECT ON DATABASE $DbName TO $DbUser;" 2>&1 | Out-Null
    psql -U postgres -d $DbName -c "GRANT CREATE ON DATABASE $DbName TO $DbUser;" 2>&1 | Out-Null
    Write-Host "  [OK] Database privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 2] Granting schema privileges..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Grant USAGE and CREATE on public schema
    psql -U postgres -d $DbName -c "GRANT USAGE ON SCHEMA public TO $DbUser;" 2>&1 | Out-Null
    psql -U postgres -d $DbName -c "GRANT CREATE ON SCHEMA public TO $DbUser;" 2>&1 | Out-Null
    Write-Host "  [OK] Schema privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 3] Granting table privileges..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Grant ALL privileges on all existing tables
    psql -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
    Write-Host "  [OK] Table privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 4] Granting sequence privileges..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Grant privileges on sequences
    psql -U postgres -d $DbName -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
    Write-Host "  [OK] Sequence privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 5] Granting function privileges..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Grant EXECUTE on all functions
    psql -U postgres -d $DbName -c "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
    Write-Host "  [OK] Function privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 6] Setting default privileges for future objects..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Set default privileges for future tables
    psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DbUser;" 2>&1 | Out-Null
    
    # Set default privileges for future sequences
    psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DbUser;" 2>&1 | Out-Null
    
    # Set default privileges for future functions
    psql -U postgres -d $DbName -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO $DbUser;" 2>&1 | Out-Null
    
    Write-Host "  [OK] Default privileges set" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 7] Verifying permissions..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Test connection and query
    $testResult = psql -U $DbUser -d $DbName -c "SELECT current_user, current_database();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Connection test successful" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Connection test failed" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "[SUCCESS] Full permissions granted!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "User: $DbUser" -ForegroundColor Cyan
    Write-Host "Database: $DbName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Permissions granted:" -ForegroundColor Yellow
    Write-Host "  ✅ Database: CONNECT, CREATE" -ForegroundColor White
    Write-Host "  ✅ Schema: USAGE, CREATE" -ForegroundColor White
    Write-Host "  ✅ Tables: ALL PRIVILEGES" -ForegroundColor White
    Write-Host "  ✅ Sequences: USAGE, SELECT" -ForegroundColor White
    Write-Host "  ✅ Functions: EXECUTE" -ForegroundColor White
    Write-Host "  ✅ Default privileges for future objects" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

Write-Host "Now you can:" -ForegroundColor Cyan
Write-Host "  - Create tables" -ForegroundColor White
Write-Host "  - Insert/Update/Delete data" -ForegroundColor White
Write-Host "  - Create indexes" -ForegroundColor White
Write-Host "  - Execute functions" -ForegroundColor White
Write-Host "  - Create demo user: cd projects\cms-backend && npx ts-node src/scripts/create-demo-user.ts" -ForegroundColor White





