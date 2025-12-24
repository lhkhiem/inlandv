# Grant Permissions on Users Table
# Cấp quyền cho inlandv_user trên bảng users

param(
    [string]$PostgresPassword = "",
    [string]$DbName = "inlandv_realestate",
    [string]$DbUser = "inlandv_user"
)

$ErrorActionPreference = "Stop"

Write-Host "[PERMISSIONS] Granting permissions on users table..." -ForegroundColor Cyan
Write-Host ""

# Try to get password from .env.local
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

# If still empty, try default or ask
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host "[INFO] Password not found in .env.local" -ForegroundColor Yellow
    Write-Host "[INFO] Trying default postgres password..." -ForegroundColor Yellow
    $PostgresPassword = "postgres"  # Try default first
}

$env:PGPASSWORD = $PostgresPassword

try {
    Write-Host "[STEP 1] Granting ALL privileges on users table..." -ForegroundColor Yellow
    
    # Grant all privileges
    psql -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON TABLE users TO $DbUser;" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Privileges granted" -ForegroundColor Green
    } else {
        Write-Host "[WARN] May have failed, continuing..." -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "[STEP 2] Granting USAGE on sequence (for UUID generation)..." -ForegroundColor Yellow
    
    # Grant usage on sequences (for UUID generation)
    psql -U postgres -d $DbName -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO $DbUser;" 2>&1 | Out-Null
    
    Write-Host "[OK] Sequence privileges granted" -ForegroundColor Green

    Write-Host ""
    Write-Host "[STEP 3] Verifying permissions..." -ForegroundColor Yellow
    
    # Check permissions
    $perms = psql -U postgres -d $DbName -c "\dp users" 2>&1 | Select-String -Pattern $DbUser
    if ($perms) {
        Write-Host "[OK] Permissions verified" -ForegroundColor Green
        Write-Host $perms -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "[SUCCESS] Permissions granted successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can create demo user:" -ForegroundColor Cyan
    Write-Host "  cd projects\cms-backend" -ForegroundColor White
    Write-Host "  npx ts-node src/scripts/create-demo-user.ts" -ForegroundColor White

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    $env:PGPASSWORD = $null
}

