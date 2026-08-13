import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { Session, Tool, Pin, Drawing } from '../types'
import { useShortcuts } from '../hooks/useShortcuts'
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } from '../constants'
import PinMarker from './PinMarker'
import CommentInput from './CommentInput'
import DrawingLayer from './DrawingLayer'

interface Props {
  session: Session
  activeTool: Tool
  pins: Pin[]
  drawings: Drawing[]
  selectedPinId: string | null
  selectedDrawingId: string | null
  onCanvasClick: (x: number, y: number) => void
  onPinUpdate: (id: string, updates: Partial<Pin>) => void
  onPinDelete: (id: string) => void
  onPinSelect: (id: string | null) => void
  onDrawingSelect: (id: string | null) => void
  onDrawingStart: () => void
  onDrawingEnd: (drawing: { type: string; points: { x: number; y: number }[] }) => void
  onToolChange: (tool: Tool) => void
  onDeselectAll: () => void
}

export default function Annotator({
  session, activeTool, pins, drawings,
  selectedPinId, selectedDrawingId,
  onCanvasClick, onPinUpdate, onPinDelete, onPinSelect, onDrawingSelect, onDrawingStart, onDrawingEnd,
  onToolChange, onDeselectAll,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingPinId, setEditingPinId] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const { t } = useTranslation()

  const toImageCoords = useCallback((clientX: number, clientY: number) => {
    const img = imageRef.current
    if (!img) return { x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    }
  }, [scale])

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (isPanning) return
    if (activeTool === 'pin') {
      const coords = toImageCoords(e.clientX, e.clientY)
      onCanvasClick(coords.x, coords.y)
    }
  }, [activeTool, isPanning, toImageCoords, onCanvasClick])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
    if (activeTool !== 'pin' && e.button === 0 && !e.shiftKey) {
      onDrawingStart()
    }
  }, [offset, activeTool, onDrawingStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }, [isPanning, panStart])

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false)
    setCursorPos(null)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handlePinDrag = useCallback((id: string, x: number, y: number) => {
    onPinUpdate(id, { x, y })
  }, [onPinUpdate])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScale(prev => {
      const next = prev - e.deltaY * 0.001
      return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next))
    })
  }, [])

  const zoomIn = () => setScale(s => Math.min(ZOOM_MAX, s + ZOOM_STEP))
  const zoomOut = () => setScale(s => Math.max(ZOOM_MIN, s - ZOOM_STEP))
  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  useShortcuts({
    onToolChange,
    onDeselectAll: () => {
      onDeselectAll()
      setEditingPinId(null)
    },
  })

  const selectedPin = pins.find(p => p.id === selectedPinId)

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-zinc-950/30 relative group"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isPanning ? 'grabbing' : activeTool === 'pin' ? 'none' : 'none' }}
    >
      {/* Checkerboard */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #fff 25%, transparent 25%),
            linear-gradient(-45deg, #fff 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #fff 75%),
            linear-gradient(-45deg, transparent 75%, #fff 75%)
          `,
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
        }}
      />

      {/* Screenshot */}
      <div
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <img
          ref={imageRef}
          src={session.screenshot}
          alt="Screenshot"
          className="max-w-none rounded-[2px]"
          onClick={handleImageClick}
          draggable={false}
          style={{
            boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.5)',
          }}
        />

        <DrawingLayer
          drawings={drawings}
          selectedDrawingId={selectedDrawingId}
          onDrawingSelect={onDrawingSelect}
          activeTool={activeTool}
          onDrawingStart={onDrawingStart}
          onDrawingEnd={onDrawingEnd}
          containerRef={imageRef}
        />

        {pins.map(pin => (
          <PinMarker
            key={pin.id}
            pin={pin}
            isSelected={pin.id === selectedPinId}
            onClick={() => {
              onPinSelect(pin.id)
              onDrawingSelect(null)
              setEditingPinId(pin.id)
            }}
            onDrag={(x, y) => handlePinDrag(pin.id, x, y)}
            containerRef={imageRef}
          />
        ))}

        {selectedPin && editingPinId === selectedPinId && (
          <CommentInput
            pin={selectedPin}
            onUpdate={(comment) => onPinUpdate(selectedPin.id, { comment })}
            onDelete={() => { onPinDelete(selectedPin.id); setEditingPinId(null) }}
            onClose={() => setEditingPinId(null)}
          />
        )}
      </div>

      {/* Custom crosshair cursor */}
      {cursorPos && !isPanning && activeTool === 'pin' && (
        <div
          className="absolute pointer-events-none z-[100]"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          {/* Outer ring */}
          <div
            className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 22,
              height: 22,
              border: '1.5px solid rgba(255,255,255,0.5)',
              boxShadow: '0 0 8px rgba(0,0,0,0.4), inset 0 0 4px rgba(0,0,0,0.15)',
            }}
          />
          {/* Center dot */}
          <div
            className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 4,
              height: 4,
              backgroundColor: 'rgba(255,255,255,0.9)',
              boxShadow: '0 0 3px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}

      {/* Drawing tool cursor */}
      {cursorPos && !isPanning && activeTool !== 'pin' && (
        <div
          className="absolute pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div
            className="rounded-full"
            style={{
              width: 10,
              height: 10,
              border: '2px solid rgba(255,255,255,0.7)',
              backgroundColor: activeTool === 'freehand' ? 'rgba(255,255,255,0.15)' : 'transparent',
              boxShadow: '0 0 6px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}

      {/* Active tool indicator — top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100">
        <span className="inline-block px-3 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-sm border border-zinc-800/50 text-[11px] font-medium text-zinc-400 shadow-lg shadow-black/30">
          {t(`toolbar.${activeTool}`)}
        </span>
      </div>

      {/* Zoom pill — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center bg-zinc-900/95 backdrop-blur-md rounded-full ring-1 ring-zinc-800/50 shadow-2xl shadow-black/40 overflow-hidden">
        <button
          onClick={zoomOut}
          disabled={scale <= ZOOM_MIN}
          className="p-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-25 transition-all duration-150"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" strokeWidth={2.25} />
        </button>

        <button
          onClick={resetView}
          className="px-3 py-2.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 tabular-nums transition-all duration-150 border-x border-zinc-800/50"
          title={t('annotator.resetView')}
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={zoomIn}
          disabled={scale >= ZOOM_MAX}
          className="p-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-25 transition-all duration-150"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" strokeWidth={2.25} />
        </button>

        <button
          onClick={resetView}
          className="p-2.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150 border-l border-zinc-800/50"
          title={t('annotator.resetView')}
        >
          <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
