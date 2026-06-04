# Phase 04 — Backend API

## Goals
- Implement `services/yfinance.py` — OHLCV fetching for a symbol + period
- Implement `services/indicators.py` — all indicator calculations (EMA, MACD, RSI, StochRSI, Fibonacci, S/R, FVG)
- Implement `routers/stock.py` — `GET /stock/{symbol}?period=...`
- Implement `routers/overview.py` — `GET /overview?symbols=...`
- Implement `routers/search.py` — `GET /search?q=...` for autocomplete

## Deliverables & Acceptance Criteria
- [ ] `GET /stock/AAPL?period=3mo` returns valid JSON matching the StockResponse schema with populated OHLCV and all indicator arrays
- [ ] `GET /overview?symbols=AAPL,TSLA,NVDA` returns a list of OverviewItem with price and diff data
- [ ] `GET /search?q=apple` returns a list of SearchResult with symbol + name
- [ ] All EMA periods (20, 50, 100, 200) are present in the indicators payload
- [ ] MACD, RSI, and StochRSI arrays align in length with the OHLCV array (NaN-prefixed values are dropped, not returned)
- [ ] Fibonacci levels cover 0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0
- [ ] Support/Resistance returns a non-empty list for typical 3-month data
- [ ] FVG returns correctly typed `bullish`/`bearish` entries
- [ ] Invalid symbol (e.g. `XXXXINVALID`) returns a 404 with `{"error": "Symbol not found"}`
- [ ] All routers are registered in `main.py`

## Dependencies
- Phase 03 must be complete (Pydantic models defined in `backend/models/`)
- No external services required beyond internet access to Yahoo Finance

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — goals, deliverables, dependencies |
| api-specification/endpoints.md | Full route definitions |
| api-specification/payloads.md | Request/response JSON schemas |
| dependencies/requirements.md | Libraries and notes |
| tasks.md | Granular implementation checklist |
| context.md | Background on indicator math and yfinance API quirks |
