import { describe, it, expect } from 'vitest'
import {
  pinSchema, drawingSchema, captureBoundsSchema,
  mcpResolveArgsSchema, isKnownTool,
} from './validation'

describe('pinSchema', () => {
  it('accepts a valid pin', () => {
    const pin = { id: 'abc-123', number: 1, x: 100, y: 200, comment: '', color: '#ef4444' }
    expect(pinSchema.safeParse(pin).success).toBe(true)
  })

  it('rejects a pin with missing id', () => {
    const pin = { number: 1, x: 100, y: 200, comment: '', color: '#ef4444' }
    expect(pinSchema.safeParse(pin).success).toBe(false)
  })

  it('rejects a pin with negative number', () => {
    const pin = { id: 'abc', number: -1, x: 100, y: 200, comment: '', color: '#ef4444' }
    expect(pinSchema.safeParse(pin).success).toBe(false)
  })
})

describe('drawingSchema', () => {
  it('accepts a valid drawing', () => {
    const d = { id: 'd1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 100, y: 100 }], color: '#ef4444' }
    expect(drawingSchema.safeParse(d).success).toBe(true)
  })

  it('rejects unknown drawing type', () => {
    const d = { id: 'd1', type: 'circle', points: [{ x: 0, y: 0 }], color: '#ef4444' }
    expect(drawingSchema.safeParse(d).success).toBe(false)
  })
})

describe('captureBoundsSchema', () => {
  it('accepts valid bounds', () => {
    expect(captureBoundsSchema.safeParse({ x: 0, y: 0, width: 100, height: 100 }).success).toBe(true)
  })

  it('rejects bounds with width < 10', () => {
    expect(captureBoundsSchema.safeParse({ x: 0, y: 0, width: 5, height: 100 }).success).toBe(false)
  })
})

describe('mcpResolveArgsSchema', () => {
  it('accepts a valid UUID-like id', () => {
    expect(mcpResolveArgsSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' }).success).toBe(true)
  })

  it('rejects a non-hex id shorter than 8 chars', () => {
    expect(mcpResolveArgsSchema.safeParse({ id: 'abc' }).success).toBe(false)
  })

  it('rejects empty string id', () => {
    expect(mcpResolveArgsSchema.safeParse({ id: '' }).success).toBe(false)
  })
})

describe('isKnownTool', () => {
  it('returns true for known tools', () => {
    expect(isKnownTool('list_annotations')).toBe(true)
    expect(isKnownTool('get_screenshot')).toBe(true)
    expect(isKnownTool('resolve_annotation')).toBe(true)
    expect(isKnownTool('get_context')).toBe(true)
  })

  it('returns false for unknown tools', () => {
    expect(isKnownTool('delete_everything')).toBe(false)
    expect(isKnownTool('')).toBe(false)
  })
})
