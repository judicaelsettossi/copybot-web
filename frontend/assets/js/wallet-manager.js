// frontend/assets/js/wallet-manager.js

class WalletManager {
  constructor() {
    this.wallets = [];
    this.stats = {
      active: 0,
      inactive: 0,
      error: 0,
      total: 0,
    };
  }

  async loadWallets() {
    try {
      this.showLoading();
      console.log("📥 Chargement des wallets...");

      const walletsData = await api.getWallets();
      console.log("✅ Wallets chargés:", walletsData);

      this.wallets = Array.isArray(walletsData) ? walletsData : [];
      this.updateStats();
      this.renderWallets();
      this.hideLoading();
    } catch (error) {
      console.error("❌ Erreur chargement wallets:", error);
      this.showError("Erreur lors du chargement des wallets");
      this.hideLoading();
    }
  }

  async addWallet(address, label = "") {
    try {
      // Validation côté client
      if (!this.validateWalletAddress(address)) {
        throw new Error("Adresse wallet invalide (32-44 caractères requis)");
      }

      // Vérifier si le wallet existe déjà
      if (this.wallets.some((w) => w.address === address)) {
        throw new Error("Ce wallet est déjà tracké");
      }

      console.log("➕ Ajout wallet:", { address, label });

      const result = await api.addWallet({ address, label });
      console.log("✅ Wallet ajouté:", result);

      // Recharger la liste
      await this.loadWallets();

      // Notification succès
      Swal.fire({
        icon: "success",
        title: "Wallet ajouté !",
        text: `Le wallet ${
          label || address.substring(0, 8)
        }... est maintenant tracké`,
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        position: "top-end",
      });

      return result;
    } catch (error) {
      console.error("❌ Erreur ajout wallet:", error);
      throw error;
    }
  }

  async updateWalletStatus(walletId, newStatus) {
    try {
      console.log(`🔄 Mise à jour statut wallet ${walletId}:`, newStatus);

      await api.updateWalletStatus(walletId, newStatus);

      // Mettre à jour localement
      const wallet = this.wallets.find((w) => w.id === walletId);
      if (wallet) {
        wallet.status = newStatus;
        this.updateStats();
        this.renderWallets();
      }

      // Notification
      const statusText = newStatus === "active" ? "activé" : "désactivé";
      Swal.fire({
        icon: "success",
        title: `Wallet ${statusText} !`,
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      console.error("❌ Erreur mise à jour statut:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de modifier le statut du wallet",
      });
    }
  }

  async deleteWallet(walletId) {
    try {
      const wallet = this.wallets.find((w) => w.id === walletId);
      if (!wallet) return;

      // Confirmation
      const result = await Swal.fire({
        title: "Supprimer ce wallet ?",
        text: `Wallet: ${wallet.label || wallet.address.substring(0, 12)}...`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
      });

      if (result.isConfirmed) {
        console.log(`🗑️ Suppression wallet ${walletId}`);

        await api.deleteWallet(walletId);

        // Recharger la liste
        await this.loadWallets();

        Swal.fire({
          icon: "success",
          title: "Wallet supprimé !",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
          position: "top-end",
        });
      }
    } catch (error) {
      console.error("❌ Erreur suppression wallet:", error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de supprimer le wallet",
      });
    }
  }

  validateWalletAddress(address) {
    if (!address || typeof address !== "string") return false;
    const trimmed = address.trim();
    return trimmed.length >= 32 && trimmed.length <= 44;
  }

  updateStats() {
    this.stats = {
      active: this.wallets.filter((w) => w.status === "active").length,
      inactive: this.wallets.filter((w) => w.status === "inactive").length,
      error: this.wallets.filter((w) => w.status === "error").length,
      total: this.wallets.length,
    };

    // Mettre à jour l'UI
    elements.activeWallets.textContent = this.stats.active;
    elements.inactiveWallets.textContent = this.stats.inactive;
    elements.errorWallets.textContent = this.stats.error;
    elements.totalWallets.textContent = this.stats.total;
    elements.walletCount.textContent = this.stats.total;
  }

  showLoading() {
    elements.walletsLoading.classList.remove("hidden");
    elements.walletsList.classList.add("hidden");
    elements.walletsEmpty.classList.add("hidden");
  }

  hideLoading() {
    elements.walletsLoading.classList.add("hidden");

    if (this.wallets.length === 0) {
      elements.walletsEmpty.classList.remove("hidden");
      elements.walletsList.classList.add("hidden");
    } else {
      elements.walletsEmpty.classList.add("hidden");
      elements.walletsList.classList.remove("hidden");
    }
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Erreur",
      text: message,
    });
  }

  renderWallets() {
    if (this.wallets.length === 0) {
      elements.walletsEmpty.classList.remove("hidden");
      elements.walletsList.classList.add("hidden");
      return;
    }

    elements.walletsEmpty.classList.add("hidden");
    elements.walletsList.classList.remove("hidden");

    const walletsHtml = this.wallets
      .map((wallet) => this.renderWalletCard(wallet))
      .join("");
    elements.walletsList.innerHTML = walletsHtml;

    // Attacher les event listeners
    this.attachWalletEventListeners();
  }

  renderWalletCard(wallet) {
    const statusClass = `status-${wallet.status}`;
    const statusIcon = this.getStatusIcon(wallet.status);
    const statusText = this.getStatusText(wallet.status);

    const createdAt = new Date(wallet.created_at).toLocaleString("fr-FR");
    const shortAddress = `${wallet.address.substring(
      0,
      6
    )}...${wallet.address.substring(-4)}`;

    return `
            <div class="wallet-card bg-slate-900/50 border border-slate-600 rounded-xl p-6 fade-in" data-wallet-id="${
              wallet.id
            }">
                <div class="flex items-start justify-between">
                    <!-- Info wallet -->
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-3">
                            <div class="w-3 h-3 rounded-full ${statusClass}"></div>
                            <h3 class="text-lg font-semibold text-white">
                                ${wallet.label || `Wallet ${shortAddress}`}
                            </h3>
                            <span class="px-2 py-1 text-xs rounded-full ${statusClass} text-white">
                                ${statusIcon} ${statusText}
                            </span>
                        </div>

                        <div class="space-y-2 text-sm text-slate-400">
                            <div class="flex items-center">
                                <span class="w-20 text-slate-500">Adresse:</span>
                                                                <code class="font-mono bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">${
                                                                  wallet.address
                                                                }</code>
                                <button onclick="copyToClipboard('${
                                  wallet.address
                                }')" class="ml-2 p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
                                    📋
                                </button>
                            </div>
                            <div class="flex items-center">
                                <span class="w-20 text-slate-500">Créé:</span>
                                <span>${createdAt}</span>
                            </div>
                            ${
                              wallet.last_activity
                                ? `
                                <div class="flex items-center">
                                    <span class="w-20 text-slate-500">Activité:</span>
                                    <span>${new Date(
                                      wallet.last_activity
                                    ).toLocaleString("fr-FR")}</span>
                                </div>
                            `
                                : ""
                            }
                            <div class="flex items-center">
                                <span class="w-20 text-slate-500">Transactions:</span>
                                <span class="font-medium text-primary">${
                                  wallet.transactions_count || 0
                                }</span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col space-y-2 ml-4">
                        <!-- Toggle Status -->
                        <button
                            class="toggle-status-btn flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              wallet.status === "active"
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            }"
                            data-wallet-id="${wallet.id}"
                            data-current-status="${wallet.status}"
                        >
                            ${
                              wallet.status === "active"
                                ? "⏸️ Désactiver"
                                : "▶️ Activer"
                            }
                        </button>

                        <!-- Voir détails -->
                        <button
                            class="details-btn flex items-center px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm font-medium transition-all duration-200"
                            data-wallet-id="${wallet.id}"
                        >
                            👁️ Détails
                        </button>

                        <!-- Supprimer -->
                        <button
                            class="delete-btn flex items-center px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-all duration-200"
                            data-wallet-id="${wallet.id}"
                        >
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  attachWalletEventListeners() {
    // Toggle status buttons
    document.querySelectorAll(".toggle-status-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const walletId = parseInt(e.target.dataset.walletId);
        const currentStatus = e.target.dataset.currentStatus;
        const newStatus = currentStatus === "active" ? "inactive" : "active";

        await this.updateWalletStatus(walletId, newStatus);
      });
    });

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const walletId = parseInt(e.target.dataset.walletId);
        await this.deleteWallet(walletId);
      });
    });

    // Details buttons
    document.querySelectorAll(".details-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const walletId = parseInt(e.target.dataset.walletId);
        this.showWalletDetails(walletId);
      });
    });
  }

  showWalletDetails(walletId) {
    const wallet = this.wallets.find((w) => w.id === walletId);
    if (!wallet) return;

    const metadata = wallet.metadata
      ? JSON.stringify(JSON.parse(wallet.metadata), null, 2)
      : "Aucune donnée";

    Swal.fire({
      title: `Détails - ${
        wallet.label || `Wallet ${wallet.address.substring(0, 8)}...`
      }`,
      html: `
                <div class="text-left space-y-4">
                    <div>
                        <strong>Adresse complète:</strong>
                        <div class="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">${
                          wallet.address
                        }</div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Statut:</strong>
                            <span class="status-badge status-${
                              wallet.status
                            } px-2 py-1 rounded text-xs ml-2">
                                ${this.getStatusIcon(
                                  wallet.status
                                )} ${this.getStatusText(wallet.status)}
                            </span>
                        </div>
                        <div>
                            <strong>Transactions:</strong>
                            <span class="ml-2 font-medium">${
                              wallet.transactions_count || 0
                            }</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Créé le:</strong>
                            <div class="text-sm mt-1">${new Date(
                              wallet.created_at
                            ).toLocaleString("fr-FR")}</div>
                        </div>
                        <div>
                            <strong>Dernière activité:</strong>
                            <div class="text-sm mt-1">${
                              wallet.last_activity
                                ? new Date(wallet.last_activity).toLocaleString(
                                    "fr-FR"
                                  )
                                : "Jamais"
                            }</div>
                        </div>
                    </div>

                    <div>
                        <strong>Métadonnées:</strong>
                        <pre class="text-xs bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-auto">${metadata}</pre>
                    </div>
                </div>
            `,
      width: "600px",
      confirmButtonText: "Fermer",
    });
  }

  getStatusIcon(status) {
    const icons = {
      active: "✅",
      inactive: "⏸️",
      error: "❌",
    };
    return icons[status] || "❓";
  }

  getStatusText(status) {
    const texts = {
      active: "Actif",
      inactive: "Inactif",
      error: "Erreur",
    };
    return texts[status] || "Inconnu";
  }
}

// Fonction utilitaire pour copier dans le presse-papier
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      Swal.fire({
        icon: "success",
        title: "Copié !",
        text: "Adresse copiée dans le presse-papier",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-end",
      });
    })
    .catch(() => {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Impossible de copier l'adresse",
      });
    });
}
