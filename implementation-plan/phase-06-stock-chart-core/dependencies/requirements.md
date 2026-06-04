# Dependencies — Phase 06

## Phase Dependencies
- Requires Phase 04 to be complete (`GET /stock/{symbol}` and `GET /search` endpoints working)
- Requires Phase 03 to be complete (`useStockApi.ts` composable with TypeScript types, dev proxy configured)
- Requires Phase 02 to be complete (`frontend/pages/stock/[[symbol]].vue` scaffolded)

## External Services
- Backend API at `http://localhost:8000` (via `/api` dev proxy)

## Libraries & Packages
| Package | Version | Purpose |
|---------|---------|---------|
| lightweight-charts | ^4.x | TradingView candlestick chart library |

Install: `npm install lightweight-charts`

**Do not use** `vue-lightweight-charts` wrappers — they lag behind the upstream API and add unnecessary abstraction. Use the raw library and wire it to Vue manually via `onMounted`/`onUnmounted` as documented in context.md.

## Environment & Setup
- Both backend (`port 8000`) and frontend (`port 3000`) dev servers must be running
- `NUXT_PUBLIC_API_BASE` env var must be set if not using the dev proxy path
