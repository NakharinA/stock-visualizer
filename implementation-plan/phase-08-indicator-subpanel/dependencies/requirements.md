# Dependencies — Phase 08

## Phase Dependencies
- Requires Phase 07 to be complete:
  - `IndicatorToggle.vue` exists with all subpanel checkboxes (MACD, RSI, Stoch RSI)
  - `useIndicatorState()` composable exists
- Requires Phase 06 to be complete:
  - `CandleChart.vue` uses ResizeObserver and responds to container height changes
  - The stock page layout is established
- Requires Phase 04 to be complete:
  - `GET /stock/{symbol}` response includes `macd`, `rsi`, and `stoch_rsi` indicator data

## External Services
- None

## Libraries & Packages
No new packages required.

| Package | Already installed | Purpose in this phase |
|---------|------------------|----------------------|
| lightweight-charts | Yes (Phase 06) | `addHistogramSeries()`, `addLineSeries()`, `createPriceLine()` for subpanel charts |

## Layout Notes
- Use CSS flexbox on the page-level container: `flex-col`
- Main chart div: `flex-1 min-h-0` (grows to fill remaining space)
- Subpanel div: `h-[140px]` fixed, hidden via `v-if`
- When subpanel hidden, the flex-1 main chart div naturally expands
- This avoids hardcoded vh units and works correctly when the browser window is resized
