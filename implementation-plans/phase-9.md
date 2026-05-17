# Phase 9 — Frontend Rebuild + PostgreSQL Watchlist

**Date:** May 17, 2026

## Summary

Complete frontend rebuild from scratch using Nuxt 4 + PrimeVue (Nora theme) + ApexCharts, replacing the old phase 5–7 frontend. Added PostgreSQL database with SQLAlchemy ORM to the Python backend for persistent watchlist storage.

---

## Backend Changes

### Dependencies (`backend/pyproject.toml`)
- Added `sqlalchemy>=2.0.0`
- Added `psycopg2-binary>=2.9.0`
- Added `alembic>=1.13.0`

### New Files
| File | Purpose |
|------|---------|
| `backend/database.py` | SQLAlchemy engine, `SessionLocal`, `Base`, `get_db()` dependency, `init_db()` (auto-creates tables on startup) |
| `backend/models/watchlist.py` | `WatchlistItem` ORM model — columns: `ticker` (PK), `name`, `added_at` |
| `backend/routers/watchlist.py` | CRUD router: `GET /watchlist`, `POST /watchlist`, `DELETE /watchlist/{ticker}` |

### Modified Files
| File | Change |
|------|--------|
| `backend/main.py` | Registered `/watchlist` router; added `@app.on_event("startup")` to call `init_db()` |
| `backend/models/schemas.py` | Added `WatchlistAddRequest`, `WatchlistItemResponse`, `WatchlistResponse` Pydantic models |
| `backend/services/data_service.py` | Added `fetch_quote_info(ticker)` — returns live `price`, `change`, `change_pct` via `yfinance.Ticker.fast_info` |

### Watchlist API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/watchlist` | List all watchlist stocks with live price/change |
| `POST` | `/watchlist` | Add a stock `{ ticker, name? }` — returns 409 if already exists |
| `DELETE` | `/watchlist/{ticker}` | Remove a stock — returns 404 if not found |

---

## Docker Changes

### `docker-compose.yml` and `docker-compose.dev.yml`
- Added `postgres:16-alpine` service with `POSTGRES_USER/PASSWORD/DB` env vars and a named volume (`pgdata` / `pgdata_dev`)
- Added `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/stockdb` to the backend service
- Added `depends_on: postgres` to the backend service
- Updated frontend dev command from `yarn` to `npm`

---

## Frontend Rebuild

### Scaffold
- Old `frontend/` directory wiped entirely
- New app scaffolded via `npx nuxi@latest init frontend --package-manager npm` (minimal Nuxt 4 template)

### Packages Installed
```
primevue @primeuix/themes primeicons
apexcharts vue3-apexcharts
@primevue/auto-import-resolver unplugin-vue-components
pinia @pinia/nuxt
```

### Configuration (`frontend/nuxt.config.ts`)
- `modules: ['@pinia/nuxt']`
- `runtimeConfig.public.apiBase` — points to the Python backend
- `css` — loads PrimeIcons and global `main.css`
- `build.transpile: ['primevue']`
- `vite.plugins` — `unplugin-vue-components` with `PrimeVueResolver` for auto-import

### Plugins
| File | Purpose |
|------|---------|
| `app/plugins/primevue.ts` | Registers PrimeVue with **Nora** preset, `ToastService`, `ConfirmationService`, `v-tooltip` directive |
| `app/plugins/apexcharts.client.ts` | Registers `vue3-apexcharts` as `<ApexChart>` (client-only) |

### App Structure
```
frontend/app/
  app.vue                          Root — NuxtLayout + NuxtPage + Toast
  assets/css/main.css              Global styles (layout, topbar, chart wrappers)
  layouts/default.vue              Top navbar: StockViz logo + Dashboard + Stock List links
  types/index.ts                   Shared TypeScript interfaces (Candle, WatchlistItem, IndicatorSeries, etc.)
  composables/
    useWatchlist.ts                fetchWatchlist / addToWatchlist / removeFromWatchlist
    useStockData.ts                fetchOHLCV / searchTickers
    useIndicator.ts                compute(type, candles, params)
  pages/
    index.vue                      Dashboard — welcome text + quick-action cards
    stocks/index.vue               Stock List — paginated DataTable with add/remove
    stocks/[ticker].vue            Stock Detail — chart + indicators
  components/
    stock/AddStockDialog.vue       Dialog with AutoComplete ticker search (debounced)
    chart/CandlestickPane.vue      ApexCharts candlestick + EMA line overlays
    chart/IndicatorPane.vue        Generic sub-pane for RSI / StochRSI / MACD / Z-Score / Volume
```

---

## Pages

### Dashboard (`/`)
- Welcome message with two quick-action cards linking to Stock List

### Stock List (`/stocks`)
- PrimeVue `DataTable` with client-side pagination (default 15 rows)
- Columns: Ticker (link), Name, Price, Change, Change %, Added Date, Remove button
- "Add Stock" button opens `AddStockDialog` — AutoComplete with debounced backend search
- Toast notifications for add/remove success and errors

### Stock Detail (`/stocks/[ticker]`)
- Header: back link, ticker name, live price + change badge
- **Interval selector:** 1m, 5m, 15m, 30m, 1h, 1D, 1W, 1Mo
- **Period selector:** 1D, 5D, 1Mo, 3Mo, 6Mo, 1Y, 2Y, 5Y
- **EMA toggles:** 20, 50, 100, 200 (20 and 50 active by default) — overlaid on candlestick
- **Indicator toggles:** RSI, StochRSI, MACD, Z-Score, Volume (RSI + Volume active by default)
- All charts share `group: 'stockChart'` for synchronized zoom/pan

---

## Indicators Implemented

| Indicator | Backend Type | Chart Type | Notes |
|-----------|-------------|------------|-------|
| EMA 20/50/100/200 | `EMA` | Line overlay on candlestick | Individually toggleable |
| RSI | `RSI` | Line | Reference lines at 30/70 |
| Stochastic RSI | `STOCHRSI` | Two lines (K + D) | Reference lines at 20/80 |
| MACD | `MACD` | Line (MACD + Signal) + Bar (Histogram) | Mixed chart type |
| Z-Score | `ZSCORE` | Line | Reference lines at ±2σ |
| Volume | derived from candles | Bar | Green/red coloured bars |

> Trendline drawing and Fair Value Gap (FVG) tools are **not implemented** in this phase.

---

## Dockerfile (`frontend/Dockerfile`)
Multi-stage build: `node:20-alpine` builder → `npm run build` → copies `.output/` to a clean runtime image.
