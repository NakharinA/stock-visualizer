from pydantic import BaseModel


class OverviewItem(BaseModel):
    symbol: str
    price: float
    diff_value: float
    diff_pct: float
    name: str = ""
    sector: str = ""
    volume: float = 0.0
    spark: list[float] = []


class SearchResult(BaseModel):
    symbol: str
    name: str
