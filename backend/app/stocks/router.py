from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.models import User
from app.stocks import schemas, service

router = APIRouter()


@router.get("/search", response_model=schemas.SearchResponse)
async def search_stocks(
    query: str = Query(...),
    limit: int = Query(20),
    _: User = Depends(get_current_user),
):
    return await service.search_stocks(query, limit)


@router.get("/{sym}/candles", response_model=schemas.CandlesResponse)
async def get_candles(
    sym: str,
    timeframe: str = Query("1D"),
    limit: Optional[int] = Query(None),
    to: Optional[int] = Query(None),
    _: User = Depends(get_current_user),
):
    return await service.get_candles(sym, timeframe, limit, to)


@router.get("/{sym}/indicators", response_model=schemas.IndicatorsResponse)
async def get_indicators(
    sym: str,
    timeframe: str = Query(...),
    indicators: str = Query(...),
    _: User = Depends(get_current_user),
):
    ind_list = [i.strip() for i in indicators.split(",") if i.strip()]
    return await service.get_indicators(sym, timeframe, ind_list)
