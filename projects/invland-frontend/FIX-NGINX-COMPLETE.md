# Hướng dẫn fix hoàn chỉnh cho domain inlandv-demo.pressup.vn

## Vấn đề hiện tại
- ✅ Nginx config đã được tạo (symlink đã có)
- ❌ Nginx **không chạy**
- ❌ Domain vẫn hiển thị Apache2 Default Page

## Giải pháp: Chạy script tổng hợp

### Cách 1: Chạy script tự động (Khuyến nghị)

```bash
ssh -p 22 pressup-cms@14.225.205.116
# Password: 123456

bash /tmp/start-nginx-fix.sh
```

Script sẽ tự động:
1. ✅ Khởi động Nginx (nếu chưa chạy)
2. ✅ Test và fix nginx config (nếu có lỗi)
3. ✅ Reload nginx
4. ✅ Kiểm tra port 80
5. ✅ Test domain

### Cách 2: Chạy thủ công (từng bước)

```bash
# 1. Khởi động Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 2. Test config (nếu có lỗi, sẽ được fix)
sudo nginx -t

# 3. Nếu có lỗi duplicate location, sửa:
sudo cp /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-available/inlandv-demo.pressup.vn.backup
sudo sed -i '/location \/.well-known\/acme-challenge/,/^    }$/d' /etc/nginx/sites-available/inlandv-demo.pressup.vn
sudo sed -i '/# Let.*Encrypt verification/d' /etc/nginx/sites-available/inlandv-demo.pressup.vn
sudo sed -i '/client_max_body_size/a\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn

# 4. Test lại
sudo nginx -t

# 5. Reload nginx
sudo systemctl reload nginx

# 6. Kiểm tra nginx đang chạy
sudo systemctl status nginx

# 7. Kiểm tra port 80
sudo ss -tlnp | grep ':80 '

# 8. Test domain
curl -I http://inlandv-demo.pressup.vn
curl -I http://localhost:4002
```

## Kiểm tra sau khi fix

```bash
# 1. Kiểm tra Nginx status
sudo systemctl status nginx

# 2. Kiểm tra domain
curl -I http://inlandv-demo.pressup.vn

# 3. Kiểm tra logs nếu có lỗi
sudo tail -f /var/log/nginx/inlandv-demo-error.log

# 4. Kiểm tra port 80 đang được dùng bởi service nào
sudo ss -tlnp | grep ':80 '

# 5. Test Next.js app trực tiếp
curl -I http://localhost:4002
```

## Kết quả mong đợi

Sau khi fix:
- ✅ Nginx đang chạy
- ✅ Nginx config test pass
- ✅ Port 80 được dùng bởi nginx
- ✅ Domain `inlandv-demo.pressup.vn` trỏ về Next.js app
- ✅ Truy cập browser sẽ thấy Next.js app thay vì Apache page

## Troubleshooting

### Nếu vẫn thấy Apache page:
1. Kiểm tra default config:
   ```bash
   cat /etc/nginx/sites-available/default
   ```
2. Disable default config:
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Nếu Nginx không khởi động:
```bash
# Xem logs
sudo journalctl -u nginx -n 50

# Kiểm tra config
sudo nginx -t

# Kiểm tra port conflict
sudo lsof -i :80
```

