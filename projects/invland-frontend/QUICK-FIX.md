# Hướng dẫn nhanh fix public-frontend

## Vấn đề
- PM2 process đang chạy tốt (online, port 4002)
- Nhưng domain chưa trỏ về Next.js app vì nginx chưa được cấu hình

## Giải pháp: Chạy script tự động

```bash
ssh -p 22 pressup-cms@14.225.205.116
# Password: 123456

bash /tmp/setup-nginx-complete.sh
```

Script sẽ tự động:
1. ✅ Tắt Apache (nếu đang chạy)
2. ✅ Khởi động Nginx (nếu chưa chạy)
3. ✅ Tạo nginx config cho domain
4. ✅ Test và reload nginx
5. ✅ Kiểm tra port 80

## Hoặc chạy thủ công

```bash
# 1. Tắt Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# 2. Đảm bảo Nginx chạy
sudo systemctl start nginx
sudo systemctl enable nginx

# 3. Tạo nginx config
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Thêm location cho Let's Encrypt
sudo sed -i '/location \//i\    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Tạo symlink
sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn

# 4. Test và reload
sudo nginx -t
sudo systemctl reload nginx

# 5. Nếu Apache vẫn chiếm port
sudo pkill -9 apache2
sudo systemctl restart nginx
```

## Kiểm tra sau khi fix

```bash
# Test domain
curl -I http://inlandv-demo.pressup.vn

# Test backend trực tiếp
curl -I http://localhost:4002

# Kiểm tra status
sudo systemctl status nginx
pm2 list
```

## Kết quả mong đợi

Sau khi fix:
- ✅ Domain `inlandv-demo.pressup.vn` trỏ về Next.js app
- ✅ Truy cập browser sẽ thấy website thay vì Apache default page
- ✅ PM2 process vẫn chạy ổn định

