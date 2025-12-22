# Setup Database Script for Windows
# Usage: .\scripts\setup\setup-database.ps1

param(
    [string]$DbName = "inland_realestate",
    [string]$DbUser = "postgres",
    [string]$DbPassword = "postgres",
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432
)

Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan

# Check if PostgreSQL is installed
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Check if database exists
$dbExists = psql -U $DbUser -h $DbHost -p $DbPort -lqt | Select-String -Pattern $DbName
if ($dbExists) {
    Write-Host "⚠️  Database '$DbName' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to recreate it? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "🗑️  Dropping database..." -ForegroundColor Yellow
        $env:PGPASSWORD = $DbPassword
        dropdb -U $DbUser -h $DbHost -p $DbPort $DbName
        Write-Host "✅ Database dropped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Using existing database" -ForegroundColor Cyan
    }
}

# Create database if not exists
if (-not $dbExists -or ($response -eq "y" -or $response -eq "Y")) {
    Write-Host "➕ Creating database '$DbName'..." -ForegroundColor Yellow
    $env:PGPASSWORD = $DbPassword
    createdb -U $DbUser -h $DbHost -p $DbPort $DbName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Generate DATABASE_URL
$databaseUrl = "postgresql://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName"
Write-Host ""
Write-Host "📋 DATABASE_URL:" -ForegroundColor Cyan
Write-Host $databaseUrl -ForegroundColor Green
Write-Host ""

# Update .env files
$envFiles = @(
    "projects\public-backend\.env",
    "projects\cms-backend\.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "📝 Updating $envFile..." -ForegroundColor Yellow
        $content = Get-Content $envFile -Raw
        
        # Replace DATABASE_URL if exists, otherwise add it
        if ($content -match "DATABASE_URL=") {
            $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=$databaseUrl"
        } else {
            $content = "DATABASE_URL=$databaseUrl`n" + $content
        }
        
        Set-Content -Path $envFile -Value $content
        Write-Host "✅ Updated $envFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $envFile not found, creating..." -ForegroundColor Yellow
        New-Item -Path $envFile -ItemType File -Force | Out-Null
        Add-Content -Path $envFile -Value "DATABASE_URL=$databaseUrl"
        Write-Host "✅ Created $envFile" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🔄 Running migrations..." -ForegroundColor Cyan
Set-Location "projects\public-backend"
npm run migrate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations completed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Migration may have failed. Check manually." -ForegroundColor Yellow
}
Set-Location "..\..\"

Write-Host ""
Write-Host "✅ Database setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify DATABASE_URL in .env files"
Write-Host "  2. Test connection: npm run dev (in backend folder)"
Write-Host "  3. Check database: psql -U $DbUser -d $DbName"








