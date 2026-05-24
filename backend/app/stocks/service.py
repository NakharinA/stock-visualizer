from typing import Optional

import pandas as pd
import pandas_ta as ta  # noqa: F401 — registers df.ta accessor
import yfinance as yf
from fastapi import HTTPException, status

from app.stocks.schemas import Bar, CandlesResponse, IndicatorsResponse, SearchResponse, SearchResult

# Each candle is 1 hour. Period covers enough history per timeframe.
TIMEFRAME_MAP: dict[str, tuple[str, str]] = {
    "1D":  ("1h", "5d"),
    "1W":  ("1h", "1mo"),
    "1M":  ("1h", "3mo"),
    "3M":  ("1h", "6mo"),
    "1Y":  ("1h", "2y"),
}


def _df_to_bars(df: pd.DataFrame) -> list[Bar]:
    bars = []
    for ts, row in df.iterrows():
        if hasattr(ts, "timestamp"):
            unix = int(ts.timestamp())
        else:
            unix = int(pd.Timestamp(ts).timestamp())
        bars.append(
            Bar(
                time=unix,
                open=round(float(row["Open"]), 6),
                high=round(float(row["High"]), 6),
                low=round(float(row["Low"]), 6),
                close=round(float(row["Close"]), 6),
                volume=int(row["Volume"]),
            )
        )
    return bars


async def get_candles(
    sym: str,
    timeframe: str,
    limit: Optional[int] = None,
    to: Optional[int] = None,
) -> CandlesResponse:
    if timeframe not in TIMEFRAME_MAP:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timeframe")

    interval, period = TIMEFRAME_MAP[timeframe]
    try:
        df = yf.Ticker(sym.upper()).history(interval=interval, period=period)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    if df.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not found")

    bars = _df_to_bars(df)

    if to is not None:
        bars = [b for b in bars if b.time <= to]
    if limit is not None:
        bars = bars[-limit:]

    return CandlesResponse(sym=sym.upper(), timeframe=timeframe, bars=bars)


async def search_stocks(query: str, limit: int = 20) -> SearchResponse:
    try:
        results_raw = yf.Search(query, max_results=limit).quotes
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

    results = []
    for item in results_raw[:limit]:
        results.append(
            SearchResult(
                sym=item.get("symbol", ""),
                name=item.get("longname") or item.get("shortname") or "",
                exchange=item.get("exchange", ""),
                sector=item.get("sector") or "",
            )
        )
    return SearchResponse(results=results)


async def get_indicators(
    sym: str,
    timeframe: str,
    indicators: list[str],
) -> IndicatorsResponse:
    candles_resp = await get_candles(sym, timeframe)
    bars = candles_resp.bars

    if not bars:
        return IndicatorsResponse(sym=sym.upper(), timeframe=timeframe, indicators={})

    df = pd.DataFrame([b.model_dump() for b in bars])
    df = df.rename(columns={"time": "Time", "open": "Open", "high": "High", "low": "Low", "close": "Close", "volume": "Volume"})
    df.set_index("Time", inplace=True)

    result: dict = {}

    def series_to_list(series: pd.Series) -> list[dict]:
        out = []
        for idx, val in series.dropna().items():
            out.append({"time": int(idx), "value": round(float(val), 6)})
        return out

    for ind in indicators:
        ind = ind.strip().upper()
        try:
            if ind == "EMA20":
                result["EMA20"] = series_to_list(df.ta.ema(length=20))
            elif ind == "EMA50":
                result["EMA50"] = series_to_list(df.ta.ema(length=50))
            elif ind == "BB":
                bb = df.ta.bbands()
                if bb is not None:
                    result["BB"] = {
                        "upper": series_to_list(bb.filter(like="BBU").iloc[:, 0]),
                        "middle": series_to_list(bb.filter(like="BBM").iloc[:, 0]),
                        "lower": series_to_list(bb.filter(like="BBL").iloc[:, 0]),
                    }
            elif ind == "VOLUME":
                result["VOLUME"] = series_to_list(df["Volume"].astype(float))
            elif ind == "RSI":
                result["RSI"] = series_to_list(df.ta.rsi())
            elif ind == "MACD":
                macd = df.ta.macd()
                if macd is not None:
                    result["MACD"] = {
                        "macd": series_to_list(macd.filter(like="MACD_").iloc[:, 0]),
                        "signal": series_to_list(macd.filter(like="MACDs_").iloc[:, 0]),
                        "histogram": series_to_list(macd.filter(like="MACDh_").iloc[:, 0]),
                    }
            elif ind == "STOCH":
                stoch = df.ta.stoch()
                if stoch is not None:
                    result["STOCH"] = series_to_list(stoch.filter(like="STOCHk_").iloc[:, 0])
            elif ind == "CCI":
                result["CCI"] = series_to_list(df.ta.cci())
        except Exception:
            pass

    return IndicatorsResponse(sym=sym.upper(), timeframe=timeframe, indicators=result)
