#!/bin/bash
# Script cài SSL cho inlandv-demo.pressup.vn

DOMAIN="inlandv-demo.pressup.vn"
EMAIL="admin@pressup.vn"  # Thay đổi email này

echo "=========================================="
echo "  Setup SSL cho $DOMAIN"
echo "=========================================="
echo ""

# Kiểm tra domain đã trỏ về IP chưa
echo "[1/6] Kiem tra domain..."
IP=$(dig +short $DOMAIN | tail -1)
VPS_IP="14.225.205.116"

if [ "$IP" != "$VPS_IP" ]; then
    echo "⚠️  Canh bao: Domain $DOMAIN tro ve IP: $IP"
    echo "   VPS IP: $VPS_IP"
    echo "   Vui long kiem tra DNS truoc khi tiep tuc!"
    read -p "Tiep tuc? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
else
    echo "✅ Domain da tro ve dung IP: $IP"
fi

# Kiểm tra certbot đã cài chưa
echo ""
echo "[2/6] Kiem tra certbot..."
if ! command -v certbot &> /dev/null; then
    echo "Certbot chua duoc cai dat. Dang cai dat..."
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

# Tạo nginx config tạm thời (chỉ HTTP) để certbot có thể verify
echo ""
echo "[3/6] Tao nginx config tam thoi..."
sudo cp /tmp/nginx-inlandv-demo.conf /etc/nginx/sites-available/inlandv-demo.pressup.vn
sudo ln -sf /etc/nginx/sites-available/inlandv-demo.pressup.vn /etc/nginx/sites-enabled/inlandv-demo.pressup.vn

# Thêm location cho Let's Encrypt verification
sudo sed -i '/location \//i\    # Let'\''s Encrypt verification\n    location /.well-known/acme-challenge/ {\n        root /var/www/html;\n    }' /etc/nginx/sites-available/inlandv-demo.pressup.vn

# Test và reload nginx
sudo nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx config co loi!"
    exit 1
fi

sudo systemctl reload nginx
echo "✅ Nginx da duoc reload"

# Tạo thư mục cho Let's Encrypt
echo ""
echo "[4/6] Tao thu muc cho Let'\''s Encrypt..."
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html

# Cài SSL với certbot
echo ""
echo "[5/6] Cai dat SSL voi Let'\''s Encrypt..."
echo "   Email: $EMAIL"
echo "   Domain: $DOMAIN"
echo ""

sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

if [ $? -eq 0 ]; then
    echo "✅ SSL da duoc cai dat thanh cong!"
else
    echo "❌ Loi khi cai dat SSL"
    exit 1
fi

# Kiểm tra auto-renewal
echo ""
echo "[6/6] Kiem tra auto-renewal..."
if sudo certbot renew --dry-run &> /dev/null; then
    echo "✅ Auto-renewal da duoc cau hinh"
else
    echo "⚠️  Can kiem tra auto-renewal thu cong"
fi

echo ""
echo "=========================================="
echo "  Hoan thanh!"
echo "=========================================="
echo ""
echo "Domain: https://$DOMAIN"
echo ""
echo "Kiem tra SSL:"
echo "  curl -I https://$DOMAIN"
echo "  openssl s_client -connect $DOMAIN:443 -servername $DOMAIN"
echo ""
echo "Xem thong tin certificate:"
echo "  sudo certbot certificates"
echo ""

