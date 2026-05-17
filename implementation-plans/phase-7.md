## Phase 7 — Drawing Tools

### Depends On: Phase 5

### Key Rule
NEVER store pixel coordinates. Store { time: unix int, price: number } only.
Convert to pixels at render time using chart.timeScale().timeToCoordinate() and series.priceToCoordinate().

### stores/drawings.ts
state: activeTool("none"), drawings([]), draft(null)
actions:
  setTool(tool) → activeTool = tool; draft = null
  startDraft(point) → draft = { id:uuid, tool:activeTool, points:[point], color:"#2962ff", opacity:0.3, lineWidth:1 }
  updateDraft(point) → draft.points = [draft.points[0], point]
  commitDraft() → drawings.push(draft); draft = null
  removeDrawing(id) → filter
  clearAll() → drawings=[]; draft=null

### components/drawing/DrawingToolbar.vue
- Vertical flex column, 40px wide (replaces sidebar placeholder from Phase 5)
- PrimeVue ToggleButton group or plain Buttons styled with dark background
- Tools: none(↖ Cursor), trendline(╱), hline(—), fvgbox(▭), freehand(✏)
- Separator + clear button (pi-trash icon) → dStore.clearAll()
- Active tool highlighted with --color-accent

### components/drawing/TrendlinePrimitive.ts
Implements ISeriesPrimitive<any>:
- TrendlineRenderer (ISeriesPrimitivePaneRenderer):
  draw(target): useBitmapCoordinateSpace → timeToCoordinate(p1.time) + priceToCoordinate(p1.price)
  Extends line to full canvas width using slope formula
  ctx.setLineDash([6,3]), strokeStyle=color, lineWidth
- TrendlinePaneView: zOrder()="top"
- TrendlinePrimitive: attached(params) stores params ref on renderer; paneViews() returns view

### components/drawing/FVGBoxPrimitive.ts
Implements ISeriesPrimitive<any>:
- FVGBoxRenderer: draws filled rect (globalAlpha=opacity) + border (globalAlpha=1)
  Uses timeToCoordinate + priceToCoordinate for both corners
- FVGBoxPaneView: zOrder()="top"
- FVGBoxPrimitive: same attached/detached/paneViews pattern

### components/chart/CandlestickChart.vue additions
After chart creation in onMounted, add:
1. toDrawingPoint(e: MouseEvent) → { time, price } | null
   coordinateToTime(x) and series.coordinateToPrice(y)
2. mousedown handler:
   - activeTool=none → return
   - activeTool=hline → startDraft + updateDraft(same price, time+9999999) + commitDraft (single click)
   - else → startDraft(pt)
3. mousemove handler: if draft → updateDraft(pt)
4. mouseup handler: if draft → updateDraft(pt) + commitDraft()
5. watch([dStore.drawings, dStore.draft], deep):
   - Detach primitives for removed drawings (via primitiveMap: Map<id, ISeriesPrimitive>)
   - Attach new TrendlinePrimitive (for trendline/hline/freehand) or FVGBoxPrimitive
   - series.attachPrimitive() / series.detachPrimitive()

### pages/index.vue changes
Replace the 40px placeholder div with <DrawingToolbar />

### Acceptance
Trendline: click 2 points → dashed extended line drawn
Hline: single click → horizontal ray across chart
FVG Box: click-drag → filled rect with border
All drawings survive zoom + scroll (stored in price/time space)
Draft follows mouse before second click
Clear button removes all drawings
Cursor tool disables drawing mode