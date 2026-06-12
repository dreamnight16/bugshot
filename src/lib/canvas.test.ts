import { describe, it, expect, vi, beforeEach } from 'vitest'
import { drawArrow, drawRect, drawFreehand, drawPinMarker, drawAllDrawings, drawAllPins } from './canvas'
import type { Drawing, Pin } from '../types'

function createMockContext(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe('drawArrow', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('draws an arrow from p1 to p2 with correct color', () => {
    drawArrow(ctx, { x: 10, y: 10 }, { x: 100, y: 100 }, '#ff0000')
    expect(ctx.stroke).toHaveBeenCalledTimes(1) // shaft stroke
    expect(ctx.fill).toHaveBeenCalledTimes(1) // arrowhead fill
  })

  it('uses custom lineWidth when provided', () => {
    drawArrow(ctx, { x: 0, y: 0 }, { x: 50, y: 50 }, '#000', { lineWidth: 5 })
    expect(ctx.lineWidth).toBe(5)
  })
})

describe('drawRect', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('draws a dashed rectangle', () => {
    drawRect(ctx, { x: 10, y: 10 }, { x: 100, y: 80 }, '#3b82f6')
    expect(ctx.setLineDash).toHaveBeenCalledWith([8, 4])
    expect(ctx.strokeRect).toHaveBeenCalled()
  })

  it('fills with optional fill color', () => {
    drawRect(ctx, { x: 10, y: 10 }, { x: 100, y: 80 }, '#3b82f6', { fill: '#3b82f615' })
    expect(ctx.fillRect).toHaveBeenCalled()
  })

  it('normalizes negative dimensions', () => {
    drawRect(ctx, { x: 100, y: 80 }, { x: 10, y: 10 }, '#3b82f6')
    expect(ctx.strokeRect).toHaveBeenCalled()
  })
})

describe('drawFreehand', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('draws nothing for fewer than 2 points', () => {
    drawFreehand(ctx, [{ x: 0, y: 0 }], '#22c55e')
    expect(ctx.beginPath).not.toHaveBeenCalled()
  })

  it('draws a path through all points', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 5 }]
    drawFreehand(ctx, pts, '#22c55e')
    expect(ctx.stroke).toHaveBeenCalled()
  })
})

describe('drawPinMarker', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('draws a circle with pin number', () => {
    drawPinMarker(ctx, { x: 150, y: 200, color: '#ef4444', number: 1 })
    expect(ctx.arc).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalledWith('1', 150, 200)
  })
})

describe('drawAllDrawings', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('handles empty drawings array', () => {
    drawAllDrawings(ctx, [])
    expect(ctx.beginPath).not.toHaveBeenCalled()
  })

  it('draws each drawing type', () => {
    const drawings: Drawing[] = [
      { id: '1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: '#ef4444' },
      { id: '2', type: 'rectangle', points: [{ x: 10, y: 10 }, { x: 50, y: 50 }], color: '#3b82f6' },
      { id: '3', type: 'freehand', points: [{ x: 0, y: 0 }, { x: 20, y: 30 }], color: '#22c55e' },
    ]
    drawAllDrawings(ctx, drawings)
    expect(ctx.stroke).toHaveBeenCalled()
  })
})

describe('drawAllPins', () => {
  let ctx: CanvasRenderingContext2D

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('draws all pins', () => {
    const pins: Pin[] = [
      { id: '1', number: 1, x: 100, y: 100, comment: '', color: '#ef4444' },
      { id: '2', number: 2, x: 200, y: 200, comment: '', color: '#eab308' },
    ]
    drawAllPins(ctx, pins)
    expect(ctx.fillText).toHaveBeenCalledTimes(2)
  })
})
