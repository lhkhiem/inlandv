# Inland Real Estate - Installation Script for Windows PowerShell

Write-Host "🏡 Installing Inland Real Estate Website..." -ForegroundColor Green
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL installation
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "✅ PostgreSQL installed: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL not found in PATH. Please ensure PostgreSQL 15+ is installed." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

Write-Host ""
Write-Host "📝 Creating Environment Files..." -ForegroundColor Cyan

# Create frontend .env.local
$frontendEnv = @"
NEXT_PUBLIC_API_URL=http://localhost:4000/api
"@
$frontendEnv | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Created .env.local" -ForegroundColor Green

# Create backend .env
$backendEnv = @"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inland_realestate
PORT=4000
NODE_ENV=development
JWT_SECRET=inland-real-estate-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@
$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "✅ Created backend/.env" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host "Please ensure PostgreSQL is running and create the database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Option 1: Using psql" -ForegroundColor White
Write-Host "  psql -U postgres" -ForegroundColor Gray
Write-Host "  CREATE DATABASE inland_realestate;" -ForegroundColor Gray
Write-Host "  \q" -ForegroundColor Gray
Write-Host ""
Write-Host "  Option 2: Using createdb command" -ForegroundColor White
Write-Host "  createdb inland_realestate" -ForegroundColor Gray
Write-Host ""

$createDb = Read-Host "Do you want to attempt automatic database creation? (y/n)"
if ($createDb -eq 'y' -or $createDb -eq 'Y') {
    Write-Host "Creating database..." -ForegroundColor Yellow
    try {
        createdb inland_realestate
        Write-Host "✅ Database created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not create database automatically. Please create it manually." -ForegroundColor Yellow
    }
}

Write-Host ""
$runMigration = Read-Host "Do you want to run database migrations now? (y/n)"
if ($runMigration -eq 'y' -or $runMigration -eq 'Y') {
    Write-Host "Running migrations..." -ForegroundColor Yellow
    Set-Location backend
    npm run migrate
    Set-Location ..
}

Write-Host ""
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 1 - Backend:" -ForegroundColor White
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2 - Frontend:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📍 Access the application:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:4000" -ForegroundColor Gray
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Read README.md for more information" -ForegroundColor Yellow
Write-Host ""
