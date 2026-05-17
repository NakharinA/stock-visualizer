# Phase 3 — Indicator API

## Goal
Implement a backend endpoint that computes technical indicators (preset and custom formula) on OHLCV data and returns a time-series result.

## Depends On
Phase 1 and Phase 2 must be complete.

## Install Additional Package
```bash
uv add numexpr
```

---

## 1. Update `models/schemas.py` — Add indicator schemas

Append these to the existing file:

```python
class OHLCVInput(BaseModel):
    time: list[int]
    open: list[float]
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[float]

class IndicatorParams(BaseModel):
    pass  # base class, params are free-form dict

class IndicatorRequest(BaseModel):
    type: str                        # e.g. "RSI", "STOCHRSI", "ZSCORE", "EMA", "SMA", "MACD", "BB", "CUSTOM"
    params: dict = {}                # e.g. {"length": 14}
    formula: str | None = None       # only used when type == "CUSTOM"
    data: OHLCVInput                 # the OHLCV series to compute on

class IndicatorSeries(BaseModel):
    name: str
    time: list[int]
    values: list[float | None]       # None for NaN padding

class IndicatorResponse(BaseModel):
    type: str
    series: list[IndicatorSeries]    # some indicators return multiple lines (e.g. MACD has 3)
```

---

## 2. `services/indicator_service.py`

```python
import pandas as pd
import pandas_ta as ta
import numpy as np
from models.schemas import IndicatorRequest, IndicatorResponse, IndicatorSeries
from fastapi import HTTPException

def _nan_to_none(series: pd.Series) -> list:
    return [None if pd.isna(v) else round(float(v), 6) for v in series]

def compute_indicator(req: IndicatorRequest) -> IndicatorResponse:
    # Build DataFrame from input
    df = pd.DataFrame({
        "open":   req.data.open,
        "high":   req.data.high,
        "low":    req.data.low,
        "close":  req.data.close,
        "volume": req.data.volume,
    }, index=pd.to_datetime(req.data.time, unit="s", utc=True))

    times = req.data.time
    p = req.params
    indicator_type = req.type.upper()

    try:
        if indicator_type == "SMA":
            length = int(p.get("length", 14))
            result = ta.sma(df["close"], length=length)
            series = [IndicatorSeries(name=f"SMA({length})", time=times, values=_nan_to_none(result))]

        elif indicator_type == "EMA":
            length = int(p.get("length", 14))
            result = ta.ema(df["close"], length=length)
            series = [IndicatorSeries(name=f"EMA({length})", time=times, values=_nan_to_none(result))]

        elif indicator_type == "RSI":
            length = int(p.get("length", 14))
            result = ta.rsi(df["close"], length=length)
            series = [IndicatorSeries(name=f"RSI({length})", time=times, values=_nan_to_none(result))]

        elif indicator_type == "STOCHRSI":
            length     = int(p.get("length", 14))
            rsi_length = int(p.get("rsi_length", 14))
            k          = int(p.get("k", 3))
            d          = int(p.get("d", 3))
            result = ta.stochrsi(df["close"], length=length, rsi_length=rsi_length, k=k, d=d)
            # pandas-ta returns a DataFrame with columns STOCHRSIk and STOCHRSId
            series = [
                IndicatorSeries(name=f"StochRSI K({k})", time=times, values=_nan_to_none(result.iloc[:, 0])),
                IndicatorSeries(name=f"StochRSI D({d})", time=times, values=_nan_to_none(result.iloc[:, 1])),
            ]

        elif indicator_type == "ZSCORE":
            length = int(p.get("length", 20))
            mean = df["close"].rolling(length).mean()
            std  = df["close"].rolling(length).std()
            result = (df["close"] - mean) / std
            series = [IndicatorSeries(name=f"Z-Score({length})", time=times, values=_nan_to_none(result))]

        elif indicator_type == "MACD":
            fast   = int(p.get("fast", 12))
            slow   = int(p.get("slow", 26))
            signal = int(p.get("signal", 9))
            result = ta.macd(df["close"], fast=fast, slow=slow, signal=signal)
            series = [
                IndicatorSeries(name=f"MACD({fast},{slow})", time=times, values=_nan_to_none(result.iloc[:, 0])),
                IndicatorSeries(name=f"Signal({signal})",    time=times, values=_nan_to_none(result.iloc[:, 1])),
                IndicatorSeries(name="Histogram",            time=times, values=_nan_to_none(result.iloc[:, 2])),
            ]

        elif indicator_type == "BB":
            length = int(p.get("length", 20))
            std    = float(p.get("std", 2.0))
            result = ta.bbands(df["close"], length=length, std=std)
            series = [
                IndicatorSeries(name="BB Upper", time=times, values=_nan_to_none(result.iloc[:, 0])),
                IndicatorSeries(name="BB Mid",   time=times, values=_nan_to_none(result.iloc[:, 1])),
                IndicatorSeries(name="BB Lower", time=times, values=_nan_to_none(result.iloc[:, 2])),
            ]

        elif indicator_type == "CUSTOM":
            if not req.formula:
                raise HTTPException(status_code=400, detail="Custom formula is required")
            series = [_eval_custom_formula(req.formula, df, times)]

        else:
            raise HTTPException(status_code=400, detail=f"Unknown indicator type: {indicator_type}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indicator computation error: {str(e)}")

    return IndicatorResponse(type=indicator_type, series=series)


def _eval_custom_formula(formula: str, df: pd.DataFrame, times: list[int]) -> IndicatorSeries:
    """
    Safely evaluate a user-defined formula string using pandas eval.
    Allowed variables: open, high, low, close, volume
    Allowed functions via @ prefix: SMA(series, n), EMA(series, n), STD(series, n)

    Example formulas:
      (close - SMA(close, 20)) / STD(close, 20)
      close / open - 1
      (high + low) / 2
    """
    # Replace SMA(...)/EMA(...)/STD(...) with helper calls the user can use via @-syntax trick.
    # For simplicity, pre-compute common rolling functions and make them available as local variables.
    import re

    local_vars = {
        "open":   df["open"],
        "high":   df["high"],
        "low":    df["low"],
        "close":  df["close"],
        "volume": df["volume"],
    }

    # Detect and replace SMA(col, n), EMA(col, n), STD(col, n) patterns
    def replace_func(match):
        func = match.group(1).upper()
        col  = match.group(2).strip()
        n    = int(match.group(3).strip())
        var_name = f"_{func}_{col}_{n}"
        src = local_vars.get(col, df["close"])
        if func == "SMA":
            local_vars[var_name] = src.rolling(n).mean()
        elif func == "EMA":
            local_vars[var_name] = src.ewm(span=n, adjust=False).mean()
        elif func == "STD":
            local_vars[var_name] = src.rolling(n).std()
        return var_name

    processed = re.sub(r'(SMA|EMA|STD)\((\w+)\s*,\s*(\d+)\)', replace_func, formula, flags=re.IGNORECASE)

    try:
        result = df.eval(processed, local_dict=local_vars)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Formula evaluation error: {str(e)}")

    return IndicatorSeries(name=f"Custom: {formula[:40]}", time=times, values=_nan_to_none(result))
```

---

## 3. `routers/indicator.py`

```python
from fastapi import APIRouter
from models.schemas import IndicatorRequest, IndicatorResponse
from services.indicator_service import compute_indicator

router = APIRouter()

@router.post("/compute", response_model=IndicatorResponse)
def compute(req: IndicatorRequest):
    return compute_indicator(req)
```

---

## 4. Update `main.py` — Register indicator router

Add after the stock router line:
```python
from routers import indicator
app.include_router(indicator.router, prefix="/indicator", tags=["indicator"])
```

---

## Preset Indicator Reference

| Type | Required Params | Returns |
|------|----------------|---------|
| `SMA` | `length` (default 14) | 1 series |
| `EMA` | `length` (default 14) | 1 series |
| `RSI` | `length` (default 14) | 1 series |
| `STOCHRSI` | `length`, `rsi_length`, `k`, `d` | 2 series (K, D) |
| `ZSCORE` | `length` (default 20) | 1 series |
| `MACD` | `fast`, `slow`, `signal` | 3 series |
| `BB` | `length`, `std` | 3 series (upper, mid, lower) |
| `CUSTOM` | — | `formula` string required | 1 series |

---

## Example Request Body (POST /indicator/compute)

```json
{
  "type": "RSI",
  "params": { "length": 14 },
  "data": {
    "time":   [1700000000, 1700086400],
    "open":   [150.0, 151.0],
    "high":   [152.0, 153.0],
    "low":    [149.0, 150.0],
    "close":  [151.0, 152.0],
    "volume": [1000000, 1200000]
  }
}
```

---

## Acceptance Criteria
- [ ] `POST /indicator/compute` with type `RSI` returns a series of values
- [ ] `POST /indicator/compute` with type `CUSTOM` and formula `(close - SMA(close,20)) / STD(close,20)` returns z-score-like values
- [ ] Unknown type returns HTTP 400
- [ ] Bad formula returns HTTP 400 with a descriptive message
