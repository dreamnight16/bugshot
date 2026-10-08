import { useRef, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, X } from 'lucide-react'
import type { Pin } from '../types'

interface Props {
  pin: Pin
  /** Natural width of the screenshot, used to keep the popover inside the image. */
  imageWidth: number
  /** Current zoom, so the popover keeps a constant on-screen size. */
  scale: number
  onUpdate: (comment: string) => void
  /** Records one undo step for the whole editing gesture. */
  onEditStart: () => void
  onDelete: () => void
  onClose: () => void
}

const WIDTH = 288
const GAP = 24

export default function CommentInput({
  pin, imageWidth, scale, onUpdate, onEditStart, onDelete, onClose,
}: Props) {
  const { t } = useTranslation()
  const popRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dirty = useRef(false)
  // Captured before focus moves into the popover, so Escape can hand it back.
  const restoreRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null)

  useLayoutEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    return () => {
      restoreRef.current?.focus?.()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return

    const nodes = popRef.current?.querySelectorAll<HTMLElement>(
      'textarea, button, input, select, a[href], [tabindex]:not([tabindex="-1"])',
    )
    const list = nodes ? Array.from(nodes).filter((n) => !n.hasAttribute('disabled')) : []
    if (list.length === 0) return
    const first = list[0]
    const last = list[list.length - 1]
    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    }
  }

  // Flip to the other side of the pin when the popover would leave the image.
  const fitsRight = imageWidth === 0 || pin.x + GAP + WIDTH <= imageWidth
  const left = fitsRight ? pin.x + GAP : Math.max(0, pin.x - GAP - WIDTH)
  const top = Math.max(0, pin.y - 12)
  const dialogLabel = `${t('export.pin')} ${pin.number}`

  return (
    <div
      ref={popRef}
      className="bs-popover"
      role="dialog"
      aria-label={dialogLabel}
      style={{ left, top, transform: `scale(${1 / scale})` }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <div className="dn-rise">
        <div
          className="bs-popover__body dn-acrylic dn-elevation-3"
          style={{ borderLeft: `4px solid ${pin.color}` }}
        >
          <div className="bs-popover__head">
            <span
              className="bs-popover__badge"
              style={{ backgroundColor: pin.color }}
            >
              {pin.number}
            </span>
            <span className="bs-popover__coord">
              {Math.round(pin.x)},{Math.round(pin.y)}
            </span>
            <span className="bs-popover__spacer" />
            <button
              type="button"
              onClick={onDelete}
              className="bs-icon-btn bs-icon-btn--danger dn-focus"
              title={t('comment.deleteAnnotation')}
              aria-label={t('comment.deleteAnnotation')}
            >
              <Trash2 aria-hidden="true" size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bs-icon-btn dn-focus"
              title={t('comment.close')}
              aria-label={t('comment.close')}
            >
              <X aria-hidden="true" size={16} strokeWidth={1.5} />
            </button>
          </div>

          <textarea
            ref={inputRef}
            value={pin.comment}
            onChange={(e) => {
              if (!dirty.current) {
                dirty.current = true
                onEditStart()
              }
              onUpdate(e.target.value)
            }}
            placeholder={t('comment.describeHere')}
            className="bs-textarea"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
