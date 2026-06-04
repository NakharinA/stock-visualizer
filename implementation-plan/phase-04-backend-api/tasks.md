# Tasks — Phase 04

## services/yfinance.py

- [ ] Implement `fetch_ohlcv(symbol: str, period: str) -> pd.DataFrame`
  - Use `yf.download(symbol, period=period, auto_adjust=True)` 
  - Return DataFrame with columns: Open, High, Low, Close, Volume
  - Raise `ValueError` if DataFrame is empty (symbol not found)
  - Reset index so Date becomes a column

- [ ] Implement `fetch_overview(symbols: list[str]) -> list[dict]`
  - For each symbol, use `yf.Ticker(symbol).fast_info` to get `last_price` and `previous_close`
  - Compute `diff_value = last_price - previous_close`
  - Compute `diff_pct = (diff_value / previous_close) * 100`
  - Skip symbols where data is unavailable (log a warning, don't raise)

- [ ] Implement `search_symbols(query: str, limit: int = 8) -> list[dict]`
  - Use `yf.Search(query, max_results=limit)` 
  - Access `.quotes` on the result — each quote has `symbol` and `longname` (or `shortname` as fallback)
  - Return list of `{"symbol": ..., "name": ...}` dicts

## services/indicators.py

- [ ] `calc_ema(df: pd.DataFrame, period: int) -> list[dict]`
  - `df['Close'].ewm(span=period, adjust=False).mean()`
  - Drop NaN rows, return `[{"time": "YYYY-MM-DD", "value": float}]`

- [ ] `calc_macd(df: pd.DataFrame) -> dict`
  - EMA(12) and EMA(26) of Close
  - MACD line = ema12 - ema26
  - Signal line = EMA(9) of MACD line
  - Histogram = MACD - signal
  - Drop rows where any of the three series is NaN
  - Return `{"macd": [...], "signal": [...], "histogram": [...]}`

- [ ] `calc_rsi(df: pd.DataFrame, period: int = 14) -> list[dict]`
  - Wilder's RSI: use `ewm(com=period-1, adjust=False)` for smoothing (not simple rolling mean)
  - Return after dropping NaN rows

- [ ] `calc_stoch_rsi(df: pd.DataFrame, rsi_period: int = 14, stoch_period: int = 14, k_smooth: int = 3, d_smooth: int = 3) -> dict`
  - Compute RSI first
  - Apply stochastic formula: `(RSI - RSI_min) / (RSI_max - RSI_min)` over `stoch_period` rolling window
  - Smooth K = rolling(k_smooth).mean() of stochastic
  - Smooth D = rolling(d_smooth).mean() of K
  - Return `{"k": [...], "d": [...]}`

- [ ] `calc_fibonacci(df: pd.DataFrame) -> dict`
  - `high = df['Close'].max()`, `low = df['Close'].min()`
  - Compute levels: `level_price = low + (high - low) * ratio` for each ratio in [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0]
  - Return `{"high": high, "low": low, "levels": {"0": ..., "0.236": ..., ...}}`

- [ ] `calc_support_resistance(df: pd.DataFrame, order: int = 5) -> list[float]`
  - Use `scipy.signal.argrelextrema` or a manual rolling window approach to find local highs and lows
  - If scipy not available, use numpy: `np.argrelextrema(prices, np.greater, order=order)` for highs, `np.less` for lows
  - Cluster nearby levels (within 0.5% of each other) and take the mean
  - Return sorted list of price levels

- [ ] `calc_fvg(df: pd.DataFrame) -> list[dict]`
  - Iterate through candles from index 2 onward
  - Bullish FVG: `candle[i].low > candle[i-2].high` → gap between i-2's high and i's low
  - Bearish FVG: `candle[i].high < candle[i-2].low` → gap between i-2's low and i's high
  - Return list of `{"type": "bullish"|"bearish", "top": float, "bottom": float, "time": "YYYY-MM-DD"}`
  - `time` is the date of candle `i` (the third candle in the pattern)

## routers/stock.py

- [ ] Define `router = APIRouter(prefix="/stock", tags=["stock"])`
- [ ] `GET /{symbol}` endpoint:
  - Validate `period` is one of `["ytd", "1y", "6mo", "3mo", "1mo", "1wk"]` (use Enum or Literal)
  - Call `fetch_ohlcv()` — catch `ValueError`, return 404
  - Call all `calc_*` functions from indicators.py
  - Serialize OHLCV as `[{"time": ..., "open": ..., ...}]`
  - Return full StockResponse

## routers/overview.py

- [ ] Define `router = APIRouter(prefix="/overview", tags=["overview"])`
- [ ] `GET /` endpoint:
  - Parse `symbols` query param as comma-separated string → list
  - Call `fetch_overview()`
  - Return list of OverviewItem

## routers/search.py

- [ ] Define `router = APIRouter(prefix="/search", tags=["search"])`
- [ ] `GET /` endpoint:
  - Require `q` param (400 if missing or empty)
  - Call `search_symbols(q, limit=limit)`
  - Return list of SearchResult

## main.py

- [ ] Register all three routers: stock, overview, search
- [ ] Add `scipy` to dependencies if using `argrelextrema` (or implement without it using numpy only)
