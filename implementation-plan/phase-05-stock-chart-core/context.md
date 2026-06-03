# Context — Phase 05: Lightweight Charts API

## Creating the Chart

```typescript
import { createChart, ColorType } from 'lightweight-charts'

const chart = createChart(containerEl, {
  layout: {
    background: { type: ColorType.Solid, color: '#0f172a' },
    textColor: '#94a3b8',
  },
  grid: {
    vertLines: { color: '#1e293b' },
    horzLines: { color: '#1e293b' },
  },
  width: containerEl.clientWidth,
  height: containerEl.clientHeight,
})
```

## Disabling Horizontal Scroll/Pan (Zoom-Only)

```typescript
chart.applyOptions({
  handleScroll: {
    mouseWheel: true,       // zoom with scroll wheel — keep enabled
    pressedMouseMove: false, // drag to pan — DISABLE
    horzTouchDrag: false,    // touch pan — DISABLE
    vertTouchDrag: false,
  },
  handleScale: {
    mouseWheel: true,       // zoom with scroll — keep enabled
    pinch: true,            // pinch zoom — keep enabled
    axisPressedMouseMove: false, // axis drag — DISABLE
  },
})
```

## Candlestick Series

```typescript
const candleSeries = chart.addCandlestickSeries({
  upColor:   '#22c55e',  // green
  downColor: '#ef4444',  // red
  borderUpColor:   '#22c55e',
  borderDownColor: '#ef4444',
  wickUpColor:   '#22c55e',
  wickDownColor: '#ef4444',
})

// Data format expected by Lightweight Charts
candleSeries.setData([
  { time: '2024-01-01', open: 100, high: 105, low: 99, close: 103 },
  ...
])
```

## EMA Line Series

```typescript
const ema20Series = chart.addLineSeries({
  color: '#3b82f6',  // blue
  lineWidth: 1,
  priceLineVisible: false,
  lastValueVisible: false,
})

// Data format: array of {time, value} — filter out nulls first
ema20Series.setData(
  indicators.ema20
    .map((v, i) => ({ time: ohlcv[i].time, value: v }))
    .filter(d => d.value !== null)
)
```

## Removing a Series (Toggle Off)

```typescript
chart.removeSeries(ema20Series)
ema20SeriesRef.value = null
```

Re-add when toggled back on. This is preferable to hiding via opacity.

## Resize Handling

```typescript
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    chart.resize(entry.contentRect.width, entry.contentRect.height)
  }
})
resizeObserver.observe(containerEl)

// Cleanup in onUnmounted
onUnmounted(() => {
  resizeObserver.disconnect()
  chart.remove()
})
```

## Time Values

Lightweight Charts accepts either Unix timestamps (seconds) or `YYYY-MM-DD` strings. The backend returns `YYYY-MM-DD` strings — use them directly. No conversion needed.

## Fitted Content

After loading data, call `chart.timeScale().fitContent()` to auto-fit the visible range.
