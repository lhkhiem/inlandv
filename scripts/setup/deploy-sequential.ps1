# Sequential Deployment Script
# Triển khai tuần tự tất cả các bước

param(
    [string]$PostgresPassword = "",
    [string]$DbUser = "",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "inlandv_realestate",
    [switch]$UseInlandvUser = $false
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SEQUENTIAL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "  Triển khai tuần tự" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$allStepsPassed = $true

# ============================================
# STEP 1: Get Database User and Password
# ============================================
Write-Host "[STEP 1] Database Configuration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Determine which user to use
if ($UseInlandvUser) {
    $DbUser = "inlandv_user"
    $PostgresPassword = "EKYvccPcharP"
    Write-Host "[INFO] Using inlandv_user (password: EKYvccPcharP)" -ForegroundColor Cyan
} elseif ([string]::IsNullOrEmpty($DbUser)) {
    Write-Host "[INFO] Select database user:" -ForegroundColor Yellow
    Write-Host "  1. postgres (default PostgreSQL user)" -ForegroundColor White
    Write-Host "  2. inlandv_user (created by setup-quick.ps1)" -ForegroundColor White
    $userChoice = Read-Host "  Enter choice (1 or 2)"
    
    if ($userChoice -eq "2") {
        $DbUser = "inlandv_user"
        $PostgresPassword = "EKYvccPcharP"
        Write-Host "[OK] Using inlandv_user" -ForegroundColor Green
    } else {
        $DbUser = "postgres"
        if ([string]::IsNullOrEmpty($PostgresPassword)) {
            Write-Host "[INFO] Enter postgres password:" -ForegroundColor Yellow
            $securePassword = Read-Host "  Password" -AsSecureString
            $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
            )
            if ([string]::IsNullOrEmpty($PostgresPassword)) {
                Write-Host "[ERROR] Password cannot be empty" -ForegroundColor Red
                exit 1
            }
        }
        Write-Host "[OK] Using postgres user" -ForegroundColor Green
    }
} else {
    if ([string]::IsNullOrEmpty($PostgresPassword)) {
        if ($DbUser -eq "inlandv_user") {
            $PostgresPassword = "EKYvccPcharP"
        } else {
            Write-Host "[INFO] Enter password for user '$DbUser':" -ForegroundColor Yellow
            $securePassword = Read-Host "  Password" -AsSecureString
            $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
            )
        }
    }
    Write-Host "[OK] Using user: $DbUser" -ForegroundColor Green
}

$env:PGPASSWORD = $PostgresPassword

# ============================================
# STEP 2: Check Database Connection
# ============================================
Write-Host ""
Write-Host "[STEP 2] Checking Database Connection" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $dbCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Cannot connect to database" -ForegroundColor Red
        Write-Host "  Error: $dbCheck" -ForegroundColor Red
        $allStepsPassed = $false
        exit 1
    }
} catch {
    Write-Host "[ERROR] Database connection failed: $($_.Exception.Message)" -ForegroundColor Red
    $allStepsPassed = $false
    exit 1
}

# ============================================
# STEP 3: Run Migration
# ============================================
Write-Host ""
Write-Host "[STEP 3] Running CMS Migration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$migrationPath = Join-Path $projectRoot "shared\database\migrations\044_cms_integration.sql"

if (-not (Test-Path $migrationPath)) {
    Write-Host "[ERROR] Migration file not found: $migrationPath" -ForegroundColor Red
    $allStepsPassed = $false
    exit 1
}

# Check if tables already exist
$tablesCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata"
if ($tablesCheck) {
    Write-Host "[INFO] CMS tables already exist" -ForegroundColor Yellow
    $response = Read-Host "  Run migration anyway? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "[SKIP] Migration skipped" -ForegroundColor Yellow
    } else {
        Write-Host "[RUN] Running migration..." -ForegroundColor Cyan
        psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Migration completed" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Migration failed" -ForegroundColor Red
            $allStepsPassed = $false
        }
    }
} else {
    Write-Host "[RUN] Running migration..." -ForegroundColor Cyan
    psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -f $migrationPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Migration completed" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Migration failed" -ForegroundColor Red
        $allStepsPassed = $false
        exit 1
    }
}

# Verify tables
$verifyCheck = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "\dt" 2>&1 | Select-String -Pattern "settings|menu_locations|page_metadata|faq|newsletter|tracking"
if ($verifyCheck) {
    Write-Host "[OK] CMS tables verified" -ForegroundColor Green
} else {
    Write-Host "[WARN] Some tables may be missing" -ForegroundColor Yellow
}

# ============================================
# STEP 4: Check Dependencies
# ============================================
Write-Host ""
Write-Host "[STEP 4] Checking Dependencies" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$projects = @("cms-backend", "cms-frontend", "inlandv-backend", "inlandv-frontend")
$missingDeps = @()

foreach ($project in $projects) {
    $nodeModules = Join-Path $projectRoot "projects\$project\node_modules"
    if (-not (Test-Path $nodeModules)) {
        Write-Host "[WARN] $project - dependencies missing" -ForegroundColor Yellow
        $missingDeps += $project
    } else {
        Write-Host "[OK] $project - dependencies installed" -ForegroundColor Green
    }
}

if ($missingDeps.Count -gt 0) {
    Write-Host ""
    Write-Host "[INFO] Installing missing dependencies..." -ForegroundColor Cyan
    foreach ($project in $missingDeps) {
        $projectPath = Join-Path $projectRoot "projects\$project"
        Write-Host "  Installing $project..." -ForegroundColor Cyan
        Set-Location $projectPath
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] $project installed" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] Failed to install $project" -ForegroundColor Red
            $allStepsPassed = $false
        }
    }
    Set-Location $projectRoot
}

# ============================================
# STEP 5: Summary and Next Steps
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allStepsPassed) {
    Write-Host "[SUCCESS] Setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Start CMS Backend:" -ForegroundColor White
    Write-Host "     cd projects\cms-backend" -ForegroundColor Cyan
    Write-Host "     npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Start InlandV Backend:" -ForegroundColor White
    Write-Host "     cd projects\inlandv-backend" -ForegroundColor Cyan
    Write-Host "     npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  3. Test endpoints:" -ForegroundColor White
    Write-Host "     http://localhost:4001/health (CMS Backend)" -ForegroundColor Cyan
    Write-Host "     http://localhost:4000/health (InlandV Backend)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  4. Create admin user:" -ForegroundColor White
    Write-Host '     $body = @{' -ForegroundColor Cyan
    Write-Host '         name = "Admin"' -ForegroundColor Cyan
    Write-Host '         email = "admin@example.com"' -ForegroundColor Cyan
    Write-Host '         password = "password123"' -ForegroundColor Cyan
    Write-Host '         role = "admin"' -ForegroundColor Cyan
    Write-Host '     } | ConvertTo-Json' -ForegroundColor Cyan
    Write-Host ""
    Write-Host '     Invoke-RestMethod -Uri "http://localhost:4001/api/auth/register" `' -ForegroundColor Cyan
    Write-Host '         -Method Post `' -ForegroundColor Cyan
    Write-Host '         -ContentType "application/json" `' -ForegroundColor Cyan
    Write-Host '         -Body $body' -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  5. Start Frontends:" -ForegroundColor White
    Write-Host "     cd projects\cms-frontend && npm run dev" -ForegroundColor Cyan
    Write-Host "     cd projects\inlandv-frontend && npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "[WARN] Some steps failed. Please check errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Cleanup
$env:PGPASSWORD = $null

