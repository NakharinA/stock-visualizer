# UI Flows — Phase 07: Chart Indicator Overlays

## Toggle Panel Layout

```
┌─────────────────────────────────────────────┐
│ EMA Lines                                   │
│  □ EMA 20    □ EMA 50                       │
│  □ EMA 100   □ EMA 200                      │
│                                             │
│ Chart Overlays                              │
│  □ Fibonacci                                │
│  □ Support / Resistance                     │
│  □ Fair Value Gaps                          │
│                                             │
│ Subpanel Indicators                         │
│  □ MACD  □ RSI  □ Stoch RSI                 │
└─────────────────────────────────────────────┘
```

The toggle panel sits below the chart canvas (and above the subpanel added in Phase 08). It is always visible regardless of subpanel state.

---

## Flow 1 — Enable EMA Line

1. User checks "EMA 20" checkbox
2. EMA 20 line appears on the candlestick chart (blue line)
3. Checkbox remains checked
4. No API call is made — data was already in the stockData response

---

## Flow 2 — Disable EMA Line

1. User unchecks "EMA 20" checkbox
2. EMA 20 line disappears from the chart instantly
3. Other EMA lines (if enabled) remain unaffected

---

## Flow 3 — Enable Fibonacci

1. User checks "Fibonacci"
2. 7 horizontal dashed lines appear on the chart at the computed price levels
3. Each line is labeled with its ratio: "0", "0.236", "0.382", "0.5", "0.618", "0.786", "1.0"

---

## Flow 4 — Enable FVG

1. User checks "Fair Value Gaps"
2. Semi-transparent rectangles appear on the chart:
   - Bullish FVGs: green fill (~10% opacity)
   - Bearish FVGs: red fill (~10% opacity)
3. Rectangles span the full horizontal width of their respective time range (from the candle time to the right edge)

---

## Flow 5 — Period Switch with Overlays Active

1. User has EMA 20 and Fibonacci enabled
2. User switches from 3M to 1Y period
3. New stock data is fetched (all indicator data re-fetched with it)
4. Chart re-renders with 1Y OHLCV data
5. EMA 20 and Fibonacci are automatically re-applied to the new data using the same toggle state
6. Other indicator checkboxes remain in their current state
