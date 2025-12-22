#!/bin/bash
# Script enable domain inlandv-demo.pressup.vn

echo "=========================================="
echo "  Enable domain inlandv-demo.pressup.vn"
echo "=========================================="
echo ""

# 1. Copy config
echo "[1/4] Copy nginx config..."
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn
if [ $? -eq 0 ]; then
    echo "✅ Config da duoc copy"
else
    echo "❌ Loi khi copy config"
    exit 1
fi

# 2. Thêm location cho Let's Encrypt
echo ""
echo "[2/4] Them location cho Let's Encrypt..."
if ! grep -q ".well-known/acme-challenge" /etc/nginx/sites-available/inlandv-demo.pressup.vn; then
    sudo sed -i '/location \//i\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn
    echo "✅ Location da duoc them"
else
    echo "✅ Location da co san"
fi

# 3. Tạo symlink
echo ""
echo "[3/4] Tao symlink..."
if [ -L "/etc/nginx/sites-enabled/inlandv-demo.pressup.vn" ]; then
    echo "⚠️  Symlink da ton tai, xoa va tao lai..."
    sudo rm /etc/nginx/sites-enabled/inlandv-demo.pressup.vn
fi

sudo ln -s /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn
if [ $? -eq 0 ]; then
    echo "✅ Symlink da duoc tao"
else
    echo "❌ Loi khi tao symlink"
    exit 1
fi

# 4. Test và reload
echo ""
echo "[4/4] Test va reload Nginx..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config hop le"
    sudo systemctl reload nginx
    echo "✅ Nginx da duoc reload"
else
    echo "❌ Nginx config co loi!"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Hoan thanh!"
echo "=========================================="
echo ""
echo "Domain da duoc enable:"
echo "  - inlandv-demo.pressup.vn"
echo ""
echo "Kiem tra:"
echo "  ls -la /etc/nginx/sites-enabled/ | grep inlandv"
echo "  curl -I http://inlandv-demo.pressup.vn"
echo ""

