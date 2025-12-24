# Create Demo User - Direct Database Method
# Tạo demo user trực tiếp qua Node.js script

$ErrorActionPreference = "Stop"

Write-Host "[DEMO] Creating demo user via Node.js script..." -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$cmsBackendPath = Join-Path $projectRoot "projects\cms-backend"
$scriptPath = Join-Path $cmsBackendPath "src\scripts\create-demo-user.ts"

# Check if CMS Backend exists
if (-not (Test-Path $cmsBackendPath)) {
    Write-Host "[ERROR] CMS Backend not found at: $cmsBackendPath" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
$nodeModulesPath = Join-Path $cmsBackendPath "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "[ERROR] Dependencies not installed" -ForegroundColor Red
    Write-Host "  Please run: cd projects\cms-backend && npm install" -ForegroundColor Yellow
    exit 1
}

# Check if script exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "[ERROR] Script not found: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 1] Checking database connection..." -ForegroundColor Yellow

# Check if .env.local exists
$envLocalPath = Join-Path $cmsBackendPath ".env.local"
if (-not (Test-Path $envLocalPath)) {
    Write-Host "[ERROR] .env.local not found" -ForegroundColor Red
    Write-Host "  Please create .env.local first" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Environment file found" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 2] Running demo user creation script..." -ForegroundColor Yellow

Set-Location $cmsBackendPath

try {
    # Run TypeScript script with ts-node or tsx
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        # Try tsx first (faster)
        if (Test-Path (Join-Path $nodeModulesPath ".bin\tsx.cmd")) {
            npx tsx src/scripts/create-demo-user.ts
        } elseif (Test-Path (Join-Path $nodeModulesPath ".bin\ts-node.cmd")) {
            npx ts-node src/scripts/create-demo-user.ts
        } else {
            # Compile and run
            Write-Host "[INFO] Compiling TypeScript..." -ForegroundColor Yellow
            npx tsc src/scripts/create-demo-user.ts --outDir dist/scripts --esModuleInterop --resolveJsonModule --module commonjs --target es2020
            if ($LASTEXITCODE -eq 0) {
                node dist/scripts/create-demo-user.js
            } else {
                Write-Host "[ERROR] Failed to compile TypeScript" -ForegroundColor Red
                exit 1
            }
        }
    } else {
        Write-Host "[ERROR] npx not found. Please install Node.js" -ForegroundColor Red
        exit 1
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Demo user creation completed!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "[ERROR] Failed to create demo user" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Set-Location $projectRoot
}

Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Email: demo@inland.com" -ForegroundColor White
Write-Host "  Password: demo123" -ForegroundColor White
Write-Host ""
Write-Host "To delete demo user, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\setup\delete-demo-user-api.ps1" -ForegroundColor Cyan





