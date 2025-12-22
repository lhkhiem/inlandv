#!/bin/bash

# Setup Git Repository and Remote
# Usage: ./scripts/setup/setup-git.sh <remote-url>

set -e

REMOTE_URL=$1

if [ -z "$REMOTE_URL" ]; then
    echo "❌ Error: Remote URL is required"
    echo ""
    echo "Usage: ./scripts/setup/setup-git.sh <remote-url>"
    echo ""
    echo "Examples:"
    echo "  ./scripts/setup/setup-git.sh https://github.com/username/repo.git"
    echo "  ./scripts/setup/setup-git.sh git@github.com:username/repo.git"
    exit 1
fi

echo "🔧 Setting up Git repository..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$REMOTE_URL"
        echo "✅ Updated remote 'origin' to: $REMOTE_URL"
    else
        echo "❌ Cancelled"
        exit 1
    fi
else
    echo "➕ Adding remote 'origin': $REMOTE_URL"
    git remote add origin "$REMOTE_URL"
    echo "✅ Remote 'origin' added successfully"
fi

# Show current remotes
echo ""
echo "📋 Current remotes:"
git remote -v

echo ""
echo "✅ Git setup complete!"
echo ""
echo "Next steps:"
echo "  1. git add ."
echo "  2. git commit -m 'Initial commit'"
echo "  3. git branch -M main"
echo "  4. git push -u origin main"

