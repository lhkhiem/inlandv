#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Build all projects
echo "📦 Building projects..."
cd ../../projects/public-backend
npm run build

cd ../public-frontend
npm run build

cd ../cms-backend
npm run build

cd ../cms-frontend
npm run build

# Restart PM2 processes
echo "🔄 Restarting services..."
pm2 restart public-backend || pm2 start ../../configs/pm2/public-backend.config.js
pm2 restart cms-backend || pm2 start ../../configs/pm2/cms-backend.config.js

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"

