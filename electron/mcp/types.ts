export const DEFAULT_PORT = parseInt(process.env.UIPIN_MCP_PORT || '3846', 10)
export const HOST = '127.0.0.1'

export interface SessionState {
  screenshot: string
  windowName: string
  pins: string
  drawings: string
}

export interface McpTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface McpToolCallResult {
  content: { type: 'text'; text: string }[]
  isError?: boolean
}
