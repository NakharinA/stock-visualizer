import json
from typing import Optional

import pandas as pd
import pandas_ta as ta  # noqa: F401 — registers df.ta accessor
import yfinance as yf
from fastapi import HTTPException, status

from app.core.redis import cache_get, cache_set
from app.stocks.schemas import Bar, CandlesResponse, IndicatorsResponse, SearchResponse, SearchResult

# yfinance doesn't support 4h interval; use 60m as closest valid option for 1Y
TIMEFRAME_MAP: dict[str, tuple[str, str]] = {
    "1D": ("1m", "1d"),
    "1W": ("5m", "5d"),
    "1M": ("30m", "1mo"),
    "3M": ("60m", "3mo"),
    "1Y": ("60m", "1y"),
}


def _df_to_bars(df: pd.DataFrame) -> list[Bar]:
    bars = []
    for ts, row in df.iterrows():
        # Convert tz-aware timestamp to UTC unix seconds
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

    cache_key = f"candles:{sym.upper()}:{timeframe}"
    cached = await cache_get(cache_key)

    if cached:
        raw_bars = [Bar(**b) for b in json.loads(cached)]
    else:
        interval, period = TIMEFRAME_MAP[timeframe]
        try:
            df = yf.Ticker(sym.upper()).history(interval=interval, period=period)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

        if df.empty:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Symbol not found")

        raw_bars = _df_to_bars(df)
        await cache_set(cache_key, json.dumps([b.model_dump() for b in raw_bars]))

    # Apply filters
    bars = raw_bars
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
            # Skip indicator on computation error — don't break entire response
            pass

    return IndicatorsResponse(sym=sym.upper(), timeframe=timeframe, indicators=result)
