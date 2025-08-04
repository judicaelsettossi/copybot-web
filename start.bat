@echo off
title CopyBot Web - Demarrage

echo 🚀 Démarrage de CopyBot Web...

:: Vérification Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker n'est pas installé ou n'est pas dans le PATH
    echo Veuillez installer Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose n'est pas disponible
    echo Assurez-vous que Docker Desktop est démarré
    pause
    exit /b 1
)

echo 🧹 Nettoyage des conteneurs existants...
docker-compose down >nul 2>&1

echo 🏗️ Construction des images Docker...
docker-compose build --no-cache
if errorlevel 1 (
    echo ❌ Erreur lors de la construction des images
    pause
    exit /b 1
)

echo 🚀 Démarrage des services...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Erreur lors du démarrage des services
    pause
    exit /b 1
)

echo ⏳ Attente du démarrage des services...
timeout /t 15 /nobreak >nul

echo 🔍 Vérification des services...

:: Vérification Backend
curl -f http://localhost:8000/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ Backend CopyBot: http://localhost:8000
) else (
    echo ❌ Backend non accessible - vérifiez les logs: docker-compose logs backend
)

:: Vérification Frontend
curl -f http://localhost:3000 >nul 2>&1
if not errorlevel 1 (
    echo ✅ Frontend CopyBot: http://localhost:3000
) else (
    echo ❌ Frontend non accessible - vérifiez les logs: docker-compose logs frontend
)

echo.
echo 🎉 CopyBot Web démarré avec succès !
echo.
echo 📱 Interface Web: http://localhost:3000
echo 🔧 API Backend: http://localhost:8000
echo 📚 Documentation API: http://localhost:8000/docs
echo.
echo 📋 Commandes utiles:
echo   - Voir les logs: docker-compose logs -f
echo   - Arrêter: docker-compose down
echo   - Status: docker-compose ps
echo   - Restart: docker-compose restart
echo.

:: Ouvrir le navigateur
echo 🌐 Ouverture du navigateur...
timeout /t 2 /nobreak >nul
start http://localhost:3000

pause
