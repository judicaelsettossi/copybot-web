<?php
// api/public/index.php

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Router basique
if (strpos($path, '/api/wallets') === 0) {
    require_once '../src/Controllers/WalletController.php';
} else {
    header("Content-Type: application/json");
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint non trouvé']);
}
?>
