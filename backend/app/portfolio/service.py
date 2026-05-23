import json
from datetime import date, timedelta

import yfinance as yf
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import cache_get, cache_set
from app.models import PnlSnapshot, Position, User
from app.portfolio.schemas import PnlPoint, PnlResponse, StatsResponse

PERIOD_DAYS = {"7d": 7, "30d": 30, "1y": 365}


async def _fetch_price(sym: str) -> dict:
    cached = await cache_get(f"price:{sym}")
    if cached:
        return json.loads(cached)

    try:
        info = yf.Ticker(sym).fast_info
        current = float(info.last_price or 0)
        previous = float(info.previous_close or 0)
    except Exception:
        current, previous = 0.0, 0.0

    data = {"current": current, "previous": previous}
    await cache_set(f"price:{sym}", json.dumps(data))
    return data


async def get_pnl(user: User, period: str, db: AsyncSession) -> PnlResponse:
    days = PERIOD_DAYS.get(period)
    if days is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid period")

    start_date = date.today() - timedelta(days=days - 1)

    result = await db.execute(
        select(PnlSnapshot)
        .where(PnlSnapshot.user_id == user.id, PnlSnapshot.date >= start_date)
        .order_by(PnlSnapshot.date)
    )
    snapshots = result.scalars().all()

    # Compute totalCost from positions
    pos_result = await db.execute(select(Position).where(Position.user_id == user.id))
    positions = pos_result.scalars().all()
    total_cost = sum(float(p.quantity) * float(p.avg_cost) for p in positions) or 1.0

    total_pnl = sum(float(s.pnl) for s in snapshots)
    total_pnl_pct = round(total_pnl / total_cost * 100, 4)

    data = [PnlPoint(date=str(s.date), pnl=float(s.pnl)) for s in snapshots]
    return PnlResponse(data=data, totalPnl=round(total_pnl, 2), totalPnlPct=total_pnl_pct)


async def get_stats(user: User, db: AsyncSession) -> StatsResponse:
    pos_result = await db.execute(select(Position).where(Position.user_id == user.id))
    positions = pos_result.scalars().all()

    total_value = 0.0
    total_cost = 0.0
    for pos in positions:
        price_data = await _fetch_price(pos.sym)
        total_value += float(pos.quantity) * price_data["current"]
        total_cost += float(pos.quantity) * float(pos.avg_cost)

    # Today's pnl snapshot
    today = date.today()
    snap_result = await db.execute(
        select(PnlSnapshot).where(PnlSnapshot.user_id == user.id, PnlSnapshot.date == today)
    )
    today_snap = snap_result.scalars().first()

    if today_snap is None:
        # Lazy-write today's snapshot based on unrealized gain
        today_pnl = round(total_value - total_cost, 2)
        new_snap = PnlSnapshot(user_id=user.id, date=today, pnl=today_pnl)
        db.add(new_snap)
        await db.flush()
    else:
        today_pnl = float(today_snap.pnl)

    today_pnl_pct = round(today_pnl / total_cost * 100, 4) if total_cost else 0.0

    # Focused symbol price
    focused_price: float | None = None
    if user.focused_sym:
        price_data = await _fetch_price(user.focused_sym)
        focused_price = price_data["current"]

    return StatsResponse(
        focusedSym=user.focused_sym,
        focusedPrice=focused_price,
        todayPnl=round(today_pnl, 2),
        todayPnlPct=today_pnl_pct,
        totalValue=round(total_value, 2),
        totalCost=round(total_cost, 2),
    )
