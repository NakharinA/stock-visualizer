"""
Seed script — creates demo data for local development.
Run: uv run python scripts/seed.py
"""
import asyncio
import sys
import os
from datetime import date, timedelta

# Ensure the backend/ root is on the path when run from the backend/ dir
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.core.security import hash_password
from app.models import PnlSnapshot, Position, User, WatchlistItem

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

DEMO_EMAIL = "demo@example.com"
DEMO_PASSWORD = "password123"

POSITIONS = [
    {"sym": "AAPL", "quantity": 50, "avg_cost": 150.00},
    {"sym": "TSLA", "quantity": 20, "avg_cost": 210.00},
    {"sym": "NVDA", "quantity": 15, "avg_cost": 450.00},
    {"sym": "MSFT", "quantity": 30, "avg_cost": 310.00},
]

PNL_DAYS = [300.00, -150.00, 620.00, 410.00, -80.00, 720.00, 1240.50]


async def seed():
    async with AsyncSessionLocal() as db:
        # Check if demo user already exists
        result = await db.execute(select(User).where(User.email == DEMO_EMAIL))
        user = result.scalars().first()

        if user:
            print(f"Demo user already exists (id={user.id}). Skipping seed.")
            return

        # Create user
        user = User(
            name="Demo User",
            email=DEMO_EMAIL,
            hashed_password=hash_password(DEMO_PASSWORD),
            avatar=None,
            focused_sym="AAPL",
        )
        db.add(user)
        await db.flush()
        print(f"Created user: {user.email} (id={user.id})")

        # Create positions
        for p in POSITIONS:
            pos = Position(user_id=user.id, sym=p["sym"], quantity=p["quantity"], avg_cost=p["avg_cost"])
            db.add(pos)
        print(f"Created {len(POSITIONS)} positions: {[p['sym'] for p in POSITIONS]}")

        # Create watchlist items
        for p in POSITIONS:
            item = WatchlistItem(user_id=user.id, sym=p["sym"])
            db.add(item)
        print(f"Created watchlist items: {[p['sym'] for p in POSITIONS]}")

        # Create 7 days of PnL snapshots
        today = date.today()
        for i, pnl in enumerate(PNL_DAYS):
            snap_date = today - timedelta(days=len(PNL_DAYS) - 1 - i)
            snap = PnlSnapshot(user_id=user.id, date=snap_date, pnl=pnl)
            db.add(snap)
        print(f"Created {len(PNL_DAYS)} PnL snapshots")

        await db.commit()
        print("\nSeed completed successfully!")
        print(f"  Login: {DEMO_EMAIL} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
