from fastapi import APIRouter, HTTPException

from models.stock import LatestStockValue
from services.yfinance import fetch_latest_value

router = APIRouter(prefix="/latest", tags=["latest"])


@router.get("/{symbol}", response_model=LatestStockValue)
def get_latest_value(symbol: str) -> LatestStockValue:
    """Get only the latest stock value for fastest response."""
    symbol = symbol.upper()
    try:
        data = fetch_latest_value(symbol)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return LatestStockValue(**data)
