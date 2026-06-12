# UIPin

[![CI](https://github.com/sixtdreanight/UIPin/actions/workflows/ci.yml/badge.svg)](https://github.com/sixtdreanight/UIPin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**通用 UI 标注反馈工具。** 截屏 → 使用标注点、箭头、矩形和自由画笔进行标注 → 通过 MCP 协议导出给 AI。

## 为什么需要 UIPin？

传统的 UI 反馈流程效率低下：截图通过聊天发送，文字描述模糊不清，来回沟通耗费大量时间。UIPin 用**可视化标注**取而代之，而且 AI 可以直接消费这些标注并执行修复。

## 功能特性

- **3 种截取模式** — 全屏（`Ctrl+Shift+P`）、区域（`Ctrl+Shift+R`）、窗口（`Ctrl+Shift+W`）
- **4 种标注工具** — 标注点、箭头、矩形框、自由画笔
- **撤销/重做** — 50 步历史记录
- **缩放与平移** — 滚轮缩放，Shift+拖拽平移
- **MCP 服务器** — AI 工具（Claude Code、Cursor、Windsurf）可通过 JSON-RPC + SSE 实时读取标注
- **导出格式** — Markdown（含颜色分析 + 区域裁剪）、JSON、标注截图 PNG
- **UIA 集成** — 自动检测每个标注点下的 Windows UI 元素名称、类型、类名和祖先树
- **多语言** — English、简体中文、繁體中文、日本語
- **系统托盘** — 常驻后台，随时可用
- **自动更新** — 通过 GitHub Releases 自动保持最新版本

## 快速开始

### 下载安装

从 [Releases](https://github.com/sixtdreanight/UIPin/releases) 下载最新安装包。

| 平台 | 安装包 |
|------|--------|
| Windows | `.exe`（NSIS 安装程序） |
| macOS | `.dmg` |
| Linux | `.AppImage` |

### 从源码构建

```bash
git clone https://github.com/sixtdreanight/UIPin.git
cd UIPin
npm install
npm run dev      # 开发模式
npm run build    # 生产构建
npm run dist     # 打包安装程序
```

**环境要求：** Node.js ≥ 20，npm ≥ 10

## 使用说明

### 快捷键

| 全局快捷键 | 功能 |
|-----------|------|
| `Ctrl+Shift+P` | 截取全屏 |
| `Ctrl+Shift+R` | 区域截取 |
| `Ctrl+Shift+W` | 窗口截取 |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 撤销 / 重做 |

| 应用内快捷键 | 功能 |
|-------------|------|
| `P` / `A` / `R` / `F` | 切换工具：标注 / 箭头 / 矩形 / 画笔 |
| `Esc` | 取消选择 |
| 滚轮 | 缩放 |
| Shift + 拖拽 | 平移 |

### 工具说明

- **标注点** — 放置带编号的标记。点击添加备注，拖拽移动位置。
- **箭头** — 从一个点画箭头到另一个点。
- **矩形框** — 画虚线矩形框高亮区域。
- **自由画笔** — 自由绘制自定义标注。

### 导出格式

- **复制（Markdown）** — 完整的问题报告，含坐标、颜色分析、区域截图、UIA 元素树。可直接粘贴到 AI 对话中。
- **截图（PNG）** — 所有标注合成到截图上。
- **JSON** — 结构化数据供程序化处理。

## MCP 协议

UIPin 在 `http://127.0.0.1:3846` 运行本地 MCP 兼容的 JSON-RPC 服务器。

### 可用工具

| 工具 | 说明 |
|------|------|
| `list_annotations` | 列出所有活动标注点和绘图 |
| `get_screenshot` | 获取当前截图元数据 |
| `resolve_annotation` | 标记标注为已解决（从列表中移除） |
| `get_context` | 获取结构化 Markdown 上下文供 AI 使用 |

### 快速测试

```bash
# 列出可用工具
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","id":1}'

# 获取当前标注
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","id":2,"params":{"name":"list_annotations"}}'
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `UIPIN_MCP_PORT` | `3846` | MCP 服务器端口 |

## 项目结构

```
UIPin/
├── electron/              # Electron 主进程
├── src/                   # React 渲染进程
│   ├── components/        # UI 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 纯函数工具模块
│   └── i18n/              # 国际化资源
└── .github/workflows/     # CI/CD
```

## 参与贡献

请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 开源协议

MIT — 详见 [LICENSE](LICENSE)。

---

- [English](README.md)
- [繁體中文](README.zh-TW.md)
- [日本語](README.ja.md)
