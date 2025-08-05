<?php
// api/src/Config/Database.php

class Database
{
    private $host = 'localhost';
    private $dbName = 'copybot';
    private $username = 'copybot_user';
    private $password = 'copybot123';
    private $pdo = null;

    public function getConnection()
    {
        if ($this->pdo === null) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->dbName};charset=utf8mb4";
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];

                $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                error_log("Erreur de connexion DB: " . $e->getMessage());
                throw new Exception("Erreur de connexion à la base de données");
            }
        }

        return $this->pdo;
    }

    // Méthode pour créer la table si elle n'existe pas
    public function createTablesIfNotExist()
    {
        try {
            $pdo = $this->getConnection();

            // Création de la table wallets
            $sql = "CREATE TABLE IF NOT EXISTS wallets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                address VARCHAR(44) NOT NULL UNIQUE,
                label VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_address (address),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

            $pdo->exec($sql);

            return true;
        } catch (PDOException $e) {
            error_log("Erreur création tables: " . $e->getMessage());
            return false;
        }
    }
}
