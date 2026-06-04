# API Payloads — Phase 04

## stock-response

`GET /stock/{symbol}?period={period}` Response

```json
{
  "symbol": "string — uppercase ticker",
  "period": "string — one of: ytd, 1y, 6mo, 3mo, 1mo, 1wk",
  "ohlcv": [
    {
      "time": "string — YYYY-MM-DD",
      "open": "number",
      "high": "number",
      "low": "number",
      "close": "number",
      "volume": "number"
    }
  ],
  "indicators": {
    "ema20": [{ "time": "string", "value": "number" }],
    "ema50": [{ "time": "string", "value": "number" }],
    "ema100": [{ "time": "string", "value": "number" }],
    "ema200": [{ "time": "string", "value": "number" }],
    "macd": {
      "macd": [{ "time": "string", "value": "number" }],
      "signal": [{ "time": "string", "value": "number" }],
      "histogram": [{ "time": "string", "value": "number" }]
    },
    "rsi": [{ "time": "string", "value": "number" }],
    "stoch_rsi": {
      "k": [{ "time": "string", "value": "number" }],
      "d": [{ "time": "string", "value": "number" }]
    },
    "fibonacci": {
      "high": "number — highest close in the period",
      "low": "number — lowest close in the period",
      "levels": {
        "0": "number",
        "0.236": "number",
        "0.382": "number",
        "0.5": "number",
        "0.618": "number",
        "0.786": "number",
        "1.0": "number"
      }
    },
    "support_resistance": ["number — price level"],
    "fvg": [
      {
        "type": "string — bullish | bearish",
        "top": "number — upper bound of the gap",
        "bottom": "number — lower bound of the gap",
        "time": "string — YYYY-MM-DD of the middle candle"
      }
    ]
  }
}
```

---

## overview-response

`GET /overview?symbols=AAPL,TSLA` Response

```json
[
  {
    "symbol": "string — uppercase ticker",
    "price": "number — latest close price",
    "diff_value": "number — change from previous close (can be negative)",
    "diff_pct": "number — percentage change (can be negative)"
  }
]
```

---

## search-response

`GET /search?q=apple` Response

```json
[
  {
    "symbol": "string — ticker symbol (e.g. AAPL)",
    "name": "string — company name (e.g. Apple Inc.)"
  }
]
```
