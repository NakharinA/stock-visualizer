import numpy as np
import pandas as pd


def _points(dates: pd.Series, values: pd.Series) -> list[dict]:
    """Zip date strings and float values into EMAPoint dicts, dropping NaN."""
    return [
        {"time": str(d)[:10], "value": float(v)}
        for d, v in zip(dates, values)
        if pd.notna(v)
    ]


def calc_ema(df: pd.DataFrame, period: int) -> list[dict]:
    # min_periods=period ensures early unstable values are excluded
    ema = df["Close"].ewm(span=period, adjust=False, min_periods=period).mean()
    mask = ema.notna()
    return _points(df["Date"][mask], ema[mask])


def calc_macd(df: pd.DataFrame) -> dict:
    close = df["Close"]
    ema12 = close.ewm(span=12, adjust=False, min_periods=12).mean()
    ema26 = close.ewm(span=26, adjust=False, min_periods=26).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False, min_periods=9).mean()
    histogram = macd_line - signal_line
    mask = macd_line.notna() & signal_line.notna() & histogram.notna()
    dates = df["Date"][mask]
    return {
        "macd": _points(dates, macd_line[mask]),
        "signal": _points(dates, signal_line[mask]),
        "histogram": _points(dates, histogram[mask]),
    }


def calc_rsi(df: pd.DataFrame, period: int = 14) -> list[dict]:
    close = df["Close"]
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    # Wilder's smoothing: com = period - 1
    avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    mask = rsi.notna()
    return _points(df["Date"][mask], rsi[mask])


def calc_stoch_rsi(
    df: pd.DataFrame,
    rsi_period: int = 14,
    stoch_period: int = 14,
    k_smooth: int = 3,
    d_smooth: int = 3,
) -> dict:
    close = df["Close"]
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=rsi_period - 1, adjust=False).mean()
    avg_loss = loss.ewm(com=rsi_period - 1, adjust=False).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))

    rsi_min = rsi.rolling(stoch_period).min()
    rsi_max = rsi.rolling(stoch_period).max()
    denom = (rsi_max - rsi_min).replace(0, np.nan)
    stoch = (rsi - rsi_min) / denom
    k = stoch.rolling(k_smooth).mean() * 100
    d = k.rolling(d_smooth).mean()
    mask = k.notna() & d.notna()
    dates = df["Date"][mask]
    return {
        "k": _points(dates, k[mask]),
        "d": _points(dates, d[mask]),
    }


def calc_fibonacci(df: pd.DataFrame) -> dict:
    high = float(df["Close"].max())
    low = float(df["Close"].min())
    ratios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0]
    levels = {str(r): round(low + (high - low) * r, 4) for r in ratios}
    return {"high": high, "low": low, "levels": levels}


def calc_support_resistance(df: pd.DataFrame, order: int = 5) -> list[float]:
    prices = df["Close"].dropna().values
    n = len(prices)
    if n < order * 2 + 1:
        return []
    levels: list[float] = []
    for i in range(order, n - order):
        window = prices[i - order : i + order + 1]
        if prices[i] == window.max() or prices[i] == window.min():
            levels.append(float(prices[i]))
    if not levels:
        return []
    levels.sort()
    clusters: list[list[float]] = [[levels[0]]]
    for price in levels[1:]:
        mean = float(np.mean(clusters[-1]))
        if mean > 0 and (price - mean) / mean <= 0.005:
            clusters[-1].append(price)
        else:
            clusters.append([price])
    return sorted(float(np.mean(c)) for c in clusters)


def calc_fvg(df: pd.DataFrame) -> list[dict]:
    highs = df["High"].values
    lows = df["Low"].values
    dates = df["Date"].values
    fvgs = []
    for i in range(2, len(df)):
        if lows[i] > highs[i - 2]:
            fvgs.append({
                "type": "bullish",
                "top": float(lows[i]),
                "bottom": float(highs[i - 2]),
                "time": str(dates[i])[:10],
            })
        elif highs[i] < lows[i - 2]:
            fvgs.append({
                "type": "bearish",
                "top": float(lows[i - 2]),
                "bottom": float(highs[i]),
                "time": str(dates[i])[:10],
            })
    return fvgs
