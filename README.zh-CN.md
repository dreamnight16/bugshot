[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-Hant.md) · [日本語](README.ja.md)

---

# BugShot

[![CI](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**UI 问题取证工具。** 截取画面，标出位置，补充备注，导出报告。

## 工作流程

普通截图往往缺少坐标和上下文，复现问题时还要来回确认。BugShot 把截图、坐标、备注和 UI 元素信息放在同一份报告里。需要外部工具读取当前会话时，再启用可选的本地 MCP 服务。

## 功能特性

- **3 种截取模式** — 全屏（`Ctrl+Shift+P`）、区域（`Ctrl+Shift+R`）、窗口（`Ctrl+Shift+W`）
- **4 种标注工具** — 标注点、箭头、矩形框、自由画笔
- **撤销/重做** — 保留 50 步历史记录
- **缩放与平移** — 滚轮缩放，Shift+拖拽平移
- **MCP 服务器** — 可选的本地 JSON-RPC + SSE 端点，供外部工具读取会话
- **导出格式** — Markdown 报告、标注截图 PNG、JSON 会话数据
- **UIA 集成** — 读取每个标注点对应的 Windows UI 元素名称、类型、类名和祖先树
- **多语言** — English、简体中文、繁體中文、日本語
- **系统托盘** — 放在托盘中继续运行
- **更新** — 从 GitHub Releases 检查新版本

## 快速开始

### 下载安装

从 [Releases](https://github.com/dreamnight16/bugshot/releases) 下载最新安装包。

| 平台 | 安装包 |
|------|--------|
| Windows | `.exe`（NSIS 安装程序） |
| macOS | `.dmg` |
| Linux | `.AppImage` |

### 从源码构建

```bash
git clone https://github.com/dreamnight16/bugshot
cd bugshot
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

- **复制（Markdown）** — 包含坐标、备注、区域裁剪、颜色和 UIA 元素树。可粘贴到工单或代码审查工具中。
- **截图（PNG）** — 保存合成标注后的图片。
- **JSON** — 保存结构化会话数据。

## MCP 协议

BugShot 可在 `http://127.0.0.1:3846` 运行本地 MCP 兼容的 JSON-RPC 服务器。

### 可用工具

| 工具 | 说明 |
|------|------|
| `list_annotations` | 列出所有活动标注点和绘图 |
| `get_screenshot` | 获取当前截图元数据 |
| `resolve_annotation` | 标记标注为已解决（从列表中移除） |
| `get_context` | 获取供人工或外部工具使用的结构化 Markdown 上下文 |

### 快速测试

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

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `UIPIN_MCP_PORT` | `3846` | MCP 服务器端口 |

## 项目结构

```
bugshot/
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
- [繁體中文](README.zh-Hant.md)
- [日本語](README.ja.md)
