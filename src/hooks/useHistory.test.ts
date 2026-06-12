import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from './useHistory'
import type { Pin, Drawing } from '../types'

const pin: Pin = { id: '1', number: 1, x: 0, y: 0, comment: '', color: '#ef4444' }
const drawing: Drawing = { id: 'd1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: '#3b82f6' }

describe('useHistory', () => {
  it('starts with canUndo=false and canRedo=false', () => {
    const { result } = renderHook(() => useHistory())
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('can undo after pushing two states', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.pushState([], []) })
    act(() => { result.current.pushState([pin], []) })
    expect(result.current.canUndo).toBe(true)
  })

  it('undo restores previous state', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.pushState([], []) })
    act(() => { result.current.pushState([pin], []) })

    let restored = null
    act(() => { restored = result.current.undo() })
    expect(restored).toEqual({ pins: [], drawings: [] })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('redo restores undone state', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.pushState([], []) })
    act(() => { result.current.pushState([pin], []) })
    act(() => { result.current.undo() })

    let restored = null
    act(() => { restored = result.current.redo() })
    expect(restored).toEqual({ pins: [pin], drawings: [] })
  })

  it('undo returns null when at beginning', () => {
    const { result } = renderHook(() => useHistory())
    let restored: unknown = 'not null'
    act(() => { restored = result.current.undo() })
    expect(restored).toBeNull()
  })

  it('redo returns null when at end', () => {
    const { result } = renderHook(() => useHistory())
    let restored: unknown = 'not null'
    act(() => { restored = result.current.redo() })
    expect(restored).toBeNull()
  })

  it('enforces 50-entry limit', () => {
    const { result } = renderHook(() => useHistory())
    for (let i = 0; i < 60; i++) {
      act(() => { result.current.pushState([], []) })
    }
    // After 60 pushes, stack should be capped at 50
    act(() => { result.current.undo() })
    // Should still work without error
    expect(result.current.canRedo).toBe(true)
  })

  it('branches new history on push after undo', () => {
    const { result } = renderHook(() => useHistory())
    act(() => { result.current.pushState([], []) })
    act(() => { result.current.pushState([pin], []) })
    act(() => { result.current.undo() })
    // Push a new state (should overwrite the "redo" future)
    act(() => { result.current.pushState([pin, { ...pin, id: '2', number: 2 }], []) })
    expect(result.current.canRedo).toBe(false)
  })
})
