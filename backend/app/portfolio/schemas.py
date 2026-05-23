from pydantic import BaseModel


class PnlPoint(BaseModel):
    date: str
    pnl: float


class PnlResponse(BaseModel):
    data: list[PnlPoint]
    totalPnl: float
    totalPnlPct: float


class StatsResponse(BaseModel):
    focusedSym: str | None
    focusedPrice: float | None
    todayPnl: float
    todayPnlPct: float
    totalValue: float
    totalCost: float
