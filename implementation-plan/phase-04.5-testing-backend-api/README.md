# Phase 04.5 — Testing: Backend API

## Goals
- Write unit tests for every indicator calculation function in `services/indicators.py`
- Write integration tests for all three API endpoints using `httpx` + `pytest`
- Verify correct behavior for happy paths, edge cases, and error conditions

## Deliverables & Acceptance Criteria
- [ ] `backend/tests/test_indicators.py` — unit tests for: `calc_ema`, `calc_macd`, `calc_rsi`, `calc_stoch_rsi`, `calc_fibonacci`, `calc_support_resistance`, `calc_fvg`
- [ ] `backend/tests/test_stock_endpoint.py` — integration tests for `GET /stock/{symbol}`
- [ ] `backend/tests/test_overview_endpoint.py` — integration tests for `GET /overview`
- [ ] `backend/tests/test_search_endpoint.py` — integration tests for `GET /search`
- [ ] All tests pass with `pytest backend/tests/`
- [ ] EMA calculation test verifies: correct length, correct first non-NaN value, empty array returned for insufficient data
- [ ] RSI test verifies: values are bounded 0–100
- [ ] StochRSI test verifies: K and D values bounded 0–100
- [ ] FVG test verifies: correct pattern detection for known bullish and bearish sequences
- [ ] Stock endpoint test: valid symbol + period returns 200 with expected schema shape
- [ ] Stock endpoint test: invalid symbol returns 404
- [ ] Stock endpoint test: invalid period returns 422
- [ ] Overview endpoint test: returns correct `diff_value` and `diff_pct` signs for up/down days
- [ ] Search endpoint test: missing `q` returns 400

## Dependencies
- Phase 04 must be fully complete (all endpoints and services implemented)
- Test environment: `pytest` and `httpx` installed

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — testing goals and acceptance criteria |
| test-plan.md | Detailed test cases and coverage map |
| dependencies/requirements.md | Test tooling requirements |
