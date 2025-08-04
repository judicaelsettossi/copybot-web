<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">💱 Trading Multi-Chain</h1>
      <p class="text-gray-400">Échangez des tokens sur plusieurs blockchains</p>
    </div>

    <!-- Sélection de chaîne -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Panel de trading -->
      <div class="lg:col-span-2">
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">🔄 Swap de Tokens</h2>

          <!-- Sélection de chaîne -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Blockchain</label>
            <select
              v-model="selectedChain"
              @change="loadTokens"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une chaîne</option>
              <option v-for="chain in chains" :key="chain.id" :value="chain.id">
                {{ chain.name }} ({{ chain.symbol }})
              </option>
            </select>
          </div>

          <!-- De (From) -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">De</label>
            <div class="flex space-x-2">
              <select
                v-model="fromToken"
                class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Token source</option>
                                <option v-for="token in availableTokens" :key="token.address" :value="token">
                  {{ token.symbol }} - {{ token.name }}
                </option>
              </select>
              <input
                v-model="fromAmount"
                type="number"
                placeholder="0.0"
                class="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
            </div>
          </div>

          <!-- Bouton de swap -->
          <div class="flex justify-center mb-4">
            <button
              @click="swapTokens"
              class="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              🔄
            </button>
          </div>

          <!-- Vers (To) -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Vers</label>
            <div class="flex space-x-2">
              <select
                v-model="toToken"
                class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Token destination</option>
                <option v-for="token in availableTokens" :key="token.address" :value="token">
                  {{ token.symbol }} - {{ token.name }}
                </option>
              </select>
              <input
                v-model="toAmount"
                type="number"
                placeholder="0.0"
                readonly
                class="w-32 bg-gray-600 border border-gray-600 rounded-lg px-3 py-2"
              >
            </div>
          </div>

          <!-- Informations de quote -->
          <div v-if="quote" class="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 class="font-medium mb-2">📊 Détails de l'échange</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Taux:</span>
                <span>1 {{ fromToken?.symbol }} = {{ exchangeRate }} {{ toToken?.symbol }}</span>
              </div>
              <div class="flex justify-between">
                <span>Slippage:</span>
                <span>0.5%</span>
              </div>
              <div class="flex justify-between">
                <span>Frais réseau:</span>
                <span>~$2.45</span>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <button
            @click="executeSwap"
            :disabled="!canSwap"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 rounded-lg transition-all duration-300"
          >
            {{ swapping ? '⏳ Échange en cours...' : '🚀 Échanger' }}
          </button>
        </div>
      </div>

      <!-- Panel d'informations -->
      <div class="space-y-6">
        <!-- Balance -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">💰 Soldes</h2>
          <div v-if="selectedChain" class="space-y-3">
            <div v-for="token in availableTokens" :key="token.address" class="flex justify-between items-center">
              <div class="flex items-center">
                <span class="font-medium">{{ token.symbol }}</span>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ getTokenBalance(token.symbol) }}</p>
                <p class="text-xs text-gray-400">${{ (getTokenBalance(token.symbol) * 100).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-400 text-center py-4">Sélectionnez une chaîne</p>
        </div>

        <!-- Historique récent -->
        <div class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">📋 Trades Récents</h2>
          <div class="space-y-3">
            <div v-for="trade in recentTrades" :key="trade.id" class="flex justify-between items-center text-sm">
              <div>
                <p class="font-medium">{{ trade.from }} → {{ trade.to }}</p>
                <p class="text-gray-400">{{ trade.time }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium" :class="trade.status === 'success' ? 'text-green-400' : 'text-orange-400'">
                  {{ trade.status === 'success' ? '✅' : '⏳' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Jupiter (Solana uniquement) -->
        <div v-if="selectedChain === 'solana'" class="bg-gray-800 rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">🪐 Jupiter Integration</h2>
          <button
            @click="loadJupiterTokens"
            :disabled="loadingJupiter"
            class="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {{ loadingJupiter ? '⏳ Chargement...' : '🔄 Charger tokens Jupiter' }}
          </button>

          <div v-if="jupiterTokens.length > 0" class="mt-4 max-h-40 overflow-y-auto">
            <p class="text-sm text-gray-400 mb-2">{{ jupiterTokens.length }} tokens disponibles</p>
            <div class="space-y-1">
              <div v-for="token in jupiterTokens.slice(0, 10)" :key="token.address" class="text-xs">
                {{ token.symbol }} - {{ token.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useApiStore } from '../stores/api'

const apiStore = useApiStore()

// État réactif
const chains = ref([])
const selectedChain = ref('')
const availableTokens = ref([])
const fromToken = ref(null)
const toToken = ref(null)
const fromAmount = ref('')
const toAmount = ref('')
const quote = ref(null)
const swapping = ref(false)
const loadingJupiter = ref(false)
const jupiterTokens = ref([])

const recentTrades = ref([
  { id: 1, from: 'ETH', to: 'USDC', time: '2 min', status: 'success' },
  { id: 2, from: 'SOL', to: 'USDT', time: '5 min', status: 'pending' },
  { id: 3, from: 'BNB', to: 'BUSD', time: '12 min', status: 'success' },
])

// Computed
const canSwap = computed(() => {
  return fromToken.value && toToken.value && fromAmount.value && !swapping.value
})

const exchangeRate = computed(() => {
  if (!quote.value || !fromAmount.value) return '0'
  return (parseFloat(toAmount.value) / parseFloat(fromAmount.value)).toFixed(6)
})

// Méthodes
const loadTokens = async () => {
  if (!selectedChain.value) return
  availableTokens.value = await apiStore.fetchTokens(selectedChain.value)
}

const getTokenBalance = (symbol) => {
  // Retourne un solde simulé
  const balances = {
    'ETH': '2.45', 'USDC': '1234.56', 'USDT': '567.89',
    'BNB': '12.34', 'SOL': '45.67', 'MATIC': '789.12'
  }
  return balances[symbol] || '0.00'
}

const swapTokens = () => {
  const temp = fromToken.value
  fromToken.value = toToken.value
  toToken.value = temp

  const tempAmount = fromAmount.value
  fromAmount.value = toAmount.value
  toAmount.value = tempAmount
}

const getQuote = async () => {
  if (!fromToken.value || !toToken.value || !fromAmount.value) return

  if (selectedChain.value === 'solana') {
    quote.value = await apiStore.getJupiterQuote(
      fromToken.value.address,
      toToken.value.address,
      (parseFloat(fromAmount.value) * 1000000).toString()
    )

    if (quote.value && quote.value.outAmount) {
      toAmount.value = (parseFloat(quote.value.outAmount) / 1000000).toFixed(6)
    }
  } else {
    // Simulation pour autres chaînes
    const rate = Math.random() * 2000 + 1000 // Taux simulé
    toAmount.value = (parseFloat(fromAmount.value) * rate).toFixed(6)
    quote.value = { simulated: true }
  }
}

const executeSwap = async () => {
  if (!canSwap.value) return

  swapping.value = true

  try {
    // Simulation d'un swap
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Ajouter à l'historique
    recentTrades.value.unshift({
      id: Date.now(),
      from: fromToken.value.symbol,
      to: toToken.value.symbol,
      time: 'maintenant',
      status: 'success'
    })

    // Reset
    fromAmount.value = ''
    toAmount.value = ''
    quote.value = null

    alert('✅ Swap réussi!')
  } catch (error) {
    alert('❌ Erreur lors du swap: ' + error.message)
  } finally {
    swapping.value = false
  }
}

const loadJupiterTokens = async () => {
  loadingJupiter.value = true
  jupiterTokens.value = await apiStore.getJupiterTokens()
  loadingJupiter.value = false
}

// Watchers
watch([fromToken, toToken, fromAmount], () => {
  if (fromToken.value && toToken.value && fromAmount.value) {
    getQuote()
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await apiStore.fetchChains()
  chains.value = apiStore.chains
})
</script>