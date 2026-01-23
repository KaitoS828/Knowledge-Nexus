# Knowledge Nexus 🧠

エンジニアのための「第2の脳」 - AIがあなたの知識を整理・構造化し、学習を加速させます。

## ✨ 機能

- 📚 **知識の構造化**: インプットした記事やメモをAIが解析し、Markdown形式で自動整理
- ⚡ **ギャップ分析**: 現在の知識と最新トレンドの差分をAIが分析
- 📝 **学習ダイアリー**: 日々の学びを記録
- 🔗 **ナレッジグラフ**: 知識の関連性を可視化
- 🔐 **Google認証 / ゲストモード**: データをクラウドに保存、またはローカルで試用

---

## 🚀 セットアップ

### 必要条件

- **Node.js** v18以上
- **npm** または **yarn**
- **Supabase アカウント**（Google認証を使用する場合）
- **Gemini API Key**

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd knowledge-nexus
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成（または既存のファイルを編集）:

```env
# Gemini API Key (必須)
GEMINI_API_KEY="your-gemini-api-key"

# Firecrawl API Key (記事取得用)
FIRECRAWL_API_KEY="your-firecrawl-api-key"

# Supabase 設定 (Google認証を使用する場合は必須)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> **💡 ヒント**: API Keyの取得方法は下記を参照

---

## 🔑 API Key の取得方法

### Gemini API Key

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 「Get API Key」をクリック
3. 新しいAPIキーを作成してコピー

### Supabase 設定

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. **Settings → API** に移動
4. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon (public)** キー: `eyJhbGciOi...` で始まるJWT形式

### Google OAuth の設定（Google認証を使用する場合）

1. [Google Cloud Console](https://console.cloud.google.com/) で新しいプロジェクトを作成
2. **APIs & Services → OAuth consent screen** を設定
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID** を作成
4. 認可されたリダイレクト URI に追加:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Supabase Dashboard → **Authentication → Providers → Google** を有効化
6. Google Cloud Console で取得した **Client ID** と **Client Secret** を入力

---

## 🖥️ ローカルで実行

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

---

## 📦 ビルド

本番用ビルドを作成:

```bash
npm run build
```

ビルドをプレビュー:

```bash
npm run preview
```

---

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 19, TypeScript, Vite |
| スタイリング | Tailwind CSS |
| 認証・DB | Supabase |
| AI | Google Gemini API |
| アイコン | Lucide React |
| グラフ可視化 | react-force-graph-2d |

---

## 📁 プロジェクト構造

```
knowledge-nexus/
├── components/          # Reactコンポーネント
│   ├── ArticleDetail.tsx
│   ├── ArticleList.tsx
│   ├── BrainEditor.tsx
│   ├── KnowledgeGraph.tsx
│   ├── LandingPage.tsx
│   ├── LearningDiary.tsx
│   ├── Onboarding.tsx
│   └── Sidebar.tsx
├── services/            # 外部サービス連携
│   ├── geminiService.ts
│   └── supabase.ts
├── App.tsx              # メインアプリケーション
├── store.tsx            # 状態管理 (Context API)
├── types.ts             # 型定義
├── index.html           # エントリーポイント
├── .env.local           # 環境変数 (gitignore対象)
└── package.json
```

---

## ❓ トラブルシューティング

### Google認証がうまくいかない

1. **Supabase Anon Key の形式を確認**: `eyJhbGciOi...` で始まるJWT形式である必要があります
2. **Supabase で Google Provider が有効化されているか確認**
3. **Google Cloud Console のリダイレクト URI が正しいか確認**

### 「Initialization failed」エラー

1. Gemini API Key が正しく設定されているか確認
2. `.env.local` ファイルが存在するか確認
3. 開発サーバーを再起動: `npm run dev`

---

## 📄 ライセンス

MIT License

---

## 🔗 リンク

- [Google AI Studio](https://ai.studio/apps/drive/188EqmesiwbjrE1wYNnmzUqhjedM0hgSo) - このアプリのAI Studioバージョン
