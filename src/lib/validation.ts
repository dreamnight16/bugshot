import { z } from 'zod'

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const uiaElementInfoSchema = z.object({
  name: z.string(),
  controlType: z.string(),
  className: z.string(),
  automationId: z.string(),
  helpText: z.string(),
  isEnabled: z.boolean(),
  ancestors: z.array(z.object({
    name: z.string(),
    controlType: z.string(),
    className: z.string(),
  })),
  error: z.string().optional(),
})

export const pinSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  comment: z.string(),
  color: z.string(),
  uia: uiaElementInfoSchema.optional(),
})

export const drawingSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['arrow', 'rectangle', 'freehand']),
  points: z.array(pointSchema),
  color: z.string(),
  comment: z.string().optional(),
})

export const sessionSchema = z.object({
  id: z.string().min(1),
  screenshot: z.string(),
  pins: z.array(pinSchema),
  drawings: z.array(drawingSchema),
  windowName: z.string(),
  capturedAt: z.number(),
  status: z.enum(['active', 'resolved']),
})

export const captureBoundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().min(10),
  height: z.number().min(10),
})

export const mcpRequestSchema = z.object({
  method: z.string(),
  id: z.number().int(),
  params: z.object({
    name: z.string().optional(),
    arguments: z.record(z.unknown()).optional(),
  }).optional(),
})

export const mcpResolveArgsSchema = z.object({
  id: z.string().regex(/^[a-f0-9-]{8,}$/i, 'Invalid annotation ID format'),
})

export const knownMcpTools = [
  'list_annotations',
  'get_screenshot',
  'resolve_annotation',
  'get_context',
] as const

export type McpToolName = (typeof knownMcpTools)[number]

export function isKnownTool(name: string): name is McpToolName {
  return knownMcpTools.includes(name as McpToolName)
}
