[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-Hant.md) · [日本語](README.ja.md)

---

# BugShot

[![CI](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**UI 問題取證工具。** 擷取畫面、標出位置、補充備註，匯出報告。

## 工作流程

普通截圖常常缺少座標和上下文，重現問題時還要來回確認。BugShot 把截圖、座標、備註和 UI 元素資訊放在同一份報告裡。需要外部工具讀取目前工作階段時，再啟用可選的本機 MCP 服務。

## 功能特性

- **3 種擷取模式** — 全螢幕（`Ctrl+Shift+P`）、區域（`Ctrl+Shift+R`）、視窗（`Ctrl+Shift+W`）
- **4 種標註工具** — 標註點、箭頭、矩形框、自由畫筆
- **復原/重做** — 保留 50 步歷程記錄
- **縮放與平移** — 滾輪縮放，Shift+拖曳平移
- **MCP 伺服器** — 可選的本機 JSON-RPC + SSE 端點，供外部工具讀取工作階段
- **匯出格式** — Markdown 報告、標註截圖 PNG、JSON 工作階段資料
- **UIA 整合** — 讀取每個標註點對應的 Windows UI 元素名稱、類型、類別名稱和祖先樹
- **多語言** — English、简体中文、繁體中文、日本語
- **系統托盤** — 放在托盤中繼續執行
- **更新** — 從 GitHub Releases 檢查新版本

## 快速開始

### 下載安裝

從 [Releases](https://github.com/dreamnight16/bugshot/releases) 下載最新安裝檔。

| 平台 | 安裝檔 |
|------|--------|
| Windows | `.exe`（NSIS 安裝程式） |
| macOS | `.dmg` |
| Linux | `.AppImage` |

### 從原始碼建置

```bash
git clone https://github.com/dreamnight16/bugshot
cd bugshot
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

- **複製（Markdown）** — 包含座標、備註、區域裁剪、色彩和 UIA 元素樹。可貼到工單或程式碼審查工具中。
- **截圖（PNG）** — 儲存合成標註後的圖片。
- **JSON** — 儲存結構化工作階段資料。

## MCP 協定

BugShot 可在 `http://127.0.0.1:3846` 執行本機 MCP 相容的 JSON-RPC 伺服器。

### 可用工具

| 工具 | 說明 |
|------|------|
| `list_annotations` | 列出所有活動標註點和繪圖 |
| `get_screenshot` | 取得目前截圖元資料 |
| `resolve_annotation` | 標記標註為已解決（從列表中移除） |
| `get_context` | 取得供人工或外部工具使用的結構化 Markdown 上下文 |

### 快速測試

```bash
# BugShot
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","id":1}'

# BugShot
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
