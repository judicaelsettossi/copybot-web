<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">📊 Dashboard CopyBot</h1>
      <p class="text-gray-400">Vue d'ensemble du trading multi-chaînes</p>
    </div>

    <!-- Stats rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-500 bg-opacity-20">
            <span class="text-2xl">💰</span>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-400">Portfolio Total</p>
            <p class="text-2xl font-semibold text-green-400">$12,345.67</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-500 bg-opacity-20">
            <span class="text-2xl">📈</span>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-400">Trades Aujourd'hui</p>
            <p class="text-2xl font-semibold text-blue-400">{{ todayTrades }}</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-500 bg-opacity-20">
            <span class="text-2xl">🔗</span>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-400">Chaînes Actives</p>
            <p class="text-2xl font-semibold text-purple-400">{{ chains.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6 card-hover">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-500 bg-opacity-20">
            <span class="text-2xl">⚡</span>
          </div>
          <div class="ml-4">
            <p class="text-sm text-gray-400">P&L 24h</p>
            <p class="text-2xl font-semibold text-orange-400">+$234.56</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chaînes supportées -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">🔗 Chaînes Supportées</h2>
      
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p class="mt-2 text-gray-400">Chargement des chaînes...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="chain in chains" 
          :key="chain.id"
          class="bg-gray-700 rounded-lg p-4 card-hover cursor-pointer"
          @click="selectChain(chain)"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium">{{ chain.name }}</h3>
            <span class="text-xs bg-gray-600 px-2 py-1 rounded">{{ chain.symbol }}</span>
          </div>
          <p class="text-sm text-gray-400">Chain ID: {{ chain.chain_id || 'N/A' }}</p>
          <div class="mt-2 flex items-center">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="ml-2 text-xs text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activité récente -->
    <div class="bg-gray-800 rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">📋 Activité Récente</h2>
      <div class="space-y-3">
        <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center justify-between py-2 border-b border-gray-700">
          <div class="flex items-center">
            <span class="text-2xl mr-3">{{ activity.icon }}</span>
            <div>
              <p class="font-medium">{{ activity.action }}</p>
              <p class="text-sm text-gray-400">{{ activity.time }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium" :class="activity.profit >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ activity.profit >= 0 ? '+' : '' }}${{ activity.profit }}
            </p>
            <p class="text-sm text-gray-400">{{ activity.chain }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApiStore } from '../stores/api'

const apiStore = useApiStore()

// Données réactives
const chains = ref([])
const loading = ref(false)
const todayTrades = ref(42)
const recentActivity = ref([
  { id: 1, icon: '💱', action: 'Swap ETH → USDC', time: 'Il y a 5 min', profit: 23.45, chain: 'Ethereum' },
  { id: 2, icon: '🚀', action: 'Buy SOL', time: 'Il y a 12 min', profit: 156.78, chain: 'Solana' },
  { id: 3, icon: '📉', action: 'Sell BNB', time: 'Il y a 23 min', profit: -45.32, chain: 'BSC' },
  { id: 4, icon: '⚡', action: 'Bridge MATIC', time: 'Il y a 1h', profit: 12.67, chain: 'Polygon' },
])

// Méthodes
const selectChain = (chain) => {
  console.log('Chaîne sélectionnée:', chain)
  // Navigation vers trading avec cette chaîne
  // router.push(`/trading?chain=${chain.id}`)
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  await apiStore.fetchChains()
  chains.value = apiStore.chains
  loading.value = false
})
</script>
