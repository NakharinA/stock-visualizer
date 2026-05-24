// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
  ],
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8000',
    },
  },
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false },
    ],
  },
  colorMode: {
    preference: 'dark',
  },
  css: ['~/assets/css/main.css'],
})
