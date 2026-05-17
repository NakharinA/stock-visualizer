# Phase 1 — Backend Scaffold

## Goal
Set up a working FastAPI project using UV as the package manager with a venv, proper folder structure, CORS configured, and a health check endpoint.

## Prerequisites
- Python 3.11+ installed
- UV installed globally (`pip install uv` or via official installer)

---

## Folder Structure to Create

```
backend/
├── .venv/                   ← created by UV automatically
├── pyproject.toml           ← UV project config
├── .env                     ← environment variables
├── main.py                  ← FastAPI entry point
├── routers/
│   ├── __init__.py
│   ├── stock.py             ← placeholder, implemented in Phase 2
│   └── indicator.py         ← placeholder, implemented in Phase 3
├── services/
│   ├── __init__.py
│   ├── data_service.py      ← placeholder
│   └── indicator_service.py ← placeholder
└── models/
    ├── __init__.py
    └── schemas.py           ← placeholder
```

---

## Step-by-Step Instructions

### 1. Initialize UV project inside `backend/`
```bash
cd backend
uv init
uv venv
uv add fastapi uvicorn yfinance pandas pandas-ta pydantic python-dotenv
```

### 2. Create `.env`
```env
CORS_ORIGINS=http://localhost:3000
```

### 3. Create `main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Stock Chart API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers will be added in Phase 2 and 3
# from routers import stock, indicator
# app.include_router(stock.router, prefix="/stock", tags=["stock"])
# app.include_router(indicator.router, prefix="/indicator", tags=["indicator"])

@app.get("/health")
def health():
    return {"status": "ok"}
```

### 4. Create all `__init__.py` files
Each one is empty. Create them in: `routers/`, `services/`, `models/`.

### 5. Create placeholder files (empty, just a comment)
- `routers/stock.py` → `# Phase 2`
- `routers/indicator.py` → `# Phase 3`
- `services/data_service.py` → `# Phase 2`
- `services/indicator_service.py` → `# Phase 3`
- `models/schemas.py` → `# Phase 2`

---

## How to Run (Dev)
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

## Acceptance Criteria
- [ ] `GET http://localhost:8000/health` returns `{"status": "ok"}`
- [ ] No import errors on startup
- [ ] `.venv` folder exists inside `backend/`
