# UI Flows — Phase 08: Indicator Subpanel

## Full Layout (Subpanel Visible)

```
[Symbol Search Bar]
[YTD] [1Y] [6M] [3M*] [1M] [1W]

┌─────────────────────────────────────────────┐
│                                             │
│         Candlestick Chart                   │
│         (~75-80% of viewport height)        │
│                                             │
└─────────────────────────────────────────────┘

[ MACD* ] [ RSI ] [ Stoch RSI ]   ← tab switcher (only when subpanel visible)

┌─────────────────────────────────────────────┐
│   Active subpanel chart (~20-22vh)          │
└─────────────────────────────────────────────┘

[ IndicatorToggle panel ]
```

---

## Collapsed Layout (All Subpanel Indicators Off)

```
[Symbol Search Bar]
[YTD] [1Y] [6M] [3M*] [1M] [1W]

┌─────────────────────────────────────────────┐
│                                             │
│         Candlestick Chart                   │
│         (expands to full available height)  │
│                                             │
└─────────────────────────────────────────────┘

[ IndicatorToggle panel ]
```

---

## Flow 1 — Enable MACD (Subpanel Appears)

1. All subpanel indicators are off → subpanel is hidden, main chart is full height
2. User checks "MACD" in the IndicatorToggle
3. Subpanel appears below the main chart
4. Main chart shrinks to ~75-80vh
5. MACD tab is automatically selected (first enabled indicator)
6. MACD subpanel chart renders with MACD line, signal line, and histogram

---

## Flow 2 — Switch Tab

1. MACD and RSI are both enabled; MACD tab is active
2. User clicks the "RSI" tab
3. MACD chart is hidden; RSI chart is shown
4. RSI line with 70/30 reference lines is visible

---

## Flow 3 — Clicking Unchecked Tab

1. Only MACD is enabled; RSI and Stoch RSI are unchecked
2. User clicks the "RSI" tab
3. The RSI tab becomes active but shows a placeholder: "Enable RSI in the indicator panel to view this chart"
4. No chart is rendered

---

## Flow 4 — Disable Last Enabled Subpanel Indicator

1. Only RSI is enabled; RSI tab is active and showing the subpanel
2. User unchecks "RSI" in IndicatorToggle
3. Subpanel collapses immediately
4. Tab bar disappears
5. Main chart expands to fill full height

---

## Flow 5 — Period Switch with Subpanel Open

1. MACD is enabled and showing
2. User switches from 3M to 6M period
3. New data is fetched; both OHLCV and MACD data are refreshed
4. Main chart and MACD subpanel both update with the new data
5. Active tab selection is preserved (still MACD)

---

## MACD Chart Details

```
┌─────────────────────────────────────────────┐
│  MACD line (blue) + Signal line (orange)    │
│  Histogram bars: green (positive),          │
│                  red (negative)             │
└─────────────────────────────────────────────┘
```

## RSI Chart Details

```
┌─────────────────────────────────────────────┐
│  RSI line (purple)                          │
│  ─── 70 overbought line (red dashed)        │
│  ─── 30 oversold line (green dashed)        │
└─────────────────────────────────────────────┘
```

## Stoch RSI Chart Details

```
┌─────────────────────────────────────────────┐
│  K line (blue) + D line (orange)            │
│  ─── 80 overbought line (dashed)            │
│  ─── 20 oversold line (dashed)              │
└─────────────────────────────────────────────┘
```
