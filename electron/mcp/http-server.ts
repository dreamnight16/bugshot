import http from 'http'
import { randomBytes } from 'crypto'
import { EventEmitter } from 'events'
import { DEFAULT_PORT, HOST } from './types'
import { addSSEClient, removeSSEClient, closeAllSSEClients } from './sse'
import { getSessionState, listAnnotations, resolveAnnotation, getToolsList, callTool } from './handlers'
import { logger } from '../logger'
import { mcpRequestSchema, mcpResolveArgsSchema, isKnownTool } from '../../src/lib/validation'

export const events = new EventEmitter()

let server: http.Server | null = null
let authToken = ''

// DNS-rebinding defense: only accept requests whose Host header resolves to a loopback host.
function getHostname(req: http.IncomingMessage): string {
  const host = (req.headers.host || '').toLowerCase()
  return host.replace(/^\[/, '').replace(/:\d+$/, '').replace(/\]$/, '')
}

function isAllowedHost(req: http.IncomingMessage): boolean {
  const hostname = getHostname(req)
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
}

function hasValidAuth(req: http.IncomingMessage): boolean {
  const header = req.headers.authorization || ''
  return header === `Bearer ${authToken}`
}

function parseMCPBody(body: string): { method: string; id: number; params?: { name?: string; arguments?: Record<string, unknown> } } | null {
  try {
    const parsed = mcpRequestSchema.safeParse(JSON.parse(body))
    if (!parsed.success) return null
    return parsed.data
  } catch {
    return null
  }
}

function createServer(): http.Server {
  return http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', `http://${HOST}:${DEFAULT_PORT}`)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // DNS-rebinding defense: reject requests not addressed to a loopback host.
    if (!isAllowedHost(req)) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Forbidden: invalid Host header' }))
      return
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    // Require the per-session bearer token on every data request.
    if (!hasValidAuth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unauthorized: missing or invalid token' }))
      return
    }

    const url = req.url || '/'

    // SSE endpoint
    if (url === '/sse' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      addSSEClient(res)
      req.on('close', () => removeSSEClient(res))
      res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      logger.debug('SSE client connected')
      return
    }

    // Health check
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', port: DEFAULT_PORT }))
      return
    }

    // MCP endpoint (JSON-RPC)
    if (url === '/mcp' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => (body += chunk))
      req.on('end', () => {
        // Reject oversized bodies
        if (body.length > 1_000_000) {
          res.writeHead(413, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Request too large' }, id: null }))
          return
        }

        const rpc = parseMCPBody(body)
        if (!rpc) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }))
          return
        }

        logger.info(`MCP request: ${rpc.method}`)
        let result: unknown = null

        switch (rpc.method) {
          case 'tools/list':
            result = getToolsList()
            break

          case 'tools/call': {
            const toolName = rpc.params?.name as string
            const toolArgs = (rpc.params?.arguments as Record<string, unknown>) || {}

            if (!toolName) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32602, message: 'Missing tool name' }, id: rpc.id }))
              return
            }

            if (!isKnownTool(toolName)) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32602, message: `Unknown tool: ${toolName}` }, id: rpc.id }))
              return
            }

            if (toolName === 'resolve_annotation') {
              const parsedArgs = mcpResolveArgsSchema.safeParse(toolArgs)
              if (!parsedArgs.success) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32602, message: 'Invalid arguments: id must be a valid annotation ID' }, id: rpc.id }))
                return
              }
            }

            result = callTool(toolName, toolArgs)
            break
          }

          case 'initialize':
            result = {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: 'bugshot', version: '1.0.0' },
            }
            break

          default:
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: rpc.id }))
            return
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', result, id: rpc.id }))
      })
      return
    }

    // REST API: get annotations
    if (url === '/api/annotations' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(listAnnotations()))
      return
    }

    // REST API: get screenshot
    if (url === '/api/screenshot' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        windowName: getSessionState()?.windowName || '',
        hasScreenshot: !!getSessionState()?.screenshot,
        screenshot: getSessionState()?.screenshot || '',
      }))
      return
    }

    // REST API: resolve annotation
    if (url?.startsWith('/api/annotations/') && req.method === 'DELETE') {
      const id = url.split('/').pop() || ''
      const resolved = resolveAnnotation(id)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ resolved, id }))
      return
    }

    res.writeHead(404)
    res.end('Not Found')
  })
}

export function startServer() {
  authToken = randomBytes(32).toString('hex')
  server = createServer()
  server.on('error', (err) => {
    logger.error(`MCP server error: ${err.message}`)
  })
  server.listen(DEFAULT_PORT, HOST, () => {
    logger.info(`MCP server running on http://${HOST}:${DEFAULT_PORT}`)
    logger.info(`MCP server auth token: Bearer ${authToken}`)
  })
}

export function stopServer() {
  closeAllSSEClients()
  if (server) {
    server.close()
    server = null
    logger.info('MCP server stopped')
  }
}
