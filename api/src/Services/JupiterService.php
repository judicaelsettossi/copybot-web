<?php
namespace CopyBot\Services;

use GuzzleHttp\Client;

class JupiterService 
{
    private Client $httpClient;
    private string $apiUrl;

    public function __construct()
    {
        $this->httpClient = new Client();
        $config = require __DIR__ . '/../../config/config.php';
        $this->apiUrl = $config['jupiter_api'];
    }

    public function getQuote(string $inputMint, string $outputMint, string $amount): ?array
    {
        try {
            $response = $this->httpClient->get($this->apiUrl . '/quote', [
                'query' => [
                    'inputMint' => $inputMint,
                    'outputMint' => $outputMint,
                    'amount' => $amount,
                    'slippageBps' => 50
                ]
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public function getTokens(): array
    {
        try {
            $response = $this->httpClient->get('https://token.jup.ag/all');
            $tokens = json_decode($response->getBody()->getContents(), true);
            
            // Retourner les 50 premiers tokens populaires
            return array_slice($tokens, 0, 50);
        } catch (\Exception $e) {
            return [];
        }
    }
}
