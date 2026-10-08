import { useEffect } from 'react'
import type { Tool } from '../types'

interface ShortcutMap {
  onToolChange: (tool: Tool) => void
  onDeselectAll: () => void
  /** Arrow keys move the selected mark: 1 px, or 10 px with Shift. */
  onNudge?: (dx: number, dy: number) => void
}

const NUDGE: Record<string, [number, number]> = {
  arrowleft: [-1, 0],
  arrowright: [1, 0],
  arrowup: [0, -1],
  arrowdown: [0, 1],
}

export function useShortcuts({ onToolChange, onDeselectAll, onNudge }: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key.toLowerCase()

      if (onNudge && NUDGE[key]) {
        const step = e.shiftKey ? 10 : 1
        const [dx, dy] = NUDGE[key]
        e.preventDefault()
        onNudge(dx * step, dy * step)
        return
      }

      switch (key) {
        case 'p': onToolChange('pin'); break
        case 'a': onToolChange('arrow'); break
        case 'r': onToolChange('rectangle'); break
        case 'f': onToolChange('freehand'); break
        case 'escape': onDeselectAll(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onToolChange, onDeselectAll, onNudge])
}
