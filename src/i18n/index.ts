import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import ja from './locales/ja.json'

const STORAGE_KEY = 'uipin-language'

function detectLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored

  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('zh-tw') || nav.startsWith('zh-hk')) return 'zh-TW'
  if (nav.startsWith('zh')) return 'zh-CN'
  if (nav.startsWith('ja')) return 'ja'
  return 'en'
}

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
    ja: { translation: ja },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export function setLanguage(lng: string) {
  localStorage.setItem(STORAGE_KEY, lng)
  i18next.changeLanguage(lng)
}

export default i18next
