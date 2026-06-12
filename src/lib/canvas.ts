import type { Pin, Drawing } from '../types'

export interface ArrowOptions {
  lineWidth?: number
  headLen?: number
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  color: string,
  options: ArrowOptions = {},
) {
  const { lineWidth = 3, headLen = 12 } = options
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()

  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  ctx.beginPath()
  ctx.moveTo(to.x, to.y)
  ctx.lineTo(
    to.x - headLen * Math.cos(angle - Math.PI / 6),
    to.y - headLen * Math.sin(angle - Math.PI / 6),
  )
  ctx.lineTo(
    to.x - headLen * Math.cos(angle + Math.PI / 6),
    to.y - headLen * Math.sin(angle + Math.PI / 6),
  )
  ctx.closePath()
  ctx.fill()
}

export interface RectOptions {
  lineWidth?: number
  dash?: number[]
  fill?: string
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  color: string,
  options: RectOptions = {},
) {
  const { lineWidth = 3, dash = [8, 4], fill } = options
  const x = Math.min(p1.x, p2.x)
  const y = Math.min(p1.y, p2.y)
  const w = Math.abs(p2.x - p1.x)
  const h = Math.abs(p2.y - p1.y)

  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  if (dash.length > 0) {
    ctx.setLineDash(dash)
  }
  ctx.strokeRect(x, y, w, h)
  ctx.setLineDash([])

  if (fill) {
    ctx.fillStyle = fill
    ctx.fillRect(x, y, w, h)
  }
}

export interface FreehandOptions {
  lineWidth?: number
}

export function drawFreehand(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  options: FreehandOptions = {},
) {
  if (points.length < 2) return
  const { lineWidth = 3 } = options
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.stroke()
}

export interface PinMarkerOptions {
  radius?: number
  shadowBlur?: number
}

export function drawPinMarker(
  ctx: CanvasRenderingContext2D,
  pin: { x: number; y: number; color: string; number: number },
  options: PinMarkerOptions = {},
) {
  const { radius = 16, shadowBlur = 8 } = options

  ctx.shadowColor = pin.color
  ctx.shadowBlur = shadowBlur
  ctx.beginPath()
  ctx.arc(pin.x, pin.y, radius, 0, Math.PI * 2)
  ctx.fillStyle = pin.color + 'dd'
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.strokeStyle = pin.color
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(pin.number), pin.x, pin.y)
}

export function drawAllDrawings(
  ctx: CanvasRenderingContext2D,
  drawings: Drawing[],
  selectedId: string | null = null,
) {
  for (const d of drawings) {
    const isSelected = d.id === selectedId
    switch (d.type) {
      case 'arrow':
        if (d.points.length >= 2) {
          drawArrow(ctx, d.points[0], d.points[d.points.length - 1], d.color, {
            lineWidth: isSelected ? 4 : 3,
          })
        }
        break
      case 'rectangle':
        if (d.points.length >= 2) {
          drawRect(ctx, d.points[0], d.points[1], d.color, {
            lineWidth: isSelected ? 4 : 3,
            fill: isSelected ? d.color + '15' : undefined,
          })
        }
        break
      case 'freehand':
        drawFreehand(ctx, d.points, d.color, { lineWidth: isSelected ? 4 : 3 })
        break
    }
  }
}

export function drawAllPins(ctx: CanvasRenderingContext2D, pins: Pin[]) {
  for (const pin of pins) {
    drawPinMarker(ctx, pin)
  }
}
