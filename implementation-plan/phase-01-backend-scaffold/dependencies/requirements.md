# Dependencies — Phase 01

## Phase Dependencies
- None. This is the first phase.

## External Services
- None required at this phase.

## Libraries & Packages
| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | >=0.111 | Web framework |
| uvicorn[standard] | >=0.29 | ASGI server with websocket + http2 support |
| yfinance | >=0.2.40 | Stock data fetching and symbol search |
| pandas | >=2.2 | DataFrame operations for OHLCV and indicator math |
| numpy | >=1.26 | Numerical operations for indicator calculations |

## Environment & Setup
- Python 3.11 or higher required
- `uv` package manager: install via `pip install uv` or `brew install uv`
- Initialize project: `uv init backend && cd backend`
- Add dependencies: `uv add fastapi "uvicorn[standard]" yfinance pandas numpy`
- Run dev server: `uv run uvicorn main:app --reload --port 8000`

## Folder Structure to Create
```
backend/
├── main.py              # FastAPI app, CORS middleware, router registration
├── routers/
│   ├── __init__.py
│   ├── stock.py         # stub file only — implemented in Phase 04
│   └── overview.py      # stub file only — implemented in Phase 04
├── services/
│   ├── __init__.py
│   ├── yfinance.py      # stub file only — implemented in Phase 04
│   └── indicators.py    # stub file only — implemented in Phase 04
└── pyproject.toml
```
