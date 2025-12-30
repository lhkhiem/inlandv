# Test reading .env.local
# Kiểm tra đọc password từ .env.local

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

Write-Host "Testing .env.local reading..." -ForegroundColor Cyan
Write-Host "File path: $cmsBackendEnv" -ForegroundColor Yellow

if (Test-Path $cmsBackendEnv) {
    Write-Host "[OK] File exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "File content:" -ForegroundColor Cyan
    Get-Content $cmsBackendEnv | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    
    # Try different methods
    Write-Host "Method 1: Read as Raw string..." -ForegroundColor Yellow
    $envContent = Get-Content $cmsBackendEnv -Raw
    Write-Host "  Content length: $($envContent.Length)" -ForegroundColor Gray
    
    if ($envContent -match "DB_PASSWORD=(.+)") {
        $password1 = $matches[1].Trim()
        Write-Host "  [OK] Found: $password1" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Pattern not matched" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Method 2: Read line by line..." -ForegroundColor Yellow
    $lines = Get-Content $cmsBackendEnv
    foreach ($line in $lines) {
        if ($line -match "DB_PASSWORD=(.+)") {
            $password2 = $matches[1].Trim()
            Write-Host "  [OK] Found: $password2" -ForegroundColor Green
            break
        }
    }
    
    Write-Host ""
    Write-Host "Method 3: Using Select-String..." -ForegroundColor Yellow
    $match = Get-Content $cmsBackendEnv | Select-String -Pattern "DB_PASSWORD=(.+)" | Select-Object -First 1
    if ($match) {
        if ($match.Line -match "DB_PASSWORD=(.+)") {
            $password3 = $matches[1].Trim()
            Write-Host "  [OK] Found: $password3" -ForegroundColor Green
        }
    }
    
} else {
    Write-Host "[ERROR] File not found!" -ForegroundColor Red
}





















