#!/bin/bash
# Script setup nginx cho inlandv-demo.pressup.vn

CONFIG_FILE="/tmp/nginx-inlandv-demo.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/inlandv-demo.pressup.vn"
NGINX_ENABLED="/etc/nginx/sites-enabled/inlandv-demo.pressup.vn"

echo "=========================================="
echo "  Setup Nginx cho inlandv-demo.pressup.vn"
echo "=========================================="
echo ""

# Kiểm tra file config
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Khong tim thay file config: $CONFIG_FILE"
    exit 1
fi

echo "[1/4] Copy config file..."
sudo cp "$CONFIG_FILE" "$NGINX_AVAILABLE"
if [ $? -eq 0 ]; then
    echo "✅ Da copy config vao $NGINX_AVAILABLE"
else
    echo "❌ Loi khi copy config"
    exit 1
fi

echo ""
echo "[2/4] Create symlink..."
if [ -L "$NGINX_ENABLED" ]; then
    echo "⚠️  Symlink da ton tai, xoa va tao lai..."
    sudo rm "$NGINX_ENABLED"
fi

sudo ln -s "$NGINX_AVAILABLE" "$NGINX_ENABLED"
if [ $? -eq 0 ]; then
    echo "✅ Da tao symlink"
else
    echo "❌ Loi khi tao symlink"
    exit 1
fi

echo ""
echo "[3/4] Test nginx config..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config hop le"
else
    echo "❌ Nginx config co loi!"
    exit 1
fi

echo ""
echo "[4/4] Reload nginx..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "✅ Nginx da duoc reload"
else
    echo "❌ Loi khi reload nginx"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Hoan thanh!"
echo "=========================================="
echo ""
echo "Domain: http://inlandv-demo.pressup.vn"
echo "Backend: http://localhost:4002"
echo ""
echo "Kiem tra status:"
echo "  sudo systemctl status nginx"
echo "  sudo nginx -t"
echo ""

