[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-Hant.md) · [日本語](README.ja.md)

---

# BugShot

[![CI](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamnight16/bugshot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**UI 問題の記録ツール。** 画面をキャプチャし、位置を示し、メモを追加してレポートを出力します。

## 使い方

スクリーンショットだけでは座標や状況が抜けて、問題の再現に手間がかかります。BugShot は画像、座標、メモ、UI 要素情報を一つのレポートにまとめます。別のツールから現在のセッションを読むときだけ、任意のローカル MCP サーバーを使います。

## 主な機能

- **3 種類のキャプチャ** — 全画面（`Ctrl+Shift+P`）、範囲指定（`Ctrl+Shift+R`）、ウィンドウ（`Ctrl+Shift+W`）
- **4 種類の注釈ツール** — ピン、矢印、矩形、フリーハンド
- **元に戻す/やり直し** — 50 ステップまで履歴を保持
- **ズームとパン** — スクロールでズーム、Shift+ドラッグでパン
- **MCP サーバー** — 外部ツール用の任意のローカル JSON-RPC + SSE エンドポイント
- **エクスポート** — Markdown レポート、注釈付き PNG、JSON セッションデータ
- **UIA 統合** — 各ピン位置の Windows UI 要素名、型、クラス、祖先ツリーを読み取る
- **多言語対応** — English、简体中文、繁體中文、日本語
- **システムトレイ** — トレイに置いて実行を続ける
- **更新** — GitHub Releases から更新を確認

## クイックスタート

### ダウンロード

[Releases](https://github.com/dreamnight16/bugshot/releases) から最新のインストーラをダウンロード。

| プラットフォーム | パッケージ |
|-----------------|-----------|
| Windows | `.exe`（NSIS インストーラ） |
| macOS | `.dmg` |
| Linux | `.AppImage` |

### ソースからビルド

```bash
git clone https://github.com/dreamnight16/bugshot
cd bugshot
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

- **コピー（Markdown）** — 座標、メモ、切り抜き領域、色、UIA 要素ツリーを含みます。チケットやレビューに貼り付けて使えます。
- **スクリーンショット（PNG）** — 注釈を重ねた画像を保存します。
- **JSON** — セッションデータを構造化形式で保存します。

## MCP プロトコル

BugShot は `http://127.0.0.1:3846` で任意の MCP 互換 JSON-RPC サーバーを実行できます。

### ツール一覧

| ツール | 説明 |
|------|-------------|
| `list_annotations` | アクティブな注釈ピンと描画の一覧 |
| `get_screenshot` | 現在のスクリーンショットのメタデータ |
| `resolve_annotation` | 注釈を解決済みとしてマーク（リストから削除） |
| `get_context` | 人または外部ツール向けの構造化 Markdown コンテキスト |

### 動作確認

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

### 環境変数

| 変数 | デフォルト | 説明 |
|------|--------|-------------|
| `UIPIN_MCP_PORT` | `3846` | MCP サーバーのポート番号 |

## アーキテクチャ

```
bugshot/
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
- [繁體中文](README.zh-Hant.md)
