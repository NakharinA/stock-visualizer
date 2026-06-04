from fastapi import APIRouter, HTTPException, Query

from models.overview import SearchResult
from services.yfinance import search_symbols

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=list[SearchResult])
def search(
    q: str = Query(default=""),
    limit: int = Query(default=8, ge=1, le=20),
) -> list[SearchResult]:
    if not q.strip():
        raise HTTPException(status_code=400, detail="Missing required parameter: q")
    return search_symbols(q.strip(), limit=limit)
