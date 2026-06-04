# Context — Phase 04

## yfinance API Notes

### Downloading OHLCV
Use `yf.download(symbol, period=period, auto_adjust=True)`. The `auto_adjust=True` flag adjusts OHLCV for splits and dividends — this is the right default for a chart tool.

The returned DataFrame has a `DatetimeIndex`. To serialize dates as "YYYY-MM-DD" strings, use `df.index.strftime('%Y-%m-%d')`.

Valid yfinance period strings (pass these directly): `ytd`, `1y`, `6mo`, `3mo`, `1mo`, `1wk`. These match the API's period enum exactly — no mapping needed.

If `yf.download()` returns an empty DataFrame, the symbol doesn't exist or Yahoo has no data for it. Treat this as a 404.

### Overview Data
`yf.Ticker(symbol).fast_info` is the fastest way to get current price without downloading full history. Key attributes: `last_price`, `previous_close`. These can be `None` for illiquid or delisted symbols — handle gracefully.

### Symbol Search (Autocomplete)
`yf.Search(query, max_results=8)` — call `.quotes` on the result. Each quote is a dict with keys like `symbol`, `longname`, `shortname`, `quoteType`. Use `longname` if available, fall back to `shortname`.

**Important:** `yf.Search` was added in yfinance 0.2.x. Pin `yfinance>=0.2.40` to ensure it's available.

---

## Indicator Calculation Notes

### Wilder's RSI (not standard EWM RSI)
Wilder's RSI uses a specific smoothing method. The correct pandas implementation:
```python
delta = df['Close'].diff()
gain = delta.clip(lower=0)
loss = -delta.clip(upper=0)
avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
rs = avg_gain / avg_loss
rsi = 100 - (100 / (1 + rs))
```
Do NOT use `rolling().mean()` — that gives standard RSI, not Wilder's.

### Stochastic RSI
Apply the stochastic formula to the RSI series (not to price):
```python
rsi_min = rsi.rolling(stoch_period).min()
rsi_max = rsi.rolling(stoch_period).max()
stoch = (rsi - rsi_min) / (rsi_max - rsi_min)
k = stoch.rolling(k_smooth).mean() * 100
d = k.rolling(d_smooth).mean()
```
Values range 0–100. Drop NaN rows before returning.

### EMA: Drop Short Series
EMA with period=200 needs at least ~200 bars of data to stabilize. If the selected period (e.g. `1wk`) doesn't have enough bars, the EMA array may be empty after dropping NaN. Return an empty array — the frontend will hide the line.

### Support/Resistance Clustering
After finding local minima/maxima with `argrelextrema`, cluster prices that are within 0.5% of each other:
- Sort the price levels
- Walk through them; if next level is within 0.5% of the current cluster mean, add it to the cluster
- Otherwise start a new cluster
- Return the mean of each cluster as one support/resistance level
Typical result: 3–8 levels for a 3-month window.

### FVG Pattern
The three-candle pattern uses **candle indices** relative to the OHLCV list:
- For each candle `i` where `i >= 2`:
  - **Bullish:** `low[i] > high[i-2]` → gap exists between `high[i-2]` (bottom) and `low[i]` (top)
  - **Bearish:** `high[i] < low[i-2]` → gap exists between `low[i-2]` (top) and `high[i]` (bottom)
- The `time` field should be the date of candle `i` (the closing candle of the pattern)
- Only report FVGs from the current period window — don't backfill from all-time data

### Date Serialization
All indicator series must return dates as `"YYYY-MM-DD"` strings. Lightweight Charts on the frontend expects this exact format. Do not return Unix timestamps or datetime objects.

---

## Error Handling Conventions

| Situation | HTTP Status | Response |
|-----------|------------|---------|
| Symbol not found (empty yfinance response) | 404 | `{"error": "Symbol not found"}` |
| Invalid period enum value | 422 | FastAPI auto-generated validation error |
| Missing required query param | 400 | `{"error": "Missing required parameter: q"}` |
| Unexpected exception | 500 | `{"error": "Internal server error"}` |
