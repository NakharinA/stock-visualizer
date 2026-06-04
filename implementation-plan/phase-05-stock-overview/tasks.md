# Tasks — Phase 05

## composables/useStockApi.ts

- [ ] Implement `fetchOverview(symbols: string[]) -> Promise<OverviewItem[]>`
  - Call `GET /api/overview?symbols={symbols.join(",")}`
  - Return typed array

## composables/useWatchlist.ts (new composable)

- [ ] Create `useWatchlist()` composable
- [ ] `symbols` — reactive ref initialized from localStorage `stock-watchlist` (parsed JSON array)
- [ ] If key missing from localStorage, initialize with default list `["AAPL","TSLA","NVDA","MSFT","AMZN","GOOGL","META","SPY"]` and persist immediately
- [ ] `addSymbol(symbol: string)` — uppercases input, guards against duplicates, updates ref + localStorage
- [ ] `removeSymbol(symbol: string)` — filters out symbol from ref + updates localStorage
- [ ] Auto-persist to localStorage on every change using a `watch` on the `symbols` ref

## components/overview/StockTable.vue

- [ ] Accept `data: OverviewItem[]` and `loading: boolean` as props
- [ ] Render a `UTable` from Nuxt UI with columns: Symbol, Price, Change, Change %, (remove button)
- [ ] Format Price as `$189.50` (2 decimal places)
- [ ] Format Change as `+2.30` / `-4.20` (include sign, 2 decimal places)
- [ ] Format Change % as `+1.23%` / `-1.68%` (include sign, 2 decimal places)
- [ ] Apply green/red color class based on sign of `diff_value`
- [ ] Emit `@remove(symbol: string)` when × button is clicked on a row
- [ ] Emit `@row-click(symbol: string)` when a row is clicked (but NOT when × is clicked)
- [ ] Show skeleton rows when `loading` is true

## pages/overview.vue

- [ ] Use `useWatchlist()` to get reactive symbols list
- [ ] On mount and whenever symbols change, call `fetchOverview(symbols)`
- [ ] Pass data and loading state to `<StockTable>`
- [ ] Handle `@remove` by calling `removeSymbol()`
- [ ] Handle `@row-click` by calling `navigateTo(`/stock/${symbol}`)`
- [ ] Render "Add Symbol" input field + "Add" button below the table
- [ ] On submit (Enter or button click), call `addSymbol()` with the input value
- [ ] Clear the input field after successful add
- [ ] Show inline warning if symbol already in watchlist
- [ ] Show error state if `fetchOverview` throws

## Styling Notes

- Use `UInput` for the add symbol field
- Use `UButton` for Add and Remove (× icon)
- Use `UAlert` or `UNotification` for the "already in watchlist" warning
- Table row cursor should be `cursor-pointer`
- Remove button click must `event.stopPropagation()` to prevent row-click firing
