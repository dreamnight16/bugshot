import { useState, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Pin } from '../types'

interface Props {
  pin: Pin
  isSelected: boolean
  onClick: () => void
  onDragStart: () => void
  onDrag: (x: number, y: number) => void
  containerRef: React.RefObject<HTMLImageElement | null>
}

const SIZE = 32

export default function PinMarker({ pin, isSelected, onClick, onDragStart, onDrag, containerRef }: Props) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const moved = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    moved.current = false
    setDragging(true)
    dragOffset.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    if (!dragging) return

    const handleMove = (e: MouseEvent) => {
      const img = containerRef.current
      if (!img) return
      const dx = e.clientX - dragOffset.current.x
      const dy = e.clientY - dragOffset.current.y
      if (dx === 0 && dy === 0) return
      // One history entry per drag gesture, not one per mouse move.
      if (!moved.current) {
        moved.current = true
        onDragStart()
      }
      dragOffset.current = { x: e.clientX, y: e.clientY }
      onDrag(pin.x + dx, pin.y + dy)
    }

    const handleUp = () => setDragging(false)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [dragging, pin.x, pin.y, onDrag, onDragStart, containerRef])

  const label = `${t('export.pin')} ${pin.number} · ${Math.round(pin.x)}, ${Math.round(pin.y)}`
  const elementName = pin.uia?.name?.trim()

  return (
    <button
      type="button"
      className="bs-pin dn-focus"
      data-dragging={dragging}
      aria-current={isSelected}
      aria-label={label}
      title={elementName ? `${label} — ${elementName}` : `${label}. ${t('a11y.nudgeHint')}`}
      style={{
        left: pin.x - SIZE / 2,
        top: pin.y - SIZE / 2,
        zIndex: isSelected ? 'var(--dn-z-panel)' : 'var(--dn-z-floating)',
        '--bs-field': pin.color,
      } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      {pin.number}
    </button>
  )
}
