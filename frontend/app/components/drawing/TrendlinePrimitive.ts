import type {
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  SeriesAttachedParameter,
  Time,
} from 'lightweight-charts'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Drawing } from '~/types'

class TrendlineRenderer implements ISeriesPrimitivePaneRenderer {
  private _params: SeriesAttachedParameter<Time> | null = null
  private _drawing: Drawing | null = null

  update(params: SeriesAttachedParameter<Time> | null, drawing: Drawing) {
    this._params = params
    this._drawing = drawing
  }

  draw(target: CanvasRenderingTarget2D): void {
    if (!this._params || !this._drawing || this._drawing.points.length < 2) return

    const { chart, series } = this._params
    const { points, color, lineWidth, tool } = this._drawing

    const x1 = chart.timeScale().timeToCoordinate(points[0].time as Time)
    const y1 = series.priceToCoordinate(points[0].price)
    const x2 = chart.timeScale().timeToCoordinate(points[1].time as Time)
    const y2 = series.priceToCoordinate(points[1].price)

    if (x1 === null || y1 === null || x2 === null || y2 === null) return

    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio, verticalPixelRatio, bitmapSize }) => {
      const bx1 = x1 * horizontalPixelRatio
      const by1 = y1 * verticalPixelRatio
      const bx2 = x2 * horizontalPixelRatio
      const by2 = y2 * verticalPixelRatio

      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth * horizontalPixelRatio

      let startX: number, startY: number, endX: number, endY: number

      if (tool === 'trendline' || tool === 'hline') {
        // Extend line to full canvas width
        ctx.setLineDash([6 * horizontalPixelRatio, 3 * horizontalPixelRatio])
        const dx = bx2 - bx1
        const dy = by2 - by1
        if (Math.abs(dx) < 0.001) {
          startX = bx1; startY = 0; endX = bx1; endY = bitmapSize.height
        } else {
          const slope = dy / dx
          startY = by1 + slope * (0 - bx1)
          endY = by1 + slope * (bitmapSize.width - bx1)
          startX = 0; endX = bitmapSize.width
        }
      } else {
        // Freehand: draw direct line
        ctx.setLineDash([])
        startX = bx1; startY = by1; endX = bx2; endY = by2
      }

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
      ctx.restore()
    })
  }
}

class TrendlinePaneView implements ISeriesPrimitivePaneView {
  private _renderer: TrendlineRenderer
  constructor(renderer: TrendlineRenderer) { this._renderer = renderer }
  zOrder(): 'top' { return 'top' }
  renderer(): ISeriesPrimitivePaneRenderer { return this._renderer }
}

export class TrendlinePrimitive implements ISeriesPrimitive<Time> {
  private _renderer: TrendlineRenderer
  private _view: TrendlinePaneView
  private _params: SeriesAttachedParameter<Time> | null = null
  public drawing: Drawing

  constructor(drawing: Drawing) {
    this.drawing = drawing
    this._renderer = new TrendlineRenderer()
    this._view = new TrendlinePaneView(this._renderer)
  }

  attached(params: SeriesAttachedParameter<Time>): void {
    this._params = params
    this._renderer.update(params, this.drawing)
  }

  detached(): void {
    this._params = null
  }

  update(drawing: Drawing): void {
    this.drawing = drawing
    if (this._params) {
      this._renderer.update(this._params, drawing)
      this._params.requestUpdate()
    }
  }

  updateAllViews(): void {
    if (this._params) this._renderer.update(this._params, this.drawing)
  }

  paneViews(): readonly ISeriesPrimitivePaneView[] {
    return [this._view]
  }
}
