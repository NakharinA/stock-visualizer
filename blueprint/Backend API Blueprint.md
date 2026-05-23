# Backend API Blueprint

## Goal
Build a Python REST API backend following three API specs: login, dashboard, and stock pages.
The backend must be production-structured, feature-based, and ready to connect to a frontend.

---

## Tech Stack

| Layer         | Choice                          |
|---------------|---------------------------------|
| Package mgr   | `uv`                            |
| Framework     | FastAPI (async)                 |
| ORM           | SQLAlchemy 2.x (async)          |
| Database      | PostgreSQL                      |
| Cache         | Redis (24-hour TTL)             |
| Auth          | PyJWT (HS256, 7-day token)      |
| Market data   | yfinance                        |
| Indicators    | pandas-ta                       |
| Server        | Uvicorn on port 8000            |

---

## Project Structure

```
project-root/
├── pyproject.toml
├── .env
├── alembic/
│   ├── env.py
│   └── versions/
├── scripts/
│   └── seed.py
└── app/
    ├── main.py
    ├── core/
    │   ├── config.py
    │   ├── database.py
    │   ├── redis.py
    │   ├── security.py
    │   └── deps.py
    ├── auth/
    │   ├── router.py
    │   ├── schemas.py
    │   └── service.py
    ├── portfolio/
    │   ├── router.py
    │   ├── schemas.py
    │   └── service.py
    ├── stocks/
    │   ├── router.py
    │   ├── schemas.py
    │   └── service.py
    └── watchlist/
        ├── router.py
        ├── schemas.py
        └── service.py
```

---

## Environment Variables (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_DAYS=7
```

---

## Database Schema

### `users`
| Column           | Type    | Notes                        |
|------------------|---------|------------------------------|
| id               | UUID PK |                              |
| name             | string  |                              |
| email            | string  | unique                       |
| hashed_password  | string  |                              |
| avatar           | string  | nullable                     |
| focused_sym      | string  | nullable, default `null`     |
| created_at       | datetime|                              |

### `positions`
| Column    | Type    | Notes              |
|-----------|---------|--------------------|
| id        | UUID PK |                    |
| user_id   | UUID FK | → users.id         |
| sym       | string  |                    |
| quantity  | numeric |                    |
| avg_cost  | numeric | cost per share     |

### `pnl_snapshots`
| Column  | Type    | Notes                              |
|---------|---------|------------------------------------|
| id      | UUID PK |                                    |
| user_id | UUID FK | → users.id                         |
| date    | date    |                                    |
| pnl     | numeric | dollar PnL for that day            |

Unique constraint: `(user_id, date)`

### `watchlist_items`
| Column  | Type    | Notes       |
|---------|---------|-------------|
| id      | UUID PK |             |
| user_id | UUID FK | → users.id  |
| sym     | string  |             |

Unique constraint: `(user_id, sym)`

---

## Setup Instructions

### 1. Init project with uv
```bash
uv init
uv add fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic \
        pyjwt passlib[bcrypt] redis[asyncio] yfinance pandas pandas-ta \
        python-dotenv pydantic-settings httpx
```

### 2. Alembic setup
```bash
uv run alembic init alembic
```
- Set `sqlalchemy.url` in `alembic.ini` to read from env
- In `alembic/env.py`, import all models and set `target_metadata`

### 3. Generate and apply migrations
```bash
uv run alembic revision --autogenerate -m "initial"
uv run alembic upgrade head
```

### 4. Seed data
```bash
uv run python scripts/seed.py
```

### 5. Run server
```bash
uv run uvicorn app.main:app --reload --port 8000
```

---

## Core Module Details (`app/core/`)

### `config.py`
- Use `pydantic-settings` `BaseSettings` to load all env vars
- Export a single `settings` singleton

### `database.py`
- Create async SQLAlchemy engine using `DATABASE_URL`
- Create `AsyncSessionLocal` factory
- Define `Base` declarative base
- Expose `get_db` async generator for dependency injection

### `redis.py`
- Create async Redis client using `REDIS_URL`
- Expose helper functions:
  - `cache_get(key) -> str | None`
  - `cache_set(key, value, ttl=86400)` — TTL default 24 hours (86400 seconds)
  - `cache_delete(key)`

### `security.py`
- `hash_password(plain) -> str` using passlib bcrypt
- `verify_password(plain, hashed) -> bool`
- `create_access_token(user_id) -> str` — encode JWT with `exp` = now + 7 days
- `decode_access_token(token) -> dict` — decode and validate JWT; raise `401` on failure

### `deps.py`
- `get_current_user` — FastAPI dependency:
  1. Extract Bearer token from `Authorization` header
  2. Call `decode_access_token`
  3. Check Redis blocklist (key: `blocklist:{token}`) — raise `401` if found
  4. Fetch user from DB by `user_id` from token payload
  5. Return user ORM object

---

## Feature Modules

---

### `auth/`

#### Endpoints
| Method | Path                 | Auth | Description                  |
|--------|----------------------|------|------------------------------|
| POST   | `/auth/login`        | No   | Email/password login         |
| POST   | `/auth/login/google` | No   | Returns 501                  |
| POST   | `/auth/logout`       | Yes  | Invalidates token            |

#### `schemas.py`
- `LoginRequest` — `email: str`, `password: str`
- `UserOut` — `id`, `name`, `email`, `avatar`
- `LoginResponse` — `user: UserOut`, `token: str`

#### `service.py`
- `login(email, password, db)`:
  1. Fetch user by email; raise `401` if not found
  2. `verify_password`; raise `401` if wrong
  3. `create_access_token(user.id)`
  4. Return `LoginResponse`
- `logout(token, db)`:
  1. Decode token to get `exp`
  2. Store `blocklist:{token}` in Redis with TTL = remaining seconds until `exp`

#### `router.py`
- `POST /auth/login` → call `login` service
- `POST /auth/login/google` → return `HTTPException(501)`
- `POST /auth/logout` → depends on `get_current_user`; call `logout` service

---

### `portfolio/`

#### Endpoints
| Method | Path               | Auth | Description          |
|--------|--------------------|------|----------------------|
| GET    | `/portfolio/pnl`   | Yes  | PnL history chart    |
| GET    | `/portfolio/stats` | Yes  | Summary stat cards   |

#### `schemas.py`
- `PnlPoint` — `date: str`, `pnl: float`
- `PnlResponse` — `data: list[PnlPoint]`, `totalPnl: float`, `totalPnlPct: float`
- `StatsResponse` — `focusedSym`, `focusedPrice`, `todayPnl`, `todayPnlPct`, `totalValue`, `totalCost`

#### `service.py`

**`get_pnl(user, period, db)`**
1. Parse period (`7d` → 7 days, `30d` → 30, `1y` → 365)
2. Query `pnl_snapshots` for `user_id` within date range, ordered by date
3. Compute `totalPnl` = sum of all pnl values
4. Compute `totalPnlPct` = `totalPnl / totalCost * 100` (totalCost from positions)
5. Return `PnlResponse`

**`get_stats(user, db)`**
1. Fetch all user positions from DB
2. Fetch current prices for each `sym` via yfinance (use Redis cache key: `price:{sym}`)
3. Compute `totalValue` = sum(qty × current_price), `totalCost` = sum(qty × avg_cost)
4. Get today's pnl_snapshot for `todayPnl` and `todayPnlPct`
5. If `user.focused_sym` set, fetch its price via yfinance
6. Return `StatsResponse`

---

### `stocks/`

#### Endpoints
| Method | Path                        | Auth | Description               |
|--------|-----------------------------|------|---------------------------|
| GET    | `/stocks/{sym}/candles`     | Yes  | OHLCV candlestick data    |
| GET    | `/stocks/search`            | Yes  | Search stocks by name/sym |
| GET    | `/stocks/{sym}/indicators`  | Yes  | Computed indicator data   |

#### `schemas.py`
- `Bar` — `time: int`, `open`, `high`, `low`, `close`, `volume`
- `CandlesResponse` — `sym`, `timeframe`, `bars: list[Bar]`
- `SearchResult` — `sym`, `name`, `exchange`, `sector`
- `SearchResponse` — `results: list[SearchResult]`
- `IndicatorsResponse` — `sym`, `timeframe`, `indicators: dict`

#### Timeframe → yfinance mapping
| Timeframe | yfinance `interval` | yfinance `period` |
|-----------|---------------------|-------------------|
| `1D`      | `1m`                | `1d`              |
| `1W`      | `5m`                | `5d`              |
| `1M`      | `30m`               | `1mo`             |
| `3M`      | `1h`                | `3mo`             |
| `1Y`      | `4h`                | `1y`              |

#### `service.py`

**`get_candles(sym, timeframe, limit, to, redis)`**
1. Build Redis cache key: `candles:{sym}:{timeframe}`
2. If cache hit → deserialize and return (apply `limit`/`to` filters after)
3. If cache miss → fetch via `yfinance.Ticker(sym).history(interval=..., period=...)`
4. Convert DataFrame rows to `Bar` list (convert datetime index to Unix timestamps)
5. Store serialized JSON in Redis with TTL 86400
6. Return filtered bars

**`search_stocks(query, limit)`**
1. Use `yfinance.Search(query).quotes` to get results
2. Map to `SearchResult` — extract `symbol`, `longname`, `exchange`, `sector`
3. Return top `limit` results

**`get_indicators(sym, timeframe, indicators, redis)`**
1. Fetch candle data (reuse `get_candles` to leverage cache)
2. Convert bars to pandas DataFrame
3. For each requested indicator, compute using pandas-ta:
   - `EMA20` → `df.ta.ema(length=20)`
   - `EMA50` → `df.ta.ema(length=50)`
   - `BB` → `df.ta.bbands()` → split into upper/middle/lower
   - `VOLUME` → raw volume column
   - `RSI` → `df.ta.rsi()`
   - `MACD` → `df.ta.macd()` → split into macd/signal/histogram
   - `STOCH` → `df.ta.stoch()`
   - `CCI` → `df.ta.cci()`
4. Convert each series to `[{ time, value }]` format (drop NaN rows)
5. Return `IndicatorsResponse`

---

### `watchlist/`

#### Endpoints
| Method | Path                  | Auth | Description             |
|--------|-----------------------|------|-------------------------|
| GET    | `/watchlist`          | Yes  | Fetch user's watchlist  |
| POST   | `/watchlist`          | Yes  | Add stock to watchlist  |
| DELETE | `/watchlist/{sym}`    | Yes  | Remove from watchlist   |

#### `schemas.py`
- `WatchlistItem` — `sym`, `name`, `price`, `change`, `changePct`
- `WatchlistResponse` — `items: list[WatchlistItem]`
- `AddWatchlistRequest` — `sym: str`

#### `service.py`

**`get_watchlist(user, db, redis)`**
1. Query all `watchlist_items` for `user_id`
2. For each sym, fetch current price from yfinance (Redis cache key: `price:{sym}`, TTL 86400)
3. Compute `change` and `changePct` from yfinance `previousClose` vs `currentPrice`
4. Return `WatchlistResponse`

**`add_to_watchlist(user, sym, db)`**
1. Check sym doesn't already exist for user → `409` if found
2. Validate sym exists via `yfinance.Ticker(sym).info` → `404` if not found
3. Insert `WatchlistItem` row
4. Fetch and return the new item with live price data

**`remove_from_watchlist(user, sym, db)`**
1. Query item by `user_id` + `sym` → `404` if not found
2. Delete row
3. Return `204`

---

## `app/main.py`

```python
from fastapi import FastAPI
from app.auth.router import router as auth_router
from app.portfolio.router import router as portfolio_router
from app.stocks.router import router as stocks_router
from app.watchlist.router import router as watchlist_router

app = FastAPI(title="Trading API")

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["portfolio"])
app.include_router(stocks_router, prefix="/stocks", tags=["stocks"])
app.include_router(watchlist_router, tags=["watchlist"])
```

---

## Seed Script (`scripts/seed.py`)

The seed script must:
1. Create one demo user: `demo@example.com` / `password123`
2. Insert 3–5 positions (e.g. AAPL, TSLA, NVDA) with qty and avg_cost
3. Insert watchlist items for the same syms
4. Set `focused_sym = "AAPL"` on the user
5. Insert 7 days of `pnl_snapshots` with realistic values (can be hardcoded)
6. Print confirmation when done

---

## Error Handling Convention

All routers must raise `HTTPException` with appropriate status codes.
No raw exceptions should escape to the client.

| Scenario                   | Status |
|----------------------------|--------|
| Missing/invalid JWT        | 401    |
| Wrong credentials          | 401    |
| Token blocklisted          | 401    |
| Resource not found         | 404    |
| Duplicate watchlist entry  | 409    |
| Google OAuth               | 501    |
| Unhandled exception        | 500    |

---

## Redis Key Convention

| Key pattern              | TTL      | Content                     |
|--------------------------|----------|-----------------------------|
| `candles:{sym}:{tf}`     | 86400s   | JSON array of Bar objects   |
| `price:{sym}`            | 86400s   | JSON with price/change data |
| `blocklist:{token}`      | remaining token lifetime | empty string |

---

## Assumptions & Decisions

- No refresh token — single 7-day access token only
- Google OAuth endpoint exists in router but always returns 501
- yfinance is the sole market data source — no real-time streaming
- PnL snapshots are stored; no nightly job needed (lazy-written by portfolio service on first request of the day if today's snapshot is missing)
- Positions are seeded manually; no buy/sell order endpoints in scope
- All monetary values are in USD
- pandas-ta NaN rows (start of indicator warmup period) are dropped before returning
