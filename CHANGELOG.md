# Changelog

## [1.1.0] - 2026-10-08

### Added — DreamNight Design Language (DNDL v1.0)

- **Brand adoption**: the interface was redesigned against DNDL v1.0 (implementation 1.1.0).
  `tokens.css`, `materials.css`, `motion.css` and `LICENSE` are vendored verbatim at a pinned
  version with a `VERSION` provenance file, keeping the files side by side. No brand value was
  modified in place.
- **Geometry & typography**: square corners, large brand colour fields, and display-scale type
  instead of decorative container stacking.
- **Legibility**: text on colour fields uses `--dn-text-on-color`; secondary small text on light
  backgrounds uses `--dn-text-secondary`. Contrast was measured per WCAG rather than dimmed with
  element-level opacity.
- **Accessibility**: interactive targets use `--dn-target-min`; focus is visible; supports
  `prefers-reduced-motion`, transparency-off and `forced-colors` fallbacks; state is no longer
  conveyed by colour alone.
- **Information architecture**: page structure and navigation were rebuilt around the product's
  real content rather than recoloured.

## [1.0.0] - 2025-06-12

### Added
- Fullscreen, region, and window capture modes
- Pin, arrow, rectangle, and freehand annotation tools
- Undo/redo with 50-step history
- Zoom and pan support
- MCP-compatible JSON-RPC server for AI tool integration
- SSE (Server-Sent Events) for real-time session updates
- REST API for annotations, screenshots, and resolved annotations
- Markdown export with color analysis and cropped region screenshots
- JSON export with structured annotation data
- Annotated PNG screenshot export
- Windows UIAutomation integration for element detection
- i18n support: English, 简体中文, 繁體中文, 日本語
- System tray with capture shortcuts
- Global keyboard shortcuts (Ctrl+Shift+P/R/W)
- Auto-update via electron-updater
- Structured logging via electron-log
- CI/CD pipeline (GitHub Actions)
- Security hardening: CSP, sandbox, restricted CORS, input validation via Zod
