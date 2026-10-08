import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
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
  onEditStart: () => void
  onNudge: (dx: number, dy: number) => void
}

export default function Annotator({
  session, activeTool, pins, drawings,
  selectedPinId, selectedDrawingId,
  onCanvasClick, onPinUpdate, onPinDelete, onPinSelect, onDrawingSelect, onDrawingStart, onDrawingEnd,
  onToolChange, onDeselectAll, onEditStart, onNudge,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [editingPinId, setEditingPinId] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
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
      const overOverlay = !!(e.target as HTMLElement).closest('.bs-zoom')
      setCursorPos(overOverlay ? null : { x: e.clientX - rect.left, y: e.clientY - rect.top })
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
    onNudge: selectedPinId ? onNudge : undefined,
  })

  const selectedPin = pins.find(p => p.id === selectedPinId)
  const zoomPercent = Math.round(scale * 100)

  const info: { label: string; value: string }[] = [
    { label: t('session.image'), value: imageSize ? `${imageSize.width} × ${imageSize.height}` : '\u2014' },
    { label: t('session.tool'), value: t(`toolbar.${activeTool}`) },
    { label: t('session.pins'), value: String(pins.length) },
    { label: t('session.drawings'), value: String(drawings.length) },
  ]

  return (
    <div className={`bs-stage${isPanning ? ' bs-stage--panning' : ''}`}>
      <div className="bs-stage__info">
        {info.map(({ label, value }) => (
          <span key={label} className="bs-info__pair">
            <span className="bs-info__label">{label}</span>
            <span className="bs-info__value">{value}</span>
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        className="bs-stage__canvas"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
      <div
        className="bs-stage__viewport"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
      >
        <img
          ref={imageRef}
          src={session.screenshot}
          alt={t('session.screenshotAlt')}
          className="bs-stage__image"
          onClick={handleImageClick}
          onLoad={(e) => {
            const img = e.currentTarget
            setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
          }}
          draggable={false}
        />

        <DrawingLayer
          drawings={drawings}
          selectedDrawingId={selectedDrawingId}
          onDrawingSelect={onDrawingSelect}
          activeTool={activeTool}
          onDrawingStart={onDrawingStart}
          onDrawingEnd={onDrawingEnd}
          imageSize={imageSize}
        />

        {pins.map(pin => (
          <PinMarker
            key={pin.id}
            pin={pin}
            isSelected={pin.id === selectedPinId}
            onClick={() => {
              // SELECT_PIN already clears the drawing selection; calling
              // onDrawingSelect(null) here would immediately deselect this pin.
              onPinSelect(pin.id)
              setEditingPinId(pin.id)
            }}
            onDragStart={onEditStart}
            onDrag={(x, y) => handlePinDrag(pin.id, x, y)}
            containerRef={imageRef}
          />
        ))}

        {selectedPin && editingPinId === selectedPinId && (
          <CommentInput
            pin={selectedPin}
            imageWidth={imageSize?.width ?? 0}
            scale={scale}
            onUpdate={(comment) => onPinUpdate(selectedPin.id, { comment })}
            onEditStart={onEditStart}
            onDelete={() => { onPinDelete(selectedPin.id); setEditingPinId(null) }}
            onClose={() => setEditingPinId(null)}
          />
        )}
      </div>

      {cursorPos && !isPanning && (
        <div className="bs-cursor" style={{ left: cursorPos.x, top: cursorPos.y }} aria-hidden="true">
          {activeTool === 'pin' ? (
            <>
              <span className="bs-cursor__ring" />
              <span className="bs-cursor__dot" />
            </>
          ) : (
            <span className="bs-cursor__ring" />
          )}
        </div>
      )}

      <div className="bs-zoom dn-acrylic dn-elevation-3" role="group" aria-label={t('session.zoomLabel')}>
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= ZOOM_MIN}
          className="bs-icon-btn dn-focus"
          title={t('zoom.out')}
          aria-label={t('zoom.out')}
        >
          <ZoomOut aria-hidden="true" size={16} strokeWidth={2.25} />
        </button>

        <button
          type="button"
          onClick={resetView}
          className="bs-zoom__level dn-focus"
          title={t('annotator.resetView')}
          aria-label={`${t('session.zoomLabel')} ${zoomPercent}% — ${t('annotator.resetView')}`}
        >
          {zoomPercent}%
        </button>

        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= ZOOM_MAX}
          className="bs-icon-btn dn-focus"
          title={t('zoom.in')}
          aria-label={t('zoom.in')}
        >
          <ZoomIn aria-hidden="true" size={16} strokeWidth={2.25} />
        </button>

        <button
          type="button"
          onClick={resetView}
          className="bs-icon-btn dn-focus"
          title={t('zoom.fit')}
          aria-label={t('zoom.fit')}
        >
          <Maximize2 aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
      </div>
      </div>
    </div>
  )
}
