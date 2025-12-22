#!/bin/bash

echo "🔧 Setting up environment variables..."

# Public Backend
if [ ! -f "../../projects/public-backend/.env" ]; then
    echo "Creating public-backend/.env..."
    cat > ../../projects/public-backend/.env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4002
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
fi

# CMS Backend
if [ ! -f "../../projects/cms-backend/.env" ]; then
    echo "Creating cms-backend/.env..."
    cat > ../../projects/cms-backend/.env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate
PORT=4001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4003
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
EOF
fi

# Public Frontend
if [ ! -f "../../projects/public-frontend/.env.local" ]; then
    echo "Creating public-frontend/.env.local..."
    cat > ../../projects/public-frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000/api
EOF
fi

# CMS Frontend
if [ ! -f "../../projects/cms-frontend/.env.local" ]; then
    echo "Creating cms-frontend/.env.local..."
    cat > ../../projects/cms-frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4001/api
EOF
fi

echo "✅ Environment files created!"
echo "⚠️  Please update DATABASE_URL and JWT_SECRET in .env files"

