# Dependencies — Phase 05

## Phase Dependencies
- Requires Phase 04 to be complete (`GET /overview` endpoint must return valid data)
- Requires Phase 03 to be complete (`useStockApi.ts` composable skeleton with TypeScript types)
- Requires Phase 02 to be complete (Nuxt project and layout scaffolded)

## External Services
- Backend API at `http://localhost:8000` (or via dev proxy at `/api`)

## Libraries & Packages
No new packages needed. All required packages were installed in Phase 02.

| Package | Already installed | Purpose in this phase |
|---------|------------------|----------------------|
| @nuxt/ui-pro | Yes (Phase 02) | `UTable`, `UInput`, `UButton`, `UAlert` components |
| @nuxtjs/color-mode | Yes (Phase 02) | Dark theme consistency |

## Environment & Setup
- Both backend and frontend dev servers must be running simultaneously
- Backend: `uv run uvicorn main:app --reload --port 8000`
- Frontend: `npm run dev` (port 3000)

## localStorage Key
- Key: `stock-watchlist`
- Format: JSON array of uppercase ticker strings: `["AAPL","TSLA","NVDA"]`
