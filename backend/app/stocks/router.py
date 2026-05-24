from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.models import User
from app.stocks import schemas, service

router = APIRouter()


@router.get(
    "/search",
    response_model=schemas.SearchResponse,
    summary="Search stocks",
    description="Search for stocks by symbol or company name. Returns up to `limit` results.",
    responses={
        200: {"description": "List of matching stocks"},
        401: {"description": "Unauthorized"},
    },
)
async def search_stocks(
    query: str = Query(..., description="Search term — ticker symbol or company name", examples=["AAPL"]),
    limit: int = Query(20, description="Maximum number of results to return", ge=1, le=100),
    _: User = Depends(get_current_user),
):
    return await service.search_stocks(query, limit)


@router.get(
    "/{sym}/candles",
    response_model=schemas.CandlesResponse,
    summary="Get OHLCV candles",
    description=(
        "Retrieve OHLCV (open/high/low/close/volume) candlestick data for a symbol.\n\n"
        "**Timeframe values**: `1m`, `5m`, `15m`, `30m`, `1H`, `4H`, `1D`, `1W`, `1M`"
    ),
    responses={
        200: {"description": "Candlestick bars for the requested symbol and timeframe"},
        401: {"description": "Unauthorized"},
        404: {"description": "Symbol not found"},
    },
)
async def get_candles(
    sym: str,
    timeframe: str = Query("1D", description="Candle timeframe (e.g. `1D`, `1H`, `5m`)", examples=["1D"]),
    limit: Optional[int] = Query(None, description="Number of bars to return", ge=1),
    to: Optional[int] = Query(None, description="Unix timestamp upper bound (exclusive)"),
    _: User = Depends(get_current_user),
):
    return await service.get_candles(sym, timeframe, limit, to)


@router.get(
    "/{sym}/indicators",
    response_model=schemas.IndicatorsResponse,
    summary="Get technical indicators",
    description=(
        "Calculate technical indicators for a symbol.\n\n"
        "Pass a comma-separated list of indicator names in `indicators`, e.g. `SMA,EMA,RSI`."
    ),
    responses={
        200: {"description": "Computed indicator values keyed by indicator name"},
        401: {"description": "Unauthorized"},
        404: {"description": "Symbol not found"},
    },
)
async def get_indicators(
    sym: str,
    timeframe: str = Query(..., description="Candle timeframe (e.g. `1D`, `1H`)", examples=["1D"]),
    indicators: str = Query(..., description="Comma-separated indicator names", examples=["SMA,EMA,RSI"]),
    _: User = Depends(get_current_user),
):
    ind_list = [i.strip() for i in indicators.split(",") if i.strip()]
    return await service.get_indicators(sym, timeframe, ind_list)
