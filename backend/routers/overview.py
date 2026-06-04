from fastapi import APIRouter, HTTPException, Query

from models.overview import OverviewItem
from services.yfinance import fetch_overview

router = APIRouter(prefix="/overview", tags=["overview"])


@router.get("", response_model=list[OverviewItem])
def get_overview(symbols: str | None = Query(default=None, description="Comma-separated ticker symbols")) -> list[OverviewItem]:
    if not symbols or not symbols.strip():
        raise HTTPException(status_code=400, detail="symbols parameter is required")
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not symbol_list:
        raise HTTPException(status_code=400, detail="symbols parameter is required")
    return fetch_overview(symbol_list)
