# Test reading .env.local

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendEnv = Join-Path $projectRoot "projects\cms-backend\.env.local"

Write-Host "Testing .env.local reading..." -ForegroundColor Cyan
Write-Host "File path: $cmsBackendEnv" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $cmsBackendEnv) {
    Write-Host "[OK] File exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "File content (first 30 lines):" -ForegroundColor Cyan
    Get-Content $cmsBackendEnv -Encoding UTF8 | Select-Object -First 30 | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Searching for passwords..." -ForegroundColor Cyan
    
    $lines = Get-Content $cmsBackendEnv -Encoding UTF8
    $foundPostgres = $false
    $foundDB = $false
    
    foreach ($line in $lines) {
        if ($line -match "POSTGRES_PASSWORD") {
            Write-Host "[FOUND] POSTGRES_PASSWORD line: $line" -ForegroundColor Green
            if ($line -match "POSTGRES_PASSWORD\s*=\s*(.+)") {
                $pwd = ($matches[1] -split '#')[0].Trim()
                Write-Host "  Value: $pwd" -ForegroundColor White
                $foundPostgres = $true
            }
        }
        if ($line -match "DB_PASSWORD") {
            Write-Host "[FOUND] DB_PASSWORD line: $line" -ForegroundColor Green
            if ($line -match "DB_PASSWORD\s*=\s*(.+)") {
                $pwd = ($matches[1] -split '#')[0].Trim()
                Write-Host "  Value: $pwd" -ForegroundColor White
                $foundDB = $true
            }
        }
    }
    
    Write-Host ""
    if ($foundPostgres -and $foundDB) {
        Write-Host "[SUCCESS] Both passwords found!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Some passwords not found" -ForegroundColor Yellow
        if (-not $foundPostgres) { Write-Host "  POSTGRES_PASSWORD not found" -ForegroundColor Red }
        if (-not $foundDB) { Write-Host "  DB_PASSWORD not found" -ForegroundColor Red }
    }
} else {
    Write-Host "[ERROR] File not found!" -ForegroundColor Red
    Write-Host "  Expected at: $cmsBackendEnv" -ForegroundColor Yellow
}





















