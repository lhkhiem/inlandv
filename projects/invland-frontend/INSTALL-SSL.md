# Hướng dẫn cài SSL cho inlandv-demo.pressup.vn

## Yêu cầu trước
- ✅ Domain đã hoạt động (HTTP)
- ✅ Nginx config đã được setup
- ✅ Port 80 đang mở

## Giải pháp: Cài SSL với Let's Encrypt

### Cách 1: Chạy script tự động (Khuyến nghị)

```bash
ssh -p 22 pressup-cms@14.225.205.116
# Password: 123456

bash /tmp/install-ssl.sh
```

Script sẽ tự động:
1. ✅ Kiểm tra DNS đã trỏ đúng chưa
2. ✅ Cài đặt certbot (nếu chưa có)
3. ✅ Kiểm tra và thêm location .well-known nếu cần
4. ✅ Tạo thư mục cho Let's Encrypt
5. ✅ Cài SSL và tự động redirect HTTP → HTTPS

### Cách 2: Cài thủ công (nếu script không chạy được)

```bash
# 1. Cài đặt certbot (nếu chưa có)
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# 2. Đảm bảo nginx config có location .well-known
# (Nếu chưa có, nó sẽ được certbot tự động thêm)

# 3. Tạo thư mục cho Let's Encrypt
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html

# 4. Cài SSL
sudo certbot --nginx -d inlandv-demo.pressup.vn

# Certbot sẽ hỏi:
# - Email: Nhập email của bạn
# - Agree to terms: Nhập Y
# - Share email: Y hoặc N tùy bạn
# - Redirect HTTP to HTTPS: Nhập 2 (khuyến nghị)
```

### Cách 3: Cài không tương tác (dùng cho script)

```bash
sudo certbot --nginx -d inlandv-demo.pressup.vn \
  --non-interactive \
  --agree-tos \
  --email admin@pressup.vn \
  --redirect
```

## Kiểm tra sau khi cài SSL

```bash
# 1. Test HTTPS
curl -I https://inlandv-demo.pressup.vn

# 2. Kiểm tra certificate
sudo certbot certificates

# 3. Test auto-renewal
sudo certbot renew --dry-run

# 4. Kiểm tra nginx config (certbot đã tự động cập nhật)
sudo nginx -t
cat /etc/nginx/sites-available/inlandv-demo.pressup.vn
```

## Kết quả mong đợi

Sau khi cài SSL:
- ✅ HTTP tự động redirect sang HTTPS
- ✅ Domain truy cập được qua HTTPS
- ✅ Certificate tự động gia hạn mỗi 90 ngày
- ✅ Nginx config đã được certbot tự động cập nhật

## Truy cập

Sau khi cài xong, truy cập:
```
https://inlandv-demo.pressup.vn
```

## Lưu ý

1. **DNS**: Đảm bảo domain `inlandv-demo.pressup.vn` đã trỏ về IP `14.225.205.116`
2. **Port 80**: Phải mở để Let's Encrypt verify domain
3. **Port 443**: Phải mở để HTTPS hoạt động
4. **Auto-renewal**: Certbot tự động setup cron job để gia hạn certificate

## Troubleshooting

### Lỗi: Domain không verify được
```bash
# Kiểm tra DNS
dig +short inlandv-demo.pressup.vn

# Kiểm tra port 80
sudo netstat -tlnp | grep ':80 '

# Kiểm tra nginx đang chạy
sudo systemctl status nginx
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

