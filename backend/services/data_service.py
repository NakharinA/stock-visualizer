from fastapi import HTTPException
import yfinance as yf
from models.schemas import Candle

VALID_INTERVALS = ["1m", "5m", "15m", "30m", "1h", "1d", "1wk", "1mo"]
VALID_PERIODS = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"]


def fetch_ohlcv(ticker: str, interval: str, period: str) -> list[Candle]:
    if interval not in VALID_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval '{interval}'. Valid: {VALID_INTERVALS}")
    if period not in VALID_PERIODS:
        raise HTTPException(status_code=400, detail=f"Invalid period '{period}'. Valid: {VALID_PERIODS}")

    df = yf.Ticker(ticker).history(interval=interval, period=period)

    if df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker}'")

    candles = []
    for ts, row in df.iterrows():
        candles.append(Candle(
            time=int(ts.timestamp()),
            open=float(row["Open"]),
            high=float(row["High"]),
            low=float(row["Low"]),
            close=float(row["Close"]),
            volume=float(row["Volume"]),
        ))
    return candles


def search_tickers(query: str) -> list[dict]:
    quotes = yf.Search(query, max_results=8).quotes
    results = []
    for q in quotes:
        results.append({
            "symbol": q.get("symbol", ""),
            "name": q.get("longname") or q.get("shortname") or "",
            "exchange": q.get("exchange", ""),
        })
    return results
