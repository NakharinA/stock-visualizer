# UI Flows — Phase 06

## Full Chart Page Layout (with Subpanel)

```
┌──────────────────────────────────────────────────┐
│  [🔍 Search]                                     │
│  [ YTD | 1Y | 6M | 3M* | 1M | 1W ]              │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │      Main Candlestick Chart                │  │
│  │      (~75vh when subpanel open)            │  │
│  │      (~95vh when subpanel closed)          │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [ MACD* | RSI | Stoch RSI ]   ← tab switcher   │
│  ┌────────────────────────────────────────────┐  │
│  │   Subpanel (~20vh)                         │  │
│  │   Active oscillator chart renders here     │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌─ Indicator Toggles ──────────────────────┐   │
│  │ ☑ EMA 20  ☑ EMA 50  □ EMA 100  □ EMA 200 │   │
│  │ ☑ MACD    □ RSI     □ Stoch RSI           │   │
│  │ □ Fibo    □ S/R     □ FVG                 │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

## Collapse Behavior

| Toggle state | Result |
|---|---|
| Any of MACD/RSI/StochRSI enabled | Subpanel visible; active tab shows that indicator |
| All three disabled | Subpanel hidden; main chart grows to fill space |

Use a computed `showSubpanel = macd || rsi || stochRsi`.

When an indicator is enabled, if no tab is currently active, default to the newly-enabled one.
When the active tab's indicator is disabled, switch to the next enabled oscillator.

## MACD Subpanel

```
─────────────────────────────────────────────────
 0 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
   ▐▐ ▐▐          histogram bars (above/below 0)
   ──── MACD line (blue)
   ──── Signal line (orange)
─────────────────────────────────────────────────
```

- Histogram bars: green when positive, red when negative
- Use a `HistogramSeries` + two `LineSeries`

## RSI Subpanel

```
─────────────────────────────────────────────────
70 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  overbought
   ────────────────── RSI line (purple)
30 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  oversold
─────────────────────────────────────────────────
```

- Price scale fixed to 0–100
- 30 and 70 are rendered as `createPriceLine({ price: 70, color: '#64748b', lineStyle: LineStyle.Dashed })`

## StochRSI Subpanel

- Same 0–100 scale as RSI
- K line (blue) and D line (orange)
- No threshold lines needed (optional: add 20/80)
