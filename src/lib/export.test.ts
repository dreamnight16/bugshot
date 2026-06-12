import { describe, it, expect } from 'vitest'
import { exportJSON } from './export'
import type { Session, Pin, Drawing } from '../types'

const mockSession: Session = {
  id: 'ses-1',
  screenshot: 'data:image/png;base64,AAAA',
  pins: [],
  drawings: [],
  windowName: 'Test Window',
  capturedAt: 1700000000000,
  status: 'active',
}

describe('exportJSON', () => {
  it('exports session with pins and drawings', () => {
    const pins: Pin[] = [
      { id: 'p1', number: 1, x: 100.5, y: 200.3, comment: 'bad alignment', color: '#ef4444' },
    ]
    const drawings: Drawing[] = [
      { id: 'd1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: '#3b82f6' },
    ]
    const result = JSON.parse(exportJSON(mockSession, pins, drawings))

    expect(result.id).toBe('ses-1')
    expect(result.windowName).toBe('Test Window')
    expect(result.pinCount).toBe(1)
    expect(result.drawingCount).toBe(1)
    expect(result.pins[0].number).toBe(1)
    expect(result.pins[0].x).toBe(101) // rounded
  })

  it('handles empty pins and drawings', () => {
    const result = JSON.parse(exportJSON(mockSession, [], []))
    expect(result.pinCount).toBe(0)
    expect(result.drawingCount).toBe(0)
    expect(result.pins).toEqual([])
    expect(result.drawings).toEqual([])
  })
})
