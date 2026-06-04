# Tasks — Phase 06

## Package Installation
- [ ] `npm install lightweight-charts` in `frontend/`

## composables/useStockApi.ts
- [ ] Implement `fetchStock(symbol: string, period: string) -> Promise<StockResponse>`
  - Call `GET /api/stock/{symbol}?period={period}`
  - Return typed StockResponse
- [ ] Implement `searchSymbols(query: string) -> Promise<SearchResult[]>`
  - Call `GET /api/search?q={query}&limit=8`
  - Return typed array

## pages/stock/[[symbol]].vue

- [ ] Read `symbol` from `useRoute().params.symbol`
- [ ] If `symbol` is undefined or empty, call `navigateTo('/stock/AAPL', { replace: true })`
- [ ] Reactive `period` ref defaulting to `'3mo'`
- [ ] On mount (and when `symbol` or `period` changes), call `fetchStock(symbol, period)`
- [ ] Pass OHLCV data to `<CandleChart>` as a prop
- [ ] Render 6 time tabs using `UTabs` or custom tab buttons: YTD, 1Y, 6M, 3M, 1M, 1W
- [ ] Map tab labels to period strings: `{ 'YTD': 'ytd', '1Y': '1y', '6M': '6mo', '3M': '3mo', '1M': '1mo', '1W': '1wk' }`
- [ ] Handle 404 from API: show error alert with symbol name
- [ ] Handle other errors: show generic error alert
- [ ] Show loading state while request is in flight

## components/chart/SymbolSearch.vue (new component)

- [ ] Render a text input with placeholder "Search symbol..."
- [ ] Show current symbol as the input value when not focused
- [ ] On input change, debounce 300ms then emit `search(query)` event
- [ ] Receive `results: SearchResult[]` prop — render dropdown list when non-empty
- [ ] Each dropdown item: `SYMBOL — Company Name`
- [ ] Emit `select(symbol: string)` when a result is clicked
- [ ] Close dropdown on Escape or click-outside
- [ ] Clear input and close dropdown after selection

## components/chart/CandleChart.vue

- [ ] Accept prop `ohlcv: OHLCVBar[]`
- [ ] On mount, create Lightweight Charts instance with `createChart(container, options)`
- [ ] Configure chart options (see context.md for exact settings):
  - `handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false }`
  - `handleScale: { mouseWheel: true, pinchScale: true }`
  - Dark theme colors
- [ ] Add a candlestick series and set data from `ohlcv` prop
- [ ] Watch `ohlcv` prop — when it changes, call `series.setData(newData)`
- [ ] Call `chart.timeScale().fitContent()` after data is set
- [ ] On mount, create a ResizeObserver to call `chart.resize(width, height)` when container size changes
- [ ] On unmount, call `chart.remove()` to clean up

## pages/stock — wiring SymbolSearch

- [ ] Use `<SymbolSearch>` in the stock page
- [ ] On `@search(query)`: call `searchSymbols(query)` and pass results back to the component
- [ ] On `@select(symbol)`: call `navigateTo(`/stock/${symbol}`)`
