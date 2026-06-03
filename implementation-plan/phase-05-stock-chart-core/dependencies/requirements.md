# Dependencies — Phase 05

## Phase Dependencies
- Requires Phase 01 to be complete (Nuxt app, composable stub)
- Requires Phase 03 to be complete (`GET /stock/{symbol}` and `GET /search` endpoints working)

## External Services
- **FastAPI backend** at `http://localhost:8000` — must be running

## Libraries & Packages

| Package | Version | Purpose |
|---------|---------|---------|
| lightweight-charts | ^4.x | Candlestick chart, line series for EMA overlays |

Install: `cd frontend && npm install lightweight-charts`

## Notes on Nuxt / SSR

Lightweight Charts directly manipulates the DOM and cannot run server-side. Wrap chart initialization in:
- A `ClientOnly` component in the template, **or**
- An `onMounted` lifecycle hook that checks `process.client`

Use `import { createChart } from 'lightweight-charts'` inside `onMounted` to avoid SSR errors.
If `ssr: false` was set in Phase 01, this is less of a concern but the pattern is still good practice.
