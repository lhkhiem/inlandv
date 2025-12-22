#!/bin/bash
# Script sửa lỗi Apache đang chiếm port 80

echo "=========================================="
echo "  Fix Apache/Nginx Conflict"
echo "=========================================="
echo ""

# Kiểm tra Apache
echo "[1/5] Kiem tra Apache..."
if systemctl is-active --quiet apache2; then
    echo "⚠️  Apache dang chay"
    echo "   Dang tat Apache..."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
    echo "✅ Apache da duoc tat"
else
    echo "✅ Apache khong chay"
fi

# Kiểm tra Nginx
echo ""
echo "[2/5] Kiem tra Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx dang chay"
else
    echo "⚠️  Nginx khong chay, dang khoi dong..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo "✅ Nginx da duoc khoi dong"
fi

# Kiểm tra config nginx
echo ""
echo "[3/5] Kiem tra Nginx config..."
if [ -f "/etc/nginx/sites-available/inlandv-demo.pressup.vn" ]; then
    echo "✅ Config da co"
else
    echo "⚠️  Config chua co, dang tao..."
    sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn
    sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn
    echo "✅ Config da duoc tao"
fi

# Test nginx config
echo ""
echo "[4/5] Test Nginx config..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config hop le"
    sudo systemctl reload nginx
    echo "✅ Nginx da duoc reload"
else
    echo "❌ Nginx config co loi!"
    exit 1
fi

# Kiểm tra port 80
echo ""
echo "[5/5] Kiem tra port 80..."
PORT_80=$(sudo netstat -tlnp 2>/dev/null | grep ':80 ' | awk '{print $7}' || sudo ss -tlnp 2>/dev/null | grep ':80 ' | awk '{print $6}')
if echo "$PORT_80" | grep -q nginx; then
    echo "✅ Nginx dang chay tren port 80"
elif echo "$PORT_80" | grep -q apache; then
    echo "❌ Apache van dang chay tren port 80"
    echo "   Dang kill Apache..."
    sudo pkill -9 apache2
    sudo systemctl restart nginx
    echo "✅ Da kill Apache va restart Nginx"
else
    echo "⚠️  Khong tim thay service nao tren port 80"
fi

echo ""
echo "=========================================="
echo "  Hoan thanh!"
echo "=========================================="
echo ""
echo "Kiem tra:"
echo "  curl -I http://inlandv-demo.pressup.vn"
echo "  sudo systemctl status nginx"
echo "  sudo systemctl status apache2"
echo ""

