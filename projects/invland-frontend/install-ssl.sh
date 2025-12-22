#!/bin/bash
# Script cài SSL cho inlandv-demo.pressup.vn

echo "=========================================="
echo "  Cai SSL cho inlandv-demo.pressup.vn"
echo "=========================================="
echo ""

DOMAIN="inlandv-demo.pressup.vn"
EMAIL="admin@pressup.vn"

# 1. Kiểm tra domain đã trỏ DNS chưa
echo "[1/5] Kiem tra domain..."
IP=$(dig +short $DOMAIN 2>/dev/null | tail -1)
VPS_IP="14.225.205.116"

if [ -z "$IP" ]; then
    echo "⚠️  Khong tim thay DNS cho domain"
    echo "   Vui long kiem tra DNS truoc khi tiep tuc!"
    exit 1
elif [ "$IP" != "$VPS_IP" ]; then
    echo "⚠️  Domain $DOMAIN tro ve IP: $IP"
    echo "   VPS IP: $VPS_IP"
    echo "   Vui long kiem tra DNS!"
    read -p "Tiep tuc? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
else
    echo "✅ Domain da tro ve dung IP: $IP"
fi

# 2. Kiểm tra certbot
echo ""
echo "[2/5] Kiem tra certbot..."
if ! command -v certbot &> /dev/null; then
    echo "⚠️  Certbot chua duoc cai dat. Dang cai dat..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    if [ $? -ne 0 ]; then
        echo "❌ Loi khi cai dat certbot"
        exit 1
    fi
    echo "✅ Certbot da duoc cai dat"
else
    echo "✅ Certbot da co san"
fi

# 3. Kiểm tra nginx config có location .well-known
echo ""
echo "[3/5] Kiem tra nginx config..."
if ! grep -q ".well-known/acme-challenge" /etc/nginx/sites-available/inlandv-demo.pressup.vn; then
    echo "⚠️  Chua co location .well-known, dang them..."
    sudo sed -i '/client_max_body_size/a\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Location da duoc them"
    else
        echo "❌ Loi khi them location"
        exit 1
    fi
else
    echo "✅ Location .well-known da co"
fi

# 4. Tạo thư mục cho Let's Encrypt
echo ""
echo "[4/5] Tao thu muc cho Let'\''s Encrypt..."
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
echo "✅ Thu muc da duoc tao"

# 5. Cài SSL với certbot
echo ""
echo "[5/5] Cai SSL voi Let'\''s Encrypt..."
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL da duoc cai dat thanh cong!"
    echo ""
    echo "=========================================="
    echo "  Hoan thanh!"
    echo "=========================================="
    echo ""
    echo "Domain HTTPS: https://$DOMAIN"
    echo ""
    echo "Kiem tra:"
    echo "  curl -I https://$DOMAIN"
    echo "  sudo certbot certificates"
    echo ""
    echo "Auto-renewal da duoc cau hinh tu dong"
    echo ""
else
    echo "❌ Loi khi cai dat SSL"
    echo ""
    echo "Xem logs:"
    echo "  sudo tail -f /var/log/letsencrypt/letsencrypt.log"
    exit 1
fi

