# UI Flows — Phase 01

## App Shell Layout

All pages share a common layout defined in `layouts/default.vue`:

```
┌─────────────────────────────────────────────────┐
│  Sidebar (fixed, ~220px wide)                   │
│  ┌──────────┐                                   │
│  │ Logo     │   ← app name / logo               │
│  │──────────│                                   │
│  │ Dashboard│   → /                             │
│  │ Stock    │   → /stock                        │
│  │ Overview │   → /overview                     │
│  └──────────┘                                   │
│                 ┌───────────────────────────────┐│
│                 │  <slot> (page content)        ││
│                 │                               ││
│                 └───────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

Use Nuxt UI Pro's `UDashboardLayout` or equivalent sidebar component.

## Page Stubs

### `/` — Dashboard (`pages/index.vue`)
- Empty page body. Title: "Dashboard".
- Placeholder text: "Coming soon."

### `/stock` — Stock Chart with no symbol (`pages/stock/[symbol].vue`)
- When `params.symbol` is absent or the route is just `/stock`:
  - Show centered empty state: "Search for a symbol to get started."
  - A search input is visible (non-functional in this phase).
- When `params.symbol` has a value (e.g. `/stock/AAPL`):
  - Show a placeholder: "Chart for {{ symbol }} — coming in Phase 05."

### `/overview` — Stock Overview (`pages/overview.vue`)
- Show a placeholder: "Overview table — coming in Phase 04."

## Composable Stub: `composables/useStockApi.ts`

Define all method signatures now so pages can import them without errors. All methods return `null` or empty arrays for now.

```typescript
export function useStockApi() {
  async function getStock(symbol: string, period: string) {
    return null
  }

  async function getOverview(symbols: string[]) {
    return []
  }

  async function searchSymbols(query: string) {
    return []
  }

  return { getStock, getOverview, searchSymbols }
}
```

## nuxt.config.ts Notes

- Set `colorMode.preference: 'dark'` (dark theme by default)
- Register `@nuxt/ui-pro` in `modules`
- No SSR needed — can set `ssr: false` for simplicity
