# Dependencies — Phase 03

## Phase Dependencies
- Requires Phase 01 to be complete (FastAPI app exists with folder structure)
- Requires Phase 02 to be complete (Nuxt project exists with pages and layout)

## External Services
- None. This phase is purely structural — no external API calls are made yet.

## Libraries & Packages
No new packages needed. All required packages were installed in Phase 01 and Phase 02.

## Environment Variables

### Frontend (`frontend/.env`)
| Variable | Example Value | Purpose |
|----------|--------------|---------|
| NUXT_PUBLIC_API_BASE | http://localhost:8000 | Base URL for FastAPI backend |

### Backend (`backend/.env`)
| Variable | Example Value | Purpose |
|----------|--------------|---------|
| ALLOWED_ORIGINS | http://localhost:3000 | CORS allowed origins (comma-separated) |

## Dev Proxy Configuration
Add to `frontend/nuxt.config.ts` so the browser never hits CORS issues in dev:
```ts
nitro: {
  devProxy: {
    '/api': { target: 'http://localhost:8000', changeOrigin: true }
  }
}
```

## Pydantic Models to Define
Create `backend/models/` with:
- `stock.py`: `OHLCVBar`, `EMAPoint`, `MACDData`, `StochRSIData`, `FibonacciData`, `FVGBox`, `IndicatorsData`, `StockResponse`
- `overview.py`: `OverviewItem`, `SearchResult`

## TypeScript Types to Define
Mirror the Pydantic schemas in `frontend/types/api.ts` (or inline in the composable):
- `OHLCVBar`, `StockResponse`, `OverviewItem`, `SearchResult`
