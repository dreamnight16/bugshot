# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in UIPin, please **do not** file a public issue.

Instead, email [DreamNight] with details. You should receive a response within 48 hours.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x | :white_check_mark: |

## Security Architecture

UIPin is a local-only Electron desktop application. Key security properties:

- **No network services** — MCP server binds to `127.0.0.1` only, not accessible from remote
- **Context isolation** — Renderer processes use `contextIsolation: true` with `sandbox: true`
- **No node integration** — Renderer has `nodeIntegration: false`
- **CSP enforced** — Content-Security-Policy restricts script and image sources
- **Preload API frozen** — `Object.freeze()` prevents post-load tampering

## Reporting a security issue

1. Describe the vulnerability with as much detail as possible
2. Include steps to reproduce
3. If possible, suggest a fix
