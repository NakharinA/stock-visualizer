# Phase 02 — Backend Scaffold

## Goals
- Initialize FastAPI project with `uv` in `backend/`
- Define the full directory structure (`routers/`, `services/`)
- Add CORS middleware allowing requests from `localhost:3000`
- Expose a `GET /health` endpoint to verify the server is running

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] `uv run uvicorn main:app --reload` starts without errors inside `backend/`
- [ ] `GET http://localhost:8000/health` returns `{"status": "ok"}` with HTTP 200
- [ ] CORS allows `http://localhost:3000` (Nuxt dev server)
- [ ] Empty router files exist: `routers/stock.py`, `routers/overview.py`, `routers/search.py`
- [ ] Empty service files exist: `services/yfinance_service.py`, `services/indicators.py`
- [ ] `pyproject.toml` lists all required dependencies

## Dependencies

What must be true before this phase starts:
- Python 3.11+ installed
- `uv` installed (`pip install uv` or `brew install uv`)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | Python version, packages, uv setup |
| api-specification/endpoints.md | Health endpoint definition |
| api-specification/payloads.md | Health response payload |
