import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { setLanguage } from '../i18n'

const LANGUAGES = [
  { code: 'en', labelKey: 'language.en' },
  { code: 'zh-CN', labelKey: 'language.zh-CN' },
  { code: 'zh-TW', labelKey: 'language.zh-TW' },
  { code: 'ja', labelKey: 'language.ja' },
]

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const label = t('language.label')

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div
      ref={ref}
      className="bs-lang no-drag"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          close()
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="bs-icon-btn dn-focus"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <Globe aria-hidden="true" size={16} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="bs-lang__menu dn-acrylic dn-elevation-3" role="menu" aria-label={label}>
          {LANGUAGES.map(({ code, labelKey }) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={i18n.language === code}
              onClick={() => { setLanguage(code); setOpen(false) }}
              className="bs-lang__item dn-focus"
            >
              <span>{t(labelKey)}</span>
              {i18n.language === code && <span aria-hidden="true">{'\u2713'}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
