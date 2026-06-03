# Tasks — Phase 03

## services/yfinance_service.py

- [ ] Implement `fetch_ohlcv(symbol: str, period: str) -> pd.DataFrame`
  - Call `yf.Ticker(symbol).history(period=period)`
  - Raise `ValueError` if the result is empty (invalid symbol or no data)
  - Return DataFrame with columns: Open, High, Low, Close, Volume; index = DatetimeIndex
- [ ] Implement `fetch_current_price(symbol: str) -> dict`
  - Fetch last 5 days of data; return latest and second-latest close for diff calculation
- [ ] Implement `search_symbols(query: str, limit: int) -> list[dict]`
  - Use `yf.Search(query).quotes`
  - Map results to `{symbol, name, exchange}`; filter out results missing `symbol`; truncate to `limit`

## services/indicators.py

- [ ] Implement `calculate_ema(series, span) -> list`
- [ ] Implement `calculate_macd(series) -> dict` with keys `macd`, `signal`, `histogram`
- [ ] Implement `calculate_rsi(series, period=14) -> list`
- [ ] Implement `calculate_stoch_rsi(series, rsi_period=14, k=3, d=3) -> dict` with keys `k`, `d`
- [ ] Implement `calculate_fibonacci(df) -> dict` with keys `high`, `low`, `levels`
- [ ] Implement `calculate_support_resistance(df, window=2, cluster_pct=0.005) -> list`
- [ ] Implement `calculate_fvg(df) -> list` of `{type, top, bottom, time}`
- [ ] Implement `calculate_all(df) -> dict` — calls all of the above and assembles the `indicators` response dict

## routers/stock.py

- [ ] Define `GET /stock/{symbol}` with query param `period` (default `3mo`)
- [ ] Validate period is one of `ytd|1y|6mo|3mo|1mo|1wk`; return 422 for invalid values
- [ ] Call `fetch_ohlcv`; catch `ValueError` and return HTTP 404
- [ ] Call `calculate_all(df)`
- [ ] Serialize OHLCV rows as `{time: YYYY-MM-DD, open, high, low, close, volume}`
- [ ] Register router in `main.py`

## routers/overview.py

- [ ] Define `GET /overview` with query param `symbols` (comma-separated string)
- [ ] Parse `symbols` into a list; reject empty list with 422
- [ ] Fetch each symbol concurrently using `asyncio.gather` with `run_in_executor`
- [ ] Silently skip symbols that raise `ValueError`
- [ ] Return list of `{symbol, price, diff_value, diff_pct}` rounded to 2 decimal places
- [ ] Register router in `main.py`

## routers/search.py

- [ ] Define `GET /search` with query params `q` (required) and `limit` (default 8)
- [ ] Call `search_symbols(q, limit)`
- [ ] Return results directly
- [ ] Register router in `main.py`

## Verification

- [ ] `curl "http://localhost:8000/stock/AAPL?period=3mo"` — verify all indicator keys present
- [ ] `curl "http://localhost:8000/stock/INVALID"` — verify 404 response
- [ ] `curl "http://localhost:8000/overview?symbols=AAPL,TSLA"` — verify two items returned
- [ ] `curl "http://localhost:8000/search?q=APPL"` — verify suggestions returned
- [ ] Open `http://localhost:8000/docs` and test all endpoints via the Swagger UI
