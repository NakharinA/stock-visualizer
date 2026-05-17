## Phase 3 — Indicator API

### Depends On: Phase 1 + 2

### Extra package
uv add numexpr

### models/schemas.py  (append to existing)
- OHLCVInput: time/open/high/low/close/volume as list[...]
- IndicatorRequest: type(str), params(dict={}), formula(str|None), data(OHLCVInput)
- IndicatorSeries: name(str), time(list[int]), values(list[float|None])
- IndicatorResponse: type(str), series(list[IndicatorSeries])

### services/indicator_service.py
- compute_indicator(req) → IndicatorResponse
  Dispatch by req.type.upper():
  SMA / EMA / RSI → single series via pandas-ta
  STOCHRSI → 2 series (K, D)
  ZSCORE → rolling mean/std manually
  MACD → 3 series (MACD line, signal, histogram)
  BB → 3 series (upper, mid, lower)
  CUSTOM → _eval_custom_formula()
  Unknown type → 400
- _nan_to_none(series) → [None if NaN else round(v,6)]
- _eval_custom_formula(formula, df, times) → IndicatorSeries
  - regex replace SMA(col,n)/EMA(col,n)/STD(col,n) → pre-computed local vars
  - df.eval(processed, local_dict=local_vars)
  - bad formula → 400 with descriptive message
  Security: local_dict restricts eval to open/high/low/close/volume + computed rolling vars only

### routers/indicator.py
- POST /compute body: IndicatorRequest → IndicatorResponse

### main.py changes
- Add: from routers import indicator
- Add: app.include_router(indicator.router, prefix="/indicator", tags=["indicator"])

### Acceptance
POST /indicator/compute {type:"RSI"} → series of values
POST /indicator/compute {type:"CUSTOM", formula:"(close-SMA(close,20))/STD(close,20)"} → values
Unknown type → 400, bad formula → 400