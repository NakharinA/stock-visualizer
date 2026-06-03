# Phase 07 — Stock Chart: Advanced Overlays

## Goals
- Render Fibonacci retracement levels as horizontal lines on the main chart
- Render Support/Resistance levels as horizontal dashed lines
- Render Fair Value Gap (FVG) zones as semi-transparent rectangles
- Wire all three to their `IndicatorToggle` checkboxes

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] Fibonacci checkbox → 7 horizontal lines appear at the Fibonacci levels; levels labeled (0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0)
- [ ] S/R checkbox → horizontal dashed lines at each detected support/resistance price
- [ ] FVG checkbox → bullish gaps shown as green semi-transparent rectangles; bearish as red
- [ ] All three overlays toggle on/off without re-fetching data
- [ ] Overlays survive time period switches (re-drawn with new data)

## Dependencies

What must be true before this phase starts:
- Phase 05 must be complete (`CandleChart.vue`, `IndicatorToggle.vue` with Fibo/S/R/FVG checkboxes present)
- Phase 03 must be complete (backend returning `fibonacci`, `support_resistance`, `fvg` in response)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | No new packages; notes on Lightweight Charts primitives used |
| context.md | How to draw static lines and rectangles in Lightweight Charts |
| tasks.md | Granular implementation checklist |
