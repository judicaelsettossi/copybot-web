<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">💼 Portfolio Multi-Chain</h1>
      <p class="text-gray-400">Gérez vos actifs sur toutes les blockchains</p>
    </div>

    <!-- Résumé du portfolio -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="text-center">
          <p class="text-3xl font-bold text-green-400">${{ totalValue.toLocaleString() }}</p>
          <p class="text-gray-400 mt-1">Valeur Totale</p>
          <p class="text-sm text-green-400 mt-2">+12.45% (24h)</p>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="text-center">
          <p class="text-3xl font-bold text-blue-400">{{ totalTokens }}</p>
          <p class="text-gray-400 mt-1">Tokens Détenus</p>
          <p class="text-sm text-blue-400 mt-2">Sur {{ chains.length }} chaînes</p>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="text-center">
          <p class="text-3xl font-bold text-purple-400">${{ dailyPnL >= 0 ? '+' : '' }}{{ dailyPnL.toFixed(2) }}</p>
          <p class="text-gray-400 mt-1">P&L 24h</p>
          <p class="text-sm" :class="dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ dailyPnL >= 0 ? '📈' : '📉' }} {{ (dailyPnL / totalValue * 100).toFixed(2) }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Répartition par chaîne -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">🔗 Répartition par Chaîne</h2>
        <div class="space-y-4">
          <div v-for="allocation in chainAllocations" :key="allocation.chain" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full mr-3" :style="{ backgroundColor: allocation.color }"></div>
              <span class="font-medium">{{ allocation.name }}</span>
            </div>
            <div class="text-right">
              <p class="font-medium">${{ allocation.value.toLocaleString() }}</p>
              <p class="text-sm text-gray-400">{{ allocation.percentage }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top tokens -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">🔥 Top Holdings</h2>
        <div class="space-y-4">
          <div v-for="holding in topHoldings" :key="holding.symbol" class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">{{ holding.icon }}</span>
              <div>
                <p class="font-medium">{{ holding.symbol }}</p>
                <p class="text-sm text-gray-400">{{ holding.name }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium">${{ holding.value.toLocaleString() }}</p>
              <p class="text-sm" :class="holding.change >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ holding.change >= 0 ? '+' : '' }}{{ holding.change }}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau détaillé des positions -->
    <div class="bg-gray-800 rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">📊 Positions Détaillées</h2>
        <button
          @click="refreshPortfolio"
          :disabled="refreshing"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {{ refreshing ? '⏳ Actualisation...' : '🔄 Actualiser' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 px-2">Token</th>
              <th class="text-left py-3 px-2">Chaîne</th>
              <th class="text-right py-3 px-2">Quantité</th>
              <th class="text-right py-3 px-2">Prix</th>
              <th class="text-right py-3 px-2">Valeur</th>
              <th class="text-right py-3 px-2">24h</th>
              <th class="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="position in positions" :key="`${position.chain}-${position.symbol}`" class="border-b border-gray-700 hover:bg-gray-700 transition-colors">
              <td class="py-4 px-2">
                <div class="flex items-center">
                  <span class="text-xl mr-3">{{ position.icon }}</span>
                  <div>
                    <p class="font-medium">{{ position.symbol }}</p>
                    <p class="text-sm text-gray-400">{{ position.name }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-2">
                <span class="bg-gray-600 px-2 py-1 rounded text-xs">{{ position.chain }}</span>
              </td>
              <td class="py-4 px-2 text-right">{{ position.balance }}</td>
              <td class="py-4 px-2 text-right">${{ position.price }}</td>
              <td class="py-4 px-2 text-right font-medium">${{ position.value.toLocaleString() }}</td>
              <td class="py-4 px-2 text-right" :class="position.change24h >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ position.change24h >= 0 ? '+' : '' }}{{ position.change24h }}%
              </td>
              <td class="py-4 px-2 text-right">
                <button @click="tradeToken(position)" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                  Trade
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useApiStore } from '../stores/api'

const router = useRouter()
const apiStore = useApiStore()

// État réactif
const chains = ref([])
const refreshing = ref(false)

const positions = ref([
  { chain: 'Ethereum', symbol: 'ETH', name: 'Ethereum', icon: '⟠', balance: '2.45', price: '2456.78', value: 6019, change24h: 3.45 },
  { chain: 'Ethereum', symbol: 'USDC', name: 'USD Coin', icon: '💵', balance: '1234.56', price: '1.00', value: 1235, change24h: 0.01 },
  { chain: 'Solana', symbol: 'SOL', name: 'Solana', icon: '☀️', balance: '45.67', price: '98.34', value: 4492, change24h: -1.23 },
  { chain: 'BSC', symbol: 'BNB', name: 'BNB', icon: '🟡', balance: '12.34', price: '234.56', value: 2895, change24h: 2.17 },
  { chain: 'Polygon', symbol: 'MATIC', name: 'Polygon', icon: '🔷', balance: '789.12', price: '0.87', value: 687, change24h: 5.34 },
])

// Computed
const totalValue = computed(() => {
  return positions.value.reduce((sum, pos) => sum + pos.value, 0)
})

const totalTokens = computed(() => {
  return positions.value.length
})

const dailyPnL = computed(() => {
  return positions.value.reduce((sum, pos) => {
    return sum + (pos.value * pos.change24h / 100)
  }, 0)
})

const chainAllocations = computed(() => {
  const allocations = {}
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  positions.value.forEach(pos => {
    if (!allocations[pos.chain]) {
      allocations[pos.chain] = { value: 0, name: pos.chain }
    }
    allocations[pos.chain].value += pos.value
  })

  return Object.values(allocations)
    .map((alloc, index) => ({
      ...alloc,
      percentage: ((alloc.value / totalValue.value) * 100).toFixed(1),
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
})

const topHoldings = computed(() => {
  return positions.value
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(pos => ({
      symbol: pos.symbol,
      name: pos.name,
      icon: pos.icon,
      value: pos.value,
      change: pos.change24h
    }))
})

// Méthodes
const refreshPortfolio = async () => {
  refreshing.value = true

  // Simulation de refresh
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mettre à jour les prix (simulation)
  positions.value.forEach(pos => {
    pos.change24h += (Math.random() - 0.5) * 2
    pos.price = (parseFloat(pos.price) * (1 + (Math.random() - 0.5) * 0.02)).toFixed(2)
    pos.value = Math.round(parseFloat(pos.balance) * parseFloat(pos.price))
  })

  refreshing.value = false
}

const tradeToken = (position) => {
  router.push(`/trading?chain=${position.chain.toLowerCase()}&token=${position.symbol}`)
}

// Lifecycle
onMounted(async () => {
  await apiStore.fetchChains()
  chains.value = apiStore.chains
})
</script>