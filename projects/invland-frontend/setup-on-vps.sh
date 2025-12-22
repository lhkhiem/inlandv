#!/bin/bash
# Script setup trên VPS sau khi upload files

DEPLOY_PATH="/var/www/inlandv"
APP_PORT="4002"

echo "========================================"
echo "  Setup Public Frontend on VPS"
echo "  Path: $DEPLOY_PATH"
echo "========================================"
echo ""

cd $DEPLOY_PATH || exit 1

# Tạo .env nếu chưa có
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Đã tạo .env từ .env.example"
fi

# Set quyền
chmod +x start.sh 2>/dev/null || true

# Install dependencies nếu cần
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Kiểm tra PM2
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 đã được cài đặt"
    
    # Stop process cũ nếu có
    pm2 stop inlandv-frontend 2>/dev/null || true
    pm2 delete inlandv-frontend 2>/dev/null || true
    
    # Start process mới
    echo "🚀 Starting application..."
    pm2 start server.js --name inlandv-frontend -- --port $APP_PORT
    pm2 save
    pm2 startup
else
    echo "⚠️  PM2 chưa được cài đặt"
    echo "   Cài đặt: npm install -g pm2"
    echo "   Sau đó chạy: pm2 start server.js --name inlandv-frontend -- --port $APP_PORT"
fi

echo ""
echo "✅ Setup hoàn tất!"
echo ""
echo "Để xem logs:"
echo "  pm2 logs inlandv-frontend"
echo ""
echo "Để restart:"
echo "  pm2 restart inlandv-frontend"
echo ""


