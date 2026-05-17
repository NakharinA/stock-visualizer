## Phase 4 — Frontend Scaffold (Nuxt 3 + PrimeVue + Yarn)

### Depends On: Phase 1

### Init commands
cd frontend
npx nuxi@latest init .        # choose: no git
yarn install
yarn add primevue @primevue/nuxt-module primeicons
yarn add pinia @pinia/nuxt
yarn add lightweight-charts
yarn add @vueuse/core

### nuxt.config.ts
modules: ["@primevue/nuxt-module", "@pinia/nuxt"]
primevue: { options: { theme: { preset: Aura, options: { darkModeSelector: ".dark" } } } }
runtimeConfig.public.apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000"
css: ["~/assets/css/main.css", "primeicons/primeicons.css"]

### .env
NUXT_PUBLIC_API_BASE=http://localhost:8000

### assets/css/main.css
CSS variables only (no Tailwind):
--color-bg: #0f1117
--color-surface: #1a1d27
--color-border: #2a2d3a
--color-accent: #2962ff
--color-up: #26a69a
--color-down: #ef5350
--color-text: #d1d4dc
--color-muted: #787b86
body: background-color var(--color-bg), color var(--color-text)

### types/index.ts
Candle, StockResponse, IndicatorSeries, IndicatorResponse,
ActiveIndicator (id, type, params, formula?, pane:"main"|"sub", color, series[]),
DrawingToolType = "none"|"trendline"|"hline"|"fvgbox"|"freehand"
DrawingPoint { time: number, price: number }
Drawing { id, tool, points[], color, opacity, lineWidth }

### Skeleton files (empty shells)
components/chart/CandlestickChart.vue   → <template><div /></template>
components/chart/IndicatorPane.vue      → same
components/toolbar/TickerSearch.vue     → same
components/toolbar/IntervalSelector.vue → same
components/toolbar/IndicatorPanel.vue   → same
components/indicator/PresetPicker.vue   → same
components/indicator/FormulaEditor.vue  → same
components/drawing/DrawingToolbar.vue   → same
components/drawing/TrendlinePrimitive.ts → // TODO
components/drawing/FVGBoxPrimitive.ts   → // TODO
composables/useStockData.ts             → // TODO
composables/useIndicator.ts             → // TODO
stores/chart.ts                         → // TODO
stores/indicator.ts                     → // TODO
stores/drawings.ts                      → // TODO

### pages/index.vue
Minimal shell: <template><div>StockChart</div></template>

### app.vue
Add class="dark" to <html> tag for PrimeVue dark mode

### Acceptance
yarn dev starts on port 3000, no errors