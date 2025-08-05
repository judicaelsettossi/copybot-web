<?php
// api/src/Models/Wallet.php

require_once __DIR__ . '/../../config/Database.php';

class Wallet
{
    private $db;
    private $table = 'wallets';

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();

        // Crée la table si elle n'existe pas
        $database->createTablesIfNotExist();
    }

    // Récupérer tous les wallets
    public function getAll()
    {
        try {
            $query = "SELECT * FROM {$this->table} WHERE is_active = 1 ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();

            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Erreur getAll wallets: " . $e->getMessage());
            throw new Exception("Erreur lors de la récupération des wallets");
        }
    }

    // Ajouter un wallet
    public function create($address, $label)
    {
        try {
            // Vérifie si le wallet existe déjà
            if ($this->exists($address)) {
                throw new Exception("Ce wallet existe déjà");
            }

            $query = "INSERT INTO {$this->table} (address, label) VALUES (:address, :label)";
            $stmt = $this->db->prepare($query);

            $stmt->bindParam(':address', $address);
            $stmt->bindParam(':label', $label);

            if ($stmt->execute()) {
                return [
                    'id' => $this->db->lastInsertId(),
                    'address' => $address,
                    'label' => $label,
                    'is_active' => true,
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }

            throw new Exception("Erreur lors de l'insertion");
        } catch (PDOException $e) {
            error_log("Erreur create wallet: " . $e->getMessage());
            throw new Exception("Erreur lors de la création du wallet");
        }
    }

    // Vérifier si un wallet existe
    public function exists($address)
    {
        try {
            $query = "SELECT COUNT(*) FROM {$this->table} WHERE address = :address";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':address', $address);
            $stmt->execute();

            return $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Erreur exists wallet: " . $e->getMessage());
            return false;
        }
    }

    // Supprimer un wallet (soft delete)
    public function delete($id)
    {
        try {
            $query = "UPDATE {$this->table} SET is_active = 0 WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erreur delete wallet: " . $e->getMessage());
            throw new Exception("Erreur lors de la suppression du wallet");
        }
    }

    // Compter les wallets actifs
    public function count()
    {
        try {
            $query = "SELECT COUNT(*) FROM {$this->table} WHERE is_active = 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute();

            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Erreur count wallets: " . $e->getMessage());
            return 0;
        }
    }
}
