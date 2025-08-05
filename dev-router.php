<?php
// dev-router.php - Router pour le serveur de développement

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Headers CORS pour le développement
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Répondre aux requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// DEBUG: Afficher le chemin demandé
error_log("Router - Path: " . $path);

// Routes
switch (true) {
    // Frontend - servir index.html
    case $path === '/frontend/' || $path === '/frontend':
        $frontendPath = __DIR__ . '/frontend/index.html';
        if (file_exists($frontendPath)) {
            header('Content-Type: text/html; charset=UTF-8');
            readfile($frontendPath);
            exit();
        } else {
            http_response_code(404);
            echo "Fichier frontend/index.html non trouvé : " . $frontendPath;
            exit();
        }
        break;

    // Assets statiques
    case strpos($path, '/frontend/') === 0:
        $file = __DIR__ . $path;
        if (file_exists($file) && is_file($file)) {
            $ext = pathinfo($file, PATHINFO_EXTENSION);
            $mimeTypes = [
                'html' => 'text/html',
                'css' => 'text/css',
                'js' => 'application/javascript',
                'json' => 'application/json',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml'
            ];

            if (isset($mimeTypes[$ext])) {
                header('Content-Type: ' . $mimeTypes[$ext]);
            }

            readfile($file);
            exit();
        }
        break;

    // API Routes
    case strpos($path, '/api/') === 0:
        $apiPath = substr($path, 4); // Enlever '/api'

        // Route vers test
        if ($apiPath === '/test') {
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'success',
                'message' => 'API fonctionne!',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '1.0.0'
            ]);
            exit();
        }

        // Route vers les wallets
        if (strpos($apiPath, '/wallets') === 0) {
            if (file_exists(__DIR__ . '/api/src/Controllers/WalletController.php')) {
                require_once __DIR__ . '/api/src/Controllers/WalletController.php';
            } else {
                header('Content-Type: application/json');
                http_response_code(404);
                echo json_encode(['error' => 'WalletController non trouvé']);
            }
            exit();
        }

        // API non trouvée
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint API non trouvé: ' . $apiPath]);
        exit();
        break;

    // Page de status
    case $path === '/status':
        if (file_exists(__DIR__ . '/status.php')) {
            require_once __DIR__ . '/status.php';
        } else {
            echo "Status: Server running";
        }
        exit();
        break;

    // Racine - redirection vers frontend
    case $path === '/' || $path === '':
        header('Location: /frontend/');
        exit();
        break;

    // 404 pour tout le reste
    default:
        http_response_code(404);
        header('Content-Type: text/html; charset=UTF-8');
        echo "<!DOCTYPE html>
        <html>
        <head>
            <title>404 - Page non trouvée</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0; }
                .error { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class='error'>
                <h1>404 - Page non trouvée</h1>
                <p>Chemin demandé: <code>$path</code></p>
                <p><a href='/frontend/'>← Retour au frontend</a></p>
                <hr>
                <small>Debug info:</small>
                <pre style='text-align: left; font-size: 12px; color: #666;'>
Path: $path
Request URI: $requestUri
Document Root: " . __DIR__ . "
Frontend exists: " . (file_exists(__DIR__ . '/frontend/index.html') ? 'YES' : 'NO') . "
                </pre>
            </div>
        </body>
        </html>";
        exit();
}
