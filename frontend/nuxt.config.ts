import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000',
    },
  },

  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],

  build: {
    transpile: ['primevue'],
  },

  vite: {
    plugins: [
      Components({
        resolvers: [PrimeVueResolver()],
      }),
    ],
  },
})
