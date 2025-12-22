#!/bin/bash
# Script để chạy Inlandv Frontend trên VPS

export NODE_ENV=production
export PORT=${PORT:-4002}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

# Load .env nếu có
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Chạy server
node server.js


