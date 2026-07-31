import { Copy, Download, Undo2, Redo2, Pin, ArrowRightFromLine, Square, Pen, Camera, Trash2, Minus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Tool, CaptureMode, Session, Pin as PinType, Drawing } from '../types'
import { exportMarkdown, exportJSON } from '../lib/export'
import { renderAnnotatedImage } from '../lib/renderer'
import LanguageSwitcher from './LanguageSwitcher'

interface Props {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onNewCapture: (mode: CaptureMode) => void
  onClearAll: () => void
  session: Session
  pins: PinType[]
  drawings: Drawing[]
}

const TOOL_DEFS: { id: Tool; labelKey: string; icon: typeof Pin; color: string; shortcut: string }[] = [
  { id: 'pin',       labelKey: 'toolbar.pin',       icon: Pin,               color: '#ef4444', shortcut: 'P' },
  { id: 'arrow',     labelKey: 'toolbar.arrow',     icon: ArrowRightFromLine, color: '#3b82f6', shortcut: 'A' },
  { id: 'rectangle', labelKey: 'toolbar.rectangle', icon: Square,            color: '#22c55e', shortcut: 'R' },
  { id: 'freehand',  labelKey: 'toolbar.freehand',  icon: Pen,              color: '#a78bfa', shortcut: 'F' },
]

export default function Toolbar({
  activeTool, onToolChange, onUndo, onRedo, canUndo, canRedo,
  onNewCapture, onClearAll, session, pins, drawings,
}: Props) {
  const { t } = useTranslation()

  const handleCopy = async () => {
    const md = await exportMarkdown(session, pins, drawings)
    window.electronAPI?.copyToClipboard(md)
    const sessionJson = exportJSON(session, pins, drawings)
    window.electronAPI?.updateAnnotations(sessionJson)
  }

  const handleSaveScreenshot = async () => {
    const dataUrl = await renderAnnotatedImage(session, pins, drawings)
    window.electronAPI?.saveScreenshot(dataUrl)
  }

  const handleSaveJson = () => {
    const json = exportJSON(session, pins, drawings)
    window.electronAPI?.saveJson(json)
  }

  const activeDef = TOOL_DEFS.find(t => t.id === activeTool)
  const activeColor = activeDef?.color ?? '#71717a'

  return (
    <div className="flex items-center gap-2.5 pl-4 pr-1 h-11 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/40 drag relative z-20">
      {/* App title */}
      <div className="select-none flex items-center gap-2">
        <span className="text-[13px] font-semibold text-zinc-300 tracking-tight">
          BugShot
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-zinc-800/50" />

      {/* Tool selector — pill style with glow on active */}
      <div className="flex items-center bg-zinc-900/80 rounded-lg p-0.5 ring-1 ring-zinc-800/60 no-drag">
        {TOOL_DEFS.map(({ id, labelKey, icon: Icon, color }) => {
          const isActive = activeTool === id
          return (
            <button
              key={id}
              onClick={() => onToolChange(id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={`${t(labelKey)} (${TOOL_DEFS.find(td => td.id === id)?.shortcut})`}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-[7px]"
                  style={{
                    background: `linear-gradient(180deg, ${color}12 0%, transparent 100%)`,
                    boxShadow: `0 0 0 1px ${color}20, 0 0 10px ${color}10`,
                  }}
                />
              )}
              <Icon
                className="w-3.5 h-3.5 relative transition-all duration-200"
                style={{
                  color: isActive ? color : undefined,
                  filter: isActive ? `drop-shadow(0 0 4px ${color}40)` : undefined,
                }}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <span className="relative hidden sm:inline">{t(labelKey)}</span>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-zinc-800/50" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 no-drag">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
          title={t('toolbar.undo') + ' (Ctrl+Z)'}
        >
          <Undo2 className="w-[17px] h-[17px]" strokeWidth={1.75} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
          title={t('toolbar.redo') + ' (Ctrl+Shift+Z)'}
        >
          <Redo2 className="w-[17px] h-[17px]" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex-1" />

      {/* Export actions */}
      <div className="flex items-center gap-1.5 no-drag">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-[12px] font-semibold transition-all duration-200 hover:brightness-110"
          style={{
            backgroundColor: activeColor,
            boxShadow: `0 2px 8px ${activeColor}35, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
        >
          <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
          {t('toolbar.copy')}
        </button>
        <button
          onClick={handleSaveScreenshot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-[12px] font-medium transition-all duration-150 ring-1 ring-zinc-700/40"
          title={t('toolbar.screenshot') + ' (Ctrl+S)'}
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">{t('toolbar.screenshot')}</span>
        </button>
        <button
          onClick={handleSaveJson}
          className="px-2.5 py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-400 text-[12px] font-medium transition-all duration-150 ring-1 ring-zinc-800/40"
          title={t('toolbar.exportJson')}
        >
          JSON
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-zinc-800/50" />

      {/* Capture + clear */}
      <div className="flex items-center gap-0.5 no-drag">
        <button
          onClick={() => onNewCapture('fullscreen')}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150"
          title={t('toolbar.newCapture')}
        >
          <Camera className="w-[17px] h-[17px]" strokeWidth={1.75} />
        </button>
        <button
          onClick={onClearAll}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/8 transition-all duration-150"
          title={t('toolbar.clearAll')}
        >
          <Trash2 className="w-[17px] h-[17px]" strokeWidth={1.75} />
        </button>
      </div>

      {/* Window controls */}
      <div className="flex items-center no-drag">
        <button
          onClick={() => window.electronAPI?.minimizeWindow()}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-150"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={() => window.electronAPI?.closeWindow()}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
          title="Close to tray"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      <LanguageSwitcher />
    </div>
  )
}
