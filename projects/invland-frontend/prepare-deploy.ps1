# Script chuẩn bị files để deploy lên VPS
# Chạy script này sau khi build xong

$deployDir = "deploy-package"
$standaloneDir = ".next/standalone"
$staticDir = ".next/static"
$serverDir = ".next/server"
$publicDir = "public"

Write-Host "Chuan bi files de deploy..." -ForegroundColor Green

# Tạo thư mục deploy
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Kiểm tra và copy standalone (nếu có)
if (Test-Path $standaloneDir) {
Write-Host "Copy standalone build..." -ForegroundColor Yellow
Copy-Item -Recurse -Force "$standaloneDir\*" "$deployDir\"
} else {
    Write-Host "Standalone build khong tim thay, se copy .next/server va .next/static..." -ForegroundColor Yellow
    
    # Copy .next/server
    if (Test-Path $serverDir) {
        Write-Host "Copy .next/server..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path "$deployDir\.next" -Force | Out-Null
        Copy-Item -Recurse -Force "$serverDir" "$deployDir\.next\"
    }
    
    # Copy .next/static
    if (Test-Path $staticDir) {
        Write-Host "Copy .next/static..." -ForegroundColor Yellow
        if (-not (Test-Path "$deployDir\.next")) {
New-Item -ItemType Directory -Path "$deployDir\.next" -Force | Out-Null
        }
Copy-Item -Recurse -Force "$staticDir" "$deployDir\.next\"
    }

    # Copy các file manifest cần thiết
    $manifestFiles = @("build-manifest.json", "app-build-manifest.json", "react-loadable-manifest.json")
    foreach ($file in $manifestFiles) {
        $sourceFile = ".next\$file"
        if (Test-Path $sourceFile) {
            Write-Host "Copy $file..." -ForegroundColor Yellow
            if (-not (Test-Path "$deployDir\.next")) {
                New-Item -ItemType Directory -Path "$deployDir\.next" -Force | Out-Null
            }
            Copy-Item -Force $sourceFile "$deployDir\.next\"
        }
    }
    
    # Tạo server.js đơn giản (nếu không có standalone)
    Write-Host "Tao server.js..." -ForegroundColor Yellow
    $serverJs = @"
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 4002

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://` + hostname + `:` + port)
  })
})
"@
    $serverJs | Out-File -FilePath "$deployDir\server.js" -Encoding UTF8 -NoNewline
    
    # Copy package.json với chỉ dependencies (không có devDependencies)
    Write-Host "Copy package.json..." -ForegroundColor Yellow
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $deployPackageJson = @{
        name = $packageJson.name
        version = $packageJson.version
        private = $true
        scripts = @{
            start = "node server.js"
        }
        dependencies = $packageJson.dependencies
    } | ConvertTo-Json -Depth 10
    $deployPackageJson | Out-File -FilePath "$deployDir\package.json" -Encoding UTF8
}

# Copy public files (nếu chưa copy trong standalone)
if (-not (Test-Path "$deployDir\public")) {
    Write-Host "Copy public assets..." -ForegroundColor Yellow
    Copy-Item -Recurse -Force "$publicDir" "$deployDir\"
}

# Copy next.config.js nếu có
if (Test-Path "next.config.js") {
    Write-Host "Copy next.config.js..." -ForegroundColor Yellow
    Copy-Item -Force "next.config.js" "$deployDir\"
}

# Tạo file .env.example
Write-Host "Tao .env.example..." -ForegroundColor Yellow
$envContent = @"
NODE_ENV=production
PORT=4002
NEXT_PUBLIC_API_URL=http://localhost:4000/api
"@
$envContent | Out-File -FilePath "$deployDir\.env.example" -Encoding UTF8 -NoNewline

# Tạo script start.sh cho VPS
Write-Host "Tao start script..." -ForegroundColor Yellow
$startScript = @"
#!/bin/bash
# Script de chay Next.js standalone tren VPS

export NODE_ENV=production
export PORT=4002

# Chay server
node server.js
"@
$startScript | Out-File -FilePath "$deployDir\start.sh" -Encoding UTF8 -NoNewline

# Tạo README cho deployment
Write-Host "Tao README..." -ForegroundColor Yellow
$readmeContent = @"
# Huong dan Deploy len VPS

## Files trong package nay:
- server.js - Next.js server
- .next/static/ - Static assets
- public/ - Public files
- node_modules/ - Dependencies (neu co)

## Cach deploy:

### 1. Upload files len VPS
scp -r deploy-package/* user@vps:/path/to/deploy/

### 2. Tren VPS, cai dat Node.js (neu chua co)
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Hoac dung nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

### 3. Tao file .env
cd /path/to/deploy
cp .env.example .env
nano .env  # Sua cac gia tri can thiet

### 4. Chay server
# Cach 1: Chay truc tiep
NODE_ENV=production PORT=4002 node server.js

# Cach 2: Dung PM2 (khuyen nghi)
npm install -g pm2
pm2 start server.js --name public-frontend --env production -- --port 4002
pm2 save
pm2 startup  # Tu dong start khi server reboot

### 5. Cau hinh Nginx (tuy chon)
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_cache_bypass `$http_upgrade;
    }
}

## Luu y:
- Dam bao port 4002 khong bi firewall chan
- Kiem tra Node.js version >= 18 (khuyen nghi >= 20)
- Neu thieu dependencies, chay: npm install --production trong thu muc deploy
- Kiem tra logs: pm2 logs public-frontend
"@
$readmeContent | Out-File -FilePath "$deployDir\README-DEPLOY.md" -Encoding UTF8 -NoNewline

# Tạo ecosystem.config.js cho PM2
Write-Host "Tao ecosystem.config.js..." -ForegroundColor Yellow
$ecosystemJs = 'module.exports = {' + "`n" +
'  apps: [{' + "`n" +
'    name: ''public-frontend'',' + "`n" +
'    script: ''./server.js'',' + "`n" +
'    instances: 1,' + "`n" +
'    exec_mode: ''fork'',' + "`n" +
'    env: {' + "`n" +
'      NODE_ENV: ''production'',' + "`n" +
'      PORT: 4002,' + "`n" +
'      HOSTNAME: ''0.0.0.0'',' + "`n" +
'      NEXT_PUBLIC_API_URL: ''http://localhost:4000/api''' + "`n" +
'    },' + "`n" +
'    error_file: ''./logs/public-frontend-error.log'',' + "`n" +
'    out_file: ''./logs/public-frontend-out.log'',' + "`n" +
'    log_date_format: ''YYYY-MM-DD HH:mm:ss Z'',' + "`n" +
'    merge_logs: true,' + "`n" +
'    autorestart: true,' + "`n" +
'    max_restarts: 10,' + "`n" +
'    min_uptime: ''10s'',' + "`n" +
'    max_memory_restart: ''500M''' + "`n" +
'  }]' + "`n" +
'};'
$ecosystemJs | Out-File -FilePath "$deployDir\ecosystem.config.js" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "Hoan thanh! Files da duoc chuan bi trong thu muc: $deployDir" -ForegroundColor Green
Write-Host ""
Write-Host "De upload len VPS, chay:" -ForegroundColor Cyan
Write-Host "   scp -r $deployDir\* user@vps:/path/to/deploy/" -ForegroundColor White
Write-Host ""
Write-Host "Hoac tao file ZIP:" -ForegroundColor Cyan
Write-Host "   Compress-Archive -Path $deployDir\* -DestinationPath deploy-package.zip -Force" -ForegroundColor White
Write-Host ""

