# API Endpoints — Phase 04

## Stock Data

### GET /stock/{symbol}
- **Auth:** not required
- **Description:** Fetch OHLCV data and all computed indicators for a given ticker symbol over a selected time period.
- **Path param:** `symbol` — uppercase ticker (e.g. `AAPL`, `TSLA`)
- **Query param:** `period` — one of `ytd`, `1y`, `6mo`, `3mo`, `1mo`, `1wk`
- **Request:** none (GET)
- **Response:** see payloads.md#stock-response
- **Errors:**
  - `404` — symbol not found or no data returned by yfinance
  - `422` — invalid period value

---

## Overview

### GET /overview
- **Auth:** not required
- **Description:** Fetch current price and daily change for a list of symbols. Used by the Stock Overview table.
- **Query param:** `symbols` — comma-separated ticker list (e.g. `AAPL,TSLA,NVDA`)
- **Request:** none (GET)
- **Response:** see payloads.md#overview-response
- **Errors:**
  - `400` — `symbols` param missing or empty
  - Symbols with no data are silently omitted from the result list

---

## Symbol Search (Autocomplete)

### GET /search
- **Auth:** not required
- **Description:** Search for ticker symbols matching a query string. Used by the symbol search autocomplete on the Stock Chart page.
- **Query param:** `q` — search string (e.g. `apple`, `tsla`)
- **Query param:** `limit` — max results to return (default: 8, max: 20)
- **Request:** none (GET)
- **Response:** see payloads.md#search-response
- **Errors:**
  - `400` — `q` param missing or empty
