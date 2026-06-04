# Phase 01 — Backend Scaffold

## Goals
- Initialize the FastAPI backend project using `uv` as the package manager
- Establish the canonical folder structure that all future phases will build into
- Install all required Python dependencies upfront
- Wire up a working CORS-enabled FastAPI app with a single health check endpoint

## Deliverables & Acceptance Criteria
- [ ] `backend/pyproject.toml` exists and is managed by `uv`
- [ ] All dependencies installed: `fastapi`, `uvicorn[standard]`, `yfinance`, `pandas`, `numpy`
- [ ] `backend/main.py` creates a FastAPI app instance with CORS middleware allowing `http://localhost:3000`
- [ ] `backend/routers/` directory exists (empty `__init__.py` files in place)
- [ ] `backend/services/` directory exists (empty `__init__.py` files in place)
- [ ] `GET /health` returns `{"status": "ok"}`
- [ ] `uvicorn main:app --reload` starts without errors

## Dependencies
- No prior phase required
- Requires Python 3.11+ installed on the host
- Requires `uv` installed (`pip install uv` or `brew install uv`)

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — goals, deliverables, dependencies |
| dependencies/requirements.md | Libraries and setup instructions |
