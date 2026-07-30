[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md)

---

# ComiRadar

[![CI](https://github.com/sixtdreanight/anime-con-radar/actions/workflows/ci.yml/badge.svg)](https://github.com/sixtdreanight/anime-con-radar/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**通用 UI 標註回饋工具。** 擷取螢幕 → 使用標註點、箭頭、矩形和自由畫筆進行標註 → 透過 MCP 協定匯出給 AI。

## 為什麼需要 ComiRadar？

傳統的 UI 回饋流程效率低落：截圖透過聊天傳送，文字描述模糊不清，來回溝通耗費大量時間。ComiRadar 用**視覺化標註**取而代之，而且 AI 可以直接消費這些標註並執行修復。

## 功能特性

- **3 種擷取模式** — 全螢幕（`Ctrl+Shift+P`）、區域（`Ctrl+Shift+R`）、視窗（`Ctrl+Shift+W`）
- **4 種標註工具** — 標註點、箭頭、矩形框、自由畫筆
- **復原/重做** — 50 步歷程記錄
- **縮放與平移** — 滾輪縮放，Shift+拖曳平移
- **MCP 伺服器** — AI 工具（Claude Code、Cursor、Windsurf）可透過 JSON-RPC + SSE 即時讀取標註
- **匯出格式** — Markdown（含色彩分析 + 區域裁剪）、JSON、標註截圖 PNG
- **UIA 整合** — 自動偵測每個標註點下的 Windows UI 元素名稱、類型、類別名稱和祖譜樹
- **多語言** — English、简体中文、繁體中文、日本語
- **系統托盤** — 常駐背景，隨時可用
- **自動更新** — 透過 GitHub Releases 自動保持最新版本

## 快速開始

### 下載安裝

從 [Releases](https://github.com/sixtdreanight/anime-con-radar/releases) 下載最新安裝檔。

| 平台 | 安裝檔 |
|------|--------|
| Windows | `.exe`（NSIS 安裝程式） |
| macOS | `.dmg` |
| Linux | `.AppImage` |

### 從原始碼建置

```bash
git clone https://github.com/sixtdreanight/anime-con-radar
cd anime-con-radar
npm install
npm run dev      # 開發模式
npm run build    # 生產建置
npm run dist     # 封裝安裝程式
```

**環境需求：** Node.js ≥ 20，npm ≥ 10

## 使用說明

### 快捷鍵

| 全域快捷鍵 | 功能 |
|-----------|------|
| `Ctrl+Shift+P` | 擷取全螢幕 |
| `Ctrl+Shift+R` | 區域擷取 |
| `Ctrl+Shift+W` | 視窗擷取 |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 復原 / 重做 |

| 應用內快捷鍵 | 功能 |
|-------------|------|
| `P` / `A` / `R` / `F` | 切換工具：標註 / 箭頭 / 矩形 / 畫筆 |
| `Esc` | 取消選擇 |
| 滾輪 | 縮放 |
| Shift + 拖曳 | 平移 |

### 工具說明

- **標註點** — 放置帶編號的標記。點擊新增備註，拖曳移動位置。
- **箭頭** — 從一個點畫箭頭到另一個點。
- **矩形框** — 畫虛線矩形框高亮區域。
- **自由畫筆** — 自由繪製自訂標註。

### 匯出格式

- **複製（Markdown）** — 完整的問題報告，含座標、色彩分析、區域截圖、UIA 元素樹。可直接貼上到 AI 對話中。
- **截圖（PNG）** — 所有標註合成到截圖上。
- **JSON** — 結構化資料供程式化處理。

## MCP 協定

ComiRadar 在 `http://127.0.0.1:3846` 執行本地 MCP 相容的 JSON-RPC 伺服器。

### 可用工具

| 工具 | 說明 |
|------|------|
| `list_annotations` | 列出所有活動標註點和繪圖 |
| `get_screenshot` | 取得目前截圖元資料 |
| `resolve_annotation` | 標記標註為已解決（從列表中移除） |
| `get_context` | 取得結構化 Markdown 上下文供 AI 使用 |

### 快速測試

```bash
# ComiRadar
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","id":1}'

# ComiRadar
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","id":2,"params":{"name":"list_annotations"}}'
```

### 環境變數

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `UIPIN_MCP_PORT` | `3846` | MCP 伺服器埠號 |

## 專案結構

```
bugshot/
├── electron/              # Electron 主程序
├── src/                   # React 渲染程序
│   ├── components/        # UI 元件
│   ├── hooks/             # 自訂 Hooks
│   ├── lib/               # 純函式工具模組
│   └── i18n/              # 國際化資源
└── .github/workflows/     # CI/CD
```

## 參與貢獻

請參閱 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 開源協議

MIT — 詳見 [LICENSE](LICENSE)。

---

- [English](README.md)
- [简体中文](README.zh-CN.md)
- [日本語](README.ja.md)
