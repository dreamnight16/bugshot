# UIPin

[![CI](https://github.com/sixtdreanight/UIPin/actions/workflows/ci.yml/badge.svg)](https://github.com/sixtdreanight/UIPin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**汎用 UI アノテーション・フィードバックツール。** スクリーンショット → ピン・矢印・矩形・フリーハンドで注釈 → MCP プロトコルで AI にエクスポート。

## なぜ UIPin か？

従来の UI フィードバックは非効率です：チャットでスクリーンショットを送り、あいまいな説明をし、何度もやり取りを繰り返します。UIPin はこれを**AI が直接理解して修正できる視覚的な注釈**に置き換えます。

## 主な機能

- **3 種類のキャプチャ** — 全画面（`Ctrl+Shift+P`）、範囲指定（`Ctrl+Shift+R`）、ウィンドウ（`Ctrl+Shift+W`）
- **4 種類の注釈ツール** — ピン、矢印、矩形、フリーハンド
- **元に戻す/やり直し** — 50 ステップの履歴
- **ズームとパン** — スクロールでズーム、Shift+ドラッグでパン
- **MCP サーバー** — AI ツール（Claude Code、Cursor、Windsurf）が JSON-RPC + SSE で注釈をリアルタイムに読み取り
- **エクスポート** — Markdown（色分析 + 切り抜き領域付き）、JSON、注釈付き PNG
- **UIA 統合** — 各ピン位置の Windows UI 要素名、型、クラス、祖先ツリーを自動検出
- **多言語対応** — English、简体中文、繁體中文、日本語
- **システムトレイ** — 常駐、邪魔にならない
- **自動アップデート** — GitHub Releases 経由で最新バージョンを維持

## クイックスタート

### ダウンロード

[Releases](https://github.com/sixtdreanight/UIPin/releases) から最新のインストーラをダウンロード。

| プラットフォーム | パッケージ |
|-----------------|-----------|
| Windows | `.exe`（NSIS インストーラ） |
| macOS | `.dmg` |
| Linux | `.AppImage` |

### ソースからビルド

```bash
git clone https://github.com/sixtdreanight/UIPin.git
cd UIPin
npm install
npm run dev      # 開発モード
npm run build    # 本番ビルド
npm run dist     # インストーラのパッケージング
```

**要件：** Node.js ≥ 20、npm ≥ 10

## 使い方

### キーボードショートカット

| グローバル | アクション |
|-----------|----------|
| `Ctrl+Shift+P` | 全画面キャプチャ |
| `Ctrl+Shift+R` | 範囲指定キャプチャ |
| `Ctrl+Shift+W` | ウィンドウキャプチャ |
| `Ctrl+Z` / `Ctrl+Shift+Z` | 元に戻す / やり直し |

| アプリ内 | アクション |
|---------|----------|
| `P` / `A` / `R` / `F` | ツール切替：ピン / 矢印 / 矩形 / ペン |
| `Esc` | すべて選択解除 |
| スクロール | ズームイン/アウト |
| Shift + ドラッグ | パン |

### ツール

- **ピン** — 番号付きマーカーを配置。クリックでコメント追加、ドラッグで再配置。
- **矢印** — 始点から終点まで矢印を描画。
- **矩形** — 破線の矩形で領域をハイライト。
- **フリーハンド** — 自由にカスタムハイライトを描画。

### エクスポート形式

- **コピー（Markdown）** — 座標、色分析、切り抜き領域のスクリーンショット、UIA 要素ツリーを含む完全なバグレポート。AI チャットに直接貼り付け可能。
- **スクリーンショット（PNG）** — すべての注釈を重ねた画像。
- **JSON** — プログラムで処理するための構造化データ。

## MCP プロトコル

UIPin は `http://127.0.0.1:3846` で MCP 互換の JSON-RPC サーバーを実行します。

### ツール一覧

| ツール | 説明 |
|------|-------------|
| `list_annotations` | アクティブな注釈ピンと描画の一覧 |
| `get_screenshot` | 現在のスクリーンショットのメタデータ |
| `resolve_annotation` | 注釈を解決済みとしてマーク（リストから削除） |
| `get_context` | AI 用の構造化 Markdown コンテキスト |

### 動作確認

```bash
# ツール一覧の取得
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list","id":1}'

# 現在の注釈の取得
curl -s http://127.0.0.1:3846/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/call","id":2,"params":{"name":"list_annotations"}}'
```

### 環境変数

| 変数 | デフォルト | 説明 |
|------|--------|-------------|
| `UIPIN_MCP_PORT` | `3846` | MCP サーバーのポート番号 |

## アーキテクチャ

```
UIPin/
├── electron/              # Electron メインプロセス
├── src/                   # React レンダラープロセス
│   ├── components/        # UI コンポーネント
│   ├── hooks/             # カスタム React Hooks
│   ├── lib/               # 純粋なユーティリティモジュール
│   └── i18n/              # 国際化リソース
└── .github/workflows/     # CI/CD
```

## 開発

```bash
npm install           # 依存関係のインストール
npm run dev           # 開発モードで起動
npm run typecheck     # 型チェック
npm run lint          # リント
npm test              # テスト実行
npm run build         # 本番ビルド
npm run dist          # 配布用にパッケージング
```

## コントリビューション

[CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

MIT — [LICENSE](LICENSE) を参照。

---

- [English](README.md)
- [简体中文](README.zh-CN.md)
- [繁體中文](README.zh-TW.md)
