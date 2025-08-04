#!/bin/bash

echo "🚀 Démarrage de CopyBot Web..."

# Vérification Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Arrêt des conteneurs existants si ils existent
echo "🧹 Nettoyage des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Construction et démarrage
echo "🏗️ Construction des images Docker..."
docker-compose build --no-cache

echo "🚀 Démarrage des services..."
docker-compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 15

# Vérification des services
echo "🔍 Vérification des services..."

# Backend
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend CopyBot: http://localhost:8000"
else
    echo "❌ Backend non accessible"
fi

# Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend CopyBot: http://localhost:3000"
else
    echo "❌ Frontend non accessible"
fi

echo ""
echo "🎉 CopyBot Web démarré avec succès !"
echo ""
echo "📱 Interface Web: http://localhost:3000"
echo "🔧 API Backend: http://localhost:8000"
echo "📚 Documentation API: http://localhost:8000/docs"
echo ""
echo "📋 Commandes utiles:"
echo "  - Voir les logs: docker-compose logs -f"
echo "  - Arrêter: docker-compose down"
echo "  - Status: docker-compose ps"
echo "  - Restart: docker-compose restart"

# Ouvrir le navigateur (optionnel)
if command -v xdg-open &> /dev/null; then
    echo ""
    echo "🌐 Ouverture du navigateur..."
    sleep 2
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    echo ""
    echo "🌐 Ouverture du navigateur..."
    sleep 2
    open http://localhost:3000
fi
