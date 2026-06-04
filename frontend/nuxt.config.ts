export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },
  devtools: { enabled: false },
  nitro: {
    devProxy: {
      '/api': { target: process.env.BACKEND_URL ?? 'http://localhost:8000', changeOrigin: true },
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:8000',
    },
  },
})
