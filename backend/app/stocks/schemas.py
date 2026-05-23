from pydantic import BaseModel


class Bar(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float
    volume: int


class CandlesResponse(BaseModel):
    sym: str
    timeframe: str
    bars: list[Bar]


class SearchResult(BaseModel):
    sym: str
    name: str
    exchange: str
    sector: str


class SearchResponse(BaseModel):
    results: list[SearchResult]


class IndicatorsResponse(BaseModel):
    sym: str
    timeframe: str
    indicators: dict
