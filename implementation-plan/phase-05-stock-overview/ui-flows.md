# UI Flows — Phase 05: Stock Overview

## Flow 1 — First Visit (Empty localStorage)

1. User navigates to `/overview`
2. Page detects no `stock-watchlist` key in localStorage
3. Default watchlist `["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "META", "SPY"]` is written to localStorage
4. Page calls `GET /overview?symbols=AAPL,TSLA,NVDA,MSFT,AMZN,GOOGL,META,SPY`
5. Loading skeleton displayed while request is in flight
6. Table renders with 8 rows, one per symbol

---

## Flow 2 — Returning Visit (localStorage has watchlist)

1. User navigates to `/overview`
2. Page reads `stock-watchlist` from localStorage
3. Page calls `/overview` with saved symbols
4. Table renders with the saved watchlist

---

## Flow 3 — Add Symbol

1. User types a ticker (e.g. `NFLX`) into the "Add Symbol" input
2. User presses Enter or clicks "Add"
3. If `NFLX` is not already in the watchlist:
   - `NFLX` is added to localStorage watchlist
   - Page re-fetches `/overview` with the updated symbol list
   - Table updates with the new row
4. If `NFLX` is already in the watchlist: show a brief inline warning ("Already in watchlist"), do not duplicate

---

## Flow 4 — Remove Symbol

1. User clicks the remove (×) button on a table row (e.g. `TSLA`)
2. `TSLA` is removed from the localStorage watchlist immediately
3. The `TSLA` row disappears from the table immediately (no re-fetch needed)

---

## Flow 5 — Navigate to Chart

1. User clicks anywhere on a table row (e.g. the `NVDA` row)
2. Browser navigates to `/stock/NVDA`
3. The Stock Chart page loads for NVDA

---

## Table Layout

```
┌──────────────────────────────────────────────────────────┐
│  Symbol     Price       Change        Change %      [×]  │
├──────────────────────────────────────────────────────────┤
│  AAPL       $189.50     +2.30         +1.23%        [×]  │
│  TSLA       $245.80     -4.20         -1.68%        [×]  │
│  NVDA       $875.00     +12.50        +1.45%        [×]  │
└──────────────────────────────────────────────────────────┘
[  Add symbol input            ] [Add]
```

- Positive change: green text (`text-green-500`)
- Negative change: red text (`text-red-500`)
- Neutral (0.00): inherit text color
