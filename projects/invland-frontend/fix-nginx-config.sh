#!/bin/bash
# Script sửa lỗi duplicate location trong nginx config

echo "=========================================="
echo "  Fix duplicate location trong nginx"
echo "=========================================="
echo ""

CONFIG_FILE="/etc/nginx/sites-available/inlandv-demo.pressup.vn"

# Backup config
echo "[1/4] Backup config..."
sudo cp $CONFIG_FILE ${CONFIG_FILE}.backup
echo "✅ Backup da duoc tao: ${CONFIG_FILE}.backup"

# Xóa tất cả location .well-known cũ
echo ""
echo "[2/4] Xoa duplicate location..."
sudo sed -i '/location \/.well-known\/acme-challenge/,/^    }$/d' $CONFIG_FILE

# Xóa các dòng comment trống liên quan
sudo sed -i '/# Let.*Encrypt verification/d' $CONFIG_FILE

# Thêm location cho .well-known vào đúng chỗ (sau client_max_body_size, trước location /)
echo ""
echo "[3/4] Them location .well-known..."
sudo sed -i '/client_max_body_size/a\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' $CONFIG_FILE

echo "✅ Location da duoc them"

# Test nginx config
echo ""
echo "[4/4] Test Nginx config..."
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
    echo ""
    echo "Restore tu backup:"
    echo "  sudo cp ${CONFIG_FILE}.backup $CONFIG_FILE"
    exit 1
fi

