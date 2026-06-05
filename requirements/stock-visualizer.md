# Stock Visualizer — Project Implementation Plan

## Summary

A TradingView-inspired stock visualizer built with Nuxt 3 (frontend) and FastAPI + uv (backend). No database or Redis — all data is fetched on-demand from yfinance. The app has three pages: a blank Dashboard, a Stock Chart page, and a Stock Overview table. The chart is candlestick-only with a locked horizontal axis (zoom only, no pan), overlaid indicators, and tabbed subpanels for oscillators.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Nuxt 3 + Nuxt UI Pro |
| Charts | Lightweight Charts (TradingView, MIT) |
| Backend | FastAPI + uv |
| Data Source | yfinance (on-demand, no cache) |
| State / Persistence | localStorage (watchlist only) |
| Database | None |
| Cache | None |

---

## Project Structure

### Backend
```
backend/
├── main.py
├── routers/
│   ├── stock.py          # GET /stock/{symbol}?period=...
│   └── overview.py       # GET /overview?symbols=...
├── services/
│   ├── yfinance.py       # Data fetching via yfinance
│   └── indicators.py     # All indicator calculations
└── pyproject.toml        # uv managed dependencies
```

### Frontend
```
frontend/
├── pages/
│   ├── index.vue                 # Dashboard (blank for now)
│   ├── stock/[symbol].vue        # Stock chart page
│   └── overview.vue              # Stock overview table
├── components/
│   ├── chart/
│   │   ├── CandleChart.vue       # Main Lightweight Charts canvas
│   │   ├── IndicatorPanel.vue    # Tabbed subpanel (MACD / RSI / StochRSI)
│   │   └── IndicatorToggle.vue   # Toggle sidebar/panel
│   └── overview/
│       └── StockTable.vue        # Overview table with add/remove
├── composables/
│   └── useStockApi.ts            # API calls to FastAPI
└── nuxt.config.ts
```

---

## Pages

### 1. Dashboard (`/`)
- Blank for now. Scaffold layout only.

### 2. Stock Chart (`/stock/[symbol]`)

**Layout:**
```
[Symbol Search Bar]
[Time Window Tabs: YTD | 1Y | 6M | 3M | 1M | 1W]

┌─────────────────────────────────────────┐
│                                         │
│         Candlestick Chart (~75-80vh)    │
│      (EMA / Fibo / S/R / FVG overlay)   │
│                                         │
└─────────────────────────────────────────┘
[ MACD | RSI | Stoch RSI ]   ← tab switcher
┌─────────────────────────────────────────┐
│   Active indicator subpanel (~20-22vh)  │
└─────────────────────────────────────────┘

[Indicator Toggle Panel]
□ EMA 20  □ EMA 50  □ EMA 100  □ EMA 200
□ MACD    □ RSI     □ Stoch RSI
□ Fibo    □ Support/Resistance  □ FVG
```

**Chart Behavior:**
- Candlestick only (no line/bar/area toggle)
- Horizontal scroll/pan is **disabled**
- Zoom in/out is **enabled**
- EMA lines overlay directly on the main chart
- Fibo levels, Support/Resistance, FVG drawn as overlay lines/boxes on the main chart
- If all subpanel indicators (MACD/RSI/StochRSI) are toggled off → subpanel collapses, main chart expands to full height

### 3. Stock Overview (`/overview`)

A table showing multiple stocks at once:

| Column | Description |
|---|---|
| Symbol | Ticker symbol |
| Current Price | Latest close price |
| Difference (Value) | Change from previous close |
| Difference (%) | Percentage change |

**Watchlist behavior:**
- Default predefined list of symbols (hardcoded)
- User can add new symbols manually
- User can remove any symbol
- Watchlist persisted in **localStorage**

---

## API Endpoints

### `GET /stock/{symbol}?period={period}`

**Period values:** `ytd`, `1y`, `6mo`, `3mo`, `1mo`, `1wk`

**Returns:**
```json
{
  "symbol": "AAPL",
  "period": "3mo",
  "ohlcv": [
    { "time": "2024-01-01", "open": 100, "high": 105, "low": 99, "close": 103, "volume": 1000000 }
  ],
  "indicators": {
    "ema20": [...],
    "ema50": [...],
    "ema100": [...],
    "ema200": [...],
    "macd": { "macd": [...], "signal": [...], "histogram": [...] },
    "rsi": [...],
    "stoch_rsi": { "k": [...], "d": [...] },
    "fibonacci": { "high": 150, "low": 100, "levels": { "0": 100, "0.236": 110.8, ... } },
    "support_resistance": [120.5, 135.0, 142.3],
    "fvg": [
      { "type": "bullish", "top": 105, "bottom": 102, "time": "2024-02-01" }
    ]
  }
}
```

### `GET /overview?symbols=AAPL,TSLA,NVDA`

**Returns:**
```json
[
  { "symbol": "AAPL", "price": 189.5, "diff_value": 2.3, "diff_pct": 1.23 },
  ...
]
```

---

## Indicator Calculation Logic

All calculations done **server-side** using pandas/numpy.

| Indicator | Logic |
|---|---|
| EMA 20/50/100/200 | Standard exponential moving average |
| MACD | 12/26 EMA diff + 9-period signal + histogram |
| RSI | 14-period Wilder RSI |
| Stochastic RSI | Stochastic of RSI(14), smoothed K=3, D=3 |
| Fibonacci | Auto from high/low of selected window → levels: 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0 |
| Support/Resistance | Local pivot point detection (min/max clustering over window) |
| Fair Value Gap (FVG) | 3-candle pattern: bullish = candle[i].low > candle[i-2].high; bearish = reverse |

---

## Implementation Steps

### Phase 1 — Backend
1. Init project with `uv init`, add dependencies: `fastapi`, `uvicorn`, `yfinance`, `pandas`, `numpy`
2. Build `services/yfinance.py` — fetch OHLCV by symbol + period
3. Build `services/indicators.py` — implement all indicators
4. Build `routers/stock.py` — wire up `/stock/{symbol}` endpoint
5. Build `routers/overview.py` — wire up `/overview` endpoint
6. Add CORS middleware for Nuxt dev server

### Phase 2 — Frontend Shell
7. Init Nuxt 3 project with Nuxt UI Pro
8. Set up layout with sidebar navigation (Dashboard, Stock, Overview)
9. Scaffold all three pages with empty content
10. Build `useStockApi.ts` composable for API calls

### Phase 3 — Stock Chart Page
11. Integrate Lightweight Charts, configure zoom-only (disable horizontal scroll)
12. Build `CandleChart.vue` — render OHLCV as candlesticks
13. Add time window tab switcher (YTD / 1Y / 6M / 3M / 1M / 1W)
14. Add symbol search bar with navigation
15. Add EMA overlay lines on main chart
16. Add `IndicatorToggle.vue` — checkboxes for all indicators
17. Build `IndicatorPanel.vue` — tabbed subpanel (MACD / RSI / StochRSI)
18. Add collapse behavior when all subpanel indicators are off
19. Add Fibonacci level lines overlay
20. Add Support/Resistance horizontal lines overlay
21. Add FVG box/rect overlays (bullish = green, bearish = red)

### Phase 4 — Stock Overview Page
22. Build `StockTable.vue` with Nuxt UI table component
23. Connect to `/overview` endpoint
24. Add symbol add/remove with localStorage persistence
25. Add default predefined watchlist

### Phase 5 — Polish
26. Dark theme consistency across all pages
27. Loading states and error handling
28. Responsive layout check

---

## Assumptions & Decisions

- yfinance is called fresh on every request (no caching). Acceptable for this use case.
- Watchlist is stored in localStorage — no user accounts or backend persistence.
- Lightweight Charts is chosen for the chart library due to its zoom/pan control APIs and MIT license.
- All indicator math is server-side to keep the frontend purely presentational.
- Nuxt UI Pro is chosen as the dashboard template for its built-in dark mode, table, tabs, and layout components.
- FVG boxes are rendered as semi-transparent rectangles on the main chart canvas.

---

## Open Questions

- Should the symbol search bar support fuzzy search / autocomplete, or exact match only?
- Should the Overview table auto-refresh at an interval, or only on page load?
- Should clicking a row in the Overview table navigate to the Stock Chart page for that symbol?
- Should there be a default symbol loaded when visiting `/stock` with no symbol?
