export interface UIAElementInfo {
  name: string
  controlType: string
  className: string
  automationId: string
  helpText: string
  isEnabled: boolean
  ancestors: { name: string; controlType: string; className: string }[]
  error?: string
}

export interface Pin {
  id: string
  number: number
  x: number
  y: number
  comment: string
  color: string
  uia?: UIAElementInfo
}

export interface Drawing {
  id: string
  type: 'arrow' | 'rectangle' | 'freehand'
  points: { x: number; y: number }[]
  color: string
  comment?: string
}

export interface Session {
  id: string
  screenshot: string
  pins: Pin[]
  drawings: Drawing[]
  windowName: string
  capturedAt: number
  status: 'active' | 'resolved'
}

export type Tool = 'pin' | 'arrow' | 'rectangle' | 'freehand'

export type CaptureMode = 'fullscreen' | 'region' | 'window'

export interface HistoryEntry {
  pins: Pin[]
  drawings: Drawing[]
}
