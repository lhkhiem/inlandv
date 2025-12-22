# Cách kiểm tra các domain đang chạy trên VPS

## 1. Kiểm tra các domain được cấu hình trong Nginx

### Xem tất cả config đang enabled
```bash
ls -la /etc/nginx/sites-enabled/
```

### Xem tất cả config có sẵn
```bash
ls -la /etc/nginx/sites-available/
```

### Xem server_name trong các config
```bash
grep -r "server_name" /etc/nginx/sites-enabled/
```

### Xem chi tiết các domain và port
```bash
grep -E "server_name|listen|proxy_pass" /etc/nginx/sites-enabled/* | grep -v "^#"
```

## 2. Kiểm tra các PM2 processes đang chạy

### Xem tất cả processes
```bash
pm2 list
```

### Xem thông tin chi tiết
```bash
pm2 describe all
```

### Xem logs của process cụ thể
```bash
pm2 logs <process-name>
```

## 3. Kiểm tra port đang được sử dụng

### Xem tất cả port đang listen
```bash
sudo netstat -tlnp | grep LISTEN
# hoặc
sudo ss -tlnp
```

### Xem port cụ thể (ví dụ: 80, 443)
```bash
sudo netstat -tlnp | grep ':80 '
sudo netstat -tlnp | grep ':443 '
# hoặc
sudo ss -tlnp | grep ':80 '
sudo ss -tlnp | grep ':443 '
```

### Xem service nào đang dùng port
```bash
sudo lsof -i :80
sudo lsof -i :443
```

## 4. Kiểm tra Nginx status

### Xem status nginx
```bash
sudo systemctl status nginx
```

### Xem nginx config test
```bash
sudo nginx -t
```

### Xem nginx version và modules
```bash
nginx -V
```

## 5. Kiểm tra Apache (nếu có)

### Xem status apache
```bash
sudo systemctl status apache2
```

### Xem apache config
```bash
ls -la /etc/apache2/sites-enabled/
```

## 6. Script tổng hợp để xem tất cả

### Tạo script xem tất cả domain
```bash
cat > ~/check-domains.sh << 'EOF'
#!/bin/bash
echo "=========================================="
echo "  DANH SACH DOMAIN DANG CHAY"
echo "=========================================="
echo ""

echo "[1] Nginx configs enabled:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^total" | awk '{print $9, $10, $11}'
echo ""

echo "[2] Server names trong Nginx:"
grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^#" | sed 's/.*server_name//' | sed 's/;//' | awk '{print "  - " $0}'
echo ""

echo "[3] Ports đang listen:"
sudo netstat -tlnp 2>/dev/null | grep LISTEN | awk '{print "  - Port " $4 " -> " $7}' | sort
echo ""

echo "[4] PM2 processes:"
pm2 list --no-color | grep -E "name|online|errored" | head -20
echo ""

echo "[5] Nginx status:"
sudo systemctl is-active nginx 2>/dev/null && echo "  ✅ Nginx đang chạy" || echo "  ❌ Nginx không chạy"
echo ""

echo "[6] Apache status:"
sudo systemctl is-active apache2 2>/dev/null && echo "  ⚠️  Apache đang chạy" || echo "  ✅ Apache không chạy"
echo ""
EOF

chmod +x ~/check-domains.sh
```

### Chạy script
```bash
bash ~/check-domains.sh
```

## 7. Kiểm tra domain cụ thể

### Test domain có hoạt động không
```bash
curl -I http://domain.com
curl -I https://domain.com
```

### Kiểm tra DNS của domain
```bash
dig domain.com
nslookup domain.com
```

### Kiểm tra SSL certificate
```bash
openssl s_client -connect domain.com:443 -servername domain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

## Lệnh nhanh nhất

```bash
# Xem tất cả domain trong nginx
grep -r "server_name" /etc/nginx/sites-enabled/ | grep -v "^#" | sed 's/.*server_name//' | sed 's/;//'

# Xem PM2 processes
pm2 list

# Xem ports đang dùng
sudo ss -tlnp | grep -E ":80|:443|:3000|:4000|:4002"
```

