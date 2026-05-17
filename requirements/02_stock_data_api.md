# Phase 2 — Stock Data API

## Goal
Implement yfinance-based OHLCV data fetching. Expose two endpoints: one for candlestick data, one for ticker search.

## Depends On
Phase 1 must be complete.

---

## 1. `models/schemas.py`

```python
from pydantic import BaseModel

class Candle(BaseModel):
    time: int       # Unix timestamp in seconds
    open: float
    high: float
    low: float
    close: float
    volume: float

class StockResponse(BaseModel):
    ticker: str
    interval: str
    period: str
    candles: list[Candle]

class SearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str

class SearchResponse(BaseModel):
    results: list[SearchResult]
```

---

## 2. `services/data_service.py`

```python
import yfinance as yf
import pandas as pd
from models.schemas import Candle
from fastapi import HTTPException

VALID_INTERVALS = ["1m", "5m", "15m", "30m", "1h", "1d", "1wk", "1mo"]
VALID_PERIODS   = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"]

def fetch_ohlcv(ticker: str, interval: str, period: str) -> list[Candle]:
    if interval not in VALID_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Choose from {VALID_INTERVALS}")
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period. Choose from {VALID_PERIODS}")

    try:
        df = yf.Ticker(ticker).history(interval=interval, period=period)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker}'")

    df = df.dropna(subset=["Open", "High", "Low", "Close"])
    df.index = pd.to_datetime(df.index)

    candles = []
    for ts, row in df.iterrows():
        # Convert timezone-aware timestamps to UTC unix int
        unix_ts = int(ts.timestamp())
        candles.append(Candle(
            time=unix_ts,
            open=round(float(row["Open"]), 6),
            high=round(float(row["High"]), 6),
            low=round(float(row["Low"]), 6),
            close=round(float(row["Close"]), 6),
            volume=round(float(row["Volume"]), 2),
        ))

    return candles


def search_tickers(query: str) -> list[dict]:
    try:
        results = yf.Search(query, max_results=8).quotes
        output = []
        for r in results:
            output.append({
                "symbol": r.get("symbol", ""),
                "name": r.get("longname") or r.get("shortname", ""),
                "exchange": r.get("exchange", ""),
            })
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 3. `routers/stock.py`

```python
from fastapi import APIRouter, Query
from models.schemas import StockResponse, SearchResponse
from services.data_service import fetch_ohlcv, search_tickers, VALID_INTERVALS, VALID_PERIODS

router = APIRouter()

@router.get("/{ticker}", response_model=StockResponse)
def get_stock(
    ticker: str,
    interval: str = Query(default="1d", description=f"One of {VALID_INTERVALS}"),
    period: str   = Query(default="6mo", description=f"One of {VALID_PERIODS}"),
):
    candles = fetch_ohlcv(ticker.upper(), interval, period)
    return StockResponse(ticker=ticker.upper(), interval=interval, period=period, candles=candles)


@router.get("/search/query", response_model=SearchResponse)
def search_stock(q: str = Query(..., min_length=1)):
    results = search_tickers(q)
    return SearchResponse(results=results)
```

---

## 4. Update `main.py` — Uncomment router registration

Replace the commented router lines with:
```python
from routers import stock
app.include_router(stock.router, prefix="/stock", tags=["stock"])
```

---

## API Reference

| Method | Path | Params | Response |
|--------|------|--------|----------|
| GET | `/stock/{ticker}` | `interval`, `period` | `StockResponse` |
| GET | `/stock/search/query` | `q` (string) | `SearchResponse` |

---

## Acceptance Criteria
- [ ] `GET /stock/AAPL?interval=1d&period=3mo` returns candles array with time/open/high/low/close/volume
- [ ] `GET /stock/search/query?q=apple` returns list of matching symbols
- [ ] Invalid ticker returns HTTP 404
- [ ] Invalid interval returns HTTP 400
