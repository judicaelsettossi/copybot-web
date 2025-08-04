<?php
namespace CopyBot\Controllers;

use CopyBot\Services\ChainService;

class ChainController 
{
    private ChainService $chainService;

    public function __construct()
    {
        $this->chainService = new ChainService();
    }

    public function getChains(): string
    {
        $chains = $this->chainService->getAllChains();
        return json_encode(['success' => true, 'data' => $chains]);
    }

    public function getTokens(string $chain): string
    {
        $tokens = $this->chainService->getTokensByChain($chain);
        return json_encode(['success' => true, 'data' => $tokens]);
    }

    public function getBalance(string $chain): string
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $address = $input['address'] ?? '';
        
        if (!$address) {
            http_response_code(400);
            return json_encode(['error' => 'Address required']);
        }

        $balance = $this->chainService->getBalance($chain, $address);
        return json_encode(['success' => true, 'data' => $balance]);
    }
}
