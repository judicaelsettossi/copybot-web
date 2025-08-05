<?php
// api/src/Models/WalletLog.php

require_once '../config/database.php';

class WalletLog {
    private $pdo;

    public $id;
    public $wallet_id;
    public $event_type;
    public $data;
    public $created_at;

    public function __construct() {
        $database = Database::getInstance();
        $this->pdo = $database->getConnection();
    }

    public function create() {
        $query = "INSERT INTO wallet_logs (wallet_id, event_type, data) VALUES (?, ?, ?)";
        $stmt = $this->pdo->prepare($query);

        return $stmt->execute([
            $this->wallet_id,
            $this->event_type,
            $this->data
        ]);
    }

    public function getAll($page = 1, $limit = 50, $walletId = null) {
        $offset = ($page - 1) * $limit;

        $whereClause = $walletId ? "WHERE wl.wallet_id = ?" : "";
        $params = $walletId ? [$walletId, $limit, $offset] : [$limit, $offset];

        $query = "
            SELECT
                wl.*,
                w.address,
                w.label
            FROM wallet_logs wl
            LEFT JOIN wallets w ON wl.wallet_id = w.id
            {$whereClause}
            ORDER BY wl.created_at DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
