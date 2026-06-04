# Context — Phase 06

## Lightweight Charts API

### Creating the Chart
```js
import { createChart } from 'lightweight-charts'

const chart = createChart(containerElement, {
  width: container.clientWidth,
  height: container.clientHeight,
  layout: {
    background: { color: '#0f1117' },
    textColor: '#d1d5db',
  },
  grid: {
    vertLines: { color: '#1f2937' },
    horzLines: { color: '#1f2937' },
  },
  crosshair: {
    mode: 1, // CrosshairMode.Normal
  },
  timeScale: {
    borderColor: '#374151',
    timeVisible: true,
  },
})
```

### Disabling Pan, Keeping Zoom
Lightweight Charts separates scroll and scale controls:
```js
chart.applyOptions({
  handleScroll: {
    mouseWheel: false,     // disable horizontal scroll via mouse wheel
    pressedMouseMove: false, // disable pan via click-drag
    horzTouchDrag: false,  // disable horizontal touch drag
    vertTouchDrag: false,
  },
  handleScale: {
    mouseWheel: true,      // enable zoom via mouse wheel
    pinchScale: true,      // enable pinch-to-zoom on touch
    axisDoubleClickReset: true,
  },
})
```

**Note:** Setting `handleScroll.mouseWheel: false` alone does not prevent zoom — it disables horizontal scrolling. Zoom is controlled by `handleScale`. This is the correct split to achieve "zoom only, no pan."

### Adding a Candlestick Series
```js
const candleSeries = chart.addCandlestickSeries({
  upColor: '#22c55e',
  downColor: '#ef4444',
  borderUpColor: '#22c55e',
  borderDownColor: '#ef4444',
  wickUpColor: '#22c55e',
  wickDownColor: '#ef4444',
})
candleSeries.setData(ohlcvData)
```

The `ohlcvData` format must be: `[{ time: "2024-01-01", open: 100, high: 105, low: 99, close: 103 }]`. The `volume` field is ignored by the candlestick series — it is only needed if adding a histogram series.

### Responsive Resizing
```js
const observer = new ResizeObserver(entries => {
  const { width, height } = entries[0].contentRect
  chart.resize(width, height)
})
observer.observe(containerElement)
// On component unmount:
observer.disconnect()
chart.remove()
```

### fitContent
After setting data, always call:
```js
chart.timeScale().fitContent()
```
This adjusts the visible range to show all data points.

---

## Vue 3 Integration Notes

- Use `onMounted` to create the chart (requires DOM to be ready)
- Use `onUnmounted` to call `chart.remove()` and disconnect the ResizeObserver
- Store the chart instance and series as `ref()` or in a plain variable in the composable scope (do NOT put a Lightweight Charts instance inside `reactive()` or `ref()` — it will break due to Vue's Proxy wrapping)
- Use a template ref (`const el = ref<HTMLDivElement>()`) to get the container element

---

## Symbol Search Debounce

Use `useDebounceFn` from VueUse, or implement manually:
```ts
let debounceTimer: ReturnType<typeof setTimeout>
function onSearchInput(query: string) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => emit('search', query), 300)
}
```

---

## Period → Tab Label Mapping

| Tab label | API period |
|-----------|------------|
| YTD | ytd |
| 1Y | 1y |
| 6M | 6mo |
| 3M | 3mo |
| 1M | 1mo |
| 1W | 1wk |

Default active tab on page load: `3M` (period `3mo`).
