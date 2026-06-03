# Dependencies — Phase 02

## Phase Dependencies
- No prior phases required — this phase starts from scratch

## External Services
- None — health endpoint only, no data fetching yet

## Libraries & Packages

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.110 | Web framework |
| uvicorn[standard] | >=0.29 | ASGI server |
| yfinance | >=0.2 | Stock data (imported here so it resolves at install time) |
| pandas | >=2.0 | DataFrame manipulation for indicators |
| numpy | >=1.26 | Numerical calculations |

## Environment & Setup

- Initialize project: `cd backend && uv init`
- Add dependencies: `uv add fastapi uvicorn[standard] yfinance pandas numpy`
- Run dev server: `uv run uvicorn main:app --reload --port 8000`
- Server binds to `localhost:8000`

## Project Structure to Create

```
backend/
├── main.py                       ← FastAPI app, CORS, router registration, /health
├── routers/
│   ├── __init__.py
│   ├── stock.py                  ← empty stub
│   ├── overview.py               ← empty stub
│   └── search.py                 ← empty stub
├── services/
│   ├── __init__.py
│   ├── yfinance_service.py       ← empty stub
│   └── indicators.py             ← empty stub
└── pyproject.toml
```
