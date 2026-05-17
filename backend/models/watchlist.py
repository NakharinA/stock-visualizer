from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist"

    ticker = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
