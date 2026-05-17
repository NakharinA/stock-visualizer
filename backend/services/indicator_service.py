import re
import pandas as pd
import pandas_ta as ta
from fastapi import HTTPException
from models.schemas import IndicatorRequest, IndicatorResponse, IndicatorSeries


def _nan_to_none(series: pd.Series) -> list:
    return [None if pd.isna(v) else round(float(v), 6) for v in series]


def _make_df(req: IndicatorRequest) -> pd.DataFrame:
    return pd.DataFrame({
        "open": req.data.open,
        "high": req.data.high,
        "low": req.data.low,
        "close": req.data.close,
        "volume": req.data.volume,
    })


def _eval_custom_formula(formula: str, df: pd.DataFrame, times: list[int]) -> IndicatorSeries:
    local_vars: dict = {
        "open": df["open"],
        "high": df["high"],
        "low": df["low"],
        "close": df["close"],
        "volume": df["volume"],
    }

    # Replace SMA(col,n), EMA(col,n), STD(col,n) with pre-computed variable names
    def replace_func(m: re.Match) -> str:
        func = m.group(1).upper()
        col = m.group(2).lower()
        n = int(m.group(3))
        var_name = f"_{func}_{col}_{n}"
        if col not in local_vars:
            raise HTTPException(status_code=400, detail=f"Unknown column '{col}' in formula")
        src = local_vars[col]
        if func == "SMA":
            local_vars[var_name] = src.rolling(n).mean()
        elif func == "EMA":
            local_vars[var_name] = src.ewm(span=n, adjust=False).mean()
        elif func == "STD":
            local_vars[var_name] = src.rolling(n).std()
        return var_name

    processed = re.sub(r"(SMA|EMA|STD)\((\w+),\s*(\d+)\)", replace_func, formula, flags=re.IGNORECASE)

    try:
        result = df.assign(**{k: v for k, v in local_vars.items() if k.startswith("_")}).eval(
            processed, local_dict=local_vars
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Formula error: {exc}")

    return IndicatorSeries(name="custom", time=times, values=_nan_to_none(result))


def compute_indicator(req: IndicatorRequest) -> IndicatorResponse:
    df = _make_df(req)
    times = req.data.time
    itype = req.type.upper()
    p = req.params

    if itype == "SMA":
        length = int(p.get("length", 20))
        result = ta.sma(df["close"], length=length)
        series = [IndicatorSeries(name=f"SMA_{length}", time=times, values=_nan_to_none(result))]

    elif itype == "EMA":
        length = int(p.get("length", 20))
        result = ta.ema(df["close"], length=length)
        series = [IndicatorSeries(name=f"EMA_{length}", time=times, values=_nan_to_none(result))]

    elif itype == "RSI":
        length = int(p.get("length", 14))
        result = ta.rsi(df["close"], length=length)
        series = [IndicatorSeries(name=f"RSI_{length}", time=times, values=_nan_to_none(result))]

    elif itype == "STOCHRSI":
        length = int(p.get("length", 14))
        rsi_length = int(p.get("rsi_length", 14))
        k = int(p.get("k", 3))
        d = int(p.get("d", 3))
        result = ta.stochrsi(df["close"], length=length, rsi_length=rsi_length, k=k, d=d)
        k_col = [c for c in result.columns if "STOCHRSIk" in c][0]
        d_col = [c for c in result.columns if "STOCHRSId" in c][0]
        series = [
            IndicatorSeries(name="StochRSI_K", time=times, values=_nan_to_none(result[k_col])),
            IndicatorSeries(name="StochRSI_D", time=times, values=_nan_to_none(result[d_col])),
        ]

    elif itype == "MACD":
        fast = int(p.get("fast", 12))
        slow = int(p.get("slow", 26))
        signal = int(p.get("signal", 9))
        result = ta.macd(df["close"], fast=fast, slow=slow, signal=signal)
        macd_col = [c for c in result.columns if c.startswith("MACD_")][0]
        hist_col = [c for c in result.columns if c.startswith("MACDh_")][0]
        sig_col = [c for c in result.columns if c.startswith("MACDs_")][0]
        series = [
            IndicatorSeries(name="MACD", time=times, values=_nan_to_none(result[macd_col])),
            IndicatorSeries(name="Signal", time=times, values=_nan_to_none(result[sig_col])),
            IndicatorSeries(name="Histogram", time=times, values=_nan_to_none(result[hist_col])),
        ]

    elif itype == "BB":
        length = int(p.get("length", 20))
        std = float(p.get("std", 2.0))
        result = ta.bbands(df["close"], length=length, std=std)
        upper_col = [c for c in result.columns if c.startswith("BBU_")][0]
        mid_col = [c for c in result.columns if c.startswith("BBM_")][0]
        lower_col = [c for c in result.columns if c.startswith("BBL_")][0]
        series = [
            IndicatorSeries(name="BB_Upper", time=times, values=_nan_to_none(result[upper_col])),
            IndicatorSeries(name="BB_Mid", time=times, values=_nan_to_none(result[mid_col])),
            IndicatorSeries(name="BB_Lower", time=times, values=_nan_to_none(result[lower_col])),
        ]

    elif itype == "ZSCORE":
        length = int(p.get("length", 20))
        mean = df["close"].rolling(length).mean()
        std = df["close"].rolling(length).std()
        result = (df["close"] - mean) / std
        series = [IndicatorSeries(name=f"ZScore_{length}", time=times, values=_nan_to_none(result))]

    elif itype == "CUSTOM":
        if not req.formula:
            raise HTTPException(status_code=400, detail="'formula' is required for CUSTOM type")
        series = [_eval_custom_formula(req.formula, df, times)]

    else:
        raise HTTPException(status_code=400, detail=f"Unknown indicator type '{req.type}'")

    return IndicatorResponse(type=itype, series=series)
