#!/bin/bash
# Script setup nginx hoàn chỉnh cho inlandv-demo.pressup.vn

echo "=========================================="
echo "  Setup Nginx cho inlandv-demo.pressup.vn"
echo "=========================================="
echo ""

# 1. Tắt Apache nếu đang chạy
echo "[1/5] Kiem tra Apache..."
if systemctl is-active --quiet apache2; then
    echo "⚠️  Apache dang chay, dang tat..."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
    echo "✅ Apache da duoc tat"
else
    echo "✅ Apache khong chay"
fi

# 2. Đảm bảo Nginx đang chạy
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

# 3. Tạo nginx config
echo ""
echo "[3/5] Tao Nginx config..."
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Thêm location cho Let's Encrypt (nếu chưa có)
if ! grep -q ".well-known/acme-challenge" /etc/nginx/sites-available/inlandv-demo.pressup.vn; then
    sudo sed -i '/location \//i\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn
fi

# Tạo symlink
sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn
echo "✅ Config da duoc tao"

# 4. Test và reload nginx
echo ""
echo "[4/5] Test va reload Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config hop le"
    sudo systemctl reload nginx
    echo "✅ Nginx da duoc reload"
else
    echo "❌ Nginx config co loi!"
    exit 1
fi

# 5. Kiểm tra port 80
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
echo "  curl -I http://localhost:4002"
echo ""
echo "Xem logs:"
echo "  sudo tail -f /var/log/nginx/inlandv-demo-access.log"
echo "  sudo tail -f /var/log/nginx/inlandv-demo-error.log"
echo ""

