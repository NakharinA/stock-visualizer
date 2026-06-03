# Phase 01 — Frontend Scaffold

## Goals
- Initialize Nuxt 3 project with Nuxt UI Pro in `frontend/`
- Set up app layout with sidebar navigation (Dashboard, Stock, Overview)
- Scaffold all three page stubs with empty content
- Create a stub `useStockApi.ts` composable (returns null/empty — no real API calls yet)

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] `npm run dev` starts without errors inside `frontend/`
- [ ] Browser loads at `localhost:3000` and shows the app shell
- [ ] Sidebar nav has three links: Dashboard (`/`), Stock (`/stock`), Overview (`/overview`)
- [ ] Each route loads its stub page without a 404
- [ ] `/stock` (no symbol) shows a search prompt / empty state
- [ ] `useStockApi.ts` exists with all method signatures returning `null`
- [ ] Dark mode is enabled by default in `nuxt.config.ts`

## Dependencies

What must be true before this phase starts:
- Node.js 18+ installed locally
- Nuxt UI Pro license key available (set as `NUXT_UI_PRO_LICENSE` env var)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | Node version, packages, env vars |
| ui-flows.md | Layout structure and page stubs described visually |
