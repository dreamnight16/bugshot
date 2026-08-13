import i18next from 'i18next'
import en from '../i18n/locales/en.json'

// Initialize i18next for tests
if (!i18next.isInitialized) {
  i18next.init({
    resources: { en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
}

// Mock crypto.randomUUID for consistent test IDs
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
    },
    writable: true,
  })
}
