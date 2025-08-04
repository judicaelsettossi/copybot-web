<?php
return [
    'app' => [
        'name' => 'CopyBot Web API',
        'version' => '1.0.0',
        'debug' => true,
    ],
    'chains' => [
        'ethereum' => [
            'name' => 'Ethereum',
            'rpc' => 'https://eth.llamarpc.com',
            'chain_id' => 1,
            'symbol' => 'ETH',
        ],
        'bsc' => [
            'name' => 'BSC',
            'rpc' => 'https://bsc-dataseed.binance.org',
            'chain_id' => 56,
            'symbol' => 'BNB',
        ],
        'polygon' => [
            'name' => 'Polygon',
            'rpc' => 'https://polygon-rpc.com',
            'chain_id' => 137,
            'symbol' => 'MATIC',
        ],
        'solana' => [
            'name' => 'Solana',
            'rpc' => 'https://api.mainnet-beta.solana.com',
            'symbol' => 'SOL',
        ],
    ],
    'jupiter_api' => 'https://quote-api.jup.ag/v6',
];
