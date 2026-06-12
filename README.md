# UIPin

[![CI](https://github.com/DreamNight/UIPin/actions/workflows/ci.yml/badge.svg)](https://github.com/DreamNight/UIPin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Universal UI annotation & feedback tool.** Screenshot → annotate with pins, arrows, rectangles, and freehand → export to AI via MCP protocol.

![UIPin](./resources/screenshot.png)

## Why UIPin?

The typical UI feedback loop is broken: screenshots sent over chat, vague comments, endless back-and-forth. UIPin replaces this with **visual annotations that AI can directly consume and act on**.

## Features

- **3 capture modes** — Fullscreen (`Ctrl+Shift+P`), Region (`Ctrl+Shift+R`), Window (`Ctrl+Shift+W`)
- **4 annotation tools** — Pin markers, arrows, rectangles, freehand drawing
- **Undo/redo** — 50-step history
- **Zoom & pan** — Scroll to zoom, Shift+drag to pan
- **MCP Server** — AI tools (Claude Code, Cursor, Windsurf) can read annotations live via JSON-RPC + SSE
- **Export** — Markdown (with color analysis + cropped regions), JSON, annotated PNG
- **UIA integration** — Auto-detects Windows UI element name, type, class, and ancestry tree at each pin
- **i18n** — English, 简体中文, 繁體中文, 日本語
- **System tray** — Always available, never in the way
- **Auto-update** — Keeps itself current via GitHub Releases

## Quick Start

### Download

Download the latest installer from [Releases](https://github.com/DreamNight/UIPin/releases).

| Platform | Package |
|----------|---------|
| Windows  | `.exe` (NSIS installer) |
| macOS    | `.dmg` |
| Linux    | `.AppImage` |

### Build from Source

```bash
git clone https://github.com/DreamNight/UIPin.git
cd UIPin
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

- **Copy (Markdown)** — Full bug report with coordinates, color analysis, cropped region screenshots, and UIA element tree. Paste directly into AI chat.
- **Screenshot (PNG)** — Annotated screenshot with all markers baked in.
- **JSON** — Structured data for programmatic consumption.

## MCP Protocol

UIPin runs a local MCP-compatible JSON-RPC server at `http://127.0.0.1:3846`.

### Tools

| Tool | Description |
|------|-------------|
| `list_annotations` | List all active annotation pins and drawings |
| `get_screenshot` | Get current screenshot metadata |
| `resolve_annotation` | Mark an annotation as resolved (removes from list) |
| `get_context` | Get structured Markdown context for AI consumption |

### Quick Test

```bash
# List available tools
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","id":1}'

# Get current annotations
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","id":2,"params":{"name":"list_annotations"}}'
```

### SSE (Server-Sent Events)

Subscribe to real-time session updates at `http://127.0.0.1:3846/sse`.

## Architecture

```
UIPin/
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
# Install dependencies
npm install

# Start development mode
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test
npm run test:watch
npm run test:e2e

# Build production
npm run build

# Package for distribution
npm run dist
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

---

- [简体中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)
- [日本語](README.ja.md)
