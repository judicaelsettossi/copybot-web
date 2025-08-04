<?php
namespace CopyBot\Services;

use GuzzleHttp\Client;

class ChainService 
{
    private array $config;
    private Client $httpClient;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/config.php';
        $this->httpClient = new Client();
    }

    public function getAllChains(): array
    {
        $chains = [];
        foreach ($this->config['chains'] as $key => $chain) {
            $chains[] = [
                'id' => $key,
                'name' => $chain['name'],
                'symbol' => $chain['symbol'],
                'rpc' => $chain['rpc'],
                'chain_id' => $chain['chain_id'] ?? null,
            ];
        }
        return $chains;
    }

    public function getTokensByChain(string $chain): array
    {
        // Tokens populaires par chaîne
        $tokens = [
            'ethereum' => [
                ['symbol' => 'ETH', 'name' => 'Ethereum', 'address' => '0x0000000000000000000000000000000000000000'],
                ['symbol' => 'USDC', 'name' => 'USD Coin', 'address' => '0xA0b86a33E6441B92C0A0e96321f6eE5Bb2fC0Ef7'],
                ['symbol' => 'USDT', 'name' => 'Tether', 'address' => '0xdac17f958d2ee523a2206206994597c13d831ec7'],
            ],
            'bsc' => [
                ['symbol' => 'BNB', 'name' => 'BNB', 'address' => '0x0000000000000000000000000000000000000000'],
                ['symbol' => 'USDT', 'name' => 'Tether', 'address' => '0x55d398326f99059fF775485246999027B3197955'],
            ],
            'polygon' => [
                ['symbol' => 'MATIC', 'name' => 'Polygon', 'address' => '0x0000000000000000000000000000000000000000'],
                ['symbol' => 'USDC', 'name' => 'USD Coin', 'address' => '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'],
            ],
            'solana' => [
                ['symbol' => 'SOL', 'name' => 'Solana', 'address' => 'So11111111111111111111111111111111111111112'],
                ['symbol' => 'USDC', 'name' => 'USD Coin', 'address' => 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4hgRhh7uQQhg3P'],
            ],
        ];

        return $tokens[$chain] ?? [];
    }

    public function getBalance(string $chain, string $address): array
    {
        // Simulation de balance (remplacer par vraie logique RPC)
        return [
            'address' => $address,
            'chain' => $chain,
            'balance' => '1.23456789',
            'symbol' => $this->config['chains'][$chain]['symbol'] ?? 'UNKNOWN',
            'usd_value' => 2468.91
        ];
    }
}
