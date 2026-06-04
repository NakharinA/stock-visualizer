# UI Flows — Phase 06: Stock Chart Core

## Flow 1 — Default Symbol Redirect

1. User visits `/stock` (no symbol in URL)
2. Page detects no `symbol` param
3. Redirect to `/stock/AAPL`
4. Chart page loads for AAPL with default period `3mo`

---

## Flow 2 — Direct URL Visit

1. User visits `/stock/TSLA`
2. Page reads `symbol = "TSLA"` from route params
3. Default period `3mo` is active
4. Page calls `GET /api/stock/TSLA?period=3mo`
5. Loading state shown
6. Chart renders candlestick data for TSLA

---

## Flow 3 — Switch Time Window

1. User is on `/stock/AAPL` with period `3mo` active
2. User clicks the `1Y` tab
3. Page calls `GET /api/stock/AAPL?period=1y`
4. Loading state shown on chart
5. Chart re-renders with 1 year of AAPL data
6. `1Y` tab is now visually active

---

## Flow 4 — Symbol Search Autocomplete

1. User clicks the search bar and starts typing `nvid`
2. After 300ms debounce, page calls `GET /api/search?q=nvid`
3. Dropdown appears below the search bar with results like:
   - NVDA — NVIDIA Corporation
   - NVDS — T-Rex 2X Inverse NVIDIA Daily...
4. User clicks `NVDA — NVIDIA Corporation`
5. Dropdown closes; page navigates to `/stock/NVDA`
6. Chart loads for NVDA with the current period

---

## Flow 5 — Invalid Symbol in URL

1. User visits `/stock/XXXXINVALID`
2. Page calls `GET /api/stock/XXXXINVALID?period=3mo`
3. Backend returns 404
4. Page shows an error message: "Symbol 'XXXXINVALID' not found"
5. Search bar is still functional

---

## Page Layout

```
┌─────────────────────────────────────────────┐
│  [Symbol Search Bar: AAPL               ▼]  │
│  [YTD] [1Y] [6M] [3M*] [1M] [1W]           │
├─────────────────────────────────────────────┤
│                                             │
│                                             │
│          Candlestick Chart                  │
│          (~75-80% of viewport height)       │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```
(*) = active tab

- Chart fills the remaining viewport height below the header and tabs
- Chart width fills the container 100%
- No scrollbars on the chart container — zoom is via scroll wheel on the chart canvas
