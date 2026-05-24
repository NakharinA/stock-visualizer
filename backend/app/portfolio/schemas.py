from pydantic import BaseModel, Field


class PnlPoint(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format", example="2024-05-20")
    pnl: float = Field(..., description="Profit and loss value for the day", example=120.50)


class PnlResponse(BaseModel):
    data: list[PnlPoint]
    totalPnl: float = Field(..., description="Total P&L over the period", example=850.00)
    totalPnlPct: float = Field(..., description="Total P&L as a percentage", example=4.25)


class StatsResponse(BaseModel):
    focusedSym: str | None = Field(None, description="Currently focused stock symbol", example="AAPL")
    focusedPrice: float | None = Field(None, description="Current price of the focused symbol", example=184.20)
    todayPnl: float = Field(..., description="Today's P&L", example=42.10)
    todayPnlPct: float = Field(..., description="Today's P&L as a percentage", example=0.21)
    totalValue: float = Field(..., description="Total portfolio market value", example=20850.00)
    totalCost: float = Field(..., description="Total portfolio cost basis", example=20000.00)
