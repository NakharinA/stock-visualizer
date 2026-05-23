# Dashboard Page — API Specification

## Overview
The dashboard displays portfolio PnL history, summary stat cards, and a focused stock detail table.
All endpoints require authentication.

**Base auth header for all requests:**
```
Authorization: Bearer <token>
```

---

## GET `/portfolio/pnl`

Fetch daily PnL data for the chart (last 7 days by default).

**Query Parameters**

| Param    | Type   | Required | Default | Description                        |
|----------|--------|----------|---------|------------------------------------|
| `period` | string | no       | `7d`    | Lookback window: `7d`, `30d`, `1y` |

**Response `200 OK`**
```json
{
  "data": [
    { "date": "2026-05-17", "pnl": 300.00 },
    { "date": "2026-05-18", "pnl": -150.00 },
    { "date": "2026-05-19", "pnl": 620.00 },
    { "date": "2026-05-20", "pnl": 410.00 },
    { "date": "2026-05-21", "pnl": -80.00 },
    { "date": "2026-05-22", "pnl": 720.00 },
    { "date": "2026-05-23", "pnl": 1240.50 }
  ],
  "totalPnl": 3060.50,
  "totalPnlPct": 3.12
}
```

| Field        | Type    | Description                        |
|--------------|---------|------------------------------------|
| `date`       | string  | ISO 8601 date `YYYY-MM-DD`         |
| `pnl`        | number  | Dollar PnL for that day            |
| `totalPnl`   | number  | Cumulative PnL over the period     |
| `totalPnlPct`| number  | Cumulative PnL as a percentage     |

---

## GET `/portfolio/stats`

Fetch summary stats displayed in the stat cards row.

**Response `200 OK`**
```json
{
  "focusedSym": "AAPL",
  "focusedPrice": 189.84,
  "todayPnl": 1240.50,
  "todayPnlPct": 3.12,
  "totalValue": 42500.00,
  "totalCost": 40000.00
}
```

| Field          | Type   | Description                               |
|----------------|--------|-------------------------------------------|
| `focusedSym`   | string | Currently focused/pinned ticker symbol    |
| `focusedPrice` | number | Last traded price of the focused symbol   |
| `todayPnl`     | number | Today's realized + unrealized PnL         |
| `todayPnlPct`  | number | Today's PnL as a percentage               |
| `totalValue`   | number | Current market value of portfolio         |
| `totalCost`    | number | Total cost basis of portfolio             |

---

## GET `/watchlist`

Fetch the user's watchlist (used by the Focusing Stock Info table).

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
    },
    {
      "sym": "TSLA",
      "name": "Tesla Inc.",
      "price": 242.10,
      "change": -4.30,
      "changePct": -1.75
    }
  ]
}
```

| Field       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `sym`       | string | Ticker symbol                            |
| `name`      | string | Company full name                        |
| `price`     | number | Last traded price                        |
| `change`    | number | Absolute price change from previous close|
| `changePct` | number | Percentage change from previous close    |

---

## Common Error Responses

| Status | Body                                   | When                       |
|--------|----------------------------------------|----------------------------|
| `401`  | `{ "error": "Unauthorized" }`          | Missing or invalid token   |
| `500`  | `{ "error": "Internal server error" }` | Unexpected server error    |
