from pydantic import BaseModel


class Candle(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: float


class StockResponse(BaseModel):
    ticker: str
    interval: str
    period: str
    candles: list[Candle]


class SearchResult(BaseModel):
    symbol: str
    name: str
    exchange: str


class SearchResponse(BaseModel):
    results: list[SearchResult]


class OHLCVInput(BaseModel):
    time: list[int]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[float]


class IndicatorRequest(BaseModel):
    type: str
    params: dict = {}
    formula: str | None = None
    data: OHLCVInput


class IndicatorSeries(BaseModel):
    name: str
    time: list[int]
    values: list[float | None]


class IndicatorResponse(BaseModel):
    type: str
    series: list[IndicatorSeries]


class WatchlistAddRequest(BaseModel):
    ticker: str
    name: str | None = None


class WatchlistItemResponse(BaseModel):
    ticker: str
    name: str | None
    added_at: str
    price: float | None = None
    change: float | None = None
    change_pct: float | None = None

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    items: list[WatchlistItemResponse]
