# Hướng dẫn enable domain inlandv-demo.pressup.vn

## Vấn đề
Domain `inlandv-demo.pressup.vn` chưa có trong `/etc/nginx/sites-enabled/`, nên nginx chưa proxy domain này về Next.js app.

## Giải pháp

### Cách 1: Chạy script tự động (Khuyến nghị)

```bash
bash /tmp/enable-inlandv-domain.sh
```

Script sẽ tự động:
1. ✅ Copy nginx config vào sites-available
2. ✅ Thêm location cho Let's Encrypt
3. ✅ Tạo symlink trong sites-enabled
4. ✅ Test và reload nginx

### Cách 2: Chạy thủ công (nếu script không chạy được)

```bash
# 1. Copy config
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn

# 2. Thêm location cho Let's Encrypt (nếu cần)
sudo nano /etc/nginx/sites-available/inlandv-demo.pressup.vn
# Thêm vào trước location /:
#     location /.well-known/acme-challenge/ {
#         root /var/www/html;
#     }

# 3. Tạo symlink
sudo ln -s /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn

# 4. Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

## Kiểm tra sau khi enable

```bash
# 1. Kiểm tra symlink đã tạo
ls -la /etc/nginx/sites-enabled/ | grep inlandv

# 2. Test domain
curl -I http://inlandv-demo.pressup.vn

# 3. Kiểm tra nginx status
sudo systemctl status nginx

# 4. Xem logs nếu có lỗi
sudo tail -f /var/log/nginx/inlandv-demo-error.log
```

## Kết quả mong đợi

Sau khi enable:
- ✅ Domain sẽ xuất hiện trong `ls -la /etc/nginx/sites-enabled/`
- ✅ Truy cập `http://inlandv-demo.pressup.vn` sẽ thấy Next.js app
- ✅ Nginx sẽ proxy domain về `localhost:4002`

## Tiếp theo

Sau khi domain hoạt động, có thể cài SSL:
```bash
sudo certbot --nginx -d inlandv-demo.pressup.vn
```

