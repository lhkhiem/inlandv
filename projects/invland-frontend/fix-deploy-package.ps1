# Script sửa deploy-package để có đầy đủ .next

$deployDir = "deploy-package"

Write-Host "Sua deploy-package..." -ForegroundColor Green

# Tạo thư mục .next nếu chưa có
if (-not (Test-Path "$deployDir\.next")) {
    New-Item -ItemType Directory -Path "$deployDir\.next" -Force | Out-Null
    Write-Host "Tao thu muc .next" -ForegroundColor Yellow
}

# Copy .next/server
if (Test-Path ".next\server") {
    Write-Host "Copy .next/server..." -ForegroundColor Yellow
    if (Test-Path "$deployDir\.next\server") {
        Remove-Item -Recurse -Force "$deployDir\.next\server"
    }
    Copy-Item -Recurse -Force ".next\server" "$deployDir\.next\"
    Write-Host "✓ Da copy .next/server" -ForegroundColor Green
} else {
    Write-Host "✗ Khong tim thay .next/server" -ForegroundColor Red
}

# Copy .next/static
if (Test-Path ".next\static") {
    Write-Host "Copy .next/static..." -ForegroundColor Yellow
    if (Test-Path "$deployDir\.next\static") {
        Remove-Item -Recurse -Force "$deployDir\.next\static"
    }
    Copy-Item -Recurse -Force ".next\static" "$deployDir\.next\"
    Write-Host "✓ Da copy .next/static" -ForegroundColor Green
} else {
    Write-Host "✗ Khong tim thay .next/static" -ForegroundColor Red
}

# Copy manifest files
$manifestFiles = @("build-manifest.json", "app-build-manifest.json", "react-loadable-manifest.json")
foreach ($file in $manifestFiles) {
    $sourceFile = ".next\$file"
    if (Test-Path $sourceFile) {
        Copy-Item -Force $sourceFile "$deployDir\.next\" -ErrorAction SilentlyContinue
        Write-Host "✓ Da copy $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Hoan thanh! Kiem tra thu muc .next:" -ForegroundColor Cyan
if (Test-Path "$deployDir\.next") {
    Get-ChildItem "$deployDir\.next" | Select-Object Name
} else {
    Write-Host "✗ Thu muc .next van khong ton tai" -ForegroundColor Red
}








