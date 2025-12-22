#!/bin/bash

echo "🛑 Stopping all development servers..."

# Stop Public Backend
pkill -f "public-backend.*dev" || true

# Stop Public Frontend
pkill -f "public-frontend.*dev" || true

# Stop CMS Backend
pkill -f "cms-backend.*dev" || true

# Stop CMS Frontend
pkill -f "cms-frontend.*dev" || true

echo "✅ All servers stopped!"

