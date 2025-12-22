# Hướng dẫn cài SSL cho inlandv-demo.pressup.vn

## Cách 1: Dùng script tự động (Khuyến nghị)

```bash
ssh -p 22 pressup-cms@14.225.205.116
bash /tmp/setup-ssl.sh
```

Script sẽ tự động:
1. Kiểm tra domain đã trỏ DNS chưa
2. Cài đặt certbot (nếu chưa có)
3. Cấu hình nginx tạm thời
4. Cài SSL với Let's Encrypt
5. Cấu hình auto-renewal

## Cách 2: Cài thủ công

### Bước 1: SSH vào VPS
```bash
ssh -p 22 pressup-cms@14.225.205.116
```

### Bước 2: Cài đặt certbot (nếu chưa có)
```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Bước 3: Setup nginx config tạm thời (chỉ HTTP)
```bash
# Copy config HTTP
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Thêm location cho Let's Encrypt verification
sudo nano /etc/nginx/sites-available/inlandv-demo.pressup.vn
# Thêm vào trước location /:
#     location /.well-known/acme-challenge/ {
#         root /var/www/html;
#     }

# Tạo symlink
sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 4: Cài SSL với certbot
```bash
sudo certbot --nginx -d inlandv-demo.pressup.vn
```

Certbot sẽ:
- Yêu cầu email (để nhận thông báo gia hạn)
- Hỏi đồng ý điều khoản
- Tự động cấu hình nginx với SSL
- Tự động redirect HTTP → HTTPS

### Bước 5: Kiểm tra auto-renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Xem thông tin certificate
sudo certbot certificates
```

## Kiểm tra SSL

```bash
# Test HTTPS
curl -I https://inlandv-demo.pressup.vn

# Kiểm tra certificate
openssl s_client -connect inlandv-demo.pressup.vn:443 -servername inlandv-demo.pressup.vn < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Test online
# Truy cập: https://www.ssllabs.com/ssltest/analyze.html?d=inlandv-demo.pressup.vn
```

## Lưu ý

1. **DNS**: Đảm bảo domain `inlandv-demo.pressup.vn` đã trỏ về IP `14.225.205.116`
2. **Port 80**: Phải mở port 80 để Let's Encrypt verify domain
3. **Auto-renewal**: Certbot tự động setup cron job để gia hạn certificate mỗi 90 ngày
4. **Email**: Dùng email thật để nhận thông báo gia hạn

## Troubleshooting

### Lỗi: Domain không verify được
```bash
# Kiểm tra DNS
dig +short inlandv-demo.pressup.vn

# Kiểm tra nginx đang chạy
sudo systemctl status nginx

# Kiểm tra port 80
sudo netstat -tlnp | grep :80
```

### Lỗi: Certificate đã hết hạn
```bash
# Gia hạn thủ công
sudo certbot renew

# Reload nginx
sudo systemctl reload nginx
```

### Xem logs
```bash
# Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Nginx logs
sudo tail -f /var/log/nginx/inlandv-demo-error.log
```

