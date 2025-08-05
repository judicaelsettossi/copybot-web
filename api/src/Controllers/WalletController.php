<?php
// api/src/Controllers/WalletController.php

require_once __DIR__ . '/../Models/Wallet.php';

class WalletController {
    private $walletModel;

    public function __construct() {
        $this->walletModel = new Wallet();
    }

    // GET /wallets - Récupérer tous les wallets
    public function getWallets() {
        try {
            $wallets = $this->walletModel->getAll();

            echo json_encode([
                'success' => true,
                'data' => $wallets,
                'count' => count($wallets),
                'message' => 'Wallets récupérés avec succès'
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    // POST /wallets - Ajouter un wallet
    public function addWallet() {
        try {
            // Récupérer les données JSON
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            if (!$data) {
                throw new Exception("Données JSON invalides");
            }

            // Validation
            if (empty($data['address'])) {
                throw new Exception("L'adresse du wallet est requise");
            }

            if (empty($data['label'])) {
                throw new Exception("Le label du wallet est requis");
            }

            $address = trim($data['address']);
            $label = trim($data['label']);

            // Validation basique de l'adresse Solana
            if (strlen($address) < 32 || strlen($address) > 44) {
                throw new Exception("Adresse Solana invalide");
            }

            // Créer le wallet
            $wallet = $this->walletModel->create($address, $label);

            echo json_encode([
                'success' => true,
                'data' => $wallet,
                'message' => 'Wallet ajouté avec succès'
            ]);

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    // DELETE /wallets/{id} - Supprimer un wallet
    public function deleteWallet($id) {
        try {
            if (empty($id)) {
                throw new Exception("ID du wallet requis");
            }

            $result = $this->walletModel->delete($id);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Wallet supprimé avec succès'
                ]);
            } else {
                throw new Exception("Impossible de supprimer le wallet");
            }

        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
}
?>
