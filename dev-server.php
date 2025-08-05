<?php
// dev-server.php - Serveur de développement local

// Configuration
$host = 'localhost';
$port = 8000;
$documentRoot = __DIR__;

echo "🚀 Démarrage du serveur de développement...\n";
echo "📁 Document root: {$documentRoot}\n";
echo "🌐 URL: http://{$host}:{$port}\n";
echo "📱 Frontend: http://{$host}:{$port}/frontend/\n";
echo "🔧 API: http://{$host}:{$port}/api/\n";
echo "📊 PHPInfo: http://{$host}:{$port}/phpinfo.php\n\n";
echo "💡 Ctrl+C pour arrêter\n\n";

// Démarrer le serveur built-in de PHP
$command = "php -S {$host}:{$port} -t {$documentRoot} dev-router.php";
passthru($command);
?>
