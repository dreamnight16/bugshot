import { useState, useEffect } from 'react'
import { Camera, MonitorSmartphone, Layers } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CaptureMode } from '../types'

interface Props {
  onCapture: (mode: CaptureMode) => void
}

const captureOptions: {
  mode: CaptureMode; labelKey: string; shortcut: string; icon: typeof Camera; color: string
}[] = [
  { mode: 'fullscreen', labelKey: 'welcome.fullscreen', shortcut: 'Ctrl + Shift + P', icon: MonitorSmartphone, color: '#61b6ff' },
  { mode: 'region',     labelKey: 'welcome.region',    shortcut: 'Ctrl + Shift + R', icon: Layers,            color: '#b6d64a' },
  { mode: 'window',     labelKey: 'welcome.window',    shortcut: 'Ctrl + Shift + W', icon: Camera,            color: '#f1bd61' },
]

export default function WelcomeScreen({ onCapture }: Props) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center h-screen gap-12 overflow-hidden bg-[#0d131a] select-none">
      {/* Dot grid — larger, richer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 70%)',
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Header — staggered fade in */}
      <div
        className="relative flex flex-col items-center gap-5 transition-all duration-700 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        {/* Logo mark */}
        <div className="relative">
          <div className="signal-aura absolute inset-0 rounded-2xl blur-2xl bg-cyan-400/15 scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-[#172633] flex items-center justify-center ring-1 ring-cyan-200/20 shadow-[0_0_30px_rgba(47,158,174,0.22)]">
            <MonitorSmartphone className="w-9 h-9 text-white" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <h1 className="text-[2.5rem] font-bold tracking-tight text-white leading-none">
            BugShot
          </h1>
          <p className="text-sm text-zinc-500 text-center leading-relaxed max-w-64">
            {t('welcome.subtitle')}
          </p>
        </div>
      </div>

      {/* Capture cards — staggered entrance */}
      <div className="relative flex flex-col gap-3 w-80">
        {captureOptions.map(({ mode, labelKey, shortcut, icon: Icon, color }, i) => (
          <button
            key={mode}
            onClick={() => onCapture(mode)}
            className="group relative flex items-center gap-4 px-5 py-4 rounded-xl bg-zinc-900/70 border border-zinc-800/70 hover:border-cyan-200/30 hover:bg-zinc-800/50 transition-[background-color,border-color,transform,box-shadow] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,.2)] text-left overflow-hidden"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: `${150 + i * 80}ms`,
              transitionProperty: 'opacity, transform',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Hover color wash */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-xl"
              style={{ background: `radial-gradient(140% 140% at 25% 50%, ${color}, transparent 70%)` }}
            />

            {/* Icon badge */}
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(47,158,174,.18)]"
              style={{
                backgroundColor: color + '14',
                boxShadow: `inset 0 1px 0 ${color}10`,
              }}
            >
              <Icon className="w-5 h-5 transition-colors duration-300" style={{ color }} strokeWidth={1.5} />
            </div>

            {/* Label */}
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-sm text-zinc-200 group-hover:text-white transition-colors duration-200">
                {t(labelKey)}
              </span>
              <span className="text-[11px] text-zinc-600 group-hover:text-zinc-500 transition-colors duration-200 font-mono tracking-tight">
                {shortcut}
              </span>
            </div>

            {/* Arrow */}
            <div className="ml-auto transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0">
              <span className="text-[11px] text-zinc-600" style={{ fontFamily: 'system-ui' }}>→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer hints */}
      <div
        className="relative flex flex-col items-center gap-2.5 transition-all duration-700 ease-out delay-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        <div className="flex items-center gap-4 text-[11px] font-mono tracking-tight">
          {[
            { k: 'P', v: 'Pin' },
            { k: 'A', v: 'Arrow' },
            { k: 'R', v: 'Rect' },
            { k: 'F', v: 'Pen' },
          ].map(({ k, v }) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">{k}</span>
              <span className="text-zinc-600">{v}</span>
            </span>
          ))}
        </div>
        <p className="text-[11px] text-zinc-700">{t('welcome.startHint')}</p>
      </div>
    </div>
  )
}
