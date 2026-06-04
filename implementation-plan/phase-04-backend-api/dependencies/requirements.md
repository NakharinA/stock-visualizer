# Dependencies — Phase 04

## Phase Dependencies
- Requires Phase 03 to be complete
- Specifically needs: `backend/models/stock.py` and `backend/models/overview.py` with all Pydantic schemas defined

## External Services
- **Yahoo Finance (via yfinance):** All OHLCV and symbol data comes from yfinance HTTP calls to Yahoo Finance. Requires internet access. No API key needed.

## Libraries & Packages
All packages were installed in Phase 01. No new dependencies needed.

| Package | Purpose in this phase |
|---------|----------------------|
| yfinance | `yf.download()` for OHLCV, `yf.Search()` for autocomplete, `yf.Ticker.fast_info` for overview |
| pandas | DataFrame operations: rolling windows, ewm(), dropna(), reset_index() |
| numpy | `np.argrelextrema()` for support/resistance pivot detection |

## Environment & Setup
- No new environment variables needed
- Backend must be running: `uv run uvicorn main:app --reload --port 8000`
- Test endpoints manually with curl or httpx before marking phase complete
