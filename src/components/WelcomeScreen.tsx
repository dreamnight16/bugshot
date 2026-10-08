import { useTranslation } from 'react-i18next'
import { ArrowRightFromLine, Camera, Layers } from 'lucide-react'
import type { CaptureMode } from '../types'
import WindowControls from './WindowControls'
import LanguageSwitcher from './LanguageSwitcher'

interface Props {
  onCapture: (mode: CaptureMode) => void
}

const CAPTURE_MODES: {
  mode: CaptureMode
  labelKey: string
  hintKey: string
  index: string
  tone: 'teal' | 'cyan' | 'emerald'
  keys: string[]
  icon: typeof Camera
}[] = [
  {
    mode: 'fullscreen',
    labelKey: 'welcome.fullscreen',
    hintKey: 'capture.fullscreenHint',
    index: '01',
    tone: 'teal',
    keys: ['Ctrl', 'Shift', 'P'],
    icon: ArrowRightFromLine,
  },
  {
    mode: 'region',
    labelKey: 'welcome.region',
    hintKey: 'capture.regionHint',
    index: '02',
    tone: 'cyan',
    keys: ['Ctrl', 'Shift', 'R'],
    icon: Layers,
  },
  {
    mode: 'window',
    labelKey: 'welcome.window',
    hintKey: 'capture.windowHint',
    index: '03',
    tone: 'emerald',
    keys: ['Ctrl', 'Shift', 'W'],
    icon: Camera,
  },
]

const FACTS = ['capture.factUia', 'capture.factMcp', 'capture.factExport', 'capture.factHistory']
const STEPS = ['capture.step1', 'capture.step2', 'capture.step3']

export default function WelcomeScreen({ onCapture }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bs-capture">
      <header className="bs-capture__bar drag">
        <span className="bs-bar__brand">{t('welcome.title')}</span>
        <span className="bs-bar__spacer" />
        <LanguageSwitcher />
        <WindowControls />
      </header>

      <div className="bs-capture__body">
        <section className="bs-capture__intro" aria-labelledby="capture-heading">
          <p className="bs-kicker">{t('capture.kicker')}</p>
          <h1 id="capture-heading" className="bs-display">{t('welcome.title')}</h1>
          <p className="bs-lead">{t('welcome.subtitle')}</p>

          <div>
            <p className="bs-kicker">{t('capture.stepsTitle')}</p>
            <ol className="bs-steps">
              {STEPS.map((key, i) => (
                <li key={key} className="bs-steps__item">
                  <span className="bs-steps__n" aria-hidden="true">{i + 1}</span>
                  <span className="bs-steps__text">{t(key)}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="bs-facts__note">{t('welcome.startHint')}</p>
        </section>

        <section className="bs-capture__modes" aria-label={t('capture.modesLabel')}>
          {CAPTURE_MODES.map(({ mode, labelKey, hintKey, index, tone, keys, icon: Icon }, i) => (
            <button
              key={mode}
              type="button"
              onClick={() => onCapture(mode)}
              className={`bs-mode bs-mode--${tone} dn-interactive dn-focus dn-rise`}
              style={{ '--dn-enter-index': i } as React.CSSProperties}
            >
              <span className="bs-mode__index">{index}</span>
              <span className="bs-mode__row">
                <span className="bs-mode__name">{t(labelKey)}</span>
                <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
              </span>
              <span className="bs-mode__hint">{t(hintKey)}</span>
              <span className="bs-mode__keys">
                {keys.map((k) => <kbd key={k} className="bs-key">{k}</kbd>)}
              </span>
            </button>
          ))}
        </section>
      </div>

      <footer className="bs-capture__facts">
        <p className="bs-kicker">{t('capture.factsTitle')}</p>
        <ul className="bs-facts">
          {FACTS.map((key) => (
            <li key={key} className="bs-facts__item">
              <span className="bs-facts__value">{t(key)}</span>
            </li>
          ))}
        </ul>
        <p className="bs-facts__note">{t('capture.staticNote')}</p>
      </footer>
    </div>
  )
}
