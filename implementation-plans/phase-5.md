## Phase 5 — Chart Core

### Depends On: Phase 2 + 4

### stores/chart.ts
state: ticker("AAPL"), interval("1d"), period("6mo"), candles([]), loading(false), error(null)
actions:
  fetchCandles() → $fetch `${apiBase}/stock/${ticker}?interval=&period=`
  setTicker(t)   → this.ticker = t.toUpperCase(); fetchCandles()
  setInterval(i) → this.interval = i; fetchCandles()
  setPeriod(p)   → this.period = p; fetchCandles()

### composables/useStockData.ts
export function useStockData() { return { store: useChartStore() } }

### components/toolbar/TickerSearch.vue
- PrimeVue AutoComplete component
  v-model = query ref (init to store.ticker)
  :suggestions = results ref (list of {symbol, name})
  @complete = debounced $fetch to /stock/search/query?q=
  @item-select = store.setTicker(event.value.symbol)
  option-label = "symbol"
  dropdown = false
- PrimeVue item template showing symbol (bold) + name (muted)

### components/toolbar/IntervalSelector.vue
- PrimeVue SelectButton
  v-model = computed get/set wired to store.interval
  :options = ["1m","5m","15m","30m","1h","1d","1wk","1mo"]
  
### components/chart/CandlestickChart.vue
- ref="chartContainer" div filling parent
- onMounted:
    createChart(container, { layout, grid, crosshair, rightPriceScale, timeScale, width, height })
    addSeries(CandlestickSeries, { upColor:#26a69a, downColor:#ef5350, borderVisible:false })
    emit("chart-ready", chart)
    ResizeObserver → chart.resize()
    store.fetchCandles()
- watch(store.candles) → series.setData() + chart.timeScale().fitContent()
- onUnmounted → chart.remove()
- emit: "chart-ready" (IChartApi)

### pages/index.vue
Layout:
  flex flex-col h-screen
  Top bar: PrimeVue Toolbar → start slot: logo + TickerSearch + IntervalSelector + loading/error
  Body: flex row
    Left sidebar: 40px placeholder div (Phase 7)
    Main: flex-1 CandlestickChart @chart-ready="onChartReady"

### Acceptance
AAPL renders on load; ticker/interval change refetches; resizes; green/red candles