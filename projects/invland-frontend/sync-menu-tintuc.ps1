# Script dong bo menu va tin tuc tu VPS ve local
# Chi dong bo cac file lien quan den menu va tin tuc

$ErrorActionPreference = "Stop"

$VpsHost = "14.225.205.116"
$VpsUser = "pressup-cms"
$VpsPort = "22"
$VpsPath = "/var/www/inlandv"
$LocalPath = "."

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Sync Menu & Tin tuc tu VPS ve Local" -ForegroundColor Cyan
Write-Host "  VPS Path: $VpsPath" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Danh sach cac file can dong bo
$filesToSync = @(
    # Menu files
    @{ Remote = "$VpsPath/components/layout/navigationData.ts"; Local = "components/layout/navigationData.ts" },
    @{ Remote = "$VpsPath/components/layout/BurgerMenu.tsx"; Local = "components/layout/BurgerMenu.tsx" },
    @{ Remote = "$VpsPath/components/layout/Header.tsx"; Local = "components/layout/Header.tsx" },
    
    # Tin tuc files
    @{ Remote = "$VpsPath/app/tin-tuc-hoat-dong/page.tsx"; Local = "app/tin-tuc-hoat-dong/page.tsx" },
    @{ Remote = "$VpsPath/app/tin-tuc-hoat-dong/[slug]/page.tsx"; Local = "app/tin-tuc-hoat-dong/[slug]/page.tsx" },
    @{ Remote = "$VpsPath/components/news-activities/NewsActivitySection.tsx"; Local = "components/news-activities/NewsActivitySection.tsx" },
    @{ Remote = "$VpsPath/components/news-activities/ActivitiesSection.tsx"; Local = "components/news-activities/ActivitiesSection.tsx" },
    @{ Remote = "$VpsPath/lib/newsActivitiesData.ts"; Local = "lib/newsActivitiesData.ts" }
)

# Kiem tra ket noi
Write-Host "[1/3] Kiem tra ket noi VPS..." -ForegroundColor Yellow
$testResult = ssh -p $VpsPort -o ConnectTimeout=5 -o StrictHostKeyChecking=no $VpsUser@$VpsHost "echo 'OK'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Khong the ket noi den VPS" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Ket noi thanh cong" -ForegroundColor Green
Write-Host ""

# Hien thi danh sach file se dong bo
Write-Host "[2/3] Danh sach file se dong bo:" -ForegroundColor Yellow
foreach ($file in $filesToSync) {
    Write-Host "  - $($file.Local)" -ForegroundColor Gray
}
Write-Host ""

# Xac nhan
Write-Host "[3/3] Xac nhan dong bo..." -ForegroundColor Yellow
Write-Host "  CA NHAC: Cac file local se bi ghi de boi file tu VPS!" -ForegroundColor Red
$confirm = Read-Host "  Ban co muon tiep tuc? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "[CANCEL] Da huy dong bo" -ForegroundColor Yellow
    exit 0
}
Write-Host ""

# Backup local truoc
$backupDir = "local-backup-menu-tintuc-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Tao backup local tai: $backupDir" -ForegroundColor Gray
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Dong bo tung file
$successCount = 0
$failCount = 0
$skipCount = 0

foreach ($file in $filesToSync) {
    $remoteFile = $file.Remote
    $localFile = $file.Local
    
    Write-Host ""
    Write-Host "Dong bo: $localFile" -ForegroundColor Cyan
    
    # Kiem tra file co ton tai tren VPS khong
    $fileExists = ssh -p $VpsPort $VpsUser@$VpsHost "test -f '$remoteFile' && echo 'EXISTS' || echo 'NOT_EXISTS'" 2>&1
    if ($fileExists -match "EXISTS") {
        # Backup file local neu co
        if (Test-Path $localFile) {
            $backupPath = Join-Path $backupDir $localFile
            $backupDirPath = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupDirPath)) {
                New-Item -ItemType Directory -Path $backupDirPath -Force | Out-Null
            }
            Copy-Item -Path $localFile -Destination $backupPath -Force | Out-Null
            Write-Host "  [BACKUP] Da backup file local" -ForegroundColor Gray
        }
        
        # Tao thu muc local neu chua co
        $localDir = Split-Path $localFile -Parent
        if ($localDir -and -not (Test-Path $localDir)) {
            New-Item -ItemType Directory -Path $localDir -Force | Out-Null
            Write-Host "  [CREATE] Da tao thu muc: $localDir" -ForegroundColor Gray
        }
        
        # Download tu VPS ve local
        Write-Host "  [SYNC] Dang tai file tu VPS..." -ForegroundColor Gray
        scp -P $VpsPort "$VpsUser@${VpsHost}:$remoteFile" "$localFile" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Dong bo thanh cong" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  [ERROR] Dong bo that bai" -ForegroundColor Red
            $failCount++
        }
    } else {
        Write-Host "  [SKIP] File khong ton tai tren VPS" -ForegroundColor Yellow
        $skipCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ket qua dong bo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Thanh cong: $successCount file" -ForegroundColor Green
Write-Host "  That bai: $failCount file" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "  Bo qua: $skipCount file" -ForegroundColor $(if ($skipCount -gt 0) { "Yellow" } else { "Gray" })
Write-Host ""
Write-Host "Backup local duoc luu tai: $backupDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ban co the:" -ForegroundColor Cyan
Write-Host "  1. Kiem tra cac file da dong bo" -ForegroundColor White
Write-Host "  2. So sanh voi backup neu can" -ForegroundColor White
Write-Host "  3. Commit cac thay doi vao git:" -ForegroundColor White
Write-Host "     git add components/layout/ app/tin-tuc-hoat-dong/ components/news-activities/ lib/" -ForegroundColor Gray
Write-Host "     git commit -m 'sync: Dong bo menu va tin tuc tu VPS'" -ForegroundColor Gray
Write-Host "     git push" -ForegroundColor Gray
Write-Host ""



