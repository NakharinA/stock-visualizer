# UI Flows — Phase 04

## Overview Page Layout

```
/overview

┌─ Sidebar nav ──┬────────────────────────────────────┐
│  Dashboard     │  Stock Overview                    │
│  Stock         │                                    │
│> Overview      │  ┌──────────────────────────────┐  │
│                │  │ [Symbol input]  [Add button] │  │
│                │  └──────────────────────────────┘  │
│                │                                    │
│                │  ┌──────┬─────────┬────────┬─────┬──────┐
│                │  │Symbol│  Price  │ Chg($) │Chg% │  ✕   │
│                │  ├──────┼─────────┼────────┼─────┼──────┤
│                │  │ AAPL │ 189.50  │ +2.30  │+1.2%│  ✕   │
│                │  │ TSLA │ 242.10  │ -4.60  │-1.9%│  ✕   │
│                │  │ NVDA │ 875.20  │ +12.40 │+1.4%│  ✕   │
│                │  └──────┴─────────┴────────┴─────┴──────┘
└────────────────┴────────────────────────────────────┘
```

## Color Coding

- `diff_value > 0` → green text (e.g. Nuxt UI `text-green-500`)
- `diff_value < 0` → red text (e.g. `text-red-500`)
- `diff_value === 0` → default text color

## Interactions

| Interaction | Behavior |
|-------------|----------|
| Page load | Fetch watchlist from localStorage; call `GET /overview?symbols=...`; populate table |
| Add symbol | User types in input, presses Enter or clicks Add; symbol appended to list; table refreshes |
| Remove symbol | Click ✕ on any row; symbol removed from watchlist; row removed from table immediately |
| Click a row | Navigate to `/stock/[symbol]` |
| Invalid symbol added | Symbol is saved to watchlist; when the overview fetch runs, bad symbols are silently omitted (backend behavior) — row simply does not appear |

## watchlist Composable (or State)

Use a dedicated `useWatchlist` composable that wraps localStorage:

```typescript
const STORAGE_KEY = 'watchlist'
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'SPY', 'QQQ']

export function useWatchlist() {
  const symbols = ref<string[]>(loadFromStorage())

  function loadFromStorage(): string[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : [...DEFAULT_SYMBOLS]
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols.value))
  }

  function add(symbol: string) {
    const s = symbol.toUpperCase().trim()
    if (s && !symbols.value.includes(s)) {
      symbols.value.push(s)
      save()
    }
  }

  function remove(symbol: string) {
    symbols.value = symbols.value.filter(s => s !== symbol)
    save()
  }

  return { symbols, add, remove }
}
```
