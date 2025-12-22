# Script sửa deploy-package để có đầy đủ file build

$deployDir = "deploy-package"
$sourceNext = ".next"

Write-Host "Sua deploy-package de co day du file build..." -ForegroundColor Green

# Kiểm tra thư mục .next gốc
if (-not (Test-Path $sourceNext)) {
    Write-Host "✗ Khong tim thay thu muc .next goc!" -ForegroundColor Red
    Write-Host "Chay 'npm run build' truoc" -ForegroundColor Yellow
    exit 1
}

# Tạo thư mục .next trong deploy-package nếu chưa có
if (-not (Test-Path "$deployDir\.next")) {
    New-Item -ItemType Directory -Path "$deployDir\.next" -Force | Out-Null
    Write-Host "Tao thu muc .next" -ForegroundColor Yellow
}

# Copy các file manifest cần thiết
$requiredFiles = @(
    "BUILD_ID",
    "prerender-manifest.json",
    "routes-manifest.json",
    "app-build-manifest.json",
    "build-manifest.json",
    "react-loadable-manifest.json",
    "app-path-routes-manifest.json",
    "required-server-files.json"
)

Write-Host "Copy cac file manifest..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    $sourceFile = "$sourceNext\$file"
    if (Test-Path $sourceFile) {
        Copy-Item -Force $sourceFile "$deployDir\.next\" -ErrorAction SilentlyContinue
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (khong tim thay)" -ForegroundColor Red
    }
}

# Copy .next/server nếu chưa có
if (-not (Test-Path "$deployDir\.next\server")) {
    Write-Host "Copy .next/server..." -ForegroundColor Yellow
    if (Test-Path "$sourceNext\server") {
        Copy-Item -Recurse -Force "$sourceNext\server" "$deployDir\.next\"
        Write-Host "  ✓ Da copy .next/server" -ForegroundColor Green
    }
}

# Copy .next/static nếu chưa có
if (-not (Test-Path "$deployDir\.next\static")) {
    Write-Host "Copy .next/static..." -ForegroundColor Yellow
    if (Test-Path "$sourceNext\static") {
        Copy-Item -Recurse -Force "$sourceNext\static" "$deployDir\.next\"
        Write-Host "  ✓ Da copy .next/static" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Hoan thanh! Kiem tra:" -ForegroundColor Cyan
if (Test-Path "$deployDir\.next\BUILD_ID") {
    Write-Host "  ✓ BUILD_ID: OK" -ForegroundColor Green
} else {
    Write-Host "  ✗ BUILD_ID: MISSING" -ForegroundColor Red
}

if (Test-Path "$deployDir\.next\prerender-manifest.json") {
    Write-Host "  ✓ prerender-manifest.json: OK" -ForegroundColor Green
} else {
    Write-Host "  ✗ prerender-manifest.json: MISSING" -ForegroundColor Red
}

Write-Host ""
Write-Host "Bay gio co the chay: cd deploy-package; npm start" -ForegroundColor Cyan

