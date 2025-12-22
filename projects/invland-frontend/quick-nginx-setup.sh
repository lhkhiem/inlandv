#!/bin/bash
# Quick setup nginx - Copy paste các lệnh này vào terminal VPS

echo "=== Setup Nginx cho inlandv-demo.pressup.vn ==="
echo ""
echo "Chạy các lệnh sau trên VPS:"
echo ""
echo "# 1. Copy config"
echo "sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn"
echo ""
echo "# 2. Tạo symlink"
echo "sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn"
echo ""
echo "# 3. Test config"
echo "sudo nginx -t"
echo ""
echo "# 4. Reload nginx"
echo "sudo systemctl reload nginx"
echo ""
echo "# 5. Kiểm tra"
echo "curl -I http://inlandv-demo.pressup.vn"
echo ""

