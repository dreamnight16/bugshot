import type { Drawing, Tool } from './types'

export const MAX_HISTORY = 50
export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 5
export const ZOOM_STEP = 0.25
export const DEFAULT_SCALE = 1

/*
 * Annotation colours are DNDL brand primitives, declared once here so the canvas
 * renderer, the on-screen markers, the toolbar and the index cannot drift apart.
 * Values mirror public/vendor/dndl/tokens.css and are never re-tuned locally.
 */

/** Crimson, Amber, Cyan, Emerald — cycled across pin markers. */
export const PIN_COLORS = ['#C98292', '#D4AC65', '#70B2D1', '#72AD8C'] as const

export const DRAWING_COLORS: Record<Drawing['type'], string> = {
  arrow: '#70B2D1',
  rectangle: '#72AD8C',
  freehand: '#A18BC8',
}

export const TOOL_COLORS: Record<Tool, string> = {
  pin: '#C98292',
  arrow: '#70B2D1',
  rectangle: '#72AD8C',
  freehand: '#A18BC8',
}

/** --dn-text-on-color: the ink validated against all eight brand fields. */
export const INK_ON_COLOR = '#102A27'
