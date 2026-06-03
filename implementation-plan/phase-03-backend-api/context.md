# Context — Phase 03: Indicator Calculation Logic

## Data Shape Entering `indicators.py`

All indicators receive a pandas DataFrame with columns: `Open`, `High`, `Low`, `Close`, `Volume`. Index is a DatetimeIndex. The DataFrame is already trimmed to the requested period.

Every indicator must return arrays of the **same length** as the DataFrame. Use `None` (or `float('nan')`) for bars that fall within the warm-up period. The router serializes these as `null` in JSON.

---

## EMA (20 / 50 / 100 / 200)

Standard exponential moving average using pandas `ewm`:

```python
df['Close'].ewm(span=period, adjust=False).mean()
```

Set the first `period - 1` values to `None` to signal warm-up (optional — pandas fills from bar 1, but the first values are noisy).

---

## MACD (12/26/9)

```
ema_fast   = EMA(close, 12)
ema_slow   = EMA(close, 26)
macd_line  = ema_fast - ema_slow
signal     = EMA(macd_line, 9)
histogram  = macd_line - signal
```

First valid bar: index 33 (26 for MACD + 9 for signal - 2 overlap). Set earlier bars to `None`.

---

## RSI (14-period Wilder)

```
delta = close.diff()
gain  = delta.clip(lower=0)
loss  = (-delta).clip(lower=0)

avg_gain = gain.ewm(alpha=1/14, adjust=False).mean()
avg_loss = loss.ewm(alpha=1/14, adjust=False).mean()

rs  = avg_gain / avg_loss
rsi = 100 - (100 / (1 + rs))
```

First 14 bars set to `None`.

---

## Stochastic RSI (K=3, D=3)

1. Compute RSI(14) as above
2. Stochastic of RSI over a 14-bar rolling window:
   ```
   min_rsi = rsi.rolling(14).min()
   max_rsi = rsi.rolling(14).max()
   raw_k   = (rsi - min_rsi) / (max_rsi - min_rsi) * 100
   ```
3. Smooth: `k = raw_k.rolling(3).mean()`
4. Signal: `d = k.rolling(3).mean()`

Handle division by zero (max == min) by setting to 50 or `None`.

---

## Fibonacci Retracement

Computed from the entire price window (not a rolling calculation):

```python
high = df['High'].max()
low  = df['Low'].min()
diff = high - low

levels = {
    "0":     low,
    "0.236": low + 0.236 * diff,
    "0.382": low + 0.382 * diff,
    "0.5":   low + 0.5   * diff,
    "0.618": low + 0.618 * diff,
    "0.786": low + 0.786 * diff,
    "1.0":   high,
}
```

Returns a single dict (not an array) — the frontend draws static horizontal lines.

---

## Support / Resistance

Detect local pivot highs and lows, then cluster nearby values:

1. Find pivot highs: `high[i] > high[i-2], high[i-1], high[i+1], high[i+2]`
2. Find pivot lows: `low[i] < low[i-2], low[i-1], low[i+1], low[i+2]`
3. Collect all pivot prices into one list
4. Cluster: merge prices within 0.5% of each other → take the mean
5. Return the resulting list of price levels (max ~10 levels)

---

## Fair Value Gap (FVG)

A 3-candle pattern on the OHLCV data:

- **Bullish FVG:** `candle[i].low > candle[i-2].high` — gap between bar i-2's high and bar i's low
  - `top = candle[i].low`, `bottom = candle[i-2].high`
- **Bearish FVG:** `candle[i].high < candle[i-2].low` — gap between bar i-2's low and bar i's high
  - `top = candle[i-2].low`, `bottom = candle[i].high`

Use the timestamp of `candle[i]` (the completing candle) as the `time` field.

Only emit FVGs that have not been fully filled (i.e., no subsequent close has entered the gap range). This keeps the list manageable. This filtering is optional for the initial implementation — emit all detected FVGs first.
