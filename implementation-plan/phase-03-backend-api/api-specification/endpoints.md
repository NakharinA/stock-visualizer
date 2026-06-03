# API Endpoints — Phase 03

## Stock Data

### GET /stock/{symbol}
- **Auth:** not required
- **Description:** Returns full OHLCV history plus all calculated indicators for the given symbol and time period.
- **Path param:** `symbol` — uppercase ticker (e.g. `AAPL`, `TSLA`)
- **Query param:** `period` — one of `ytd`, `1y`, `6mo`, `3mo`, `1mo`, `1wk` (default: `3mo`)
- **Error:** 404 if yfinance returns empty data for the symbol
- **Request:** no body
- **Response:** see payloads.md#stock-response

---

## Overview

### GET /overview
- **Auth:** not required
- **Description:** Returns current price and daily change for each requested symbol. Each symbol is fetched concurrently.
- **Query param:** `symbols` — comma-separated ticker list (e.g. `AAPL,TSLA,NVDA`)
- **Error:** symbols with no data are silently omitted from the response list
- **Request:** no body
- **Response:** see payloads.md#overview-response

---

## Symbol Search / Autocomplete

### GET /search
- **Auth:** not required
- **Description:** Returns a list of matching ticker symbols and names for autocomplete. Uses `yfinance.Search(query).quotes`.
- **Query param:** `q` — partial symbol or company name (e.g. `APP`, `Tesla`)
- **Query param:** `limit` — max results to return (default: 8)
- **Request:** no body
- **Response:** see payloads.md#search-response
