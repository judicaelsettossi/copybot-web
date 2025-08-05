const WebSocket = require("ws");

class SolanaTracker {
  constructor() {
    this.ws = null;
    this.activeWallets = new Map();
  }

  async trackWallet(walletAddress, callback) {
    console.log(`🎯 Démarrage tracking simple pour: ${walletAddress}`);

    try {
      // Connexion WebSocket à Solana
      this.ws = new WebSocket("wss://api.mainnet-beta.solana.com/");

      this.ws.on("open", () => {
        console.log("✅ Connexion Solana WebSocket ouverte");

        // Subscribe aux logs d'account pour ce wallet
        const subscribeMessage = {
          jsonrpc: "2.0",
          id: 1,
          method: "logsSubscribe",
          params: [
            {
              mentions: [walletAddress],
            },
            {
              commitment: "confirmed",
            },
          ],
        };

        this.ws.send(JSON.stringify(subscribeMessage));
        console.log(`📡 Subscription envoyée pour ${walletAddress}`);
      });

      this.ws.on("message", (data) => {
        try {
          const response = JSON.parse(data);

          // Si c'est une confirmation de subscription
          if (response.result && typeof response.result === "number") {
            console.log(`✅ Subscription confirmée, ID: ${response.result}`);
            return;
          }

          // Si c'est une notification de transaction
          if (response.method === "logsNotification") {
            const logs = response.params?.result?.value?.logs || [];
            const signature = response.params?.result?.value?.signature;

            console.log(`🔔 Transaction détectée: ${signature}`);

            // Envoyer la notification simple
            callback({
              type: "transaction_detected",
              data: {
                walletAddress: walletAddress,
                chain: "solana",
                signature: signature,
                timestamp: Date.now(),
                logs: logs.slice(0, 3), // Premiers logs pour debug
                message: `Nouvelle transaction détectée`,
              },
            });
          }
        } catch (error) {
          console.error("❌ Erreur parsing message:", error);
        }
      });

      this.ws.on("error", (error) => {
        console.error("❌ Erreur WebSocket Solana:", error);
      });

      this.ws.on("close", () => {
        console.log("🔌 Connexion Solana fermée");
      });
    } catch (error) {
      console.error("❌ Erreur trackWallet:", error);
    }
  }

  stopTracking(walletAddress) {
    if (this.ws) {
      this.ws.close();
      console.log(`🛑 Tracking arrêté pour ${walletAddress}`);
    }
  }
}

module.exports = SolanaTracker;
