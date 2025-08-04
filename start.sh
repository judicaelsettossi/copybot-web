#!/bin/bash
echo "🚀 CopyBot Web - PHP + Vue.js"
echo "=============================="
echo ""
echo "Démarrage séparé recommandé:"
echo ""
echo "Terminal 1 - Backend PHP:"
echo "  ./start-backend.sh"
echo ""
echo "Terminal 2 - Frontend Vue.js:"
echo "  ./start-frontend.sh"
echo ""
echo "URLs une fois démarrés:"
echo "  🎨 Frontend: http://localhost:3000"
echo "  🔧 Backend:  http://localhost:8000"
echo "  ❤️  Health:   http://localhost:8000/health"
echo ""

read -p "Voulez-vous démarrer automatiquement? (y/n): " -n 1 -r
echo
if [[  $ REPLY =~ ^[Yy] $  ]]; then
    echo "🚀 Démarrage automatique..."
    
    # Démarrer backend en arrière-plan
    ./start-backend.sh &
    BACKEND_PID=$!
    
    sleep 3
    
    # Démarrer frontend en arrière-plan  
    ./start-frontend.sh &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ CopyBot Web is starting!"
    echo "🌐 Frontend:  http://localhost:3000"
    echo "🔧 Backend:   http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    
    # Attendre Ctrl+C
    trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi
