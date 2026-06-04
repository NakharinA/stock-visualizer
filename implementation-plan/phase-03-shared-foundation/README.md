# Phase 03 — Shared Foundation

## Goals
- Define Pydantic response models for all API contracts (backend)
- Build the typed `useStockApi.ts` composable skeleton on the frontend (structure only, no real calls yet)
- Configure the Nuxt dev proxy so frontend API calls forward to the FastAPI backend
- Add global error handling middleware to the FastAPI app
- Establish environment variable conventions for both projects

## Deliverables & Acceptance Criteria
- [ ] `backend/models/` directory with `stock.py` and `overview.py` defining all Pydantic response schemas
- [ ] `backend/main.py` includes a global exception handler that returns `{"error": "message"}` on unhandled exceptions
- [ ] `frontend/composables/useStockApi.ts` exists with typed function stubs: `fetchStock()`, `fetchOverview()`, `searchSymbols()` — each returns a typed Promise but has a `// TODO` body
- [ ] `frontend/nuxt.config.ts` has `nitro.devProxy` forwarding `/api/**` to `http://localhost:8000/**`
- [ ] `frontend/.env.example` documents `NUXT_PUBLIC_API_BASE` variable
- [ ] `backend/.env.example` documents `ALLOWED_ORIGINS` variable

## Dependencies
- Phase 01 must be complete (FastAPI project initialized)
- Phase 02 must be complete (Nuxt project initialized)

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — goals, deliverables, dependencies |
| dependencies/requirements.md | Libraries and environment variable documentation |
