#!/bin/bash
# Script sửa lỗi duplicate location trong nginx config

echo "=========================================="
echo "  Fix duplicate location trong nginx"
echo "=========================================="
echo ""

CONFIG_FILE="/etc/nginx/sites-available/inlandv-demo.pressup.vn"

# Backup config
echo "[1/3] Backup config..."
sudo cp $CONFIG_FILE ${CONFIG_FILE}.backup
echo "✅ Backup da duoc tao: ${CONFIG_FILE}.backup"

# Sửa duplicate location
echo ""
echo "[2/3] Sua duplicate location..."
# Xóa các dòng duplicate location cho .well-known
sudo sed -i '/location \/.well-known\/acme-challenge/,/}/d' $CONFIG_FILE

# Thêm location cho .well-known vào đúng chỗ (trước location /)
sudo sed -i '/location \//i\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' $CONFIG_FILE

echo "✅ Duplicate location da duoc sua"

# Test nginx config
echo ""
echo "[3/3] Test Nginx config..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config hop le"
    sudo systemctl reload nginx
    echo "✅ Nginx da duoc reload"
    echo ""
    echo "=========================================="
    echo "  Hoan thanh!"
    echo "=========================================="
    echo ""
    echo "Kiem tra:"
    echo "  curl -I http://inlandv-demo.pressup.vn"
    echo "  ls -la /etc/nginx/sites-enabled/ | grep inlandv"
    echo ""
else
    echo "❌ Nginx config van co loi!"
    echo ""
    echo "Xem loi chi tiet:"
    sudo nginx -t
    exit 1
fi

