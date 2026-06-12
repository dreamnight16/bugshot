import type { SessionState, McpTool, McpToolCallResult } from './types'

let sessionState: SessionState | null = null

export function getSessionState() {
  return sessionState
}

export function setSessionState(state: SessionState | null) {
  sessionState = state
}

export function listAnnotations() {
  if (!sessionState) {
    return { pins: [], drawings: [], windowName: '', hasSession: false }
  }
  return {
    pins: JSON.parse(sessionState.pins || '[]'),
    drawings: JSON.parse(sessionState.drawings || '[]'),
    windowName: sessionState.windowName,
    hasSession: true,
  }
}

export function resolveAnnotation(id: string): boolean {
  if (!sessionState) return false
  const pins = JSON.parse(sessionState.pins || '[]')
  const drawings = JSON.parse(sessionState.drawings || '[]')
  const pinIndex = pins.findIndex((p: { id: string }) => p.id === id)
  const drawingIndex = drawings.findIndex((d: { id: string }) => d.id === id)

  if (pinIndex >= 0) {
    pins.splice(pinIndex, 1)
    sessionState.pins = JSON.stringify(pins)
    return true
  }
  if (drawingIndex >= 0) {
    drawings.splice(drawingIndex, 1)
    sessionState.drawings = JSON.stringify(drawings)
    return true
  }
  return false
}

export function buildMarkdownContext(): string {
  if (!sessionState) return ''

  const pins = JSON.parse(sessionState.pins || '[]')
  const drawings = JSON.parse(sessionState.drawings || '[]')

  let md = '## UI 问题反馈\n\n'
  md += `窗口: ${sessionState.windowName}\n\n`

  if (pins.length > 0) {
    md += '### 标注点\n\n'
    for (const pin of pins) {
      md += `**Pin ${pin.number}** — 位置 (${Math.round(pin.x)}, ${Math.round(pin.y)})\n`
      md += `> ${pin.comment || '(无备注)'}\n\n`
    }
  }

  if (drawings.length > 0) {
    md += '### 绘图标注\n\n'
    for (const d of drawings) {
      md += `- **${d.type}** (${d.color})`
      if (d.comment) md += ` — ${d.comment}`
      md += '\n'
    }
  }

  return md
}

const TOOLS: McpTool[] = [
  {
    name: 'list_annotations',
    description: '列出当前所有 UI 标注点（坐标、备注、颜色），包括 Pin 标记和绘图标注。',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_screenshot',
    description: '获取当前截图的 base64 数据。包含截图和窗口信息。',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'resolve_annotation',
    description: '标记某个标注为已解决，将其从活动列表中移除。',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: '标注的 ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_context',
    description: '获取当前会话的完整 AI 上下文，包括结构化 Markdown 问题描述，可直接用于 AI 修复。',
    inputSchema: { type: 'object', properties: {} },
  },
]

export function getToolsList() {
  return { tools: TOOLS }
}

export function callTool(name: string, args: Record<string, unknown>): McpToolCallResult {
  switch (name) {
    case 'list_annotations':
      return {
        content: [{ type: 'text', text: JSON.stringify(listAnnotations(), null, 2) }],
      }
    case 'get_screenshot':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            windowName: sessionState?.windowName || '',
            hasScreenshot: !!sessionState?.screenshot,
          }, null, 2),
        }],
      }
    case 'resolve_annotation': {
      const id = args.id as string
      const resolved = resolveAnnotation(id)
      return {
        content: [{ type: 'text', text: JSON.stringify({ resolved, id }) }],
      }
    }
    case 'get_context':
      return {
        content: [{ type: 'text', text: buildMarkdownContext() || '无标注会话' }],
      }
    default:
      return {
        content: [{ type: 'text', text: `未知工具: ${name}` }],
        isError: true,
      }
  }
}
