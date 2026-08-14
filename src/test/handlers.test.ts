import { describe, it, expect, beforeEach } from 'vitest'
import { getSessionState, setSessionState, listAnnotations, resolveAnnotation, buildMarkdownContext } from '../../electron/mcp/handlers'
import type { SessionState } from '../../electron/mcp/types'

function makeSession(): SessionState {
  return {
    screenshot: 'data:image/png;base64,AAAA',
    windowName: 'Main Window',
    pins: JSON.stringify([
      { id: 'pin-1', number: 1, x: 100, y: 200, comment: 'Button misaligned', color: '#ef4444' },
      { id: 'pin-2', number: 2, x: 50, y: 60, comment: '', color: '#3b82f6' },
    ]),
    drawings: JSON.stringify([
      { id: 'draw-1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }], color: '#22c55e', comment: 'arrow here' },
    ]),
  }
}

beforeEach(() => {
  setSessionState(null)
})

describe('listAnnotations', () => {
  it('returns empty annotations when no session exists', () => {
    expect(listAnnotations()).toEqual({ pins: [], drawings: [], windowName: '', hasSession: false })
  })

  it('parses pins and drawings from the active session', () => {
    setSessionState(makeSession())
    const result = listAnnotations()
    expect(result.hasSession).toBe(true)
    expect(result.windowName).toBe('Main Window')
    expect(result.pins).toHaveLength(2)
    expect(result.drawings).toHaveLength(1)
  })
})

describe('resolveAnnotation', () => {
  it('removes a pin by id and returns true', () => {
    setSessionState(makeSession())
    expect(resolveAnnotation('pin-1')).toBe(true)
    const state = getSessionState()
    expect(JSON.parse(state?.pins || '[]')).toHaveLength(1)
  })

  it('removes a drawing by id and returns true', () => {
    setSessionState(makeSession())
    expect(resolveAnnotation('draw-1')).toBe(true)
    const state = getSessionState()
    expect(JSON.parse(state?.drawings || '[]')).toHaveLength(0)
  })

  it('returns false when id is unknown or no session exists', () => {
    expect(resolveAnnotation('missing')).toBe(false)
    setSessionState(makeSession())
    expect(resolveAnnotation('missing')).toBe(false)
  })
})

describe('buildMarkdownContext', () => {
  it('returns empty string when no session exists', () => {
    expect(buildMarkdownContext()).toBe('')
  })

  it('includes window name and pin comments', () => {
    setSessionState(makeSession())
    const md = buildMarkdownContext()
    expect(md).toContain('Main Window')
    expect(md).toContain('Button misaligned')
    expect(md).toContain('arrow')
  })

  it('renders only the header when the session has no annotations', () => {
    setSessionState({ screenshot: 'x', windowName: 'Empty', pins: '[]', drawings: '[]' })
    expect(buildMarkdownContext()).toBe('## UI 问题反馈\n\n窗口: Empty\n\n')
  })

  it('rounds pin coordinates and falls back to (无备注) for empty comments', () => {
    setSessionState({
      screenshot: 'x',
      windowName: 'W',
      pins: JSON.stringify([{ id: 'p', number: 1, x: 100.4, y: 199.6, comment: '', color: '#000000' }]),
      drawings: '[]',
    })
    const md = buildMarkdownContext()
    expect(md).toContain('**Pin 1** — 位置 (100, 200)')
    expect(md).toContain('> (无备注)')
  })

  it('omits the comment suffix for drawings without a comment', () => {
    setSessionState({
      screenshot: 'x',
      windowName: 'W',
      pins: '[]',
      drawings: JSON.stringify([{ id: 'd1', type: 'rectangle', points: [], color: '#000000' }]),
    })
    const md = buildMarkdownContext()
    expect(md).toContain('- **rectangle** (#000000)\n')
    expect(md).not.toContain('—')
  })
})
