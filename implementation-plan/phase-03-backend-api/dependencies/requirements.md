# Dependencies — Phase 03

## Phase Dependencies
- Requires Phase 02 to be complete
- Specifically needs: FastAPI server running, `services/` and `routers/` stubs in place, all packages installed

## External Services
- **yfinance / Yahoo Finance:** All OHLCV and search data is fetched from Yahoo Finance via the `yfinance` Python library. No API key required. Rate limiting is informal — for this use case (on-demand, single user) it is not a concern.

## Libraries & Packages

All packages already installed in Phase 02. No new additions.

| Package | Purpose in This Phase |
|---------|----------------------|
| yfinance | `yf.Ticker(symbol).history(period=...)` for OHLCV; `yf.Search(query)` for autocomplete |
| pandas | DataFrame for OHLCV data; rolling windows for indicators |
| numpy | Array operations for pivot detection (S/R) |
| fastapi | Route definitions and HTTP exceptions |

## Environment & Setup
- No new environment variables
- Verify with FastAPI interactive docs at `http://localhost:8000/docs`
