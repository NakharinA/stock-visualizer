# Phase 7 — Drawing Tools (Trendline, FVG Box, Horizontal Line)

## Goal
Add freehand drawing tools to the chart. All drawn objects are stored in price/time space in Pinia, rendered as lightweight-charts canvas primitives, and survive zoom/scroll/resize.

## Depends On
Phase 5 (chart core) must be complete.

---

## Key Principle
**Never store pixel coordinates.** Always store `{ time: number (unix), price: number }`. Convert to pixels only at render time using the chart's coordinate conversion API.

---

## 1. `stores/drawings.ts`

```ts
import { defineStore } from "pinia"
import type { Drawing, DrawingToolType, DrawingPoint } from "~/types"

export const useDrawingsStore = defineStore("drawings", {
  state: () => ({
    activeTool: "none" as DrawingToolType,
    drawings:   []     as Drawing[],
    draft:      null   as Partial<Drawing> | null,   // in-progress drawing
  }),

  actions: {
    setTool(tool: DrawingToolType) {
      this.activeTool = tool
      this.draft      = null
    },

    startDraft(point: DrawingPoint) {
      this.draft = {
        id:        crypto.randomUUID(),
        tool:      this.activeTool,
        points:    [point],
        color:     "#2962ff",
        opacity:   0.3,
        lineWidth: 1,
      }
    },

    updateDraft(point: DrawingPoint) {
      if (!this.draft) return
      // Always keep only start + current end point
      this.draft.points = [this.draft.points![0], point]
    },

    commitDraft() {
      if (!this.draft || !this.draft.points?.length) return
      this.drawings.push(this.draft as Drawing)
      this.draft = null
    },

    removeDrawing(id: string) {
      this.drawings = this.drawings.filter(d => d.id !== id)
    },

    clearAll() {
      this.drawings = []
      this.draft    = null
    },
  },
})
```

---

## 2. `components/drawing/DrawingToolbar.vue`

A vertical left sidebar with tool buttons.

```vue
<template>
  <div class="flex flex-col items-center gap-2 py-3 w-10
              bg-[var(--color-surface)] border-r border-[var(--color-border)]">
    <button
      v-for="tool in tools"
      :key="tool.id"
      :title="tool.label"
      @click="dStore.setTool(tool.id)"
      :class="[
        'w-7 h-7 rounded flex items-center justify-center text-sm',
        dStore.activeTool === tool.id
          ? 'bg-[var(--color-accent)] text-white'
          : 'text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-border)]'
      ]"
    >
      {{ tool.icon }}
    </button>

    <div class="border-t border-[var(--color-border)] w-6 my-1" />

    <button
      title="Clear all drawings"
      @click="dStore.clearAll()"
      class="w-7 h-7 rounded flex items-center justify-center text-sm
             text-[var(--color-muted)] hover:text-red-400"
    >🗑</button>
  </div>
</template>

<script setup lang="ts">
const dStore = useDrawingsStore()

const tools = [
  { id: "none"      as const, label: "Cursor",          icon: "↖" },
  { id: "trendline" as const, label: "Trendline",       icon: "╱" },
  { id: "hline"     as const, label: "Horizontal Line", icon: "—" },
  { id: "fvgbox"    as const, label: "FVG Box",         icon: "▭" },
  { id: "freehand"  as const, label: "Freehand",        icon: "✏" },
]
</script>
```

---

## 3. `components/drawing/TrendlinePrimitive.ts`

A lightweight-charts custom series primitive that draws a line through two price/time points, extended to the edges of the visible range.

```ts
import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  ISeriesPrimitivePaneView,
  ISeriesPrimitivePaneRenderer,
  BitmapCoordinatesRenderingScope,
  CanvasRenderingTarget2D,
} from "lightweight-charts"
import type { DrawingPoint } from "~/types"

class TrendlineRenderer implements ISeriesPrimitivePaneRenderer {
  private _p1: DrawingPoint
  private _p2: DrawingPoint
  private _color: string
  private _lineWidth: number
  private _params: SeriesAttachedParameter<any> | null = null

  constructor(p1: DrawingPoint, p2: DrawingPoint, color: string, lineWidth: number) {
    this._p1 = p1
    this._p2 = p2
    this._color     = color
    this._lineWidth = lineWidth
  }

  setParams(p: SeriesAttachedParameter<any>) { this._params = p }

  draw(target: CanvasRenderingTarget2D): void {
    target.useBitmapCoordinateSpace((scope: BitmapCoordinatesRenderingScope) => {
      if (!this._params) return
      const { context: ctx, bitmapSize } = scope
      const chart  = this._params.chart
      const series = this._params.series

      const x1 = chart.timeScale().timeToCoordinate(this._p1.time as any)
      const y1 = series.priceToCoordinate(this._p1.price)
      const x2 = chart.timeScale().timeToCoordinate(this._p2.time as any)
      const y2 = series.priceToCoordinate(this._p2.price)

      if (x1 === null || y1 === null || x2 === null || y2 === null) return

      // Extend the line across the full canvas width
      const dx = x2 - x1
      const dy = y2 - y1
      const slope = dx !== 0 ? dy / dx : 0
      const extX1 = 0
      const extY1 = y1 + slope * (extX1 - x1)
      const extX2 = bitmapSize.width / scope.horizontalPixelRatio
      const extY2 = y1 + slope * (extX2 - x1)

      ctx.save()
      ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio)
      ctx.beginPath()
      ctx.moveTo(extX1, extY1)
      ctx.lineTo(extX2, extY2)
      ctx.strokeStyle = this._color
      ctx.lineWidth   = this._lineWidth
      ctx.setLineDash([6, 3])
      ctx.stroke()
      ctx.restore()
    })
  }
}

class TrendlinePaneView implements ISeriesPrimitivePaneView {
  private _renderer: TrendlineRenderer
  constructor(r: TrendlineRenderer) { this._renderer = r }
  renderer() { return this._renderer }
  zOrder(): "top" { return "top" }
}

export class TrendlinePrimitive implements ISeriesPrimitive<any> {
  private _renderer:  TrendlineRenderer
  private _paneView:  TrendlinePaneView
  private _params:    SeriesAttachedParameter<any> | null = null

  constructor(p1: DrawingPoint, p2: DrawingPoint, color = "#2962ff", lineWidth = 1) {
    this._renderer = new TrendlineRenderer(p1, p2, color, lineWidth)
    this._paneView = new TrendlinePaneView(this._renderer)
  }

  attached(params: SeriesAttachedParameter<any>) {
    this._params = params
    this._renderer.setParams(params)
  }

  detached() { this._params = null }

  paneViews() { return [this._paneView] }

  updateAllViews() {}
}
```

---

## 4. `components/drawing/FVGBoxPrimitive.ts`

Draws a filled rectangle between two price/time corners.

```ts
import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  ISeriesPrimitivePaneView,
  ISeriesPrimitivePaneRenderer,
  BitmapCoordinatesRenderingScope,
  CanvasRenderingTarget2D,
} from "lightweight-charts"
import type { DrawingPoint } from "~/types"

class FVGBoxRenderer implements ISeriesPrimitivePaneRenderer {
  private _topLeft:     DrawingPoint
  private _bottomRight: DrawingPoint
  private _color:       string
  private _opacity:     number
  private _params: SeriesAttachedParameter<any> | null = null

  constructor(tl: DrawingPoint, br: DrawingPoint, color: string, opacity: number) {
    this._topLeft     = tl
    this._bottomRight = br
    this._color   = color
    this._opacity = opacity
  }

  setParams(p: SeriesAttachedParameter<any>) { this._params = p }

  draw(target: CanvasRenderingTarget2D): void {
    target.useBitmapCoordinateSpace((scope: BitmapCoordinatesRenderingScope) => {
      if (!this._params) return
      const { context: ctx } = scope
      const chart  = this._params.chart
      const series = this._params.series

      const x1 = chart.timeScale().timeToCoordinate(this._topLeft.time as any)
      const y1 = series.priceToCoordinate(this._topLeft.price)
      const x2 = chart.timeScale().timeToCoordinate(this._bottomRight.time as any)
      const y2 = series.priceToCoordinate(this._bottomRight.price)

      if (x1 === null || y1 === null || x2 === null || y2 === null) return

      ctx.save()
      ctx.scale(scope.horizontalPixelRatio, scope.verticalPixelRatio)

      // Fill
      ctx.globalAlpha = this._opacity
      ctx.fillStyle   = this._color
      ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))

      // Border
      ctx.globalAlpha = 1
      ctx.strokeStyle = this._color
      ctx.lineWidth   = 1
      ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1))

      ctx.restore()
    })
  }
}

class FVGBoxPaneView implements ISeriesPrimitivePaneView {
  private _renderer: FVGBoxRenderer
  constructor(r: FVGBoxRenderer) { this._renderer = r }
  renderer() { return this._renderer }
  zOrder(): "top" { return "top" }
}

export class FVGBoxPrimitive implements ISeriesPrimitive<any> {
  private _renderer: FVGBoxRenderer
  private _paneView: FVGBoxPaneView
  private _params:   SeriesAttachedParameter<any> | null = null

  constructor(tl: DrawingPoint, br: DrawingPoint, color = "#2962ff", opacity = 0.2) {
    this._renderer = new FVGBoxRenderer(tl, br, color, opacity)
    this._paneView = new FVGBoxPaneView(this._renderer)
  }

  attached(params: SeriesAttachedParameter<any>) {
    this._params = params
    this._renderer.setParams(params)
  }

  detached() { this._params = null }

  paneViews() { return [this._paneView] }

  updateAllViews() {}
}
```

---

## 5. Mouse Interaction in `components/chart/CandlestickChart.vue`

Add mouse event handling inside `onMounted` after chart creation. Add this block:

```ts
import { useDrawingsStore } from "~/stores/drawings"
import { TrendlinePrimitive } from "~/components/drawing/TrendlinePrimitive"
import { FVGBoxPrimitive }    from "~/components/drawing/FVGBoxPrimitive"

const dStore = useDrawingsStore()
const primitiveMap = new Map<string, ISeriesPrimitive<any>>()

// Convert mouse event to price/time coordinates
function toDrawingPoint(e: MouseEvent): DrawingPoint | null {
  if (!chart || !chartContainer.value) return null
  const rect = chartContainer.value.getBoundingClientRect()
  const x    = e.clientX - rect.left
  const y    = e.clientY - rect.top
  const time  = chart.timeScale().coordinateToTime(x)
  const price = series!.coordinateToPrice(y)
  if (time === null || price === null) return null
  return { time: time as unknown as number, price }
}

chartContainer.value.addEventListener("mousedown", (e) => {
  if (dStore.activeTool === "none") return
  const pt = toDrawingPoint(e)
  if (!pt) return
  if (dStore.activeTool === "hline") {
    // Horizontal line — single click commits
    dStore.startDraft(pt)
    dStore.updateDraft({ time: pt.time + 9999999, price: pt.price })
    dStore.commitDraft()
    return
  }
  dStore.startDraft(pt)
})

chartContainer.value.addEventListener("mousemove", (e) => {
  if (!dStore.draft) return
  const pt = toDrawingPoint(e)
  if (!pt) return
  dStore.updateDraft(pt)
})

chartContainer.value.addEventListener("mouseup", (e) => {
  if (!dStore.draft) return
  if (dStore.activeTool === "freehand") {
    const pt = toDrawingPoint(e)
    if (pt) dStore.updateDraft(pt)
  }
  dStore.commitDraft()
})
```

---

## 6. Sync Drawings to Chart Primitives

In `CandlestickChart.vue`, watch `dStore.drawings` and attach/detach primitives on the candlestick series:

```ts
watch(
  () => [...dStore.drawings, dStore.draft],
  () => {
    if (!series) return
    // Remove primitives for deleted drawings
    for (const [id, primitive] of primitiveMap.entries()) {
      const stillExists =
        dStore.drawings.find(d => d.id === id) ||
        (dStore.draft?.id === id)
      if (!stillExists) {
        series.detachPrimitive(primitive)
        primitiveMap.delete(id)
      }
    }

    // Add primitives for new drawings (including draft)
    const all = [
      ...dStore.drawings,
      ...(dStore.draft ? [dStore.draft as Drawing] : [])
    ]

    for (const drawing of all) {
      if (primitiveMap.has(drawing.id!)) continue
      if (!drawing.points || drawing.points.length < 2) continue

      let primitive: ISeriesPrimitive<any> | null = null

      if (drawing.tool === "trendline" || drawing.tool === "hline" || drawing.tool === "freehand") {
        primitive = new TrendlinePrimitive(
          drawing.points[0],
          drawing.points[drawing.points.length - 1],
          drawing.color,
          drawing.lineWidth,
        )
      } else if (drawing.tool === "fvgbox") {
        primitive = new FVGBoxPrimitive(
          drawing.points[0],
          drawing.points[drawing.points.length - 1],
          drawing.color,
          drawing.opacity,
        )
      }

      if (primitive) {
        series.attachPrimitive(primitive)
        primitiveMap.set(drawing.id!, primitive)
      }
    }
  },
  { deep: true }
)
```

---

## 7. Update `pages/index.vue` — Add DrawingToolbar

Replace the empty left sidebar div:
```vue
<DrawingToolbar />
```

---

## Acceptance Criteria
- [ ] Selecting "Trendline" tool, clicking two points on the chart draws an extended dashed line
- [ ] Selecting "Horizontal Line" and clicking once draws a horizontal ray
- [ ] Selecting "FVG Box" and click-dragging draws a filled rectangle with border
- [ ] All drawings survive zoom and scroll (coordinates are in price/time space)
- [ ] Clicking 🗑 clears all drawings
- [ ] Switching back to cursor (↖) tool disables drawing mode
- [ ] Draft (in-progress) drawing follows the mouse before the second click
