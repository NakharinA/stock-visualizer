# Stock Page — API Specification

## Overview
The stock page renders the main candlestick chart, indicator panes, and the watchlist panel.
All endpoints require authentication.

**Base auth header for all requests:**
```
Authorization: Bearer <token>
```

---

## GET `/stocks/{sym}/candles`

Fetch OHLCV candlestick data for a given symbol and timeframe.
Used by `MainChart` on load and on timeframe / symbol change.

**Path Parameters**

| Param | Type   | Required | Description     |
|-------|--------|----------|-----------------|
| `sym` | string | yes      | Ticker symbol, e.g. `AAPL` |

**Query Parameters**

| Param       | Type   | Required | Default | Description                                        |
|-------------|--------|----------|---------|----------------------------------------------------|
| `timeframe` | string | yes      | `1D`    | `1D` · `1W` · `1M` · `3M` · `1Y`                  |
| `limit`     | int    | no       | —       | Max number of bars to return                       |
| `to`        | int    | no       | now     | End timestamp (Unix seconds) for pagination        |

**Timeframe → Bar Interval Mapping**

| Timeframe | Bar Interval |
|-----------|-------------|
| `1D`      | 1 minute    |
| `1W`      | 5 minutes   |
| `1M`      | 30 minutes  |
| `3M`      | 1 hour      |
| `1Y`      | 4 hours     |

**Response `200 OK`**
```json
{
  "sym": "AAPL",
  "timeframe": "1D",
  "bars": [
    {
      "time": 1748044800,
      "open": 189.20,
      "high": 190.15,
      "low": 188.95,
      "close": 189.84,
      "volume": 458320
    }
  ]
}
```

| Field    | Type   | Description                              |
|----------|--------|------------------------------------------|
| `time`   | int    | Bar open time as Unix timestamp (seconds)|
| `open`   | number | Opening price                            |
| `high`   | number | Highest price in the interval            |
| `low`    | number | Lowest price in the interval             |
| `close`  | number | Closing price                            |
| `volume` | int    | Trade volume for the interval            |

---

## GET `/stocks/search`

Search for stocks by symbol or company name.
Used by the `StockSearchModal` "Add Stock" flow.

**Query Parameters**

| Param   | Type   | Required | Description                        |
|---------|--------|----------|------------------------------------|
| `query` | string | yes      | Partial symbol or company name     |
| `limit` | int    | no       | Max results to return (default 20) |

**Response `200 OK`**
```json
{
  "results": [
    {
      "sym": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "sector": "Technology"
    },
    {
      "sym": "AMZN",
      "name": "Amazon.com Inc.",
      "exchange": "NASDAQ",
      "sector": "Consumer Cyclical"
    }
  ]
}
```

| Field      | Type   | Description                  |
|------------|--------|------------------------------|
| `sym`      | string | Ticker symbol                |
| `name`     | string | Company full name            |
| `exchange` | string | Exchange (e.g. `NASDAQ`, `NYSE`) |
| `sector`   | string | GICS sector                  |

---

## GET `/watchlist`

Fetch the user's watchlist to populate the `WatchlistPanel`.

**Response `200 OK`**
```json
{
  "items": [
    {
      "sym": "AAPL",
      "name": "Apple Inc.",
      "price": 189.84,
      "change": 2.15,
      "changePct": 1.14
    }
  ]
}
```

---

## POST `/watchlist`

Add a stock to the user's watchlist.

**Request**
```json
{
  "sym": "NVDA"
}
```

**Response `201 Created`**
```json
{
  "sym": "NVDA",
  "name": "NVIDIA Corporation",
  "price": 875.40,
  "change": 12.60,
  "changePct": 1.46
}
```

**Response `409 Conflict`**
```json
{
  "error": "Symbol already in watchlist"
}
```

---

## DELETE `/watchlist/{sym}`

Remove a stock from the user's watchlist.

**Path Parameters**

| Param | Type   | Required | Description    |
|-------|--------|----------|----------------|
| `sym` | string | yes      | Ticker symbol  |

**Response `204 No Content`**

---

## GET `/stocks/{sym}/indicators`

Fetch pre-computed server-side indicator data for a symbol and timeframe.
Used when overlay or pane indicators are enabled.

**Path Parameters**

| Param | Type   | Required | Description   |
|-------|--------|----------|---------------|
| `sym` | string | yes      | Ticker symbol |

**Query Parameters**

| Param        | Type   | Required | Description                                               |
|--------------|--------|----------|-----------------------------------------------------------|
| `timeframe`  | string | yes      | `1D` · `1W` · `1M` · `3M` · `1Y`                         |
| `indicators` | string | yes      | Comma-separated list: `EMA20,EMA50,BB,VOLUME,RSI,MACD,STOCH,CCI` |

**Response `200 OK`**
```json
{
  "sym": "AAPL",
  "timeframe": "1D",
  "indicators": {
    "EMA20": [
      { "time": 1748044800, "value": 188.42 }
    ],
    "EMA50": [
      { "time": 1748044800, "value": 185.10 }
    ],
    "BB": {
      "upper": [{ "time": 1748044800, "value": 192.30 }],
      "middle": [{ "time": 1748044800, "value": 188.42 }],
      "lower": [{ "time": 1748044800, "value": 184.54 }]
    },
    "VOLUME": [
      { "time": 1748044800, "value": 458320 }
    ],
    "RSI": [
      { "time": 1748044800, "value": 62.4 }
    ],
    "MACD": {
      "macd": [{ "time": 1748044800, "value": 1.23 }],
      "signal": [{ "time": 1748044800, "value": 0.98 }],
      "histogram": [{ "time": 1748044800, "value": 0.25 }]
    },
    "STOCH": [
      { "time": 1748044800, "value": 74.2 }
    ],
    "CCI": [
      { "time": 1748044800, "value": 112.5 }
    ]
  }
}
```

> **Note:** All `time` values are Unix timestamps in seconds, matching the candle bar timestamps.

---

## Common Error Responses

| Status | Body                                      | When                              |
|--------|-------------------------------------------|-----------------------------------|
| `400`  | `{ "error": "Invalid timeframe" }`        | Unknown timeframe value           |
| `401`  | `{ "error": "Unauthorized" }`             | Missing or invalid token          |
| `404`  | `{ "error": "Symbol not found" }`         | Unknown ticker symbol             |
| `500`  | `{ "error": "Internal server error" }`    | Unexpected server error           |
