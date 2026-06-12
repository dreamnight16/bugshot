import { describe, it, expect } from 'vitest'
import { buildFixPrompt, buildStyleFixPrompt, buildLayoutFixPrompt } from './prompts'
import type { Session, Pin, Drawing } from '../types'

const mockSession: Session = {
  id: 's1',
  screenshot: '',
  pins: [],
  drawings: [],
  windowName: 'Test',
  capturedAt: 0,
  status: 'active',
}

describe('buildFixPrompt', () => {
  it('includes pin coordinates and comments', () => {
    const pins: Pin[] = [
      { id: '1', number: 1, x: 150, y: 75, comment: 'button too small', color: '#ef4444' },
    ]
    const prompt = buildFixPrompt(mockSession, pins, [])
    expect(prompt).toContain('Pin 1')
    expect(prompt).toContain('button too small')
  })

  it('includes drawing annotations', () => {
    const drawings: Drawing[] = [
      { id: 'd1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: '#ef4444' },
    ]
    const prompt = buildFixPrompt(mockSession, [], drawings)
    expect(prompt).toContain('Arrow')
  })

  it('handles empty annotations', () => {
    const prompt = buildFixPrompt(mockSession, [], [])
    expect(prompt).toContain('fix them one by one')
  })
})

describe('buildStyleFixPrompt', () => {
  it('includes style-specific instructions', () => {
    const pins: Pin[] = [
      { id: '1', number: 1, x: 10, y: 10, comment: 'color mismatch', color: '#ef4444' },
    ]
    const prompt = buildStyleFixPrompt(mockSession, pins, [])
    expect(prompt).toContain('style issues')
    expect(prompt).toContain('design system')
    expect(prompt).toContain('responsive')
  })
})

describe('buildLayoutFixPrompt', () => {
  it('includes layout-specific instructions', () => {
    const pins: Pin[] = [
      { id: '1', number: 1, x: 10, y: 10, comment: 'alignment issue', color: '#3b82f6' },
    ]
    const prompt = buildLayoutFixPrompt(mockSession, pins, [])
    expect(prompt).toContain('layout issues')
    expect(prompt).toContain('Flexbox')
    expect(prompt).toContain('CSS Grid')
  })
})
