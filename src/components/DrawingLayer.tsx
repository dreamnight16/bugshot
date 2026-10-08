import { useRef, useState, useCallback, useEffect } from 'react'
import type { Drawing, Tool } from '../types'
import { drawArrow, drawRect, drawFreehand, drawAllDrawings } from '../lib/canvas'
import { TOOL_COLORS } from '../constants'

interface Props {
  drawings: Drawing[]
  selectedDrawingId: string | null
  onDrawingSelect: (id: string | null) => void
  activeTool: Tool
  onDrawingStart: () => void
  onDrawingEnd: (drawing: { type: string; points: { x: number; y: number }[] }) => void
  /** Natural size of the decoded screenshot; null until it loads. */
  imageSize: { width: number; height: number } | null
}

export default function DrawingLayer({
  drawings, selectedDrawingId, onDrawingSelect,
  activeTool, onDrawingStart, onDrawingEnd, imageSize,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([])
  const rafRef = useRef<number>(0)

  const getCanvasPos = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'pin') return
    onDrawingStart()
    setIsDrawing(true)
    const pos = getCanvasPos(e)
    setCurrentPoints([pos])
  }, [activeTool, onDrawingStart, getCanvasPos])

  const moveDraw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const pos = getCanvasPos(e)
      setCurrentPoints(prev => {
        if (activeTool === 'freehand') return [...prev, pos]
        return [prev[0], pos]
      })
    })
  }, [isDrawing, activeTool, getCanvasPos])

  const endDraw = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    if (currentPoints.length > 0 && activeTool !== 'pin') {
      onDrawingEnd({ type: activeTool, points: [...currentPoints] })
    }
    setCurrentPoints([])
  }, [isDrawing, currentPoints, activeTool, onDrawingEnd])

  // Canvas sizing with HiDPI support. Depends on the decoded size, so marks are
  // never drawn onto a zero-sized canvas when the screenshot decodes late.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageSize) return
    const dpr = window.devicePixelRatio || 1
    const w = imageSize.width
    const h = imageSize.height
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [imageSize])

  // Render drawings
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawAllDrawings(ctx, drawings, selectedDrawingId)

    // Draw current in-progress drawing
    if (isDrawing && currentPoints.length > 0 && activeTool !== 'pin') {
      // Preview in the colour the mark will actually keep, so the result is predictable.
      ctx.globalAlpha = 0.85
      const previewColor = TOOL_COLORS[activeTool]
      if (activeTool === 'arrow' && currentPoints.length >= 2) {
        drawArrow(ctx, currentPoints[0], currentPoints[currentPoints.length - 1], previewColor)
      } else if (activeTool === 'rectangle' && currentPoints.length >= 2) {
        drawRect(ctx, currentPoints[0], currentPoints[1], previewColor, { dash: [8, 4] })
      } else if (activeTool === 'freehand') {
        drawFreehand(ctx, currentPoints, previewColor)
      }
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }, [drawings, selectedDrawingId, isDrawing, currentPoints, activeTool, imageSize])

  return (
    <canvas
      ref={canvasRef}
      className="bs-drawlayer"
      style={{ pointerEvents: activeTool !== 'pin' ? 'auto' : 'none' }}
      onMouseDown={startDraw}
      onMouseMove={moveDraw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onClick={() => { if (activeTool === 'pin') onDrawingSelect(null) }}
    />
  )
}
