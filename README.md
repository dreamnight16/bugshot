[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-Hant.md) · [日本語](README.ja.md)

---

# BugShot

[![CI](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**UI issue capture tool.** Capture the screen, mark the spot, add a note, and export the report.

## Workflow

A plain screenshot often loses the coordinates and context needed to reproduce an issue. BugShot keeps the image, coordinates, notes, and UI element details together. Use the optional local MCP server when another tool needs to read the current session.

## Features

- **3 capture modes** — Fullscreen (`Ctrl+Shift+P`), Region (`Ctrl+Shift+R`), Window (`Ctrl+Shift+W`)
- **4 annotation tools** — Pin markers, arrows, rectangles, freehand drawing
- **Undo/redo** — Keep up to 50 history steps
- **Zoom & pan** — Scroll to zoom; Shift+drag to pan
- **MCP Server** — Optional local JSON-RPC + SSE endpoint for external tools
- **Export** — Markdown report, annotated PNG, and JSON session data
- **UIA integration** — Read the Windows UI element name, type, class, and ancestry at each pin
- **i18n** — English, 简体中文, 繁體中文, 日本語
- **System tray** — Keep BugShot running from the tray
- **Auto-update** — Check GitHub Releases for updates

## Quick Start

### Download

Download the latest installer from [Releases](https://github.com/dreamnight16/bugshot/releases).

| Platform | Package |
|----------|---------|
| Windows  | `.exe` (NSIS installer) |
| macOS    | `.dmg` |
| Linux    | `.AppImage` |

### Build from Source

```bash
git clone https://github.com/dreamnight16/bugshot
cd bugshot
npm install
npm run dev      # Start in development mode
npm run build    # Production build
npm run dist     # Package installer
```

**Requirements:** Node.js ≥ 20, npm ≥ 10

## Usage

### Keyboard Shortcuts

| Global Shortcut | Action |
|----------------|--------|
| `Ctrl+Shift+P` | Capture full screen |
| `Ctrl+Shift+R` | Capture region |
| `Ctrl+Shift+W` | Capture window |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo |

| In-App Shortcut | Action |
|----------------|--------|
| `P` / `A` / `R` / `F` | Switch tool: Pin / Arrow / Rect / Freehand |
| `Esc` | Deselect all |
| Scroll | Zoom in/out |
| Shift + Drag | Pan |

### Tools

- **Pin** — Place a numbered marker. Click to add a comment. Drag to reposition.
- **Arrow** — Draw an arrow from one point to another.
- **Rectangle** — Draw a dashed rectangle to highlight a region.
- **Freehand** — Draw freely for custom highlights.

### Export Formats

- **Copy (Markdown)** — Coordinates, notes, cropped regions, colors, and the UIA element tree. Paste it into an issue or review.
- **Screenshot (PNG)** — Save the annotated image.
- **JSON** — Save structured session data.

## MCP Protocol

BugShot runs an optional local MCP-compatible JSON-RPC server at `http://127.0.0.1:3846`.

The server creates a fresh bearer token on every launch. The token is printed in
the BugShot log as `MCP server auth token: Bearer ...`; copy it into the
`Authorization` header for every `/mcp` and `/sse` request. The server remains
loopback-only and rejects requests with a non-loopback `Host` header.

### Tools

| Tool | Description |
|------|-------------|
| `list_annotations` | List all active annotation pins and drawings |
| `get_screenshot` | Get current screenshot metadata |
| `resolve_annotation` | Mark an annotation as resolved (removes from list) |
| `get_context` | Get structured Markdown context for a person or external tool |

### Quick Test

```bash
# Replace this with the token printed in the BugShot log.
TOKEN="paste-token-here"

curl -s http://127.0.0.1:3846/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","id":1}'

curl -s http://127.0.0.1:3846/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","id":2,"params":{"name":"list_annotations"}}'
```

### SSE (Server-Sent Events)

Subscribe to real-time session updates at `http://127.0.0.1:3846/sse` with the
same `Authorization: Bearer $TOKEN` header.

## Architecture

```
bugshot/
├── electron/              # Electron main process
│   ├── main.ts            # Window, IPC, shortcuts, tray
│   ├── preload.ts         # Context bridge API
│   ├── uia.ts             # Windows UIAutomation (PowerShell)
│   ├── updater.ts         # Auto-update via electron-updater
│   ├── logger.ts          # Structured logging
│   ├── mcp/               # MCP protocol server (modular)
│   │   ├── http-server.ts # HTTP bootstrap, routing, CORS
│   │   ├── handlers.ts    # Tool implementations
│   │   ├── sse.ts         # SSE connection management
│   │   └── types.ts       # Shared types
│   └── mcp-server.ts      # Re-export facade
├── src/                   # React renderer
│   ├── components/        # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Pure utility modules
│   ├── i18n/              # Internationalization
│   ├── context/           # React context + reducer
│   └── types/             # TypeScript type definitions
├── resources/             # Icons and images
└── .github/workflows/     # CI/CD pipeline
```

## Development

```bash
npm install

npm run dev

npm run typecheck

npm run lint

npm test
npm run test:watch

npm run build

npm run dist
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

---

- [简体中文](README.zh-CN.md)
- [繁體中文](README.zh-Hant.md)
- [日本語](README.ja.md)
