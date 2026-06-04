import logging
import yfinance as yf
import pandas as pd

logger = logging.getLogger(__name__)


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


def fetch_overview(symbols: list[str]) -> list[dict]:
    results = []
    for symbol in symbols:
        try:
            info = yf.Ticker(symbol).fast_info
            last_price = info.last_price
            previous_close = info.previous_close
            if last_price is None or previous_close is None or previous_close == 0:
                continue
            diff_value = last_price - previous_close
            diff_pct = (diff_value / previous_close) * 100
            results.append({
                "symbol": symbol.upper(),
                "price": round(float(last_price), 4),
                "diff_value": round(float(diff_value), 4),
                "diff_pct": round(float(diff_pct), 4),
            })
        except Exception as e:
            logger.warning("Could not fetch overview for %s: %s", symbol, e)
    return results


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
