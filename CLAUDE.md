# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity and Purpose

Stock Visualizer is a personal stock tracking web app with a TradingView-inspired interface. It provides a dashboard for PnL tracking and a stock page for candlestick charting with technical indicators. Users manage a watchlist of symbols and track their paper portfolio positions. All market data is sourced from yfinance — there is no real-time streaming.

---

## Tech Stack and Tooling

**Backend**
| Layer | Choice |
|---|---|
| Package manager | `uv` |
| Framework | FastAPI (async) |
| ORM | SQLAlchemy 2.x (async) with asyncpg |
| Database | PostgreSQL 16 |
| Auth | PyJWT HS256, 7-day tokens |
| Market data | yfinance |
| Indicators | pandas-ta |
| Scheduler | APScheduler (AsyncIOScheduler) |
| Server | Uvicorn on port 8000 |

**Frontend**
| Layer | Choice |
|---|---|
| Framework | Nuxt 4 (SSR disabled — pure SPA) |
| UI library | Nuxt UI + Tailwind CSS |
| Stock chart | LightweightCharts (TradingView OSS) |
| Dashboard chart | ApexCharts via vue3-apexcharts |
| State | Pinia |
| Theme | Dark-first with light/dark toggle |

---

## Project Structure Overview

```
stock-visualizer/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, lifespan, router registration
│   │   ├── models.py        # All SQLAlchemy ORM models
│   │   ├── core/            # Shared: config, database, security, deps, blocklist
│   │   ├── auth/            # Login, logout endpoints
│   │   ├── portfolio/       # PnL history and portfolio stats
│   │   ├── stocks/          # Candles, indicators, symbol search
│   │   └── watchlist/       # Watchlist CRUD + hourly cache cron
│   ├── scripts/
│   │   └── seed.py          # Creates demo user and sample data
│   ├── pyproject.toml
│   └── .env                 # Not committed — copy from .env.example
├── frontend/
│   ├── app/
│   │   ├── pages/           # index, login, dashboard, stock
│   │   ├── components/      # layout/, stock/, dashboard/, auth/
│   │   ├── stores/          # Pinia: auth, watchlist, chart, indicator
│   │   ├── composables/     # useApiFetch, useStockApi, useAuthApi
│   │   ├── middleware/       # Auth route guards
│   │   └── assets/css/      # main.css
│   └── nuxt.config.ts
├── blueprint/               # Original design specs — read for intent
├── api_spec/                # Per-page API contracts
└── docker-compose.yml       # Production
└── docker-compose.dev.yml   # Dev with hot reload
```

Each backend feature module (`auth/`, `portfolio/`, `stocks/`, `watchlist/`) contains exactly three files: `router.py`, `service.py`, `schemas.py`.

---

## Commands Claude Should Know

**Backend** (run from `backend/`)
```bash
# Run dev server with hot reload
uv run uvicorn app.main:app --reload --port 8000

# Seed demo data (idempotent — skips if demo user exists)
uv run python scripts/seed.py

# Add a dependency
uv add <package>
```

**Frontend** (run from `frontend/`)
```bash
npm run dev       # Dev server on :3000
npm run build     # Production build
npm run generate  # Static generation
```

**Full stack via Docker**
```bash
docker compose up                              # Production
docker compose -f docker-compose.dev.yml up   # Dev with hot reload + volume mounts
```

---

## Code Conventions and Style Preferences

**Backend**
- All feature logic lives in `service.py`; routers only call service functions and handle HTTP concerns.
- Use FastAPI `Depends()` for `get_db` and `get_current_user` — never instantiate sessions or decode tokens directly in routers.
- Schemas use camelCase field names where the frontend expects it (e.g. `totalPnl`, `changePct`, `focusedSym`).
- All monetary values are USD; round to 2 decimal places for display values, 4–6 for prices/calculations.
- Drop NaN rows before returning indicator series — never send null values in time-series arrays.
- Raise `HTTPException` with explicit status codes; never let raw exceptions reach the client (global handler in `main.py` catches stragglers as 500).

**Frontend**
- All API calls go through `useApiFetch` composable — never call `$fetch` directly in components.
- Typed wrappers for each domain live in `useStockApi.ts` / `useAuthApi.ts`.
- Components are globally registered without path prefix (configured in `nuxt.config.ts`).
- Auth token and user object are persisted in cookies (`stockviz-token`, `stockviz-user`) — not localStorage.
- Dark palette: background `#0d1117`, surface `#161b22`, border `#30363d`, text `#e6edf3`, muted `#8b949e`, accent blue `#58a6ff`, green `#3fb950`, red `#f85149`.

---

## Architecture Decisions and Constraints

**No Redis in production** — the original blueprint called for Redis caching and a Redis-backed token blocklist. The implementation replaced both with in-memory alternatives:
- Token blocklist: `core/blocklist.py` — in-process dict, pruned on write. Tokens survive only within a single process.
- Price/candle caching: replaced by the `watchlist_cache` DB table, refreshed hourly by APScheduler.

**No Alembic migrations** — tables are created at startup via `Base.metadata.create_all`. To add a column, add it to the model and recreate the DB (dev only). The `.env.example` still lists `REDIS_URL` as a leftover from the original blueprint — it is not read by the app.

**No refresh tokens** — single 7-day JWT access token. On logout, the token is added to the in-memory blocklist for its remaining TTL.

**Watchlist cache flow** — `WatchlistCache` is a DB table that stores pre-fetched price data for all symbols in any user's watchlist. It is upserted by `watchlist/cron.py` every hour via APScheduler (started in `main.py` lifespan). GET `/watchlist` reads from this cache table, not live yfinance.

**PnL snapshots are lazy-written** — `portfolio/service.py` writes today's `PnlSnapshot` on the first call to `GET /portfolio/stats` if no snapshot exists for today. No nightly job.

**focused_sym** — stored on the `User` model. The stock page defaults to displaying this symbol. When the user switches symbols on the stock page, the frontend updates the focused symbol in the watchlist store.

**Timeframe → yfinance mapping** (actual implementation, differs slightly from blueprint):
| Timeframe | interval | period |
|---|---|---|
| 1D | 1h | 5d |
| 1W | 1h | 1mo |
| 1M | 1h | 3mo |
| 3M | 1h | 6mo |
| 6M | 1d | 6mo |
| 1Y | 1d | 1y |
| 2Y | 1d | 2y |

**Google OAuth** — the `/auth/login/google` endpoint exists in the router but always returns 501. UI button is present on the login page.

---

## Domain-Specific Terminology

| Term | Meaning |
|---|---|
| `sym` | Ticker symbol (e.g. `AAPL`, `TSLA`) — always stored and returned uppercase |
| `focused_sym` | The single symbol a user has pinned as their "focus" stock, shown in dashboard stat cards |
| `Position` | A paper portfolio holding — a symbol with quantity and average cost basis |
| `PnlSnapshot` | A daily record of dollar PnL for a user; one row per user per date |
| `WatchlistItem` | A user's saved symbol (many per user, unique per user+sym) |
| `WatchlistCache` | Shared DB table caching current price data per sym (not per user) |
| `Bar` | A single OHLCV candlestick; `time` is a Unix timestamp (seconds) |
| `timeframe` | Chart resolution string: `1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `2Y` |
| Overlay indicator | Rendered on the main candlestick chart (EMA20, EMA50, BB, Volume) |
| Pane indicator | Rendered in a separate tabbed panel below the chart (RSI, MACD, STOCH, CCI) |
| `avg_cost` | Average cost per share for a position (not total cost) |
| `changePct` | Price change as a percentage vs previous close |

---

## Environment and Secrets Rules

Backend requires `backend/.env` — copy from `backend/.env.example`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000
```

`REDIS_URL` in `.env.example` is a leftover — the app does not read it.

Frontend reads `NUXT_PUBLIC_API_BASE` at runtime (defaults to `http://localhost:8000` in `nuxt.config.ts`). In Docker prod it is set to `http://backend:8000` via `docker-compose.yml`.

Docker dev credentials: PostgreSQL `postgres/postgres`, DB `stockdb`. Demo login seeded by `seed.py`: `demo@example.com` / `password123`.

`JWT_SECRET` must be changed before any production deployment.
