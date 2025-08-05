<?php
// dev-api-router.php - Router pour l'API

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log des requêtes API
error_log("API Router - Method: " . $_SERVER['REQUEST_METHOD'] . " Path: " . $path);

// Routes API
switch (true) {
    // Test de l'API
    case $path === '/test':
        echo json_encode([
            'status' => 'success',
            'message' => 'API Copy Trading Bot connectée !',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
        exit();

        // Status de l'API
    case $path === '/status':
        echo json_encode([
            'status' => 'online',
            'database' => 'connected',
            'websocket' => 'active',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();

        // Liste des wallets
    case $path === '/wallets' && $_SERVER['REQUEST_METHOD'] === 'GET':
        require_once __DIR__ . '/src/Controllers/WalletController.php';
        if (class_exists('WalletController')) {
            $controller = new WalletController();
            $controller->getWallets();
        } else if (class_exists('Api\Controllers\WalletController')) {
            $controller = new \Api\Controllers\WalletController();
            $controller->getWallets();
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'WalletController class not found']);
        }
        exit();

        // Ajouter un wallet
    case $path === '/wallets' && $_SERVER['REQUEST_METHOD'] === 'POST':
        require_once __DIR__ . '/src/Controllers/WalletController.php';
        if (class_exists('WalletController')) {
            $controller = new WalletController();
            $controller->addWallet();
        } else if (class_exists('Api\Controllers\WalletController')) {
            $controller = new \Api\Controllers\WalletController();
            $controller->addWallet();
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'WalletController class not found']);
        }
        exit();

        // Stats
    case $path === '/stats':
        echo json_encode([
            'total_wallets' => 1,
            'active_trades' => 0,
            'total_profit' => 0,
            'success_rate' => 0,
            'last_update' => date('Y-m-d H:i:s')
        ]);
        exit();

        // Liste des trades
    case $path === '/trades' && $_SERVER['REQUEST_METHOD'] === 'GET':
        echo json_encode([
            'success' => true,
            'data' => [],
            'count' => 0,
            'message' => 'Trades récupérés avec succès'
        ]);
        exit();

        // Liste des positions
    case $path === '/positions' && $_SERVER['REQUEST_METHOD'] === 'GET':
        echo json_encode([
            'success' => true,
            'data' => [],
            'count' => 0,
            'message' => 'Positions récupérées avec succès'
        ]);
        exit();


    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
        exit();
}
