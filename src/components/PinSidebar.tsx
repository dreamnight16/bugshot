import { useRef, useEffect } from 'react'
import { Pin, ArrowRightFromLine, Square, Pen, Trash2, MousePointerClick } from 'lucide-react'
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
}

const typeIcons: Record<string, typeof Pin> = {
  arrow: ArrowRightFromLine,
  rectangle: Square,
  freehand: Pen,
}

export default function PinSidebar({
  pins, drawings, selectedPinId, selectedDrawingId,
  onPinSelect, onDrawingSelect, onPinUpdate, onPinDelete,
  onDrawingUpdate, onDrawingDelete,
}: Props) {
  const { t } = useTranslation()
  const listRef = useRef<HTMLDivElement>(null)

  const typeLabels: Record<string, string> = {
    arrow: t('export.arrow'),
    rectangle: t('export.rectangle'),
    freehand: t('export.freehand'),
  }

  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedPinId, selectedDrawingId])

  const isEmpty = pins.length === 0 && drawings.length === 0

  return (
    <div className="w-72 bg-zinc-950/70 backdrop-blur-sm border-l border-zinc-800/40 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-zinc-800/40">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest select-none">
            {t('sidebar.title')}
          </h2>
          {!isEmpty && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-zinc-800/80 text-[10px] font-semibold text-zinc-400 tabular-nums">
              {pins.length + drawings.length}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 flex items-center justify-center ring-1 ring-zinc-800/40">
              <MousePointerClick className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
            </div>
            <p className="text-[12px] text-zinc-500 leading-relaxed whitespace-pre-line">
              {t('sidebar.empty')}
            </p>
          </div>
        ) : (
          <div>
            {/* Pins */}
            {pins.map((pin) => {
              const isSelected = selectedPinId === pin.id
              return (
                <div
                  key={pin.id}
                  data-selected={isSelected}
                  onClick={() => onPinSelect(pin.id)}
                  className={`relative group px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-zinc-800/70'
                      : 'hover:bg-zinc-900/50'
                  }`}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Left accent */}
                  <div
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full transition-all duration-300"
                    style={{
                      backgroundColor: pin.color,
                      opacity: isSelected ? 1 : 0,
                      transform: isSelected ? 'scaleY(1)' : 'scaleY(0.4)',
                    }}
                  />

                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span
                      className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-full text-[10px] font-bold text-white shrink-0 select-none transition-all duration-200"
                      style={{
                        backgroundColor: pin.color,
                        boxShadow: isSelected ? `0 0 14px ${pin.color}50` : `0 0 0px ${pin.color}00`,
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {pin.number}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono tracking-tight tabular-nums">
                      {Math.round(pin.x)},{Math.round(pin.y)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onPinDelete(pin.id) }}
                      className="ml-auto p-1 rounded-md opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
                      title={t('sidebar.delete')}
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>

                  <textarea
                    value={pin.comment}
                    onChange={(e) => onPinUpdate(pin.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={t('sidebar.pinCommentPlaceholder')}
                    className={`w-full bg-transparent rounded-lg px-2.5 py-2 text-[12px] leading-relaxed placeholder-zinc-600 resize-none outline-none transition-all duration-200 ${
                      isSelected
                        ? 'text-zinc-200 bg-zinc-900/80 ring-1 ring-zinc-700/40'
                        : 'text-zinc-400 focus:text-zinc-300 focus:bg-zinc-900/40 focus:ring-1 focus:ring-zinc-800/40'
                    }`}
                    rows={2}
                  />
                </div>
              )
            })}

            {/* Drawings section */}
            {drawings.length > 0 && (
              <div>
                {pins.length > 0 && (
                  <div className="px-4 py-2.5 border-b border-zinc-800/20 bg-zinc-950/40">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      {t('export.drawingAnnotations')}
                    </span>
                  </div>
                )}
                {drawings.map((d) => {
                  const isSelected = selectedDrawingId === d.id
                  const Icon = typeIcons[d.type] || Pen
                  return (
                    <div
                      key={d.id}
                      data-selected={isSelected}
                      onClick={() => onDrawingSelect(d.id)}
                      className={`relative group px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-zinc-800/70'
                          : 'hover:bg-zinc-900/50'
                      }`}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                      }}
                    >
                      <div
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full transition-all duration-300"
                        style={{
                          backgroundColor: d.color,
                          opacity: isSelected ? 1 : 0,
                          transform: isSelected ? 'scaleY(1)' : 'scaleY(0.4)',
                        }}
                      />

                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div
                          className="w-[24px] h-[24px] rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                          style={{
                            backgroundColor: d.color + '15',
                            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: d.color }} strokeWidth={2} />
                        </div>
                        <span className="text-[11px] text-zinc-500">{typeLabels[d.type] || d.type}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDrawingDelete(d.id) }}
                          className="ml-auto p-1 rounded-md opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
                          title={t('sidebar.delete')}
                        >
                          <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>

                      <textarea
                        value={d.comment || ''}
                        onChange={(e) => onDrawingUpdate(d.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder={t('sidebar.drawingNotePlaceholder')}
                        className={`w-full bg-transparent rounded-lg px-2.5 py-2 text-[12px] leading-relaxed placeholder-zinc-600 resize-none outline-none transition-all duration-200 ${
                          isSelected
                            ? 'text-zinc-200 bg-zinc-900/80 ring-1 ring-zinc-700/40'
                            : 'text-zinc-400 focus:text-zinc-300 focus:bg-zinc-900/40 focus:ring-1 focus:ring-zinc-800/40'
                        }`}
                        rows={2}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
