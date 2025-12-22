#!/bin/bash

echo "🔨 Building all projects..."

# Build Public Backend
echo "Building public-backend..."
cd ../../projects/public-backend
npm run build
cd ../../scripts/deployment

# Build Public Frontend
echo "Building public-frontend..."
cd ../../projects/public-frontend
npm run build
cd ../../scripts/deployment

# Build CMS Backend
echo "Building cms-backend..."
cd ../../projects/cms-backend
npm run build
cd ../../scripts/deployment

# Build CMS Frontend
echo "Building cms-frontend..."
cd ../../projects/cms-frontend
npm run build
cd ../../scripts/deployment

echo "✅ All projects built!"

