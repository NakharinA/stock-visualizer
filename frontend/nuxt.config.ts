export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Ticker — Stock Visualizer',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },
  ssr: false,
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },
  devtools: { enabled: false },
  nitro: {
    preset: 'cloudflare-pages-static',
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
