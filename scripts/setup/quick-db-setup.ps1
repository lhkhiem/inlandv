# Quick Database Setup - No interaction
# Usage: .\scripts\setup\quick-db-setup.ps1

$DbName = "inland_realestate"
$DbUser = "postgres"
$DbPassword = "postgres"
$DbHost = "localhost"
$DbPort = 5432

Write-Host "Quick database setup..." -ForegroundColor Cyan

# Create database
Write-Host "Creating database..." -ForegroundColor Yellow
$env:PGPASSWORD = $DbPassword
createdb -U $DbUser -h $DbHost -p $DbPort $DbName 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created" -ForegroundColor Green
} else {
    Write-Host "Database may already exist, continuing..." -ForegroundColor Yellow
}

# Create .env files
$databaseUrl = "postgresql://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName"

# Public Backend .env
$publicBackendEnv = "projects\public-backend\.env"
if (-not (Test-Path $publicBackendEnv)) {
    @"
DATABASE_URL=$databaseUrl
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4002
"@ | Out-File -FilePath $publicBackendEnv -Encoding utf8
    Write-Host "Created $publicBackendEnv" -ForegroundColor Green
}

# CMS Backend .env
$cmsBackendEnv = "projects\cms-backend\.env"
if (-not (Test-Path $cmsBackendEnv)) {
    @"
DATABASE_URL=$databaseUrl
PORT=4001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4003
"@ | Out-File -FilePath $cmsBackendEnv -Encoding utf8
    Write-Host "Created $cmsBackendEnv" -ForegroundColor Green
}

Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Cyan
Set-Location "projects\public-backend"
if (Test-Path "node_modules") {
    npm run migrate 2>&1 | Out-Null
    Write-Host "Migrations done" -ForegroundColor Green
    
    Write-Host "Seeding data..." -ForegroundColor Cyan
    npm run seed 2>&1 | Out-Null
    Write-Host "Seeding done" -ForegroundColor Green
} else {
    Write-Host "Please run 'npm install' first in projects/public-backend" -ForegroundColor Yellow
}
Set-Location "..\..\"

Write-Host ""
Write-Host "Done! Database ready." -ForegroundColor Green








