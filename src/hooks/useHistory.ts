import { useState, useCallback } from 'react'
import type { Pin, Drawing, HistoryEntry } from '../types'

export function useHistory() {
  const [stack, setStack] = useState<HistoryEntry[]>([])
  const [index, setIndex] = useState(-1)

  const pushState = useCallback((pins: Pin[], drawings: Drawing[]) => {
    setStack(prev => {
      const newStack = prev.slice(0, index + 1)
      newStack.push({ pins: [...pins], drawings: [...drawings] })
      if (newStack.length > 50) newStack.shift()
      return newStack
    })
    setIndex(prev => Math.min(prev + 1, 49))
  }, [index])

  const undo = useCallback((): HistoryEntry | null => {
    if (index <= 0) return null
    const newIndex = index - 1
    setIndex(newIndex)
    return stack[newIndex]
  }, [stack, index])

  const redo = useCallback((): HistoryEntry | null => {
    if (index >= stack.length - 1) return null
    const newIndex = index + 1
    setIndex(newIndex)
    return stack[newIndex]
  }, [stack, index])

  const reset = useCallback(() => {
    setStack([])
    setIndex(-1)
  }, [])

  return {
    canUndo: index > 0,
    canRedo: index < stack.length - 1,
    pushState,
    undo,
    redo,
    reset
  }
}
