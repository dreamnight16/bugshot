import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, X } from 'lucide-react'
import type { Pin } from '../types'

interface Props {
  pin: Pin
  onUpdate: (comment: string) => void
  onDelete: () => void
  onClose: () => void
}

export default function CommentInput({ pin, onUpdate, onDelete, onClose }: Props) {
  const { t } = useTranslation()
  const [comment, setComment] = useState(pin.comment)
  const [entered, setEntered] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setComment(pin.comment)
  }, [pin.id, pin.comment])

  useLayoutEffect(() => {
    requestAnimationFrame(() => setEntered(true))
    inputRef.current?.focus()
  }, [])

  const handleChange = (value: string) => {
    setComment(value)
    onUpdate(value)
  }

  const popupX = pin.x + 24
  const popupY = pin.y - 12

  return (
    <div
      className="absolute z-50"
      style={{ left: popupX, top: popupY }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Connector line */}
      <svg
        className="absolute"
        style={{
          left: -14,
          top: 16,
          width: 14,
          height: 2,
          overflow: 'visible',
        }}
      >
        <line
          x1={0} y1={0} x2={14} y2={0}
          stroke={pin.color}
          strokeWidth={1.5}
          strokeDasharray="3 2"
          opacity={entered ? 0.6 : 0}
          style={{ transition: 'opacity 0.3s ease-out 0.1s' }}
        />
      </svg>

      {/* Popup card */}
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300 shadow-2xl shadow-black/60"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Colored edge glow */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px ${pin.color}20, 0 0 20px ${pin.color}08`,
          }}
        />

        {/* Card body */}
        <div className="relative bg-zinc-900/98 backdrop-blur-xl border border-zinc-700/50 w-64">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800/40">
            <span
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: pin.color, boxShadow: `0 0 8px ${pin.color}35` }}
            >
              {pin.number}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono tracking-tight">
              {Math.round(pin.x)},{Math.round(pin.y)}
            </span>
            <div className="flex-1" />
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/8 transition-colors duration-150"
              title={t('comment.deleteAnnotation')}
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors duration-150"
              title={t('comment.close')}
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={comment}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t('comment.describeHere')}
            className="w-full bg-zinc-950/60 px-3.5 py-3 text-[13px] text-zinc-200 placeholder-zinc-600 resize-none outline-none leading-relaxed"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
