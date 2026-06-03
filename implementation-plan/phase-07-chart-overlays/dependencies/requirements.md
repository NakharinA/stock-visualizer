# Dependencies — Phase 07

## Phase Dependencies
- Requires Phase 05 to be complete (`CandleChart.vue` exists, `IndicatorToggle.vue` has Fibo/S/R/FVG checkboxes)
- Requires Phase 03 to be complete (all overlay data returned by backend)

## External Services
- **FastAPI backend** at `http://localhost:8000` — must be running

## Libraries & Packages

No new packages. All implemented using Lightweight Charts primitives already installed in Phase 05.

## Lightweight Charts Primitives Used

| Overlay | Primitive |
|---------|-----------|
| Fibonacci lines | `series.createPriceLine()` on a dummy invisible series |
| Support/Resistance | `series.createPriceLine()` (dashed style) |
| FVG rectangles | Custom `ISeriesPrimitive` plugin OR a workaround using a band/area series |

**Recommended FVG approach:** Lightweight Charts v4 supports `ISeriesPrimitive` for custom drawing. However, if this adds too much complexity, use a workaround: one `AreaSeries` per FVG box (set `topValue` and `bottomValue` with invisible line and semi-transparent fill), restricted to its time range using `setData` with exactly two points. This is less clean but avoids needing to implement a custom primitive.

Choose based on complexity tolerance. The `ISeriesPrimitive` approach is correct but requires implementing `paneViews()` with a canvas renderer.
