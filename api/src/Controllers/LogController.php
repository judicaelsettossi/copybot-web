<?php
// api/src/Controllers/LogController.php

require_once '../Models/WalletLog.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $log = new WalletLog();

        // Paramètres de pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $walletId = isset($_GET['wallet_id']) ? (int)$_GET['wallet_id'] : null;

        $logs = $log->getAll($page, $limit, $walletId);
        echo json_encode($logs);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Méthode non autorisée']);
        break;
}
?>
