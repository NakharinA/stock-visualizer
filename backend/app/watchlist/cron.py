"""Hourly cron job: fetch price data for all watchlist symbols and upsert into watchlist_cache."""
import logging

import yfinance as yf
from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert

from app.core.database import AsyncSessionLocal
from app.models import WatchlistCache, WatchlistItem

logger = logging.getLogger(__name__)


async def refresh_watchlist_cache() -> None:
    """Fetch latest price data for every unique sym in watchlist_items and upsert into watchlist_cache."""
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(select(WatchlistItem.sym).distinct())
            syms = [row[0] for row in result.all()]

            if not syms:
                logger.info("watchlist_cache: no symbols to refresh")
                return

            logger.info("watchlist_cache: refreshing %d symbols: %s", len(syms), syms)

            for sym in syms:
                try:
                    ticker = yf.Ticker(sym)
                    info = ticker.info
                    name = info.get("longName") or info.get("shortName") or sym

                    fast = ticker.fast_info
                    current = float(fast.last_price or 0)
                    previous = float(fast.previous_close or 0)
                    change = round(current - previous, 4)
                    change_pct = round(change / previous * 100, 4) if previous else 0.0

                    stmt = (
                        insert(WatchlistCache)
                        .values(
                            sym=sym,
                            name=name,
                            price=round(current, 4),
                            change=change,
                            change_pct=change_pct,
                            updated_at=text("now()"),
                        )
                        .on_conflict_do_update(
                            index_elements=["sym"],
                            set_={
                                "name": name,
                                "price": round(current, 4),
                                "change": change,
                                "change_pct": change_pct,
                                "updated_at": text("now()"),
                            },
                        )
                    )
                    await session.execute(stmt)
                    logger.debug("watchlist_cache: updated %s price=%.4f", sym, current)

                except Exception as exc:
                    logger.warning("watchlist_cache: failed to update %s: %s", sym, exc)

            await session.commit()
            logger.info("watchlist_cache: refresh complete")

        except Exception as exc:
            await session.rollback()
            logger.error("watchlist_cache: refresh failed: %s", exc)
