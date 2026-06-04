# Test Plan — Phase 04.5: Backend API

## Backend — Unit Tests (`test_indicators.py`)

Use a synthetic 250-row DataFrame with realistic OHLC prices to test indicator math without hitting the network.

| Module / Function | Scenario | Input | Expected Output |
|-------------------|----------|-------|-----------------|
| `calc_ema` | Happy path, period 20 | 250-bar DataFrame | List of dicts with `time` + `value`; length = 250 - 19 (warmup rows dropped) |
| `calc_ema` | Insufficient data | 5-bar DataFrame, period 20 | Empty list (not an error) |
| `calc_ema` | Values are correct | Known close prices | First EMA(20) value matches manual calculation |
| `calc_macd` | Happy path | 250-bar DataFrame | Dict with `macd`, `signal`, `histogram` arrays of equal length |
| `calc_macd` | All values finite | 250-bar DataFrame | No `None` or NaN values in output |
| `calc_rsi` | Happy path | 250-bar DataFrame, period 14 | All values between 0 and 100 (inclusive) |
| `calc_rsi` | Overbought signal | 30 consecutive up-days | RSI value > 70 |
| `calc_stoch_rsi` | Happy path | 250-bar DataFrame | K and D arrays, all values 0–100 |
| `calc_stoch_rsi` | Array lengths match | 250-bar DataFrame | `len(k) == len(d)` |
| `calc_fibonacci` | Happy path | DataFrame with known high/low | Level "0" == low, level "1.0" == high, level "0.5" == midpoint |
| `calc_fibonacci` | All 7 levels present | Any DataFrame | Keys: "0", "0.236", "0.382", "0.5", "0.618", "0.786", "1.0" |
| `calc_support_resistance` | Returns a list | 100-bar DataFrame | Non-empty list of floats |
| `calc_support_resistance` | Levels within price range | 100-bar DataFrame | All returned levels between df['Low'].min() and df['High'].max() |
| `calc_fvg` | Bullish FVG detected | Synthetic 3-candle sequence with low[i] > high[i-2] | One entry with type="bullish" |
| `calc_fvg` | Bearish FVG detected | Synthetic 3-candle sequence with high[i] < low[i-2] | One entry with type="bearish" |
| `calc_fvg` | No FVG in flat market | Candles with overlapping wicks | Empty list |

---

## Backend — Integration Tests (`test_stock_endpoint.py`)

Uses FastAPI `TestClient` from `httpx`. Tests hit real yfinance (internet required).

| Endpoint | Scenario | Input | Expected Result |
|----------|----------|-------|-----------------|
| `GET /stock/AAPL` | Happy path, default period | `period=3mo` | 200, `symbol == "AAPL"`, `ohlcv` is non-empty list |
| `GET /stock/AAPL` | All indicator keys present | `period=3mo` | Response has `ema20`, `ema50`, `macd`, `rsi`, `stoch_rsi`, `fibonacci`, `support_resistance`, `fvg` |
| `GET /stock/AAPL` | 1-week period | `period=1wk` | 200, `ohlcv` has ~5 bars |
| `GET /stock/AAPL` | YTD period | `period=ytd` | 200, bars count ≈ trading days since Jan 1 |
| `GET /stock/XXXXINVALID` | Symbol not found | — | 404, body has `error` key |
| `GET /stock/AAPL` | Invalid period | `period=99d` | 422 |
| `GET /stock/AAPL` | OHLCV shape | `period=3mo` | Each OHLCV bar has `time`, `open`, `high`, `low`, `close`, `volume` |

---

## Backend — Integration Tests (`test_overview_endpoint.py`)

| Endpoint | Scenario | Input | Expected Result |
|----------|----------|-------|-----------------|
| `GET /overview` | Happy path | `symbols=AAPL,TSLA` | 200, list of 2 items |
| `GET /overview` | Correct schema | `symbols=AAPL` | Each item has `symbol`, `price`, `diff_value`, `diff_pct` |
| `GET /overview` | Price is positive | `symbols=AAPL` | `price > 0` |
| `GET /overview` | Diff signs consistent | `symbols=AAPL` | `diff_pct` sign matches `diff_value` sign |
| `GET /overview` | Missing symbols param | — | 400 or 422 |

---

## Backend — Integration Tests (`test_search_endpoint.py`)

| Endpoint | Scenario | Input | Expected Result |
|----------|----------|-------|-----------------|
| `GET /search` | Happy path | `q=apple` | 200, non-empty list |
| `GET /search` | AAPL in results | `q=apple` | At least one result has `symbol == "AAPL"` |
| `GET /search` | Result schema | `q=tesla` | Each item has `symbol` and `name` |
| `GET /search` | Limit respected | `q=microsoft&limit=3` | Response list length ≤ 3 |
| `GET /search` | Empty query | `q=` | 400 |
| `GET /search` | Missing q param | — | 400 |
