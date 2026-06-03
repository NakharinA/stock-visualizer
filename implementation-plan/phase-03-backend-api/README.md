# Phase 03 — Backend API & Data

## Goals
- Implement `services/yfinance_service.py` — fetch OHLCV data by symbol and period
- Implement `services/indicators.py` — all indicator calculations (EMA, MACD, RSI, StochRSI, Fibonacci, S/R, FVG)
- Wire `routers/stock.py` — `GET /stock/{symbol}`
- Wire `routers/overview.py` — `GET /overview`
- Wire `routers/search.py` — `GET /search` (symbol autocomplete via yfinance)

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] `GET /stock/AAPL?period=3mo` returns full OHLCV + all indicators JSON
- [ ] `GET /overview?symbols=AAPL,TSLA` returns price + diff data for each symbol
- [ ] `GET /search?q=APP` returns a list of matching symbol suggestions
- [ ] All indicator keys are present in the stock response (even if array is short due to warm-up period)
- [ ] Invalid symbol returns HTTP 404 with a meaningful error message
- [ ] All endpoints verified manually with curl or the FastAPI `/docs` UI

## Dependencies

What must be true before this phase starts:
- Phase 02 must be complete (FastAPI server running, project structure in place)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | No new packages; all were installed in Phase 02 |
| api-specification/endpoints.md | Full API route definitions for all three endpoints |
| api-specification/payloads.md | Request/response shapes |
| context.md | Indicator calculation logic — formulas and edge cases |
| tasks.md | Granular implementation checklist |
