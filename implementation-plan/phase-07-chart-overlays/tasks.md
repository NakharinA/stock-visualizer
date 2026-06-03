# Tasks — Phase 07

## components/chart/CandleChart.vue — Overlay Logic

### Fibonacci

- [ ] Accept `showFibo: boolean` prop; watch it
- [ ] When `showFibo` turns true: iterate `indicators.fibonacci.levels`, call `candleSeries.createPriceLine()` for each; store refs in `fiboLineRefs`
- [ ] When `showFibo` turns false: call `clearFiboLines()` to remove all stored price lines
- [ ] When `ohlcv` data changes (period switch): if `showFibo`, clear and re-draw

### Support / Resistance

- [ ] Accept `showSR: boolean` prop; watch it
- [ ] When `showSR` turns true: iterate `indicators.support_resistance`, create a dotted price line per level; store refs in `srLineRefs`
- [ ] When `showSR` turns false: remove all stored S/R price lines
- [ ] When data changes: if `showSR`, clear and re-draw

### FVG

- [ ] Accept `showFVG: boolean` prop; watch it
- [ ] When `showFVG` turns true: iterate `indicators.fvg`, create one series per FVG box (see context.md Option A); store refs in `fvgSeriesRefs`
- [ ] When `showFVG` turns false: call `clearFvgSeries()` to remove all stored series
- [ ] When data changes: if `showFVG`, clear and re-draw
- [ ] Bullish FVG = green fill; bearish FVG = red fill

## pages/stock/[symbol].vue

- [ ] Pass `showFibo`, `showSR`, `showFVG` props to `<CandleChart>` derived from toggle state
- [ ] Ensure `IndicatorToggle.vue` Fibo/S/R/FVG checkboxes are now active (not greyed out)

## Verification

- [ ] Enable Fibonacci → 7 horizontal lines appear with level labels
- [ ] Disable Fibonacci → all lines removed cleanly
- [ ] Enable S/R → dotted lines at detected price levels
- [ ] Enable FVG → colored semi-transparent boxes appear where gaps exist
- [ ] Switch time period with all overlays enabled → overlays re-draw correctly for new data
- [ ] Toggle all overlays off → chart is clean
