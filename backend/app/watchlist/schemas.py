from pydantic import BaseModel


class WatchlistItemSchema(BaseModel):
    sym: str
    name: str
    price: float
    change: float
    changePct: float


class WatchlistResponse(BaseModel):
    items: list[WatchlistItemSchema]


class AddWatchlistRequest(BaseModel):
    sym: str
