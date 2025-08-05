const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Importers
const SolanaTracker = require("./trackers/solana");
const EthereumTracker = require("./trackers/ethereum");

class CopyBotWebSocketServer {
  constructor() {
    this.config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
    this.clients = new Map();
    this.trackedWallets = new Map();

    // Créer le serveur HTTP
    this.server = http.createServer();

    // Créer le serveur WebSocket
    this.wss = new WebSocket.Server({
      server: this.server,
      path: "/ws",
    });

    // Initialiser les trackers
    this.solanaTracker = new SolanaTracker(this.config.solana);
    this.ethereumTracker = new EthereumTracker(this.config.ethereum);

    this.setupWebSocket();
    // ✅ SUPPRIMÉ l'appel setupTrackers() qui causait l'erreur
    console.log("🔧 Trackers initialisés");
  }

  setupWebSocket() {
    this.wss.on("connection", (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws: ws,
        subscriptions: new Set(),
        connectedAt: new Date(),
      });

      console.log(
        `🔗 Client connecté: ${clientId} (Total: ${this.clients.size})`
      );

      // Message de bienvenue
      this.sendToClient(clientId, {
        type: "connected",
        clientId: clientId,
        timestamp: Date.now(),
      });

      // Gestion des messages
      ws.on("message", (data) => {
        this.handleMessage(clientId, data);
      });

      // Nettoyage à la déconnexion
      ws.on("close", () => {
        this.clients.delete(clientId);
        console.log(
          `❌ Client déconnecté: ${clientId} (Restants: ${this.clients.size})`
        );
      });

      // Gestion des erreurs
      ws.on("error", (error) => {
        console.error(`❌ Erreur WebSocket pour ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  handleMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "subscribe_wallet":
          this.subscribeToWallet(clientId, message);
          break;

        case "unsubscribe_wallet":
          this.unsubscribeFromWallet(clientId, message);
          break;

        case "get_wallet_info":
          this.getWalletInfo(clientId, message);
          break;

        case "ping":
          this.sendToClient(clientId, { type: "pong", timestamp: Date.now() });
          break;

        default:
          this.sendToClient(clientId, {
            type: "error",
            message: `Type de message inconnu: ${message.type}`,
          });
      }
    } catch (error) {
      console.error("❌ Erreur parsing message:", error);
      this.sendToClient(clientId, {
        type: "error",
        message: "Format de message invalide",
      });
    }
  }

  subscribeToWallet(clientId, message) {
    const { walletAddress, chain } = message.data;

    if (!walletAddress || !chain) {
      this.sendToClient(clientId, {
        type: "error",
        message: "Adresse de wallet et chaîne requis",
      });
      return;
    }

    const client = this.clients.get(clientId);
    if (client) {
      const subscriptionKey = `${chain}:${walletAddress}`;
      client.subscriptions.add(subscriptionKey);

      // Ajouter au tracking global
      if (!this.trackedWallets.has(subscriptionKey)) {
        this.trackedWallets.set(subscriptionKey, new Set());
      }
      this.trackedWallets.get(subscriptionKey).add(clientId);

      // ✅ CORRIGÉ: Commencer le tracking avec les bons paramètres
      this.startTracking(chain, walletAddress);

      this.sendToClient(clientId, {
        type: "subscription_confirmed",
        data: { walletAddress, chain },
      });

      console.log(`👀 ${clientId} suit maintenant: ${subscriptionKey}`);
    }
  }

  unsubscribeFromWallet(clientId, message) {
    const { walletAddress, chain } = message.data;
    const subscriptionKey = `${chain}:${walletAddress}`;

    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(subscriptionKey);

      // Retirer du tracking global
      if (this.trackedWallets.has(subscriptionKey)) {
        this.trackedWallets.get(subscriptionKey).delete(clientId);

        // Si plus personne ne track ce wallet, arrêter le tracking
        if (this.trackedWallets.get(subscriptionKey).size === 0) {
          this.stopTracking(chain, walletAddress);
          this.trackedWallets.delete(subscriptionKey);
        }
      }

      this.sendToClient(clientId, {
        type: "unsubscription_confirmed",
        data: { walletAddress, chain },
      });
    }
  }

  getWalletInfo(clientId, message) {
    const { walletAddress, chain } = message.data;

    if (!walletAddress || !chain) {
      this.sendToClient(clientId, {
        type: "error",
        message: "Adresse de wallet et chaîne requis",
      });
      return;
    }

    // Info basique du wallet
    const subscriptionKey = `${chain}:${walletAddress}`;
    const isTracked = this.trackedWallets.has(subscriptionKey);
    const subscriberCount = isTracked
      ? this.trackedWallets.get(subscriptionKey).size
      : 0;

    this.sendToClient(clientId, {
      type: "wallet_info",
      data: {
        walletAddress: walletAddress,
        chain: chain,
        isTracked: isTracked,
        subscriberCount: subscriberCount,
        timestamp: Date.now(),
      },
    });

    console.log(`ℹ️ Info demandée pour ${subscriptionKey} par ${clientId}`);
  }

  // ✅ CORRIGÉ: Méthode startTracking simplifiée
  startTracking(chain, walletAddress) {
    const subscriptionKey = `${chain}:${walletAddress}`;

    // Éviter de démarrer plusieurs fois le même tracking
    if (this.trackedWallets.get(subscriptionKey)?.size > 1) {
      console.log(`🔄 Tracking déjà actif pour ${subscriptionKey}`);
      return;
    }

    console.log(`🎯 Démarrage du tracking pour ${subscriptionKey}`);

    // Callback pour recevoir les transactions détectées
    const callback = (transactionData) => {
      this.broadcastTransaction(chain, walletAddress, transactionData);
    };

    // Démarrer le tracking selon la chaîne
    switch (chain.toLowerCase()) {
      case "solana":
        this.solanaTracker.trackWallet(walletAddress, callback);
        break;
      case "ethereum":
        this.ethereumTracker.trackWallet(walletAddress, callback);
        break;
      default:
        console.error(`❌ Chaîne non supportée: ${chain}`);
    }
  }

  stopTracking(chain, walletAddress) {
    console.log(`🛑 Arrêt du tracking pour ${chain}:${walletAddress}`);

    switch (chain.toLowerCase()) {
      case "solana":
        this.solanaTracker.stopTracking(walletAddress);
        break;
      case "ethereum":
        this.ethereumTracker.stopTracking(walletAddress);
        break;
    }
  }

  // ✅ CORRIGÉ: broadcastTransaction pour diffuser les transactions détectées
  broadcastTransaction(chain, walletAddress, transactionData) {
    const subscriptionKey = `${chain}:${walletAddress}`;
    const subscribers = this.trackedWallets.get(subscriptionKey);

    if (subscribers && subscribers.size > 0) {
      subscribers.forEach((clientId) => {
        this.sendToClient(clientId, transactionData);
      });

      console.log(
        `📡 Transaction diffusée pour ${subscriptionKey} à ${subscribers.size} clients`
      );
    }
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  generateClientId() {
    return (
      "client_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    );
  }

  start() {
    const port = this.config.websocket.port;
    const host = this.config.websocket.host;

    this.server.listen(port, host, () => {
      console.log(
        `🚀 CopyBot WebSocket Server démarré sur ws://${host}:${port}/ws`
      );
      console.log(`📊 Prêt à tracker les transactions sur Solana et Ethereum`);
    });
  }

  // Statistiques
  getStats() {
    return {
      connectedClients: this.clients.size,
      trackedWallets: this.trackedWallets.size,
      totalSubscriptions: Array.from(this.clients.values()).reduce(
        (total, client) => total + client.subscriptions.size,
        0
      ),
    };
  }
}

// Démarrer le serveur
const server = new CopyBotWebSocketServer();
server.start();

// Logs de stats toutes les 30 secondes
setInterval(() => {
  const stats = server.getStats();
  console.log(
    `📊 Stats: ${stats.connectedClients} clients, ${stats.trackedWallets} wallets, ${stats.totalSubscriptions} subscriptions`
  );
}, 30000);

// Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("\n🛑 Arrêt du serveur WebSocket...");
  process.exit(0);
});
