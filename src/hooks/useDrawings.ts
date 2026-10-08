import { useState, useCallback } from 'react'
import type { Drawing } from '../types'
import { DRAWING_COLORS } from '../constants'

export function useDrawings() {
  const [drawings, setDrawings] = useState<Drawing[]>([])

  const add = useCallback((
    type: Drawing['type'],
    points: { x: number; y: number }[]
  ): Drawing => {
    const drawing: Drawing = {
      id: crypto.randomUUID(),
      type,
      points,
      color: DRAWING_COLORS[type]
    }
    setDrawings(prev => [...prev, drawing])
    return drawing
  }, [])

  const update = useCallback((id: string, updates: Partial<Drawing>) => {
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }, [])

  const remove = useCallback((id: string) => {
    setDrawings(prev => prev.filter(d => d.id !== id))
  }, [])

  const setAll = useCallback((newDrawings: Drawing[]) => {
    setDrawings(newDrawings)
  }, [])

  const reset = useCallback(() => {
    setDrawings([])
  }, [])

  return { items: drawings, add, update, remove, setAll, reset }
}
