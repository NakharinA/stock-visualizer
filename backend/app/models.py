import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Float

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    avatar: Mapped[str | None] = mapped_column(String, nullable=True)
    focused_sym: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    positions: Mapped[list["Position"]] = relationship("Position", back_populates="user", lazy="selectin")
    pnl_snapshots: Mapped[list["PnlSnapshot"]] = relationship("PnlSnapshot", back_populates="user")
    watchlist_items: Mapped[list["WatchlistItem"]] = relationship("WatchlistItem", back_populates="user")


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    sym: Mapped[str] = mapped_column(String, nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(18, 6), nullable=False)
    avg_cost: Mapped[float] = mapped_column(Numeric(18, 6), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="positions")


class PnlSnapshot(Base):
    __tablename__ = "pnl_snapshots"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_pnl_user_date"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    pnl: Mapped[float] = mapped_column(Numeric(18, 2), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="pnl_snapshots")


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"
    __table_args__ = (UniqueConstraint("user_id", "sym", name="uq_watchlist_user_sym"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    sym: Mapped[str] = mapped_column(String, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="watchlist_items")


class WatchlistCache(Base):
    __tablename__ = "watchlist_cache"

    sym: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    change: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    change_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
