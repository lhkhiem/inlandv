#!/bin/bash
# Script sửa config nginx - copy file sạch mới

echo "=========================================="
echo "  Fix Nginx config - Copy file clean"
echo "=========================================="
echo ""

CONFIG_FILE="/etc/nginx/sites-available/inlandv-demo.pressup.vn"
CLEAN_CONFIG="/tmp/nginx-inlandv-demo-clean.conf"

# Backup config cũ
echo "[1/3] Backup config cu..."
sudo cp $CONFIG_FILE ${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup da duoc tao"

# Copy config sạch mới
echo ""
echo "[2/3] Copy config clean moi..."
sudo cp $CLEAN_CONFIG $CONFIG_FILE
if [ $? -eq 0 ]; then
    echo "✅ Config clean da duoc copy"
else
    echo "❌ Loi khi copy config"
    exit 1
fi

# Test nginx config
echo ""
echo "[3/3] Test Nginx config..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config hop le!"
    sudo systemctl reload nginx
    echo "✅ Nginx da duoc reload"
    echo ""
    echo "=========================================="
    echo "  Hoan thanh!"
    echo "=========================================="
    echo ""
    echo "Kiem tra:"
    echo "  sudo nginx -t"
    echo "  curl -I http://inlandv-demo.pressup.vn"
    echo "  sudo systemctl status nginx"
    echo ""
else
    echo "❌ Nginx config van co loi!"
    echo ""
    echo "Xem loi:"
    sudo nginx -t
    echo ""
    echo "Restore tu backup:"
    echo "  sudo cp ${CONFIG_FILE}.backup.* $CONFIG_FILE"
    exit 1
fi

