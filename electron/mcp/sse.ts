import type http from 'http'

const SSE_CLIENTS = new Set<http.ServerResponse>()

export function addSSEClient(res: http.ServerResponse) {
  SSE_CLIENTS.add(res)
}

export function removeSSEClient(res: http.ServerResponse) {
  SSE_CLIENTS.delete(res)
}

export function broadcastSSE(data: unknown) {
  const msg = `data: ${JSON.stringify(data)}\n\n`
  for (const client of SSE_CLIENTS) {
    try {
      client.write(msg)
    } catch {
      SSE_CLIENTS.delete(client)
    }
  }
}

export function closeAllSSEClients() {
  for (const client of SSE_CLIENTS) {
    try {
      client.end()
    } catch { /* client may already be closed */ }
  }
  SSE_CLIENTS.clear()
}
