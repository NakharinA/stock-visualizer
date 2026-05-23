from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.watchlist import schemas, service

router = APIRouter()


@router.get("/watchlist", response_model=schemas.WatchlistResponse)
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_watchlist(current_user, db)


@router.post("/watchlist", response_model=schemas.WatchlistItemSchema, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    body: schemas.AddWatchlistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.add_to_watchlist(current_user, body.sym, db)


@router.delete("/watchlist/{sym}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(
    sym: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await service.remove_from_watchlist(current_user, sym, db)
