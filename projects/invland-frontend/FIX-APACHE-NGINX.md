# Sửa lỗi Apache đang chiếm port 80

## Vấn đề
Domain `inlandv-demo.pressup.vn` đang hiển thị Apache2 Default Page thay vì Next.js app vì Apache đang chạy và chiếm port 80.

## Giải pháp nhanh

### Cách 1: Chạy script tự động
```bash
ssh -p 22 pressup-cms@14.225.205.116
# Password: 123456

chmod +x /tmp/fix-apache-nginx.sh
bash /tmp/fix-apache-nginx.sh
```

### Cách 2: Chạy thủ công (copy paste từng lệnh)

```bash
ssh -p 22 pressup-cms@14.225.205.116
# Password: 123456

# 1. Tắt Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# 2. Đảm bảo Nginx đang chạy
sudo systemctl start nginx
sudo systemctl enable nginx

# 3. Kiểm tra và tạo nginx config (nếu chưa có)
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn
sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn

# 4. Test và reload nginx
sudo nginx -t
sudo systemctl reload nginx

# 5. Kiểm tra port 80
sudo netstat -tlnp | grep ':80 '
# Hoặc
sudo ss -tlnp | grep ':80 '

# Nếu vẫn thấy Apache, kill process
sudo pkill -9 apache2
sudo systemctl restart nginx
```

## Kiểm tra kết quả

```bash
# Test domain
curl -I http://inlandv-demo.pressup.vn

# Kiểm tra status
sudo systemctl status nginx
sudo systemctl status apache2

# Xem logs nginx
sudo tail -f /var/log/nginx/inlandv-demo-access.log
```

## Kết quả mong đợi

Sau khi fix:
- ✅ Apache đã tắt
- ✅ Nginx đang chạy trên port 80
- ✅ Domain trỏ đúng về Next.js app (port 4002)
- ✅ Truy cập `http://inlandv-demo.pressup.vn` sẽ thấy Next.js app

## Lưu ý

Nếu bạn cần dùng Apache cho domain khác:
- Cấu hình Apache chạy trên port khác (ví dụ: 8080)
- Hoặc dùng Nginx làm reverse proxy cho cả Apache và Next.js

