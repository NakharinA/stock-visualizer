# API Payloads — Phase 03

## stock-response

```json
{
  "symbol": "string — uppercase ticker",
  "period": "string — one of ytd|1y|6mo|3mo|1mo|1wk",
  "ohlcv": [
    {
      "time": "string — ISO date YYYY-MM-DD",
      "open": "number",
      "high": "number",
      "low": "number",
      "close": "number",
      "volume": "number"
    }
  ],
  "indicators": {
    "ema20":  ["number|null — one entry per OHLCV bar; null during warm-up"],
    "ema50":  ["number|null"],
    "ema100": ["number|null"],
    "ema200": ["number|null"],
    "macd": {
      "macd":      ["number|null"],
      "signal":    ["number|null"],
      "histogram": ["number|null"]
    },
    "rsi": ["number|null — 0–100; null for first 14 bars"],
    "stoch_rsi": {
      "k": ["number|null — 0–100"],
      "d": ["number|null — 0–100"]
    },
    "fibonacci": {
      "high": "number — highest close in window",
      "low":  "number — lowest close in window",
      "levels": {
        "0":     "number",
        "0.236": "number",
        "0.382": "number",
        "0.5":   "number",
        "0.618": "number",
        "0.786": "number",
        "1.0":   "number"
      }
    },
    "support_resistance": ["number — price level"],
    "fvg": [
      {
        "type":   "string — bullish | bearish",
        "top":    "number — upper bound of the gap",
        "bottom": "number — lower bound of the gap",
        "time":   "string — ISO date of the middle candle (candle[i])"
      }
    ]
  }
}
```

## overview-response

```json
[
  {
    "symbol":     "string — uppercase ticker",
    "price":      "number — latest close",
    "diff_value": "number — close minus previous close (negative = decline)",
    "diff_pct":   "number — percentage change rounded to 2 decimal places"
  }
]
```

## search-response

```json
[
  {
    "symbol":   "string — ticker symbol",
    "name":     "string — company/fund name",
    "exchange": "string — e.g. NMS, NYQ"
  }
]
```
