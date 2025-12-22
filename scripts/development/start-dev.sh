#!/bin/bash

echo "🚀 Starting all development servers..."

# Start Public Backend
echo "Starting public-backend (Port 4000)..."
cd ../../projects/public-backend
npm run dev &
PUBLIC_BACKEND_PID=$!

# Start Public Frontend
echo "Starting public-frontend (Port 4002)..."
cd ../public-frontend
npm run dev &
PUBLIC_FRONTEND_PID=$!

# Start CMS Backend
echo "Starting cms-backend (Port 4001)..."
cd ../cms-backend
npm run dev &
CMS_BACKEND_PID=$!

# Start CMS Frontend
echo "Starting cms-frontend (Port 4003)..."
cd ../cms-frontend
npm run dev &
CMS_FRONTEND_PID=$!

echo "✅ All servers started!"
echo "Public Backend: http://localhost:4000"
echo "Public Frontend: http://localhost:4002"
echo "CMS Backend: http://localhost:4001"
echo "CMS Frontend: http://localhost:4003"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $PUBLIC_BACKEND_PID $PUBLIC_FRONTEND_PID $CMS_BACKEND_PID $CMS_FRONTEND_PID" EXIT
wait

