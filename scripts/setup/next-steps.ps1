# Next Steps Guide - Interactive
# Hướng dẫn các bước tiếp theo sau khi đã setup .env.local

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "🚀 NEXT STEPS - Các bước tiếp theo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Step 1: Install Dependencies
Write-Host "[STEP 1] Install Dependencies" -ForegroundColor Yellow
Write-Host "  Cài đặt npm packages cho tất cả projects:" -ForegroundColor White
Write-Host ""
Write-Host "  cd projects\cms-backend && npm install" -ForegroundColor Cyan
Write-Host "  cd projects\cms-frontend && npm install" -ForegroundColor Cyan
Write-Host "  cd projects\inlandv-backend && npm install" -ForegroundColor Cyan
Write-Host "  cd projects\inlandv-frontend && npm install" -ForegroundColor Cyan
Write-Host ""

$install = Read-Host "Bạn muốn cài đặt dependencies ngay bây giờ? (y/n)"
if ($install -eq "y" -or $install -eq "Y") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    
    $projects = @("cms-backend", "cms-frontend", "inlandv-backend", "inlandv-frontend")
    foreach ($project in $projects) {
        $projectPath = Join-Path $projectRoot "projects\$project"
        Write-Host "  Installing $project..." -ForegroundColor Cyan
        Set-Location $projectPath
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ Failed to install $project" -ForegroundColor Red
        } else {
            Write-Host "  ✅ $project installed" -ForegroundColor Green
        }
    }
    Set-Location $projectRoot
}

Write-Host ""
Write-Host "[STEP 2] Run Database Migration" -ForegroundColor Yellow
Write-Host "  Chạy migration CMS integration:" -ForegroundColor White
Write-Host ""
Write-Host "  psql -U postgres -d inlandv_realestate -f shared\database\migrations\044_cms_integration.sql" -ForegroundColor Cyan
Write-Host ""

$migrate = Read-Host "Bạn muốn chạy migration ngay bây giờ? (y/n)"
if ($migrate -eq "y" -or $migrate -eq "Y") {
    Write-Host "Running migration..." -ForegroundColor Yellow
    $migrationPath = Join-Path $projectRoot "shared\database\migrations\044_cms_integration.sql"
    
    $pgPassword = Read-Host "Nhập PostgreSQL password" -AsSecureString
    $pgPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
    )
    
    $env:PGPASSWORD = $pgPasswordPlain
    psql -U postgres -d inlandv_realestate -f $migrationPath
    $env:PGPASSWORD = $null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Migration completed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Migration failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[STEP 3] Test Backend Connections" -ForegroundColor Yellow
Write-Host "  Start backend servers:" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 1: cd projects\cms-backend && npm run dev" -ForegroundColor Cyan
Write-Host "  Terminal 2: cd projects\inlandv-backend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Test endpoints:" -ForegroundColor White
Write-Host "    - http://localhost:4001/health (CMS Backend)" -ForegroundColor Cyan
Write-Host "    - http://localhost:4000/health (InlandV Backend)" -ForegroundColor Cyan
Write-Host ""

Write-Host "[STEP 4] Create Admin User" -ForegroundColor Yellow
Write-Host "  Sau khi CMS Backend chạy, tạo admin user:" -ForegroundColor White
Write-Host ""
Write-Host '  $body = @{' -ForegroundColor Cyan
Write-Host '      name = "Admin"' -ForegroundColor Cyan
Write-Host '      email = "admin@example.com"' -ForegroundColor Cyan
Write-Host '      password = "password123"' -ForegroundColor Cyan
Write-Host '      role = "admin"' -ForegroundColor Cyan
Write-Host '  } | ConvertTo-Json' -ForegroundColor Cyan
Write-Host ''
Write-Host '  Invoke-RestMethod -Uri "http://localhost:4001/api/auth/register" `' -ForegroundColor Cyan
Write-Host '      -Method Post `' -ForegroundColor Cyan
Write-Host '      -ContentType "application/json" `' -ForegroundColor Cyan
Write-Host '      -Body $body' -ForegroundColor Cyan
Write-Host ""

Write-Host "[STEP 5] Test Frontend" -ForegroundColor Yellow
Write-Host "  Start frontend servers:" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 3: cd projects\cms-frontend && npm run dev" -ForegroundColor Cyan
Write-Host "  Terminal 4: cd projects\inlandv-frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Access:" -ForegroundColor White
Write-Host "    - http://localhost:4003 (CMS Dashboard)" -ForegroundColor Cyan
Write-Host "    - http://localhost:4002 (Public Website)" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Hướng dẫn hoàn tất!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Xem thêm: docs\NEXT_STEPS_GUIDE.md" -ForegroundColor Yellow





