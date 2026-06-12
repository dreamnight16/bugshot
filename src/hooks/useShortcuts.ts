import { useEffect } from 'react'
import type { Tool } from '../types'

interface ShortcutMap {
  onToolChange: (tool: Tool) => void
  onDeselectAll: () => void
}

export function useShortcuts({ onToolChange, onDeselectAll }: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'p': onToolChange('pin'); break
        case 'a': onToolChange('arrow'); break
        case 'r': onToolChange('rectangle'); break
        case 'f': onToolChange('freehand'); break
        case 'escape': onDeselectAll(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onToolChange, onDeselectAll])
}
