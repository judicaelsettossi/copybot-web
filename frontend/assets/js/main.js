class CopyBotManager {
    constructor() {
        this.connectedWallet = null;
        this.botStatus = null;
        this.trackedWallets = [];
        this.init();
    }

    async init() {
        console.log('🚀 Initialisation CopyBot Web...');

        // Event listeners
        this.setupEventListeners();

        // Chargement initial
        await this.checkAPIStatus();
        await this.loadSupportedNetworks();
        await this.updateBotStatus();

        console.log('✅ CopyBot initialisé avec succès');
    }

    setupEventListeners() {
        // Connexion wallet
        document.getElementById('wallet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.connectWallet();
        });

        // Contrôles bot
        document.getElementById('start-bot-btn').addEventListener('click', () => this.startBot());
        document.getElementById('stop-bot-btn').addEventListener('click', () => this.stopBot());

        // Ajouter wallet à suivre
        document.getElementById('add-wallet-btn').addEventListener('click', () => this.showAddWalletModal());
    }

    async checkAPIStatus() {
        try {
            const response = await API.healthCheck();
            document.getElementById('api-status').innerHTML = `
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-400">API Connectée</span>
            `;
            console.log('✅ API Status:', response);
        } catch (error) {
            document.getElementById('api-status').innerHTML = `
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="text-sm text-red-400">API Déconnectée</span>
            `;
            console.error('❌ Erreur API:', error);
        }
    }

    async loadSupportedNetworks() {
        try {
            const response = await API.getSupportedNetworks();
            const select = document.getElementById('network-select');

            select.innerHTML = '<option value="">Sélectionnez un réseau</option>';
                        response.networks.forEach(network => {
                const option = document.createElement('option');
                option.value = network.id;
                option.textContent = `${network.name} (${network.currency})`;
                if (network.priority === 1) option.selected = true;
                select.appendChild(option);
            });

            console.log('✅ Réseaux chargés:', response.networks.length);
        } catch (error) {
            console.error('❌ Erreur chargement réseaux:', error);
            this.showStatus('Erreur lors du chargement des réseaux', 'error');
        }
    }

    async connectWallet() {
        const address = document.getElementById('wallet-address-input').value.trim();
        const network = document.getElementById('network-select').value;
        const submitBtn = document.getElementById('connect-btn');

        if (!address || !network) {
            this.showStatus('Veuillez remplir tous les champs', 'error');
            return;
        }

        try {
            this.showStatus('Connexion en cours...', 'loading');
            submitBtn.disabled = true;
            submitBtn.textContent = '🔄 Connexion...';

            const walletData = { address, network };
            const response = await API.connectWallet(walletData);

            if (response.status === 'success') {
                this.connectedWallet = response.data;
                this.showStatus(response.message, 'success');

                // Afficher le dashboard
                await this.showDashboard();

                // Récupérer le solde
                await this.loadWalletBalance();

                console.log('✅ Wallet connecté:', this.connectedWallet);
            }

        } catch (error) {
            console.error('❌ Erreur connexion wallet:', error);
            this.showStatus(error.message || 'Erreur de connexion', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '🔗 Connecter le Wallet';
        }
    }

    async loadWalletBalance() {
        if (!this.connectedWallet) return;

        try {
            const response = await API.getWalletBalance(
                this.connectedWallet.address,
                this.connectedWallet.network
            );

            if (response.status === 'success') {
                const balanceData = response.data;
                const mainBalance = balanceData.balances.native;
                const currency = balanceData.currency_symbol;

                document.getElementById('wallet-balance').textContent =
                    `${mainBalance} ${currency}`;

                console.log('✅ Solde chargé:', balanceData);
            }
        } catch (error) {
            console.error('❌ Erreur chargement solde:', error);
            document.getElementById('wallet-balance').textContent = 'Erreur';
        }
    }

    async showDashboard() {
        // Masquer la section de connexion
        document.getElementById('connection-section').style.display = 'none';

        // Afficher le dashboard
        document.getElementById('dashboard-section').classList.remove('hidden');

        // Mettre à jour les infos wallet
        document.getElementById('wallet-address').textContent =
            this.connectedWallet.short_address;
        document.getElementById('wallet-network').textContent =
            this.connectedWallet.network;

        // Charger les données
        await this.loadTrackedWallets();
        await this.updateBotStatus();
    }

    async updateBotStatus() {
        try {
            const response = await API.getBotStatus();
            this.botStatus = response.data;

            // Mettre à jour l'UI
            const statusEl = document.getElementById('bot-status');
            const isRunning = this.botStatus.is_running;

            statusEl.textContent = isRunning ? 'En cours' : 'Arrêté';
            statusEl.className = `px-3 py-1 rounded-full text-sm ${
                isRunning ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
            }`;

            // Stats
            document.getElementById('tracked-wallets-count').textContent =
                this.botStatus.wallets_tracked || 0;
            document.getElementById('trades-today').textContent =
                this.botStatus.trades_today || 0;
            document.getElementById('last-activity').textContent =
                this.botStatus.last_activity ?
                new Date(this.botStatus.last_activity).toLocaleTimeString() : '-';

        } catch (error) {
            console.error('❌ Erreur status bot:', error);
        }
    }

    async startBot() {
        try {
            this.showStatus('Démarrage du bot...', 'loading');
            const response = await API.startBot();

            if (response.status === 'success') {
                this.showStatus(response.message, 'success');
                await this.updateBotStatus();
            }
        } catch (error) {
            console.error('❌ Erreur démarrage bot:', error);
            this.showStatus(error.message || 'Erreur lors du démarrage', 'error');
        }
    }

    async stopBot() {
        try {
            this.showStatus('Arrêt du bot...', 'loading');
            const response = await API.stopBot();

            if (response.status === 'success') {
                this.showStatus(response.message, 'success');
                await this.updateBotStatus();
            }
        } catch (error) {
            console.error('❌ Erreur arrêt bot:', error);
            this.showStatus(error.message || 'Erreur lors de l\'arrêt', 'error');
        }
    }

    async loadTrackedWallets() {
        try {
            const response = await API.getTrackedWallets();
            this.trackedWallets = response.data.tracked_wallets || [];
            this.renderTrackedWallets();
        } catch (error) {
            console.error('❌ Erreur chargement wallets suivis:', error);
        }
    }

    renderTrackedWallets() {
        const container = document.getElementById('tracked-wallets-list');

        if (this.trackedWallets.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <p>Aucun wallet suivi pour le moment</p>
                    <p class="text-sm">Ajoutez des wallets performants pour commencer le copy trading</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.trackedWallets.map(wallet => `
            <div class="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">👀</span>
                    </div>
                    <div>
                        <div class="font-semibold">${wallet.nickname}</div>
                        <div class="text-sm text-gray-400">
                            ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}
                            • ${wallet.network}
                            • Mode: ${wallet.copy_mode}
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="text-right">
                        <div class="text-sm font-semibold text-green-400">
                            ${wallet.trades_copied || 0} trades
                        </div>
                        <div class="text-xs text-gray-400">
                            PnL:  $ {wallet.total_pnl || 0} $
                        </div>
                    </div>
                    <button
                        onclick="copyBot.removeTrackedWallet('${wallet.address}')"
                        class="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition"
                        title="Retirer du suivi"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    showAddWalletModal() {
        // Modal temporaire (remplacer par une vraie modal plus tard)
        const address = prompt('Adresse du wallet à suivre:');
        if (!address) return;

        const network = prompt('Réseau (solana/ethereum/base/bnb):') || 'solana';
        const nickname = prompt('Nom/Surnom (optionnel):') || `Wallet-${address.slice(0, 6)}`;
        const copyMode = prompt('Mode de copie (full/buy_only/sell_only):') || 'full';
        const budget = prompt('Budget par trade (optionnel):');

        this.addWalletToTrack({
            address,
            network,
            nickname,
            copy_mode: copyMode,
            budget_per_trade: budget ? parseFloat(budget) : null
        });
    }

    async addWalletToTrack(walletData) {
        try {
            this.showStatus('Ajout du wallet...', 'loading');
            const response = await API.addWalletToTrack(walletData);

            if (response.status === 'success') {
                this.showStatus('Wallet ajouté au suivi', 'success');
                await this.loadTrackedWallets();
                await this.updateBotStatus();
            }
        } catch (error) {
            console.error('❌ Erreur ajout wallet:', error);
            this.showStatus(error.message || 'Erreur lors de l\'ajout', 'error');
        }
    }

    async removeTrackedWallet(address) {
        if (!confirm('Voulez-vous vraiment retirer ce wallet du suivi ?')) return;

        try {
            const response = await API.removeTrackedWallet(address);

            if (response.status === 'success') {
                this.showStatus('Wallet retiré du suivi', 'success');
                await this.loadTrackedWallets();
                await this.updateBotStatus();
            }
        } catch (error) {
            console.error('❌ Erreur suppression wallet:', error);
            this.showStatus(error.message || 'Erreur lors de la suppression', 'error');
        }
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('connection-status');
        const messageEl = document.getElementById('status-message');
        const indicatorEl = document.getElementById('status-indicator');

        statusDiv.classList.remove('hidden');
        statusDiv.className = 'mb-6 p-4 rounded-lg border';
        indicatorEl.className = 'w-5 h-5 rounded-full';

        messageEl.textContent = message;

        switch(type) {
            case 'success':
                statusDiv.classList.add('bg-green-900/50', 'border-green-500', 'text-green-200');
                indicatorEl.classList.add('bg-green-500');
                break;
            case 'error':
                statusDiv.classList.add('bg-red-900/50', 'border-red-500', 'text-red-200');
                indicatorEl.classList.add('bg-red-500');
                break;
            case 'loading':
                statusDiv.classList.add('bg-yellow-900/50', 'border-yellow-500', 'text-yellow-200');
                indicatorEl.classList.add('bg-yellow-500', 'animate-pulse');
                break;
        }

        // Auto-masquer après 5 secondes sauf pour les erreurs
        if (type !== 'error') {
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 5000);
        }
    }
}

// Instance globale
let copyBot;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    copyBot = new CopyBotManager();
});

