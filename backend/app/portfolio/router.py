from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.portfolio import schemas, service

router = APIRouter()


@router.get("/pnl", response_model=schemas.PnlResponse)
async def get_pnl(
    period: str = Query("7d"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_pnl(current_user, period, db)


@router.get("/stats", response_model=schemas.StatsResponse)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_stats(current_user, db)
