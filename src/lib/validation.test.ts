import { describe, it, expect } from 'vitest'
import {
  pinSchema, drawingSchema, captureBoundsSchema,
  mcpResolveArgsSchema, isKnownTool,
  pointSchema, uiaElementInfoSchema, sessionSchema, mcpRequestSchema,
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

describe('pointSchema', () => {
  it('accepts numeric x and y', () => {
    expect(pointSchema.safeParse({ x: 0, y: 0 }).success).toBe(true)
    expect(pointSchema.safeParse({ x: -1.5, y: 10.25 }).success).toBe(true)
  })

  it('rejects non-numeric or missing coordinates', () => {
    expect(pointSchema.safeParse({ x: '0', y: 0 }).success).toBe(false)
    expect(pointSchema.safeParse({ x: 0 }).success).toBe(false)
  })
})

describe('uiaElementInfoSchema', () => {
  const valid = {
    name: 'OK',
    controlType: 'Button',
    className: 'Button',
    automationId: 'btn-1',
    helpText: 'help',
    isEnabled: true,
    ancestors: [{ name: 'Root', controlType: 'Window', className: 'Window' }],
  }

  it('accepts a valid element info', () => {
    expect(uiaElementInfoSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts an optional error field', () => {
    expect(uiaElementInfoSchema.safeParse({ ...valid, error: 'oops' }).success).toBe(true)
  })

  it('rejects when isEnabled is not a boolean', () => {
    expect(uiaElementInfoSchema.safeParse({ ...valid, isEnabled: 'yes' }).success).toBe(false)
  })

  it('rejects when an ancestor is missing controlType', () => {
    const bad = { ...valid, ancestors: [{ name: 'Root', className: 'Window' }] }
    expect(uiaElementInfoSchema.safeParse(bad).success).toBe(false)
  })
})

describe('sessionSchema', () => {
  const valid = {
    id: 'session-1',
    screenshot: 'data:image/png;base64,AAAA',
    pins: [{ id: 'p1', number: 1, x: 10, y: 20, comment: 'hi', color: '#000000' }],
    drawings: [{ id: 'd1', type: 'arrow', points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], color: '#ff0000' }],
    windowName: 'Main Window',
    capturedAt: 1700000000000,
    status: 'active',
  }

  it('accepts a valid session', () => {
    expect(sessionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an empty id', () => {
    expect(sessionSchema.safeParse({ ...valid, id: '' }).success).toBe(false)
  })

  it('rejects an unknown status', () => {
    expect(sessionSchema.safeParse({ ...valid, status: 'pending' }).success).toBe(false)
  })

  it('rejects a session containing an invalid pin', () => {
    const badPin = { id: 'p1', number: -1, x: 10, y: 20, comment: 'hi', color: '#000000' }
    expect(sessionSchema.safeParse({ ...valid, pins: [badPin] }).success).toBe(false)
  })
})

describe('mcpRequestSchema', () => {
  it('accepts a request without params', () => {
    expect(mcpRequestSchema.safeParse({ method: 'list_annotations', id: 1 }).success).toBe(true)
  })

  it('accepts a request with params and arguments', () => {
    const req = { method: 'resolve_annotation', id: 2, params: { name: 'resolve_annotation', arguments: { id: 'abc-123' } } }
    expect(mcpRequestSchema.safeParse(req).success).toBe(true)
  })

  it('rejects a request with a non-integer id', () => {
    expect(mcpRequestSchema.safeParse({ method: 'get_context', id: 1.5 }).success).toBe(false)
  })

  it('rejects a request with a string id', () => {
    expect(mcpRequestSchema.safeParse({ method: 'get_context', id: '1' }).success).toBe(false)
  })

  it('rejects a request with a non-string method', () => {
    expect(mcpRequestSchema.safeParse({ method: 123, id: 1 }).success).toBe(false)
  })
})
