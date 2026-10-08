import { useState } from 'react'
import {
  ArrowRightFromLine, Camera, Copy, Download, Pen, Pin, Redo2, Square, Trash2, Undo2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Tool, CaptureMode, Session, Pin as PinType, Drawing } from '../types'
import { exportMarkdown, exportJSON } from '../lib/export'
import { renderAnnotatedImage } from '../lib/renderer'
import LanguageSwitcher from './LanguageSwitcher'
import WindowControls from './WindowControls'

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

const TOOL_DEFS: { id: Tool; labelKey: string; icon: typeof Pin; shortcut: string }[] = [
  { id: 'pin',       labelKey: 'toolbar.pin',       icon: Pin,                shortcut: 'P' },
  { id: 'arrow',     labelKey: 'toolbar.arrow',     icon: ArrowRightFromLine, shortcut: 'A' },
  { id: 'rectangle', labelKey: 'toolbar.rectangle', icon: Square,             shortcut: 'R' },
  { id: 'freehand',  labelKey: 'toolbar.freehand',  icon: Pen,                shortcut: 'F' },
]

const STATUS_KEYS = {
  working: 'toolbar.exporting',
  success: 'toolbar.exported',
  error: 'toolbar.exportFailed',
} as const

export default function Toolbar({
  activeTool, onToolChange, onUndo, onRedo, canUndo, canRedo,
  onNewCapture, onClearAll, pins, drawings, session,
}: Props) {
  const { t } = useTranslation()
  const [exportState, setExportState] = useState<'idle' | 'working' | 'success' | 'error'>('idle')

  const handleCopy = async () => {
    setExportState('working')
    try {
      const md = await exportMarkdown(session, pins, drawings)
      window.electronAPI!.copyToClipboard(md)
      const sessionJson = exportJSON(session, pins, drawings)
      window.electronAPI!.updateAnnotations(sessionJson)
      setExportState('success')
    } catch {
      setExportState('error')
    }
  }

  const handleSaveScreenshot = async () => {
    setExportState('working')
    try {
      const dataUrl = await renderAnnotatedImage(session, pins, drawings)
      window.electronAPI!.saveScreenshot(dataUrl)
      setExportState('success')
    } catch {
      setExportState('error')
    }
  }

  const handleSaveJson = () => {
    try {
      const json = exportJSON(session, pins, drawings)
      window.electronAPI!.saveJson(json)
      setExportState('success')
    } catch {
      setExportState('error')
    }
  }

  const windowName = session.windowName || t('session.untitled')
  const capturedAt = new Date(session.capturedAt).toLocaleString()

  return (
    <header className="bs-bar drag">
      <span className="bs-bar__brand">BugShot</span>

      <div className="bs-bar__session">
        <span className="bs-bar__session-name" title={windowName}>{windowName}</span>
        <span
          className="bs-bar__session-time"
          title={t('session.capturedAt')}
          aria-label={`${t('session.capturedAt')}: ${capturedAt}`}
        >
          {capturedAt}
        </span>
      </div>

      <div className="bs-bar__divider" aria-hidden="true" />

      <div className="bs-tools" role="group" aria-label={t('toolbar.toolsLabel')}>
        {TOOL_DEFS.map(({ id, labelKey, icon: Icon, shortcut }) => {
          const isActive = activeTool === id
          const label = `${t(labelKey)} (${shortcut})`
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToolChange(id)}
              className={`bs-tool bs-tool--${id} dn-interactive dn-focus`}
              aria-pressed={isActive}
              aria-label={label}
              title={label}
            >
              <Icon aria-hidden="true" size={18} strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="bs-tool__key">{shortcut}</span>
            </button>
          )
        })}
      </div>

      <div className="bs-bar__divider" aria-hidden="true" />

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="bs-icon-btn dn-focus"
        title={`${t('toolbar.undo')} (Ctrl+Z)`}
        aria-label={t('toolbar.undo')}
      >
        <Undo2 aria-hidden="true" size={18} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className="bs-icon-btn dn-focus"
        title={`${t('toolbar.redo')} (Ctrl+Shift+Z)`}
        aria-label={t('toolbar.redo')}
      >
        <Redo2 aria-hidden="true" size={18} strokeWidth={1.75} />
      </button>

      <span className="bs-bar__spacer" />

      <button
        type="button"
        onClick={handleCopy}
        className="bs-btn bs-btn--primary dn-interactive dn-focus"
      >
        <Copy aria-hidden="true" size={16} strokeWidth={2} />
        <span className="bs-btn__label">{t('toolbar.copy')}</span>
      </button>
      <button
        type="button"
        onClick={handleSaveScreenshot}
        className="bs-btn dn-interactive dn-focus"
        title={`${t('toolbar.screenshot')} (Ctrl+S)`}
        aria-label={`${t('toolbar.screenshot')} (Ctrl+S)`}
      >
        <Download aria-hidden="true" size={16} strokeWidth={1.75} />
        <span className="bs-btn__label">{t('toolbar.screenshot')}</span>
      </button>
      <button
        type="button"
        onClick={handleSaveJson}
        className="bs-btn dn-interactive dn-focus"
        title={t('toolbar.exportJson')}
      >
        <span className="bs-btn__label">{t('toolbar.exportJson')}</span>
      </button>

      <span className={`bs-status bs-status--${exportState}`} role="status" aria-live="polite">
        {exportState !== 'idle' && (
          <>
            <span className="bs-status__mark" aria-hidden="true" />
            <span className="bs-status__text">{t(STATUS_KEYS[exportState])}</span>
          </>
        )}
      </span>

      <div className="bs-bar__divider" aria-hidden="true" />

      <button
        type="button"
        onClick={() => onNewCapture('fullscreen')}
        className="bs-icon-btn dn-focus"
        title={t('toolbar.newCapture')}
        aria-label={t('toolbar.newCapture')}
      >
        <Camera aria-hidden="true" size={18} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={onClearAll}
        className="bs-icon-btn bs-icon-btn--danger dn-focus"
        title={t('toolbar.clearAll')}
        aria-label={t('toolbar.clearAll')}
      >
        <Trash2 aria-hidden="true" size={18} strokeWidth={1.75} />
      </button>

      <div className="bs-bar__divider" aria-hidden="true" />

      <LanguageSwitcher />
      <WindowControls />
    </header>
  )
}
