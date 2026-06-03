# Context — Phase 07: Drawing Overlays in Lightweight Charts

## Fibonacci & Support/Resistance: Price Lines

The simplest way to draw horizontal lines at fixed price levels is via `createPriceLine` on any existing series. Attach them to the candlestick series to keep them tied to the same price scale.

```typescript
import { LineStyle } from 'lightweight-charts'

// Add a Fibonacci level line
const fiboLine = candleSeries.createPriceLine({
  price: 142.5,
  color: '#f59e0b',       // amber
  lineWidth: 1,
  lineStyle: LineStyle.Dashed,
  axisLabelVisible: true,
  title: '0.618',
})

// Remove it later
candleSeries.removePriceLine(fiboLine)
```

Store all created price line references in a `ref([])` array so they can be removed as a group when toggled off.

### Fibonacci Colors

Use distinct colors per level for readability:

| Level | Color |
|-------|-------|
| 0     | `#64748b` (slate) |
| 0.236 | `#22c55e` (green) |
| 0.382 | `#3b82f6` (blue) |
| 0.5   | `#a855f7` (purple) |
| 0.618 | `#f59e0b` (amber — the "golden ratio" level) |
| 0.786 | `#ef4444` (red) |
| 1.0   | `#64748b` (slate) |

### Support/Resistance Lines

Same approach as Fibonacci but with a uniform dashed style:

```typescript
const srLine = candleSeries.createPriceLine({
  price: level,
  color: '#94a3b8',
  lineWidth: 1,
  lineStyle: LineStyle.Dotted,
  axisLabelVisible: false,
})
```

---

## FVG Rectangles

FVG boxes are tricky because Lightweight Charts v4 doesn't have a native rectangle primitive. Two options:

### Option A: Area Series Workaround (Simpler)

Create one `AreaSeries` per FVG with two data points at the start and end time of the visible range, setting `topValue` and `bottomValue` to create a filled band.

```typescript
const fvgSeries = chart.addAreaSeries({
  topColor:    fvg.type === 'bullish' ? 'rgba(34,197,94,0.2)'  : 'rgba(239,68,68,0.2)',
  bottomColor: fvg.type === 'bullish' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
  lineColor:   'transparent',
  lineWidth:   0,
  priceLineVisible: false,
  lastValueVisible: false,
})
// Set two points: at FVG time and at the last OHLCV date
// Both with value = fvg.top for top; use a second series for bottom
```

This is imperfect — AreaSeries draws from a value down to `0`, not between two arbitrary values. A cleaner approximation: use two `LineSeries` as the bounds and shade between them using a custom `ISeriesPrimitive`.

### Option B: Custom Primitive (More Correct)

Implement `ISeriesPrimitive` with a `paneViews()` method that returns a renderer drawing a canvas rect. This is the proper approach for v4 but requires ~50 lines of boilerplate. Reference: TradingView's Lightweight Charts plugin examples at `https://github.com/tradingview/lightweight-charts/tree/master/plugin-examples`.

**Recommendation:** Start with Option A. If the visual result is acceptable, ship it. If not, implement Option B in a follow-up.

---

## Toggle Cleanup Pattern

When an overlay is toggled off, remove ALL associated price lines or series from the chart:

```typescript
function clearFiboLines() {
  fiboLineRefs.value.forEach(line => candleSeries.removePriceLine(line))
  fiboLineRefs.value = []
}

function clearFvgSeries() {
  fvgSeriesRefs.value.forEach(s => chart.removeSeries(s))
  fvgSeriesRefs.value = []
}
```

When toggled back on, re-draw from the already-fetched `indicators` data.
