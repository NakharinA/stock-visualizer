# Context — Phase 07

## Lightweight Charts: Adding EMA Lines

EMA lines are added as additional `LineSeries` on the same chart instance:
```js
const ema20Series = chart.addLineSeries({
  color: '#3b82f6', // blue
  lineWidth: 1,
  priceLineVisible: false,
  lastValueVisible: false,
})
ema20Series.setData(indicators.ema20) // [{ time: "2024-01-01", value: 190.5 }]
```

To hide/show an EMA line when toggled:
```js
// Hide: set empty data
ema20Series.setData([])
// Or: applyOptions to make it invisible (but series still exists)
ema20Series.applyOptions({ visible: false })
```

The cleanest approach for toggle behavior: use `applyOptions({ visible: bool })` rather than adding/removing series, because adding/removing series can cause chart flicker.

**EMA colors:**
- EMA 20: `#3b82f6` (blue)
- EMA 50: `#f97316` (orange)
- EMA 100: `#a855f7` (purple)
- EMA 200: `#ef4444` (red)

---

## Lightweight Charts: Horizontal Price Lines (Fibonacci + S/R)

Price lines are attached to an existing series (e.g. the candlestick series):
```js
const fibLine = candleSeries.createPriceLine({
  price: 142.5,
  color: '#f59e0b',
  lineWidth: 1,
  lineStyle: 2, // LineStyle.Dashed = 2
  axisLabelVisible: true,
  title: '0.618',
})
// To remove:
candleSeries.removePriceLine(fibLine)
```

For Fibonacci: create 7 price lines, one per level, using `lineStyle: 2` (dashed). Use a warm amber/gold color for all.
For Support/Resistance: create one price line per level using `lineStyle: 0` (solid). Use a neutral white/gray at 60% opacity.

Store the created price line objects in an array so you can call `removePriceLine()` on toggle-off.

---

## Lightweight Charts: FVG Rectangles

Lightweight Charts v4 does not have a built-in rectangle primitive. Use the **Series Markers** or **Background Bands** approach, or draw rectangles using the `ISeriesApi.createPriceLine` trick with a band.

The recommended approach for FVG boxes is the **primitive plugin** available in the Lightweight Charts examples repository. As an alternative, use a `AreaSeries` with custom configuration to simulate a colored band.

**Practical approach without plugins:**
- For each FVG, add two price lines (top and bottom of the gap) with matching colors
- This gives visible price boundaries without true rectangle fill

**If using the official plugin:**
- Install `lightweight-charts-plugin-primitives` or copy the rectangle primitive from the Lightweight Charts GitHub examples
- The plugin provides `RectanglePrimitive` which can be attached to any series

For this project, start with the two-price-line approach (simpler, no extra package). The context will note where a full rectangle implementation would be a future enhancement.

---

## State Management for Toggles

Use a composable `useIndicatorState()` that stores all toggle booleans:
```ts
const indicators = reactive({
  ema20: false, ema50: false, ema100: false, ema200: false,
  macd: false, rsi: false, stochRsi: false,
  fibonacci: false, supportResistance: false, fvg: false,
})
```

Provide this via `provide/inject` or pass it as props between the stock page, `IndicatorToggle`, and `CandleChart`. Since these components are all within the same route page, prop drilling is acceptable — avoid Vuex/Pinia for this single-page state.

When any toggle changes, `CandleChart` watches the relevant property and calls the appropriate series `applyOptions({ visible: bool })`.
