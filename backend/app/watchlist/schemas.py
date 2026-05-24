from pydantic import BaseModel, Field


class WatchlistItemSchema(BaseModel):
    sym: str = Field(..., description="Ticker symbol", example="TSLA")
    name: str = Field(..., description="Company name", example="Tesla Inc.")
    price: float = Field(..., description="Current price", example=245.30)
    change: float = Field(..., description="Price change today", example=3.20)
    changePct: float = Field(..., description="Price change percentage today", example=1.32)


class WatchlistResponse(BaseModel):
    items: list[WatchlistItemSchema]


class AddWatchlistRequest(BaseModel):
    sym: str = Field(..., description="Ticker symbol to add", example="TSLA")
