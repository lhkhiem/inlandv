#!/bin/bash

echo "📦 Installing dependencies for all projects..."

# Public Backend
echo "Installing public-backend..."
cd ../../projects/public-backend
npm install
cd ../../scripts/setup

# Public Frontend
echo "Installing public-frontend..."
cd ../../projects/public-frontend
npm install
cd ../../scripts/setup

# CMS Backend
echo "Installing cms-backend..."
cd ../../projects/cms-backend
npm install
cd ../../scripts/setup

# CMS Frontend
echo "Installing cms-frontend..."
cd ../../projects/cms-frontend
npm install
cd ../../scripts/setup

echo "✅ All dependencies installed!"

