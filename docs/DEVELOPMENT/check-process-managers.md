# Kiểm tra Process Managers đang chạy

## 🔍 PM2 (Process Manager 2) - Node.js

### Kiểm tra PM2 đang chạy

#### 1. Xem tất cả processes

```bash
pm2 list
# hoặc
pm2 ls
```

#### 2. Xem chi tiết

```bash
pm2 show <app-name>
# hoặc
pm2 describe <app-name>
```

#### 3. Xem logs

```bash
# Tất cả logs
pm2 logs

# Logs của một app cụ thể
pm2 logs <app-name>

# Chỉ lỗi
pm2 logs --err

# Chỉ output
pm2 logs --out
```

#### 4. Xem status

```bash
pm2 status
```

#### 5. Xem thông tin chi tiết (JSON)

```bash
pm2 jlist
```

#### 6. Xem monitoring

```bash
pm2 monit
```

### Kiểm tra PM2 daemon

```bash
# Kiểm tra PM2 daemon có đang chạy không
pm2 ping

# Xem thông tin PM2
pm2 info
```

### Trên Windows (PowerShell)

```powershell
# Kiểm tra PM2 processes
pm2 list

# Kiểm tra PM2 có đang chạy không
Get-Process | Where-Object { $_.ProcessName -like "*pm2*" }

# Hoặc kiểm tra port
netstat -ano | findstr :4000
netstat -ano | findstr :4001
netstat -ano | findstr :4002
netstat -ano | findstr :4003
```

---

## 🔍 Systemd (Linux)

### Kiểm tra services đang chạy

```bash
# Tất cả services
systemctl list-units --type=service --state=running

# Services của user
systemctl --user list-units --type=service --state=running

# Service cụ thể
systemctl status <service-name>

# Ví dụ
systemctl status inlandv-frontend
systemctl status public-backend
```

### Xem logs

```bash
# Logs của service
journalctl -u <service-name> -f

# Logs gần đây
journalctl -u <service-name> -n 100
```

---

## 🔍 Supervisor (Python-based)

### Kiểm tra processes

```bash
# Tất cả processes
supervisorctl status

# Process cụ thể
supervisorctl status <process-name>

# Xem logs
supervisorctl tail <process-name>
supervisorctl tail <process-name> stderr
```

---

## 🔍 Nginx (Web Server)

### Kiểm tra Nginx

```bash
# Status
systemctl status nginx

# Hoặc
nginx -t  # Test config
nginx -s reload  # Reload config

# Xem processes
ps aux | grep nginx
```

---

## 🔍 Kiểm tra Processes theo Port

### Linux/Mac

```bash
# Xem process đang dùng port
lsof -i :4000
lsof -i :4001
lsof -i :4002
lsof -i :4003
lsof -i :6088

# Hoặc dùng netstat
netstat -tulpn | grep :4000
netstat -tulpn | grep :4001
netstat -tulpn | grep :4002
netstat -tulpn | grep :4003
netstat -tulpn | grep :6088

# Hoặc dùng ss (modern)
ss -tulpn | grep :4000
```

### Windows (PowerShell)

```powershell
# Xem process đang dùng port
netstat -ano | findstr :4000
netstat -ano | findstr :4001
netstat -ano | findstr :4002
netstat -ano | findstr :4003
netstat -ano | findstr :6088

# Hoặc dùng Get-NetTCPConnection
Get-NetTCPConnection -LocalPort 4000 | Select-Object LocalAddress, LocalPort, State, OwningProcess
Get-NetTCPConnection -LocalPort 4001 | Select-Object LocalAddress, LocalPort, State, OwningProcess
Get-NetTCPConnection -LocalPort 4002 | Select-Object LocalAddress, LocalPort, State, OwningProcess
Get-NetTCPConnection -LocalPort 4003 | Select-Object LocalAddress, LocalPort, State, OwningProcess
Get-NetTCPConnection -LocalPort 6088 | Select-Object LocalAddress, LocalPort, State, OwningProcess
```

---

## 🔍 Kiểm tra Node.js Processes

### Linux/Mac

```bash
# Tất cả Node.js processes
ps aux | grep node

# Chi tiết hơn
ps aux | grep -E "node|pm2"

# Với tree view
pstree -p | grep node
```

### Windows (PowerShell)

```powershell
# Tất cả Node.js processes
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# Hoặc
tasklist | findstr node.exe

# Chi tiết
Get-Process node | Format-Table Id, ProcessName, CPU, WorkingSet, StartTime
```

---

## 📋 Script kiểm tra tất cả (PowerShell)

Tạo file `check-all-processes.ps1`:

```powershell
# Kiểm tra tất cả Process Managers và Services

Write-Host "=== PM2 Processes ===" -ForegroundColor Cyan
if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    pm2 list
} else {
    Write-Host "PM2 không được cài đặt" -ForegroundColor Yellow
}

Write-Host "`n=== Node.js Processes ===" -ForegroundColor Cyan
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" }
if ($nodeProcesses) {
    $nodeProcesses | Format-Table Id, ProcessName, CPU, WorkingSet, StartTime
} else {
    Write-Host "Không có Node.js processes đang chạy" -ForegroundColor Yellow
}

Write-Host "`n=== Ports đang được sử dụng ===" -ForegroundColor Cyan
$ports = @(4000, 4001, 4002, 4003, 6088)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Port $port : Đang được sử dụng" -ForegroundColor Green
        $connections | Select-Object LocalAddress, LocalPort, State, OwningProcess | Format-Table
    } else {
        Write-Host "Port $port : Không có process" -ForegroundColor Gray
    }
}

Write-Host "`n=== Nginx Status ===" -ForegroundColor Cyan
$nginx = Get-Service -Name nginx -ErrorAction SilentlyContinue
if ($nginx) {
    Write-Host "Nginx Status: $($nginx.Status)" -ForegroundColor $(if ($nginx.Status -eq 'Running') { 'Green' } else { 'Red' })
} else {
    Write-Host "Nginx không được cài đặt hoặc không phải service" -ForegroundColor Yellow
}
```

---

## 📋 Script kiểm tra tất cả (Bash - Linux/Mac)

Tạo file `check-all-processes.sh`:

```bash
#!/bin/bash

echo "=== PM2 Processes ==="
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "PM2 không được cài đặt"
fi

echo ""
echo "=== Node.js Processes ==="
ps aux | grep -E "node|pm2" | grep -v grep

echo ""
echo "=== Ports đang được sử dụng ==="
ports=(4000 4001 4002 4003 6088)
for port in "${ports[@]}"; do
    if lsof -i :$port &> /dev/null; then
        echo "Port $port: Đang được sử dụng"
        lsof -i :$port
    else
        echo "Port $port: Không có process"
    fi
done

echo ""
echo "=== Systemd Services ==="
systemctl list-units --type=service --state=running | grep -E "inlandv|public|cms"

echo ""
echo "=== Nginx Status ==="
if systemctl is-active --quiet nginx; then
    echo "Nginx: Đang chạy"
else
    echo "Nginx: Không chạy"
fi
```

---

## 🎯 Quick Commands

### PM2

```bash
pm2 list              # Danh sách
pm2 status            # Status
pm2 logs              # Logs
pm2 monit             # Monitor
pm2 info              # Info
```

### Systemd

```bash
systemctl status <service>    # Status
systemctl list-units          # List all
journalctl -u <service> -f    # Logs
```

### Ports

```bash
# Linux
lsof -i :PORT
netstat -tulpn | grep :PORT

# Windows
netstat -ano | findstr :PORT
```

---

## 📝 Lưu ý

1. **PM2**: Phổ biến nhất cho Node.js apps
2. **Systemd**: Mặc định trên Linux, tốt cho production
3. **Supervisor**: Python-based, đơn giản
4. **Nginx**: Web server, thường dùng làm reverse proxy

Chọn process manager phù hợp với môi trường của bạn!



