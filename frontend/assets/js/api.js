// frontend/assets/js/api.js

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${config.method || "GET"} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log("✅ API Response:", data);
      this.updateApiStatus(true);
      return data;
    } catch (error) {
      console.error("❌ API Error:", error);
      this.updateApiStatus(false);
      throw error;
    }
  }

  updateApiStatus(isOnline) {
    const statusEl = elements.apiStatus;
    if (isOnline) {
      statusEl.innerHTML = `
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                API Connectée
            `;
      statusEl.className =
        "flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400";
    } else {
      statusEl.innerHTML = `
                <div class="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                API Déconnectée
            `;
      statusEl.className =
        "flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400";
    }
  }

  // Méthodes pour les wallets
  async getWallets() {
    return await this.request("/wallets");
  }

  async addWallet(walletData) {
    return await this.request("/wallets", {
      method: "POST",
      body: JSON.stringify(walletData),
    });
  }

  async updateWalletStatus(walletId, status) {
    return await this.request(`/wallets/${walletId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async deleteWallet(walletId) {
    return await this.request(`/wallets/${walletId}`, {
      method: "DELETE",
    });
  }

  async getWalletById(walletId) {
    return await this.request(`/wallets/${walletId}`);
  }
}

// Instance globale
const api = new ApiClient(API_BASE_URL);
