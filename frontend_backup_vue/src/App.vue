<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-800 shadow-lg">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold gradient-text">🤖 CopyBot Web</h1>
            <span class="text-sm text-gray-400">Multi-Chain Trading</span>
          </div>

          <div class="flex space-x-6">
            <router-link to="/" class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              :class="{ 'bg-gray-700': $route.name === 'Dashboard' }">
              📊 Dashboard
            </router-link>
            <router-link to="/trading"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              :class="{ 'bg-gray-700': $route.name === 'Trading' }">
              💱 Trading
            </router-link>
            <router-link to="/portfolio"
              class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              :class="{ 'bg-gray-700': $route.name === 'Portfolio' }">
              💼 Portfolio
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="container mx-auto px-6 py-8">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
