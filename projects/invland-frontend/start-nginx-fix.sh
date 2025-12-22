#!/bin/bash
# Script khởi động Nginx và fix domain inlandv-demo.pressup.vn

echo "=========================================="
echo "  Start Nginx va fix domain"
echo "=========================================="
echo ""

# 1. Kiểm tra và khởi động Nginx
echo "[1/5] Kiem tra va khoi dong Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx dang chay"
else
    echo "⚠️  Nginx khong chay, dang khoi dong..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx da duoc khoi dong"
    else
        echo "❌ Khong the khoi dong Nginx"
        exit 1
    fi
fi

# 2. Test nginx config
echo ""
echo "[2/5] Test Nginx config..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx config co loi!"
    echo ""
    echo "Dang sua config..."
    
    # Fix duplicate location nếu có
    CONFIG_FILE="/etc/nginx/sites-available/inlandv-demo.pressup.vn"
    if [ -f "$CONFIG_FILE" ]; then
        # Backup
        sudo cp $CONFIG_FILE ${CONFIG_FILE}.backup2
        
        # Xóa tất cả location .well-known cũ
        sudo sed -i '/location \/.well-known\/acme-challenge/,/^    }$/d' $CONFIG_FILE
        sudo sed -i '/# Let.*Encrypt verification/d' $CONFIG_FILE
        
        # Thêm location .well-known vào đúng chỗ
        sudo sed -i '/client_max_body_size/a\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' $CONFIG_FILE
        
        echo "✅ Config da duoc sua"
    fi
    
    # Test lại
    sudo nginx -t
    if [ $? -ne 0 ]; then
        echo "❌ Van co loi! Kiem tra config thu cong."
        exit 1
    fi
fi
echo "✅ Nginx config hop le"

# 3. Reload nginx
echo ""
echo "[3/5] Reload Nginx..."
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo "✅ Nginx da duoc reload"
else
    echo "❌ Loi khi reload Nginx"
    exit 1
fi

# 4. Kiểm tra port 80
echo ""
echo "[4/5] Kiem tra port 80..."
PORT_80=$(sudo ss -tlnp 2>/dev/null | grep ':80 ' | awk '{print $6}')
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
    echo "   Dang khoi dong lai Nginx..."
    sudo systemctl restart nginx
fi

# 5. Test domain
echo ""
echo "[5/5] Test domain..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4002)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Next.js app dang chay tren port 4002"
else
    echo "⚠️  Next.js app chua san sang (HTTP: $HTTP_CODE)"
fi

DOMAIN_TEST=$(curl -s -H "Host: inlandv-demo.pressup.vn" http://localhost:80 | head -5)
if echo "$DOMAIN_TEST" | grep -q "Apache2\|Ubuntu Default"; then
    echo "❌ Domain van tra ve Apache default page"
    echo "   Can kiem tra default config"
else
    echo "✅ Domain tra ve Next.js app"
fi

echo ""
echo "=========================================="
echo "  Hoan thanh!"
echo "=========================================="
echo ""
echo "Kiem tra:"
echo "  sudo systemctl status nginx"
echo "  curl -I http://inlandv-demo.pressup.vn"
echo "  sudo tail -f /var/log/nginx/inlandv-demo-error.log"
echo ""

