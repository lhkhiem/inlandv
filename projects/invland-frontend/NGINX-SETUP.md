# Hướng dẫn Setup Nginx cho inlandv-demo.pressup.vn

## File đã được upload lên VPS:
- `/tmp/nginx-inlandv-demo.conf` - Config file
- `/tmp/setup-nginx.sh` - Setup script

## Cách 1: Chạy script tự động (cần sudo password)

```bash
ssh -p 22 pressup-cms@14.225.205.116
bash /tmp/setup-nginx.sh
# Nhập sudo password khi được hỏi
```

## Cách 2: Setup thủ công

### Bước 1: SSH vào VPS
```bash
ssh -p 22 pressup-cms@14.225.205.116
```

### Bước 2: Copy config file
```bash
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn
```

### Bước 3: Tạo symlink
```bash
sudo ln -s /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn
```

### Bước 4: Test config
```bash
sudo nginx -t
```

### Bước 5: Reload nginx
```bash
sudo systemctl reload nginx
```

## Kiểm tra

```bash
# Kiểm tra nginx status
sudo systemctl status nginx

# Test domain
curl -I http://inlandv-demo.pressup.vn

# Xem logs
sudo tail -f /var/log/nginx/inlandv-demo-access.log
sudo tail -f /var/log/nginx/inlandv-demo-error.log
```

## Truy cập

Sau khi setup xong, truy cập:
- **HTTP**: http://inlandv-demo.pressup.vn
- **Backend**: http://14.225.205.116:4002

## Lưu ý

1. Đảm bảo domain `inlandv-demo.pressup.vn` đã được trỏ DNS về IP `14.225.205.116`
2. Nếu muốn thêm SSL (HTTPS), có thể dùng Let's Encrypt:
   ```bash
   sudo certbot --nginx -d inlandv-demo.pressup.vn
   ```

