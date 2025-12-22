# Sửa lỗi duplicate location trong nginx

## Vấn đề
Nginx config có lỗi: `duplicate location "/.well-known/acme-challenge/"` vì location này được định nghĩa 3 lần (dòng 14, 45, 56).

## Giải pháp

### Cách 1: Chạy script tự động (Khuyến nghị)

```bash
bash /tmp/fix-nginx-config.sh
```

Script sẽ:
1. ✅ Backup config hiện tại
2. ✅ Xóa tất cả duplicate location
3. ✅ Thêm lại location .well-known 1 lần duy nhất
4. ✅ Test và reload nginx

### Cách 2: Sửa thủ công

```bash
# 1. Backup config
sudo cp /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-available/inlandv-demo.pressup.vn.backup

# 2. Xem file config
sudo nano /etc/nginx/sites-available/inlandv-demo.pressup.vn

# 3. Xóa tất cả location .well-known trùng lặp, chỉ giữ lại 1 location ở đầu file (sau client_max_body_size, trước location /)

# 4. Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

### Hoặc dùng sed để sửa tự động

```bash
# 1. Backup
sudo cp /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-available/inlandv-demo.pressup.vn.backup

# 2. Xóa tất cả location .well-known cũ
sudo sed -i '/location \/.well-known\/acme-challenge/,/^    }$/d' /etc/nginx/sites-available/inlandv-demo.pressup.vn
sudo sed -i '/# Let.*Encrypt verification/d' /etc/nginx/sites-available/inlandv-demo.pressup.vn

# 3. Thêm location .well-known vào đúng chỗ (sau client_max_body_size)
sudo sed -i '/client_max_body_size/a\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn

# 4. Test và reload
sudo nginx -t
sudo systemctl reload nginx
```

## Kiểm tra sau khi fix

```bash
# 1. Test config
sudo nginx -t

# 2. Kiểm tra chỉ còn 1 location .well-known
grep -n "well-known" /etc/nginx/sites-available/inlandv-demo.pressup.vn

# 3. Test domain
curl -I http://inlandv-demo.pressup.vn

# 4. Kiểm tra nginx status
sudo systemctl status nginx
```

## Kết quả mong đợi

Sau khi fix:
- ✅ Chỉ còn 1 location `.well-known/acme-challenge/`
- ✅ Nginx config test pass
- ✅ Domain hoạt động: `http://inlandv-demo.pressup.vn`

