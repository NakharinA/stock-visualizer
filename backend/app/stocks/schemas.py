from pydantic import BaseModel, Field


class Bar(BaseModel):
    time: int = Field(..., description="Unix timestamp (seconds)", example=1700000000)
    open: float = Field(..., description="Opening price", example=182.50)
    high: float = Field(..., description="High price", example=185.00)
    low: float = Field(..., description="Low price", example=181.00)
    close: float = Field(..., description="Closing price", example=184.20)
    volume: int = Field(..., description="Trading volume", example=52341200)


class CandlesResponse(BaseModel):
    sym: str = Field(..., description="Stock symbol", example="AAPL")
    timeframe: str = Field(..., description="Candle timeframe", example="1D")
    bars: list[Bar]


class SearchResult(BaseModel):
    sym: str = Field(..., description="Ticker symbol", example="AAPL")
    name: str = Field(..., description="Company name", example="Apple Inc.")
    exchange: str = Field(..., description="Exchange name", example="NASDAQ")
    sector: str = Field(..., description="Sector", example="Technology")


class SearchResponse(BaseModel):
    results: list[SearchResult]


class IndicatorsResponse(BaseModel):
    sym: str = Field(..., description="Stock symbol", example="AAPL")
    timeframe: str = Field(..., description="Candle timeframe", example="1D")
    indicators: dict = Field(..., description="Indicator name → values mapping", example={"SMA": [183.1, 184.0]})
