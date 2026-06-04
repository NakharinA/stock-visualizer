from pydantic import BaseModel


class OverviewItem(BaseModel):
    symbol: str
    price: float
    diff_value: float
    diff_pct: float


class SearchResult(BaseModel):
    symbol: str
    name: str
