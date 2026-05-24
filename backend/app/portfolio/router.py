from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.portfolio import schemas, service

router = APIRouter()


@router.get(
    "/pnl",
    response_model=schemas.PnlResponse,
    summary="Portfolio P&L over time",
    description=(
        "Returns daily P&L data points for the authenticated user's portfolio over a given period.\n\n"
        "**Period values**: `1d`, `7d`, `1m`, `3m`, `6m`, `1y`, `all`"
    ),
    responses={
        200: {"description": "P&L time series with totals"},
        401: {"description": "Unauthorized"},
    },
)
async def get_pnl(
    period: str = Query("7d", description="Lookback period (e.g. `7d`, `1m`, `1y`)", examples=["7d"]),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_pnl(current_user, period, db)


@router.get(
    "/stats",
    response_model=schemas.StatsResponse,
    summary="Portfolio summary stats",
    description="Returns high-level portfolio statistics: focused symbol, today's P&L, total value, and total cost.",
    responses={
        200: {"description": "Portfolio statistics"},
        401: {"description": "Unauthorized"},
    },
)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_stats(current_user, db)
