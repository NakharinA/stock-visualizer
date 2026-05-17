import Aura from '@primevue/themes/aura'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  experimental: {
    payloadExtraction: false,
  },
  modules: ['@primevue/nuxt-module', '@pinia/nuxt'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000',
    },
  },
  css: ['~/assets/css/main.css', 'primeicons/primeicons.css'],
  app: {
    htmlAttrs: {
      class: 'dark',
    },
  },
})
