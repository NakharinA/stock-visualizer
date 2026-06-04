# Tasks — Phase 08

## components/chart/IndicatorPanel.vue

- [ ] Accept props:
  - `indicators: IndicatorsData` — the full indicators object
  - `indicatorState: IndicatorState` — reactive toggle state
  - `activeTab: 'macd' | 'rsi' | 'stochrsi'` — currently visible tab
- [ ] Emit `update:activeTab` when user clicks a tab
- [ ] Compute `subpanelVisible = computed(() => indicatorState.macd || indicatorState.rsi || indicatorState.stochRsi)`
- [ ] When `subpanelVisible` is false, render nothing (or `v-if="subpanelVisible"`)
- [ ] Render a tab bar with 3 tabs (MACD, RSI, Stoch RSI) — visible only when subpanelVisible
- [ ] Render the active tab's chart container (v-show for each chart container)
- [ ] When active tab's indicator is not enabled: show "Enable [indicator] to view this chart" text instead of chart

### MACD Chart
- [ ] Create a Lightweight Charts instance for the MACD subpanel container on mount
- [ ] Add a `LineSeries` for MACD line (blue)
- [ ] Add a `LineSeries` for Signal line (orange)
- [ ] Add a `HistogramSeries` for histogram bars
  - Positive histogram values: `#22c55e` (green)
  - Negative histogram values: `#ef4444` (red)
  - Use `colorField` approach: each bar has a `color` property set based on value sign
- [ ] Watch `indicators.macd` — re-set data on change
- [ ] Height: set chart height to `~140px` (approximately 20-22vh on typical screens) or make it fill the container

### RSI Chart
- [ ] Create a separate Lightweight Charts instance for the RSI container
- [ ] Add a `LineSeries` for RSI (purple, `#a855f7`)
- [ ] Add `createPriceLine` on the RSI series for 70 (red dashed) and 30 (green dashed) reference lines
- [ ] Watch `indicators.rsi` — re-set data on change

### Stoch RSI Chart
- [ ] Create a separate Lightweight Charts instance for the Stoch RSI container
- [ ] Add `LineSeries` for K line (blue) and D line (orange)
- [ ] Add `createPriceLine` for 80 (dashed) and 20 (dashed) reference lines
- [ ] Watch `indicators.stoch_rsi` — re-set K and D data on change

### Subpanel-Specific Chart Options
All subpanel charts share these options (apply via `chart.applyOptions()`):
```js
{
  layout: { background: { color: '#0f1117' }, textColor: '#d1d5db' },
  grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
  timeScale: { visible: false },  // hide time axis on subpanel (shared with main chart)
  handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false },
  handleScale: { mouseWheel: false, pinchScale: false },  // lock subpanel — no zoom
}
```

### Cleanup
- [ ] On `onUnmounted`, call `chart.remove()` for all 3 subpanel chart instances

## pages/stock/[[symbol]].vue

- [ ] Add `activeSubpanelTab` ref defaulting to `'macd'`
- [ ] Compute `subpanelVisible` from `indicatorState`
- [ ] When `subpanelVisible` becomes true and `activeSubpanelTab` is not an enabled indicator, auto-select the first enabled one
- [ ] Wrap the layout in a flex column:
  - Main chart: `flex-1` or fixed `75vh` when subpanel visible; `100%` when hidden
  - Subpanel: fixed height `~140px` or `20-22vh`, hidden when not needed
- [ ] Pass `indicators` and `indicatorState` and `activeTab` to `<IndicatorPanel>`
- [ ] Handle `update:activeTab` to update `activeSubpanelTab`

## Histogram Color per Bar

The `HistogramSeries` in Lightweight Charts accepts data with a `color` field per bar:
```js
histogramSeries.setData(
  indicators.macd.histogram.map(bar => ({
    time: bar.time,
    value: bar.value,
    color: bar.value >= 0 ? '#22c55e' : '#ef4444',
  }))
)
```
