import logging
from concurrent.futures import ThreadPoolExecutor

import yfinance as yf
import pandas as pd

logger = logging.getLogger(__name__)

# Number of trailing closes returned for the overview sparkline.
SPARK_POINTS = 30


def fetch_ohlcv(symbol: str, period: str) -> pd.DataFrame:
    df = yf.download(symbol, period=period, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data found for symbol: {symbol}")
    # Flatten MultiIndex columns present in newer yfinance versions
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.reset_index()
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    return df[["Date", "Open", "High", "Low", "Close", "Volume"]]


def _overview_row(symbol: str) -> dict | None:
    """Build a single overview row: quote + 30-point sparkline + name/sector/volume.

    Returns None when no usable price data is available so the symbol is skipped.
    Name/sector are best-effort: `.info` is slow and occasionally fails, so it is
    isolated and falls back to the bare symbol / empty string rather than dropping
    the whole row.
    """
    ticker = yf.Ticker(symbol)

    # Daily history drives price, daily change, sparkline and last volume.
    try:
        hist = ticker.history(period="3mo", auto_adjust=True)
    except Exception as e:
        logger.warning("Could not fetch history for %s: %s", symbol, e)
        return None
    if hist.empty or "Close" not in hist:
        return None

    closes = [float(c) for c in hist["Close"].tolist() if c == c]  # drop NaN
    if len(closes) < 2:
        return None

    last_price = closes[-1]
    previous_close = closes[-2]
    if previous_close == 0:
        return None
    diff_value = last_price - previous_close
    diff_pct = (diff_value / previous_close) * 100

    volume = 0.0
    if "Volume" in hist and not hist["Volume"].empty:
        last_vol = hist["Volume"].iloc[-1]
        if last_vol == last_vol:  # not NaN
            volume = float(last_vol)

    spark = [round(c, 4) for c in closes[-SPARK_POINTS:]]

    name, sector = "", ""
    try:
        info = ticker.info or {}
        name = info.get("shortName") or info.get("longName") or ""
        sector = info.get("sector") or ""
    except Exception as e:
        logger.debug("Could not fetch info for %s: %s", symbol, e)

    return {
        "symbol": symbol.upper(),
        "price": round(last_price, 4),
        "diff_value": round(diff_value, 4),
        "diff_pct": round(diff_pct, 4),
        "name": name or symbol.upper(),
        "sector": sector,
        "volume": volume,
        "spark": spark,
    }


def fetch_overview(symbols: list[str]) -> list[dict]:
    # yfinance calls are network-bound; fetch symbols concurrently and preserve order.
    with ThreadPoolExecutor(max_workers=min(8, len(symbols) or 1)) as pool:
        rows = list(pool.map(_overview_row, symbols))
    return [r for r in rows if r is not None]


def search_symbols(query: str, limit: int = 8) -> list[dict]:
    try:
        search = yf.Search(query, max_results=limit)
        quotes = search.quotes or []
    except Exception as e:
        logger.warning("Symbol search failed for %r: %s", query, e)
        return []
    results = []
    for quote in quotes:
        symbol = quote.get("symbol", "")
        name = quote.get("longname") or quote.get("shortname", "")
        if symbol:
            results.append({"symbol": symbol, "name": name})
    return results[:limit]
