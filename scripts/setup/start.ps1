# Quick Start Script - Windows PowerShell
# This script starts both frontend and backend servers

Write-Host "🏡 Starting Inland Real Estate Application..." -ForegroundColor Green
Write-Host ""

# Check if .env files exist
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Frontend .env.local not found. Run install.ps1 first!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Backend .env not found. Run install.ps1 first!" -ForegroundColor Red
    exit 1
}

# Function to start backend
$backendScript = {
    Set-Location "d:\Client Website Frontend\Inlandv\backend"
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
    npm run dev
}

# Function to start frontend
$frontendScript = {
    Set-Location "d:\Client Website Frontend\Inlandv"
    Start-Sleep -Seconds 3
    Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Cyan
    npm run dev
}

Write-Host "Starting servers in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$backendScript}"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$frontendScript}"

Write-Host "✅ Servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Press any key to exit (servers will continue running)" -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
