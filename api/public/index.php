<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../vendor/autoload.php';

$config = require __DIR__ . '/../config/config.php';

use CopyBot\Controllers\ApiController;
use CopyBot\Controllers\ChainController;
use CopyBot\Controllers\JupiterController;

// Router simple
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch (true) {
        // Health check
        case $uri === '/health' && $method === 'GET':
            $controller = new ApiController();
            echo $controller->health();
            break;

        // Chains
        case $uri === '/api/chains' && $method === 'GET':
            $controller = new ChainController();
            echo $controller->getChains();
            break;

        case preg_match('/^\/api\/chains\/(\w+)\/tokens$/', $uri, $matches) && $method === 'GET':
            $controller = new ChainController();
            echo $controller->getTokens($matches[1]);
            break;

        case preg_match('/^\/api\/chains\/(\w+)\/balance$/', $uri, $matches) && $method === 'POST':
            $controller = new ChainController();
            echo $controller->getBalance($matches[1]);
            break;

        // Portfolio
        case $uri === '/api/portfolio' && $method === 'GET':
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'data' => [
                    'totalValue' => 15420.50,
                    'totalValueUSD' => 15420.50,
                    'change24h' => 2.45,
                    'tokens' => [
                        [
                            'symbol' => 'ETH',
                            'name' => 'Ethereum',
                            'amount' => 5.2,
                            'value' => 12000.00,
                            'price' => 2307.69,
                            'change24h' => 1.8
                        ],
                        [
                            'symbol' => 'SOL',
                            'name' => 'Solana',
                            'amount' => 45.8,
                            'value' => 3420.50,
                            'price' => 74.68,
                            'change24h' => 4.2
                        ]
                    ]
                ]
            ]);
            break;

        // Jupiter
        case $uri === '/api/jupiter/quote' && $method === 'GET':
            $controller = new JupiterController();
            echo $controller->getQuote();
            break;

        case $uri === '/api/jupiter/tokens' && $method === 'GET':
            $controller = new JupiterController();
            echo $controller->getTokens();
            break;

        // Default
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Route not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
