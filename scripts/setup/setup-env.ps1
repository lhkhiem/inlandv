# Setup Environment Variables - PowerShell
# Usage: .\scripts\setup\setup-env.ps1 -PostgresPassword "your_password" [-DbUser "postgres"] [-DbHost "localhost"] [-DbPort 5432]

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword,
    [string]$DbUser = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbName = "inlandv_realestate",
    [string]$JwtSecret = "inlandv-dev-jwt-secret-key-change-in-production-min-32-chars"
)

$ErrorActionPreference = "Stop"

Write-Host "[START] Setting up environment variables..." -ForegroundColor Cyan

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

try {
    # 1. CMS Backend .env.local
    Write-Host "[STEP 1] Creating CMS Backend .env.local..." -ForegroundColor Yellow
    $cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"
    $cmsBackendContent = @"
# ============================================
# CMS Backend - Environment Variables
# ============================================
# CMS Backend phục vụ Admin Dashboard (port 4001)

# ============================================
# Database Configuration
# ============================================
DB_HOST=$DbHost
DB_PORT=$DbPort
DB_USER=$DbUser
DB_PASSWORD=$PostgresPassword
DB_NAME=$DbName

# Alternative: Use DATABASE_URL instead of individual fields
DATABASE_URL=postgresql://$DbUser`:$PostgresPassword@$DbHost`:$DbPort/$DbName

# ============================================
# Server Configuration
# ============================================
PORT=4001
NODE_ENV=development

# ============================================
# CORS Configuration
# ============================================
# CMS Frontend URL (Admin Dashboard)
ADMIN_ORIGIN=http://localhost:4003
PUBLIC_IP=localhost

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=$JwtSecret
JWT_EXPIRES_IN=7d

# ============================================
# Rate Limiting (stricter for CMS)
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
"@
    Set-Content -Path $cmsBackendEnv -Value $cmsBackendContent -Encoding UTF8
    Write-Host "[OK] CMS Backend .env.local created" -ForegroundColor Green

    # 2. CMS Frontend .env.local
    Write-Host "[STEP 2] Creating CMS Frontend .env.local..." -ForegroundColor Yellow
    $cmsFrontendEnv = Join-Path $projectRoot "projects\cms-frontend\.env.local"
    $cmsFrontendContent = @"
# ============================================
# CMS Frontend - Environment Variables
# ============================================
# CMS Frontend là Admin Dashboard (port 4003)
# Kết nối với CMS Backend (port 4001)

# ============================================
# API Configuration
# ============================================
# CMS Backend API URL (Admin API)
NEXT_PUBLIC_API_URL=http://localhost:4001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
"@
    Set-Content -Path $cmsFrontendEnv -Value $cmsFrontendContent -Encoding UTF8
    Write-Host "[OK] CMS Frontend .env.local created" -ForegroundColor Green

    # 3. InlandV Backend .env.local
    Write-Host "[STEP 3] Creating InlandV Backend .env.local..." -ForegroundColor Yellow
    $inlandvBackendEnv = Join-Path $projectRoot "projects\inlandv-backend\.env.local"
    $inlandvBackendContent = @"
# ============================================
# InlandV Backend - Environment Variables
# ============================================
# InlandV Backend phục vụ Public Website (port 4000)

# ============================================
# Database Configuration
# ============================================
# Use DATABASE_URL for PostgreSQL connection
DATABASE_URL=postgresql://$DbUser`:$PostgresPassword@$DbHost`:$DbPort/$DbName

# ============================================
# Server Configuration
# ============================================
PORT=4000
NODE_ENV=development

# ============================================
# CORS Configuration
# ============================================
# InlandV Frontend URL (Public Website)
CORS_ORIGIN=http://localhost:4002

# ============================================
# Rate Limiting (Public API)
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@
    Set-Content -Path $inlandvBackendEnv -Value $inlandvBackendContent -Encoding UTF8
    Write-Host "[OK] InlandV Backend .env.local created" -ForegroundColor Green

    # 4. InlandV Frontend .env.local
    Write-Host "[STEP 4] Creating InlandV Frontend .env.local..." -ForegroundColor Yellow
    $inlandvFrontendEnv = Join-Path $projectRoot "projects\inlandv-frontend\.env.local"
    $inlandvFrontendContent = @"
# ============================================
# InlandV Frontend - Environment Variables
# ============================================
# InlandV Frontend là Public Website (port 4002)
# Kết nối với InlandV Backend (port 4000)

# ============================================
# API Configuration
# ============================================
# InlandV Backend API URL (Public API)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
"@
    Set-Content -Path $inlandvFrontendEnv -Value $inlandvFrontendContent -Encoding UTF8
    Write-Host "[OK] InlandV Frontend .env.local created" -ForegroundColor Green

    Write-Host ""
    Write-Host "[SUCCESS] All environment files created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Files created:" -ForegroundColor Cyan
    Write-Host "  - projects\cms-backend\.env.local" -ForegroundColor Yellow
    Write-Host "  - projects\cms-frontend\.env.local" -ForegroundColor Yellow
    Write-Host "  - projects\inlandv-backend\.env.local" -ForegroundColor Yellow
    Write-Host "  - projects\inlandv-frontend\.env.local" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review and update JWT_SECRET in cms-backend\.env.local if needed" -ForegroundColor White
    Write-Host "  2. Install dependencies: npm install in each project" -ForegroundColor White
    Write-Host "  3. Start development servers" -ForegroundColor White

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}





















