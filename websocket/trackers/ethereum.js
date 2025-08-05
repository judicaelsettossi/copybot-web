const WebSocket = require('ws');
const EventEmitter = require('events');

class EthereumTracker extends EventEmitter {
    constructor() {
        super();
        this.trackedWallets = new Map();
        this.isConnected = false;
    }

    async initialize() {
        console.log('🔷 Ethereum Tracker initialisé');
        this.isConnected = true;
        this.emit('ready');
    }

    async addWallet(walletAddress, clientId) {
        if (!this.trackedWallets.has(walletAddress)) {
            this.trackedWallets.set(walletAddress, new Set());
            console.log(`🔷 [ETH] Nouveau wallet tracké: ${walletAddress}`);
        }
        
        this.trackedWallets.get(walletAddress).add(clientId);
        console.log(`🔷 [ETH] Client ${clientId} ajouté au wallet ${walletAddress}`);

        // Simuler quelques transactions récentes pour test
        return this.getMockTransactions(walletAddress);
    }

    removeWallet(walletAddress, clientId) {
        if (this.trackedWallets.has(walletAddress)) {
            this.trackedWallets.get(walletAddress).delete(clientId);
            
            if (this.trackedWallets.get(walletAddress).size === 0) {
                this.trackedWallets.delete(walletAddress);
                console.log(`🔷 [ETH] Wallet ${walletAddress} plus tracké`);
            }
        }
    }

    getMockTransactions(walletAddress) {
        // Transactions d'exemple pour le test
        return [
            {
                hash: '0x1234567890abcdef...',
                type: 'transfer',
                amount: 0.5,
                token: 'ETH',
                from: walletAddress,
                to: '0x742d35Cc6634C0532925a3b8D4C8001c46c01c94',
                success: true,
                blockNumber: 18500000,
                timestamp: Date.now() - 300000
            },
            {
                hash: '0xabcdef1234567890...',
                type: 'swap',
                amount: 1000,
                token: 'USDC',
                from: '0x742d35Cc6634C0532925a3b8D4C8001c46c01c94',
                to: walletAddress,
                success: true,
                blockNumber: 18500001,
                timestamp: Date.now() - 120000
            }
        ];
    }

    getTrackedWallets() {
        return Array.from(this.trackedWallets.keys());
    }

    isTracking(walletAddress) {
        return this.trackedWallets.has(walletAddress);
    }
}

module.exports = EthereumTracker;
