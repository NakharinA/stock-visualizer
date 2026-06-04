from pydantic import BaseModel


class OHLCVBar(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class EMAPoint(BaseModel):
    time: str
    value: float


class MACDData(BaseModel):
    macd: list[EMAPoint]
    signal: list[EMAPoint]
    histogram: list[EMAPoint]


class StochRSIData(BaseModel):
    k: list[EMAPoint]
    d: list[EMAPoint]


class FibonacciData(BaseModel):
    high: float
    low: float
    levels: dict[str, float]


class FVGBox(BaseModel):
    type: str
    top: float
    bottom: float
    time: str


class IndicatorsData(BaseModel):
    ema20: list[EMAPoint]
    ema50: list[EMAPoint]
    ema100: list[EMAPoint]
    ema200: list[EMAPoint]
    macd: MACDData
    rsi: list[EMAPoint]
    stoch_rsi: StochRSIData
    fibonacci: FibonacciData
    support_resistance: list[float]
    fvg: list[FVGBox]


class StockResponse(BaseModel):
    symbol: str
    period: str
    ohlcv: list[OHLCVBar]
    indicators: IndicatorsData
