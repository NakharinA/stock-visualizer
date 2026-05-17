## Phase 2 — Stock Data API

### Depends On: Phase 1

### models/schemas.py  (replace # Phase 2 placeholder)
- Candle: time(int), open/high/low/close/volume(float)
- StockResponse: ticker, interval, period, candles: list[Candle]
- SearchResult: symbol, name, exchange
- SearchResponse: results: list[SearchResult]

### services/data_service.py
- VALID_INTERVALS = ["1m","5m","15m","30m","1h","1d","1wk","1mo"]
- VALID_PERIODS   = ["1d","5d","1mo","3mo","6mo","1y","2y","5y"]
- fetch_ohlcv(ticker, interval, period) → list[Candle]
  - validate interval/period → 400 if invalid
  - yf.Ticker(ticker).history(interval=interval, period=period)
  - empty df → 404
  - convert tz-aware index to unix int via ts.timestamp()
- search_tickers(query) → list[dict]
  - yf.Search(query, max_results=8).quotes
  - map to {symbol, name, exchange}

### routers/stock.py
- GET /{ticker}?interval=1d&period=6mo → StockResponse
- GET /search/query?q=<str> → SearchResponse
  NOTE: /search/query must be declared BEFORE /{ticker} to avoid route conflict

### main.py changes
- Uncomment: from routers import stock
- Uncomment: app.include_router(stock.router, prefix="/stock", tags=["stock"])

### Acceptance
GET /stock/AAPL?interval=1d&period=3mo → candles array
GET /stock/search/query?q=apple → results list
Invalid ticker → 404, invalid interval → 400