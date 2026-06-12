import { useState, useRef, useEffect } from 'react'
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative no-drag">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        title={t('language.' + i18n.language) ?? 'Language'}
      >
        <Globe className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 min-w-[120px]">
          {LANGUAGES.map(({ code, labelKey }) => (
            <button
              key={code}
              onClick={() => { setLanguage(code); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                i18n.language === code
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
