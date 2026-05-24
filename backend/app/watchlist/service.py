import uuid

import yfinance as yf
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User, WatchlistItem
from app.watchlist.schemas import WatchlistItemSchema, WatchlistResponse


def _fetch_price_data(sym: str) -> dict:
    try:
        fast = yf.Ticker(sym.upper()).fast_info
        current = float(fast.last_price or 0)
        previous = float(fast.previous_close or 0)
    except Exception:
        current, previous = 0.0, 0.0
    return {"current": current, "previous": previous}


def _build_item(sym: str, name: str, price_data: dict) -> WatchlistItemSchema:
    current = price_data["current"]
    previous = price_data["previous"]
    change = round(current - previous, 4)
    change_pct = round(change / previous * 100, 4) if previous else 0.0
    return WatchlistItemSchema(
        sym=sym,
        name=name,
        price=round(current, 4),
        change=change,
        changePct=change_pct,
    )


async def get_watchlist(user: User, db: AsyncSession) -> WatchlistResponse:
    result = await db.execute(select(WatchlistItem).where(WatchlistItem.user_id == user.id))
    items = result.scalars().all()

    response_items = []
    for item in items:
        try:
            ticker = yf.Ticker(item.sym.upper())
            info = ticker.info
            name = info.get("longName") or info.get("shortName") or item.sym
        except Exception:
            name = item.sym

        price_data = _fetch_price_data(item.sym)
        response_items.append(_build_item(item.sym, name, price_data))

    return WatchlistResponse(items=response_items)


async def add_to_watchlist(user: User, sym: str, db: AsyncSession) -> WatchlistItemSchema:
    sym = sym.upper()

    existing = await db.execute(
        select(WatchlistItem).where(WatchlistItem.user_id == user.id, WatchlistItem.sym == sym)
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Symbol already in watchlist",
        )

    try:
        info = yf.Ticker(sym).info
        if not info or not info.get("symbol"):
            raise ValueError("no data")
        name = info.get("longName") or info.get("shortName") or sym
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Symbol not found",
        )

    new_item = WatchlistItem(id=str(uuid.uuid4()), user_id=user.id, sym=sym)
    db.add(new_item)
    await db.flush()

    price_data = _fetch_price_data(sym)
    return _build_item(sym, name, price_data)


async def remove_from_watchlist(user: User, sym: str, db: AsyncSession) -> None:
    sym = sym.upper()
    result = await db.execute(
        select(WatchlistItem).where(WatchlistItem.user_id == user.id, WatchlistItem.sym == sym)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not in watchlist")

    await db.delete(item)
