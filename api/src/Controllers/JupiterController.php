<?php
namespace CopyBot\Controllers;

use CopyBot\Services\JupiterService;

class JupiterController 
{
    private JupiterService $jupiterService;

    public function __construct()
    {
        $this->jupiterService = new JupiterService();
    }

    public function getQuote(): string
    {
        $inputMint = $_GET['inputMint'] ?? '';
        $outputMint = $_GET['outputMint'] ?? '';
        $amount = $_GET['amount'] ?? '';

        if (!$inputMint || !$outputMint || !$amount) {
            http_response_code(400);
            return json_encode(['error' => 'Missing required parameters']);
        }

        $quote = $this->jupiterService->getQuote($inputMint, $outputMint, $amount);
        return json_encode(['success' => true, 'data' => $quote]);
    }

    public function getTokens(): string
    {
        $tokens = $this->jupiterService->getTokens();
        return json_encode(['success' => true, 'data' => $tokens]);
    }
}
