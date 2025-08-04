#!/bin/bash
echo "🎨 Starting CopyBot Web Frontend (Vue.js)"
echo "========================================"

cd frontend

# Installation des dépendances
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

echo "🚀 Starting Vue.js development server..."
echo "Frontend running on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"

npm run dev
