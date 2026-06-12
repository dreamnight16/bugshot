import { useState, useCallback, useEffect, useRef } from 'react'
import type { Pin } from '../types'

interface Props {
  pin: Pin
  isSelected: boolean
  onClick: () => void
  onDrag: (x: number, y: number) => void
  containerRef: React.RefObject<HTMLImageElement | null>
}

const SIZE = 28

export default function PinMarker({ pin, isSelected, onClick, onDrag, containerRef }: Props) {
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
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
  }, [dragging, pin.x, pin.y, onDrag, containerRef])

  const interactive = isSelected || hovered || dragging

  return (
    <div
      className={`absolute pointer-events-auto transition-transform duration-150 ${
        dragging ? 'cursor-grabbing z-50 scale-110' : 'cursor-grab'
      }`}
      style={{
        left: pin.x - SIZE / 2,
        top: pin.y - SIZE / 2,
        zIndex: isSelected ? 40 : 20,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onClick() }}
    >
      {/* Lift shadow when dragging */}
      {dragging && (
        <div
          className="absolute rounded-full"
          style={{
            left: -2,
            top: 4,
            width: SIZE + 4,
            height: SIZE + 4,
            backgroundColor: 'rgba(0,0,0,0.4)',
            filter: 'blur(6px)',
          }}
        />
      )}

      {/* Pulse ring on select */}
      {isSelected && (
        <div
          className="absolute rounded-full animate-ping"
          style={{
            left: -4,
            top: -4,
            width: SIZE + 8,
            height: SIZE + 8,
            backgroundColor: pin.color + '18',
            animationDuration: '1.8s',
          }}
        />
      )}

      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-200"
        style={{
          backgroundColor: pin.color,
          opacity: interactive ? 0.7 : 0.2,
          filter: `blur(${interactive ? 6 : 4}px)`,
          transform: interactive ? 'scale(1.1)' : 'scale(1)',
        }}
      />

      {/* Circle body */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center transition-all duration-150"
        style={{
          width: SIZE,
          height: SIZE,
          backgroundColor: pin.color + 'dd',
          border: `2px solid ${interactive ? 'rgba(255,255,255,0.2)' : pin.color}`,
          boxShadow: interactive
            ? `0 0 18px ${pin.color}60, 0 4px 12px rgba(0,0,0,0.3)`
            : `0 0 0px ${pin.color}00`,
          transform: interactive ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <span
          className="text-white text-[11px] font-bold leading-none select-none"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {pin.number}
        </span>
      </div>
    </div>
  )
}
