# Dependencies — Phase 04.5

## Phase Dependencies
- Requires Phase 04 to be fully complete (all services and routers implemented)

## External Services
- Internet access required for integration tests that call real yfinance endpoints
- Consider using `AAPL` as the canonical test symbol — it is liquid, has long history, and reliably returns data

## Libraries & Packages
| Package | Version | Purpose |
|---------|---------|---------|
| pytest | >=8.0 | Test runner |
| httpx | >=0.27 | Async HTTP client for FastAPI TestClient |
| pytest-asyncio | >=0.23 | Async test support |

Install: `uv add --dev pytest httpx pytest-asyncio`

## Test File Structure
```
backend/
└── tests/
    ├── __init__.py
    ├── conftest.py              # TestClient fixture
    ├── test_indicators.py       # Unit tests for indicators.py
    ├── test_stock_endpoint.py   # Integration tests for /stock
    ├── test_overview_endpoint.py
    └── test_search_endpoint.py
```

## Running Tests
```bash
cd backend
uv run pytest tests/ -v
```
