# Tasks — Phase 05

## composables/useStockApi.ts

- [ ] Implement `getStock(symbol, period)` — `$fetch('http://localhost:8000/stock/{symbol}?period={period}')`
- [ ] Implement `searchSymbols(query, limit = 8)` — `$fetch('http://localhost:8000/search?q={query}&limit={limit}')`
- [ ] Define TypeScript types: `OhlcvBar`, `StockResponse`, `SearchResult`

## components/chart/CandleChart.vue

- [ ] Accept props: `ohlcv: OhlcvBar[]`, `indicators: Indicators`, `activeEmas: string[]`
- [ ] Create Lightweight Charts chart in `onMounted`; configure dark theme options
- [ ] Apply `handleScroll` / `handleScale` options to disable pan (see context.md)
- [ ] Add candlestick series; call `setData(ohlcv)`
- [ ] Add one line series per EMA (ema20/50/100/200); `setData` for each
- [ ] Watch `activeEmas` prop: when an EMA is removed, call `chart.removeSeries()`; when added, re-create the series
- [ ] Watch `ohlcv` prop: when data changes (period switch), update all series with new data
- [ ] Call `chart.timeScale().fitContent()` after setting data
- [ ] Add `ResizeObserver` for container; clean up in `onUnmounted`

## components/chart/IndicatorToggle.vue

- [ ] Accept prop: `modelValue: { ema20, ema50, ema100, ema200, macd, rsi, stochRsi, fibo, sr, fvg }` (all booleans)
- [ ] Emit `update:modelValue` on any checkbox change (v-model compatible)
- [ ] Render two rows of checkboxes:
  - Row 1: EMA 20, EMA 50, EMA 100, EMA 200
  - Row 2: MACD, RSI, Stoch RSI, Fibo, S/R, FVG (all disabled/greyed in this phase — enabled in later phases)

## components/chart/SymbolSearch.vue

- [ ] Text input with debounced watcher (300ms)
- [ ] On input change: call `searchSymbols(query)` and store results
- [ ] Show dropdown list below input when results exist
- [ ] Each result shows: symbol (bold) + name + exchange
- [ ] Click result: emit `select(symbol)`
- [ ] Keyboard: Escape closes dropdown; Tab/ArrowDown navigates list
- [ ] Close dropdown on outside click (use `onClickOutside` from VueUse or manual handler)

## pages/stock/[symbol].vue

- [ ] Read `route.params.symbol` to determine if a symbol is in the URL
- [ ] If no symbol: show empty state with `<SymbolSearch>` centered
- [ ] If symbol present:
  - Show `<SymbolSearch>` pre-filled with current symbol
  - Show time window tabs (default: `3mo`)
  - On mount and tab change: call `getStock(symbol, period)` and store response
  - Show loading state while fetching
  - Render `<CandleChart>` with `ohlcv` and `indicators` from response
  - Render `<IndicatorToggle>` with v-model for toggle state
  - Pass active EMA list to `<CandleChart>` derived from toggle state
- [ ] Handle `@select` from `<SymbolSearch>`: `navigateTo('/stock/' + symbol)`

## Verification

- [ ] `/stock` — shows empty state with search bar
- [ ] Type in search bar — suggestions appear with debounce
- [ ] Select a suggestion — navigates to `/stock/[symbol]`
- [ ] `/stock/AAPL` — candlestick chart renders
- [ ] Scroll on chart — zooms in/out; dragging does NOT pan
- [ ] Click each time tab — chart reloads with new period
- [ ] Toggle EMA checkboxes — lines appear/disappear on chart
- [ ] Resize browser window — chart fills container
