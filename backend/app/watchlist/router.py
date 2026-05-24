from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.watchlist import schemas, service

router = APIRouter()


@router.get(
    "/watchlist",
    response_model=schemas.WatchlistResponse,
    summary="Get watchlist",
    description="Returns all symbols in the authenticated user's watchlist with current price and change data.",
    responses={
        200: {"description": "Watchlist items with live price data"},
        401: {"description": "Unauthorized"},
    },
)
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_watchlist(current_user, db)


@router.post(
    "/watchlist",
    response_model=schemas.WatchlistItemSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Add symbol to watchlist",
    description="Add a stock symbol to the authenticated user's watchlist.",
    responses={
        201: {"description": "Symbol added to watchlist"},
        400: {"description": "Symbol already in watchlist or invalid"},
        401: {"description": "Unauthorized"},
    },
)
async def add_to_watchlist(
    body: schemas.AddWatchlistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.add_to_watchlist(current_user, body.sym, db)


@router.delete(
    "/watchlist/{sym}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove symbol from watchlist",
    description="Remove a stock symbol from the authenticated user's watchlist.",
    responses={
        204: {"description": "Symbol removed"},
        401: {"description": "Unauthorized"},
        404: {"description": "Symbol not in watchlist"},
    },
)
async def remove_from_watchlist(
    sym: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.remove_from_watchlist(current_user, sym, db)
