from fastapi import APIRouter, Query
from models.schemas import StockResponse, SearchResponse, SearchResult
from services.data_service import fetch_ohlcv, search_tickers

router = APIRouter()


# /search/query must be declared BEFORE /{ticker} to avoid route conflict
@router.get("/search/query", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1)):
    results = search_tickers(q)
    return SearchResponse(results=[SearchResult(**r) for r in results])


@router.get("/{ticker}", response_model=StockResponse)
def get_stock(ticker: str, interval: str = "1d", period: str = "6mo"):
    candles = fetch_ohlcv(ticker.upper(), interval, period)
    return StockResponse(ticker=ticker.upper(), interval=interval, period=period, candles=candles)
