#!/bin/bash
echo "🔧 Starting CopyBot Web Backend (PHP)"
echo "====================================="

cd api

# Installation des dépendances
if [ ! -d "vendor" ]; then
    echo "📦 Installing PHP dependencies..."
    composer install
fi

echo "🚀 Starting PHP development server..."
echo "Backend running on: http://localhost:8000"
echo "Health check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop"

php -S localhost:8000 -t public
