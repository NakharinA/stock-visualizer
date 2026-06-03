# UI Flows — Phase 05

## Stock Chart Page Layout

```
/stock/AAPL

┌─ Sidebar ──┬───────────────────────────────────────────────┐
│            │  [🔍 Search: AAPL ▾]   ← autocomplete input  │
│            │                                               │
│            │  [ YTD | 1Y | 6M | 3M* | 1M | 1W ]          │
│            │                                               │
│            │  ┌─────────────────────────────────────────┐  │
│            │  │                                         │  │
│            │  │         Candlestick Chart               │  │
│            │  │         (~75vh)                         │  │
│            │  │                                         │  │
│            │  └─────────────────────────────────────────┘  │
│            │                                               │
│            │  [Indicator subpanel — added in Phase 06]    │
│            │                                               │
│            │  ┌─ Indicator Toggles ────────────────────┐  │
│            │  │ ☑ EMA 20  ☑ EMA 50  □ EMA 100  □ EMA200│  │
│            │  │ □ MACD    □ RSI    □ Stoch RSI         │  │
│            │  │ □ Fibo    □ S/R    □ FVG               │  │
│            │  └───────────────────────────────────────┘  │
└────────────┴───────────────────────────────────────────────┘
```

## Empty State (no symbol)

```
/stock

┌─ Sidebar ──┬───────────────────────────────────────────────┐
│            │  [🔍 Search for a symbol...]                  │
│            │                                               │
│            │        Search for a symbol                    │
│            │      to view its chart.                       │
└────────────┴───────────────────────────────────────────────┘
```

## Symbol Search Autocomplete Flow

1. User focuses search input and begins typing (e.g. `APPL`)
2. After 300ms debounce, call `GET /search?q=APPL&limit=8`
3. Show dropdown list below input:
   ```
   AAPL  Apple Inc.         NMS
   AAPLS ...
   ```
4. User clicks a result → `navigateTo('/stock/' + symbol)` → dropdown closes
5. User presses Escape → dropdown closes
6. Clicking outside → dropdown closes

## Time Window Tabs

| Label | `period` param |
|-------|---------------|
| YTD   | `ytd`         |
| 1Y    | `1y`          |
| 6M    | `6mo`         |
| 3M    | `3mo`         |
| 1M    | `1mo`         |
| 1W    | `1wk`         |

Default tab: `3mo`. Active tab is highlighted. Switching a tab re-fetches stock data and re-renders the chart. The active tab is NOT persisted across page navigations.

## EMA Toggle Behavior

- Each EMA line is independently shown/hidden via its checkbox
- Hidden lines are removed from the chart (`.remove()` the series) to avoid performance overhead
- When re-enabled, the series is re-added and data is set from the already-fetched response (no new API call)
