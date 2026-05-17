import type {
  ISeriesPrimitive,
  ISeriesPrimitivePaneRenderer,
  ISeriesPrimitivePaneView,
  SeriesAttachedParameter,
  Time,
} from 'lightweight-charts'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Drawing } from '~/types'

class FVGBoxRenderer implements ISeriesPrimitivePaneRenderer {
  private _params: SeriesAttachedParameter<Time> | null = null
  private _drawing: Drawing | null = null

  update(params: SeriesAttachedParameter<Time> | null, drawing: Drawing) {
    this._params = params
    this._drawing = drawing
  }

  draw(target: CanvasRenderingTarget2D): void {
    if (!this._params || !this._drawing || this._drawing.points.length < 2) return

    const { chart, series } = this._params
    const { points, color, opacity, lineWidth } = this._drawing

    const x1 = chart.timeScale().timeToCoordinate(points[0].time as Time)
    const y1 = series.priceToCoordinate(points[0].price)
    const x2 = chart.timeScale().timeToCoordinate(points[1].time as Time)
    const y2 = series.priceToCoordinate(points[1].price)

    if (x1 === null || y1 === null || x2 === null || y2 === null) return

    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) => {
      const bx1 = x1 * horizontalPixelRatio
      const by1 = y1 * verticalPixelRatio
      const bx2 = x2 * horizontalPixelRatio
      const by2 = y2 * verticalPixelRatio

      const left = Math.min(bx1, bx2)
      const top = Math.min(by1, by2)
      const width = Math.abs(bx2 - bx1)
      const height = Math.abs(by2 - by1)

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.fillRect(left, top, width, height)

      ctx.globalAlpha = 1
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth * horizontalPixelRatio
      ctx.strokeRect(left, top, width, height)
      ctx.restore()
    })
  }
}

class FVGBoxPaneView implements ISeriesPrimitivePaneView {
  private _renderer: FVGBoxRenderer
  constructor(renderer: FVGBoxRenderer) { this._renderer = renderer }
  zOrder(): 'top' { return 'top' }
  renderer(): ISeriesPrimitivePaneRenderer { return this._renderer }
}

export class FVGBoxPrimitive implements ISeriesPrimitive<Time> {
  private _renderer: FVGBoxRenderer
  private _view: FVGBoxPaneView
  private _params: SeriesAttachedParameter<Time> | null = null
  public drawing: Drawing

  constructor(drawing: Drawing) {
    this.drawing = drawing
    this._renderer = new FVGBoxRenderer()
    this._view = new FVGBoxPaneView(this._renderer)
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
