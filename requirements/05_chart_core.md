# Phase 5 — Chart Core (Candlestick + Toolbar)

## Goal
Render a live candlestick chart using lightweight-charts. Wire up ticker search, interval selector, and Pinia store. Fetch data from the backend on change.

## Depends On
Phase 2 (backend stock API) and Phase 4 (frontend scaffold) must be complete.

---

## 1. `stores/chart.ts`

```ts
import { defineStore } from "pinia"
import type { Candle } from "~/types"

export const useChartStore = defineStore("chart", {
  state: () => ({
    ticker:   "AAPL" as string,
    interval: "1d"   as string,
    period:   "6mo"  as string,
    candles:  []     as Candle[],
    loading:  false  as boolean,
    error:    null   as string | null,
  }),

  actions: {
    async fetchCandles() {
      this.loading = true
      this.error   = null
      const config = useRuntimeConfig()
      try {
        const res = await $fetch<{ candles: Candle[] }>(
          `${config.public.apiBase}/stock/${this.ticker}`,
          { params: { interval: this.interval, period: this.period } }
        )
        this.candles = res.candles
      } catch (e: any) {
        this.error = e?.data?.detail || "Failed to fetch data"
      } finally {
        this.loading = false
      }
    },

    setTicker(t: string)   { this.ticker   = t.toUpperCase(); this.fetchCandles() },
    setInterval(i: string) { this.interval = i;               this.fetchCandles() },
    setPeriod(p: string)   { this.period   = p;               this.fetchCandles() },
  },
})
```

---

## 2. `composables/useStockData.ts`

```ts
import { useChartStore } from "~/stores/chart"

export function useStockData() {
  const store = useChartStore()
  return { store }
}
```

---

## 3. `components/toolbar/TickerSearch.vue`

```vue
<template>
  <div class="relative">
    <input
      v-model="query"
      @input="onInput"
      @keydown.enter="selectFirst"
      placeholder="Search ticker..."
      class="bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]
             rounded px-3 py-1 text-sm w-44 focus:outline-none focus:border-[var(--color-accent)]"
    />
    <ul
      v-if="results.length"
      class="absolute top-full left-0 mt-1 bg-[var(--color-surface)] border border-[var(--color-border)]
             rounded w-64 z-50 shadow-lg max-h-60 overflow-y-auto"
    >
      <li
        v-for="r in results"
        :key="r.symbol"
        @click="select(r.symbol)"
        class="px-3 py-2 cursor-pointer hover:bg-[var(--color-border)] text-sm"
      >
        <span class="font-bold text-white">{{ r.symbol }}</span>
        <span class="text-[var(--color-muted)] ml-2 text-xs">{{ r.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const store  = useChartStore()
const config = useRuntimeConfig()
const query   = ref(store.ticker)
const results = ref<{ symbol: string; name: string }[]>([])
let debounce: ReturnType<typeof setTimeout>

async function onInput() {
  clearTimeout(debounce)
  if (query.value.length < 1) { results.value = []; return }
  debounce = setTimeout(async () => {
    try {
      const res = await $fetch<{ results: any[] }>(
        `${config.public.apiBase}/stock/search/query`,
        { params: { q: query.value } }
      )
      results.value = res.results
    } catch { results.value = [] }
  }, 300)
}

function select(symbol: string) {
  query.value   = symbol
  results.value = []
  store.setTicker(symbol)
}

function selectFirst() {
  if (results.value.length) select(results.value[0].symbol)
  else store.setTicker(query.value)
}
</script>
```

---

## 4. `components/toolbar/IntervalSelector.vue`

```vue
<template>
  <div class="flex gap-1">
    <button
      v-for="iv in intervals"
      :key="iv"
      @click="store.setInterval(iv)"
      :class="[
        'px-2 py-1 text-xs rounded font-mono',
        store.interval === iv
          ? 'bg-[var(--color-accent)] text-white'
          : 'text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-border)]'
      ]"
    >{{ iv }}</button>
  </div>
</template>

<script setup lang="ts">
const store     = useChartStore()
const intervals = ["1m","5m","15m","30m","1h","1d","1wk","1mo"]
</script>
```

---

## 5. `components/chart/CandlestickChart.vue`

This is the core chart component. Use lightweight-charts v4.

```vue
<template>
  <div ref="chartContainer" class="w-full h-full" />
</template>

<script setup lang="ts">
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi } from "lightweight-charts"

const store          = useChartStore()
const chartContainer = ref<HTMLDivElement | null>(null)

let chart:  IChartApi | null        = null
let series: ISeriesApi<"Candlestick"> | null = null

// Expose chart instance for indicator pane and drawing tools
const emit = defineEmits<{ (e: "chart-ready", chart: IChartApi): void }>()

onMounted(() => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: "#0f1117" },
      textColor:  "#d1d4dc",
    },
    grid: {
      vertLines: { color: "#2a2d3a" },
      horzLines: { color: "#2a2d3a" },
    },
    crosshair: { mode: 1 },
    rightPriceScale: { borderColor: "#2a2d3a" },
    timeScale: {
      borderColor:     "#2a2d3a",
      timeVisible:     true,
      secondsVisible:  false,
    },
    width:  chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
  })

  series = chart.addSeries(CandlestickSeries, {
    upColor:       "#26a69a",
    downColor:     "#ef5350",
    borderVisible: false,
    wickUpColor:   "#26a69a",
    wickDownColor: "#ef5350",
  })

  emit("chart-ready", chart)

  // Auto-resize
  const ro = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.resize(chartContainer.value.clientWidth, chartContainer.value.clientHeight)
    }
  })
  ro.observe(chartContainer.value)

  // Load initial data
  store.fetchCandles()
})

// Watch candle data changes and update chart
watch(
  () => store.candles,
  (candles) => {
    if (!series || !candles.length) return
    series.setData(
      candles.map(c => ({
        time:  c.time as any,
        open:  c.open,
        high:  c.high,
        low:   c.low,
        close: c.close,
      }))
    )
    chart?.timeScale().fitContent()
  },
  { immediate: true }
)

onUnmounted(() => { chart?.remove() })
</script>
```

---

## 6. Update `pages/index.vue`

Replace the placeholder div with real components:

```vue
<template>
  <div class="flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
    <!-- Top toolbar -->
    <div class="flex items-center gap-3 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <span class="text-white font-bold text-lg">📈 StockChart</span>
      <TickerSearch />
      <IntervalSelector />
      <span v-if="store.loading" class="text-[var(--color-muted)] text-xs">Loading...</span>
      <span v-if="store.error"   class="text-red-400 text-xs">{{ store.error }}</span>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left sidebar — Phase 7 -->
      <div class="w-10 bg-[var(--color-surface)] border-r border-[var(--color-border)]" />

      <!-- Chart area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <CandlestickChart class="flex-1" @chart-ready="onChartReady" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChartApi } from "lightweight-charts"

const store = useChartStore()

function onChartReady(chart: IChartApi) {
  // Will be used by indicator pane (Phase 6) and drawing tools (Phase 7)
  console.log("Chart ready", chart)
}
</script>
```

---

## Acceptance Criteria
- [ ] Candlestick chart renders with AAPL data on page load
- [ ] Typing a ticker in the search box and pressing Enter refetches and re-renders
- [ ] Clicking an interval button refetches data and re-renders
- [ ] Chart resizes correctly when browser window resizes
- [ ] Up candles are green (`#26a69a`), down candles are red (`#ef5350`)
