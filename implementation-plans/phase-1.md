## Phase 1 — Backend Scaffold

### Packages
uv add fastapi uvicorn yfinance pandas pandas-ta pydantic python-dotenv

### Files to Create
backend/
├── pyproject.toml          ← uv init output
├── .venv/                  ← uv venv output
├── .env                    → CORS_ORIGINS=http://localhost:3000
├── main.py                 → FastAPI app, CORSMiddleware from .env, /health endpoint
├── routers/__init__.py     → empty
├── routers/stock.py        → # Phase 2
├── routers/indicator.py    → # Phase 3
├── services/__init__.py    → empty
├── services/data_service.py      → # Phase 2
├── services/indicator_service.py → # Phase 3
├── models/__init__.py      → empty
└── models/schemas.py       → # Phase 2

### Key Details
- CORS origins read from os.getenv("CORS_ORIGINS").split(",")
- Router imports in main.py are commented out (uncommented in Phase 2/3)
- Run: uv run uvicorn main:app --reload --port 8000

### Acceptance
GET http://localhost:8000/health → {"status": "ok"}
No import errors on startup