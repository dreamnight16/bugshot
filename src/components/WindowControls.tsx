import { Minus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Window controls for the frameless shell. Rendered on every screen so the
 * window can always be minimised or hidden back to the tray.
 */
export default function WindowControls() {
  const { t } = useTranslation()
  const minimize = t('windowControls.minimize')
  const close = t('windowControls.close')

  return (
    <div className="bs-window-controls no-drag">
      <button
        type="button"
        onClick={() => window.electronAPI?.minimizeWindow()}
        className="bs-icon-btn dn-focus"
        title={minimize}
        aria-label={minimize}
      >
        <Minus aria-hidden="true" size={16} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => window.electronAPI?.closeWindow()}
        className="bs-icon-btn bs-icon-btn--danger dn-focus"
        title={close}
        aria-label={close}
      >
        <X aria-hidden="true" size={16} strokeWidth={2} />
      </button>
    </div>
  )
}
