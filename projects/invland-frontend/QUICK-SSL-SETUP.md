# Hướng dẫn nhanh cài SSL

## Các file đã được upload lên VPS:
- `/tmp/nginx-inlandv-demo.conf` - Config HTTP
- `/tmp/nginx-inlandv-demo-ssl.conf` - Config HTTPS (tham khảo)
- `/tmp/setup-ssl.sh` - Script tự động

## Cách cài SSL (Copy paste từng bước)

### Bước 1: SSH vào VPS
```bash
ssh -p 22 pressup-cms@14.225.205.116
# Nhập password: 123456
```

### Bước 2: Setup nginx config tạm thời
```bash
# Copy config HTTP
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Thêm location cho Let's Encrypt (chạy lệnh này)
sudo sed -i '/location \//i\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Tạo symlink
sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn

# Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 3: Tạo thư mục cho Let's Encrypt
```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
```

### Bước 4: Cài SSL với certbot
```bash
sudo certbot --nginx -d inlandv-demo.pressup.vn
```

Certbot sẽ hỏi:
1. **Email**: Nhập email của bạn (để nhận thông báo gia hạn)
2. **Agree to terms**: Nhập `Y` và Enter
3. **Share email**: Nhập `Y` hoặc `N` tùy bạn
4. Certbot sẽ tự động cấu hình nginx với SSL

### Bước 5: Kiểm tra
```bash
# Test HTTPS
curl -I https://inlandv-demo.pressup.vn

# Xem thông tin certificate
sudo certbot certificates
```

## Hoặc dùng script tự động

```bash
# Chỉnh sửa email trong script (nếu cần)
nano /tmp/setup-ssl.sh
# Sửa dòng: EMAIL="admin@pressup.vn"

# Chạy script
bash /tmp/setup-ssl.sh
```

## Kết quả

Sau khi cài xong:
- ✅ HTTP sẽ tự động redirect sang HTTPS
- ✅ Certificate tự động gia hạn mỗi 90 ngày
- ✅ Truy cập: **https://inlandv-demo.pressup.vn**

## Troubleshooting

Nếu gặp lỗi, kiểm tra:
```bash
# Xem logs certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Xem logs nginx
sudo tail -f /var/log/nginx/inlandv-demo-error.log

# Kiểm tra nginx config
sudo nginx -t
```

