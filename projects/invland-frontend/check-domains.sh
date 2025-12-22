#!/bin/bash
# Script kiểm tra các domain đang chạy

echo "=========================================="
echo "  DANH SACH DOMAIN DANG CHAY"
echo "=========================================="
echo ""

echo "[1] Nginx configs đang enabled:"
echo "----------------------------------------"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^total" | grep -v "^d" | awk '{print "  " $9, "->", $10, $11}' | sed 's/-> ->/->/'
echo ""

echo "[2] Server names trong Nginx:"
echo "----------------------------------------"
grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^#" | grep -v "default_server" | sed 's/.*server_name//' | sed 's/;//' | sed 's/^[ \t]*//' | sort -u | awk '{print "  - " $0}'
echo ""

echo "[3] PM2 processes:"
echo "----------------------------------------"
pm2 list --no-color | grep -E "^│ [0-9]" | awk -F'│' '{print "  - " $3 " (Status: " $7 ", Memory: " $10 ")"}'
echo ""

echo "[4] Nginx status:"
echo "----------------------------------------"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo "  ✅ Nginx đang chạy"
else
    echo "  ❌ Nginx không chạy"
fi
echo ""

echo "[5] Apache status:"
echo "----------------------------------------"
if systemctl is-active --quiet apache2 2>/dev/null; then
    echo "  ⚠️  Apache đang chạy"
else
    echo "  ✅ Apache không chạy"
fi
echo ""

echo "[6] Ports đang listen (cần sudo):"
echo "----------------------------------------"
if command -v sudo &> /dev/null; then
    sudo ss -tlnp 2>/dev/null | grep -E ":80|:443|:3000|:4000|:4002" | awk '{print "  - Port " $4 " -> " $6}' | sed 's/users:((\"//' | sed 's/\",.*//'
else
    echo "  ⚠️  Cần sudo để xem ports"
fi
echo ""

