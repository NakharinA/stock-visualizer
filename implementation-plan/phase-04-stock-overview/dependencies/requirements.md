# Dependencies — Phase 04

## Phase Dependencies
- Requires Phase 01 to be complete (Nuxt app, `useStockApi.ts` stub)
- Requires Phase 03 to be complete (`GET /overview` endpoint working)
- Specifically needs: `getOverview(symbols)` method signature already present in `useStockApi.ts`

## External Services
- **FastAPI backend** at `http://localhost:8000` — must be running during development

## Libraries & Packages

No new packages. All provided by Nuxt UI Pro:

| Component | Purpose |
|-----------|---------|
| `UTable` (Nuxt UI Pro) | Overview table |
| `UBadge` or inline spans | Color-coded change values |
| `UInput` + `UButton` | Symbol add form |

## Environment & Setup
- Backend must be running: `uv run uvicorn main:app --reload --port 8000`
- Frontend must be running: `npm run dev` inside `frontend/`
- API base URL: configure in `useStockApi.ts` as `http://localhost:8000` (or via `runtimeConfig`)

## Default Watchlist

Hardcode these symbols as the initial list in the composable or a constants file:

```
AAPL, MSFT, GOOGL, AMZN, NVDA, TSLA, META, SPY, QQQ
```
