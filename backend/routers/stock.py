from typing import Literal

from fastapi import APIRouter, HTTPException

from models.stock import (
    FibonacciData,
    FVGBox,
    IndicatorsData,
    MACDData,
    OHLCVBar,
    StochRSIData,
    StockResponse,
)
from services.indicators import (
    calc_ema,
    calc_fvg,
    calc_fibonacci,
    calc_macd,
    calc_rsi,
    calc_stoch_rsi,
    calc_support_resistance,
)
from services.yfinance import fetch_ohlcv

router = APIRouter(prefix="/stock", tags=["stock"])


@router.get("/{symbol}", response_model=StockResponse)
def get_stock(
    symbol: str,
    period: Literal["ytd", "1y", "6mo", "3mo", "1mo", "1wk"] = "3mo",
) -> StockResponse:
    symbol = symbol.upper()
    try:
        df = fetch_ohlcv(symbol, period)
    except ValueError:
        raise HTTPException(status_code=404, detail="Symbol not found")

    ohlcv = [
        OHLCVBar(
            time=row.Date,
            open=float(row.Open),
            high=float(row.High),
            low=float(row.Low),
            close=float(row.Close),
            volume=float(row.Volume),
        )
        for row in df.itertuples(index=False)
    ]

    indicators = IndicatorsData(
        ema20=calc_ema(df, 20),
        ema50=calc_ema(df, 50),
        ema100=calc_ema(df, 100),
        ema200=calc_ema(df, 200),
        macd=MACDData(**calc_macd(df)),
        rsi=calc_rsi(df),
        stoch_rsi=StochRSIData(**calc_stoch_rsi(df)),
        fibonacci=FibonacciData(**calc_fibonacci(df)),
        support_resistance=calc_support_resistance(df),
        fvg=calc_fvg(df),
    )

    return StockResponse(symbol=symbol, period=period, ohlcv=ohlcv, indicators=indicators)
