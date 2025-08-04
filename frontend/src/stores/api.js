import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
})

export const useApiStore = defineStore('api', {
  state: () => ({
    chains: [],
    tokens: {},
    loading: false,
    error: null,
  }),

  actions: {
    async fetchChains() {
      try {
        this.loading = true
        const response = await api.get('/api/chains')
        this.chains = response.data.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchTokens(chainId) {
      try {
        const response = await api.get(`/api/chains/${chainId}/tokens`)
        this.tokens[chainId] = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.message
        return []
      }
    },

    async getBalance(chainId, address) {
      try {
        const response = await api.post(`/api/chains/${chainId}/balance`, {
          address
        })
        return response.data.data
      } catch (error) {
        this.error = error.message
        return null
      }
    },

    async getJupiterQuote(inputMint, outputMint, amount) {
      try {
        const response = await api.get('/api/jupiter/quote', {
          params: { inputMint, outputMint, amount }
        })
        return response.data.data
      } catch (error) {
        this.error = error.message
        return null
      }
    },

    async getJupiterTokens() {
      try {
        const response = await api.get('/api/jupiter/tokens')
        return response.data.data
      } catch (error) {
        this.error = error.message
        return []
      }
    }
  }
})