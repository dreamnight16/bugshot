import { useState, useCallback } from 'react'
import type { Pin, UIAElementInfo } from '../types'

const COLORS = ['#ef4444', '#eab308', '#3b82f6', '#22c55e']

async function queryUIA(x: number, y: number): Promise<UIAElementInfo | undefined> {
  try {
    const info = await window.electronAPI?.queryUIA(x, y)
    if (info && !info.error) return info
  } catch { /* UIA not available */ }
  return undefined
}

export function usePins() {
  const [pins, setPins] = useState<Pin[]>([])

  const add = useCallback(async (x: number, y: number): Promise<Pin> => {
    const nextNumber = pins.length + 1
    const color = COLORS[(nextNumber - 1) % COLORS.length]
    const uia = await queryUIA(x, y)
    const pin: Pin = {
      id: crypto.randomUUID(),
      number: nextNumber,
      x,
      y,
      comment: '',
      color,
      uia
    }
    setPins(prev => [...prev, pin])
    return pin
  }, [pins.length])

  const update = useCallback((id: string, updates: Partial<Pin>) => {
    setPins(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const remove = useCallback((id: string) => {
    setPins(prev => {
      const filtered = prev.filter(p => p.id !== id)
      return filtered.map((p, i) => ({ ...p, number: i + 1 }))
    })
  }, [])

  const setAll = useCallback((newPins: Pin[]) => {
    setPins(newPins)
  }, [])

  const reset = useCallback(() => {
    setPins([])
  }, [])

  return { items: pins, add, update, remove, setAll, reset }
}
