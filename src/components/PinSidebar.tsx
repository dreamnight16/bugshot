import { useRef, useEffect, useState, useCallback } from 'react'
import { ArrowRightFromLine, Pen, Square, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Pin as PinType, Drawing } from '../types'

interface Props {
  pins: PinType[]
  drawings: Drawing[]
  selectedPinId: string | null
  selectedDrawingId: string | null
  onPinSelect: (id: string) => void
  onDrawingSelect: (id: string) => void
  onPinUpdate: (id: string, comment: string) => void
  onPinDelete: (id: string) => void
  onDrawingUpdate: (id: string, comment: string) => void
  onDrawingDelete: (id: string) => void
  onEditStart: () => void
}

const typeIcons: Record<string, typeof Square> = {
  arrow: ArrowRightFromLine,
  rectangle: Square,
  freehand: Pen,
}

export default function PinSidebar({
  pins, drawings, selectedPinId, selectedDrawingId,
  onPinSelect, onDrawingSelect, onPinUpdate, onPinDelete,
  onDrawingUpdate, onDrawingDelete, onEditStart,
}: Props) {
  const { t } = useTranslation()
  const listRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const dirty = useRef(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const typeLabels: Record<string, string> = {
    arrow: t('export.arrow'),
    rectangle: t('export.rectangle'),
    freehand: t('export.freehand'),
  }

  const total = pins.length + drawings.length
  const isEmpty = total === 0

  // Keep the mark selected on the canvas visible in the index.
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]')
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [selectedPinId, selectedDrawingId])

  // Escape closes the open note and hands focus back to the row that opened it.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Escape' || !openId) return
    e.stopPropagation()
    rowRefs.current[openId]?.focus()
    setOpenId(null)
  }, [openId])

  const toggle = (id: string) => {
    dirty.current = false
    setOpenId((current) => (current === id ? null : id))
  }

  const noteChange = (apply: (value: string) => void) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!dirty.current) {
      dirty.current = true
      onEditStart()
    }
    apply(e.target.value)
  }

  const coord = (x: number, y: number) => `${Math.round(x)}, ${Math.round(y)}`

  return (
    <aside
      className="bs-index"
      aria-label={t('index.title')}
      onKeyDown={handleKeyDown}
    >
      <div className="bs-index__head">
        <div>
          <p className="bs-kicker">{t('index.title')}</p>
          <p className="bs-index__hint">{t('index.hint')}</p>
        </div>
        <span className="bs-index__count" aria-label={`${t('index.title')}: ${total}`}>{total}</span>
      </div>

      <div ref={listRef} className="bs-index__list">
        {isEmpty ? (
          <div className="bs-empty">
            <p className="bs-kicker">{t('index.emptyTitle')}</p>
            <ol className="bs-empty__steps">
              <li>{t('index.emptyStep1')}</li>
              <li>{t('index.emptyStep2')}</li>
            </ol>
          </div>
        ) : (
          <>
            {pins.length > 0 && (
              <>
                {drawings.length > 0 && (
                  <div className="bs-index__section">
                    <p className="bs-kicker">{t('export.pin')}</p>
                  </div>
                )}
                {pins.map((pin) => {
                  const isSelected = selectedPinId === pin.id
                  const isOpen = openId === pin.id
                  const elementName = pin.uia?.name?.trim()
                  const elementType = pin.uia?.controlType?.trim()
                  const hasComment = pin.comment.trim().length > 0
                  const preview = hasComment
                    ? pin.comment
                    : (elementType || t('sidebar.pinCommentPlaceholder'))
                  return (
                    <div key={pin.id}>
                      <button
                        type="button"
                        ref={(el) => { rowRefs.current[pin.id] = el }}
                        data-selected={isSelected}
                        aria-expanded={isOpen}
                        aria-label={`${t('export.pin')} ${pin.number}, ${coord(pin.x, pin.y)}`}
                        className="bs-row dn-focus"
                        style={{ '--bs-field': pin.color } as React.CSSProperties}
                        onClick={() => { onPinSelect(pin.id); toggle(pin.id) }}
                      >
                        <span className="bs-row__head">
                          <span className="bs-row__badge">{pin.number}</span>
                          <span className="bs-row__title">{elementName || t('export.pin')}</span>
                          <span className="bs-row__coord">{coord(pin.x, pin.y)}</span>
                        </span>
                        <span className={`bs-row__preview${hasComment ? '' : ' bs-row__preview--empty'}`}>
                          {preview}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="bs-row__details" style={{ '--bs-field': pin.color } as React.CSSProperties}>
                          <label className="bs-visually-hidden" htmlFor={`note-${pin.id}`}>
                            {t('index.noteLabel')}
                          </label>
                          <textarea
                            id={`note-${pin.id}`}
                            value={pin.comment}
                            onChange={noteChange((value) => onPinUpdate(pin.id, value))}
                            placeholder={t('sidebar.pinCommentPlaceholder')}
                            className="bs-textarea"
                            rows={3}
                            autoFocus
                          />
                          <div className="bs-row__actions">
                            <button
                              type="button"
                              className="bs-btn bs-icon-btn--danger dn-interactive dn-focus"
                              onClick={() => { setOpenId(null); onPinDelete(pin.id) }}
                            >
                              <Trash2 aria-hidden="true" size={15} strokeWidth={1.5} />
                              <span className="bs-btn__label">{t('sidebar.delete')}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}

            {drawings.length > 0 && (
              <>
                {pins.length > 0 && (
                  <div className="bs-index__section">
                    <p className="bs-kicker">{t('export.drawingAnnotations')}</p>
                  </div>
                )}
                {drawings.map((d) => {
                  const isSelected = selectedDrawingId === d.id
                  const isOpen = openId === d.id
                  const Icon = typeIcons[d.type] || Pen
                  const hasComment = (d.comment || '').trim().length > 0
                  return (
                    <div key={d.id}>
                      <button
                        type="button"
                        ref={(el) => { rowRefs.current[d.id] = el }}
                        data-selected={isSelected}
                        aria-expanded={isOpen}
                        aria-label={typeLabels[d.type] || d.type}
                        className="bs-row dn-focus"
                        style={{ '--bs-field': d.color } as React.CSSProperties}
                        onClick={() => { onDrawingSelect(d.id); toggle(d.id) }}
                      >
                        <span className="bs-row__head">
                          <span className="bs-row__badge">
                            <Icon aria-hidden="true" size={15} strokeWidth={2} />
                          </span>
                          <span className="bs-row__title">{typeLabels[d.type] || d.type}</span>
                          <span className="bs-row__coord">{d.points.length} pt</span>
                        </span>
                        <span className={`bs-row__preview${hasComment ? '' : ' bs-row__preview--empty'}`}>
                          {hasComment ? d.comment : t('sidebar.drawingNotePlaceholder')}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="bs-row__details" style={{ '--bs-field': d.color } as React.CSSProperties}>
                          <label className="bs-visually-hidden" htmlFor={`note-${d.id}`}>
                            {t('index.noteLabel')}
                          </label>
                          <textarea
                            id={`note-${d.id}`}
                            value={d.comment || ''}
                            onChange={noteChange((value) => onDrawingUpdate(d.id, value))}
                            placeholder={t('sidebar.drawingNotePlaceholder')}
                            className="bs-textarea"
                            rows={3}
                            autoFocus
                          />
                          <div className="bs-row__actions">
                            <button
                              type="button"
                              className="bs-btn bs-icon-btn--danger dn-interactive dn-focus"
                              onClick={() => { setOpenId(null); onDrawingDelete(d.id) }}
                            >
                              <Trash2 aria-hidden="true" size={15} strokeWidth={1.5} />
                              <span className="bs-btn__label">{t('sidebar.delete')}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}
      </div>

      {!isEmpty && (
        <div className="bs-index__foot">
          <div className="bs-index__stat">
            <span className="bs-index__stat-value">{pins.length}</span>
            <span className="bs-kicker">{t('session.pins')}</span>
          </div>
          <div className="bs-index__stat">
            <span className="bs-index__stat-value">{drawings.length}</span>
            <span className="bs-kicker">{t('session.drawings')}</span>
          </div>
        </div>
      )}
    </aside>
  )
}
