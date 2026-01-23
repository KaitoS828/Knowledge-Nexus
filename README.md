# Knowledge Nexus 🧠

エンジニアのための「第2の脳」 - AIがあなたの知識を整理・構造化し、学習を加速させます。

## ✨ 主要機能

### 📚 記事管理
- **URL入力**: Firecrawl APIで記事を自動取得
- **AI解析**: Gemini AIが記事を解析し、要約・キーワード・学習パターンを抽出
- **ステータス管理**: new → reading → practice → mastered の学習フロー

### 📄 PDFドキュメント管理
- **PDFアップロード**: ドラッグ&ドロップでPDFをアップロード
- **テキスト抽出**: PDF.jsで自動的にテキストを抽出
- **AI分析**: 章ごとの要約・重要ポイントの抽出
- **スプリットビュー**: 記事詳細と同じレイアウトで学習可能

### 🎯 能動的学習
- **クイズ生成**: AIが記事・PDF内容から理解度テストを自動生成
- **リトライ機能**: 不正解問題のみを再挑戦可能
- **教えるモード**: AIに教えることで理解を深める
- **学習アクション提案**: PDFから具体的な実践ステップを生成

### 🧠 Brain（知識ベース）
- **Markdown形式**: 構造化された知識管理
- **マージ機能**: 記事・PDFの内容をBrainに統合
- **リファクタリング**: AIが知識を整理・最適化
- **Brain統合提案**: PDFをどうBrainに統合すべきかAIが提案

### 📝 学習ダイアリー
- **日々の記録**: 学習内容を日記形式で記録
- **学習ツイート**: 学んだことを140文字で要約

### 🔗 ナレッジグラフ
- **可視化**: 知識の関連性をインタラクティブなグラフで表示
- **トレンド検出**: 学習傾向の分析

### 🔐 認証システム
- **Google OAuth**: Googleアカウントでログイン
- **GitHub OAuth**: GitHubアカウントでログイン
- **データ永続化**: Supabaseにデータを保存

---

## 🚀 セットアップ

### 必要条件

- **Node.js** v18以上
- **npm** または **yarn**
- **Supabase アカウント**（OAuth認証を使用する場合）
- **Gemini API Key** (必須)
- **Firecrawl API Key** (記事取得用)

### 1. リポジトリのクローン

```bash
git clone https://github.com/KaitoS828/Knowledge-Nexus.git
cd Knowledge-Nexus
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成:

```env
# Gemini API Key (必須)
VITE_GEMINI_API_KEY="your-gemini-api-key"

# Firecrawl API Key (記事取得用)
VITE_FIRECRAWL_API_KEY="your-firecrawl-api-key"

# Supabase 設定 (OAuth認証を使用する場合は必須)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

> **💡 ヒント**: Viteを使用しているため、すべての環境変数に `VITE_` プレフィックスが必要です

---

## 🔑 API Key の取得方法

### Gemini API Key

1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. 「Get API Key」をクリック
3. 新しいAPIキーを作成してコピー

### Firecrawl API Key

1. [Firecrawl](https://firecrawl.dev/) にアクセス
2. アカウントを作成
3. ダッシュボードからAPIキーを取得

### Supabase 設定

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. **Settings → API** に移動
4. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon (public)** キー: `eyJhbGciOi...` で始まるJWT形式

### OAuth プロバイダーの設定

#### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) で新しいプロジェクトを作成
2. **APIs & Services → OAuth consent screen** を設定
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID** を作成
4. 認可されたリダイレクト URI に追加:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Supabase Dashboard → **Authentication → Providers → Google** を有効化
6. Google Cloud Console で取得した **Client ID** と **Client Secret** を入力

#### GitHub OAuth

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Application name: `Knowledge Nexus`
3. Homepage URL: `http://localhost:5173` (開発時)
4. Authorization callback URL:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Supabase Dashboard → **Authentication → Providers → GitHub** を有効化
6. GitHub で取得した **Client ID** と **Client Secret** を入力

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
| 認証・DB | Supabase (PostgreSQL) |
| AI | Google Gemini API |
| PDF処理 | PDF.js |
| 記事取得 | Firecrawl API |
| アイコン | Lucide React |
| グラフ可視化 | react-force-graph-2d |
| Markdown | react-markdown |

---

## 📁 プロジェクト構造

```
knowledge-nexus/
├── components/              # Reactコンポーネント
│   ├── ArticleDetail.tsx   # 記事詳細（スプリットペイン）
│   ├── ArticleList.tsx     # 記事一覧＋URL/PDF入力
│   ├── DocumentDetail.tsx  # PDF詳細（スプリットペイン）
│   ├── BrainEditor.tsx     # Brain編集
│   ├── KnowledgeGraph.tsx  # ナレッジグラフ
│   ├── LandingPage.tsx     # ランディングページ
│   ├── LearningDiary.tsx   # 学習ダイアリー
│   ├── Onboarding.tsx      # オンボーディング
│   └── Sidebar.tsx         # サイドバーナビゲーション
├── services/                # 外部サービス連携
│   ├── geminiService.ts    # Gemini AI統合
│   ├── pdfService.ts       # PDF処理
│   └── supabase.ts         # Supabase クライアント
├── App.tsx                  # メインアプリケーション
├── store.tsx                # 状態管理 (Context API)
├── types.ts                 # TypeScript型定義
├── index.html               # エントリーポイント
├── vite.config.ts           # Vite設定
├── tailwind.config.js       # Tailwind CSS設定
├── .env.local               # 環境変数 (gitignore対象)
└── package.json
```

---

## 🗄️ データベース設計

### Supabase テーブル構造

#### 1. users (認証テーブル - Supabase Authが自動管理)
Supabaseの`auth.users`テーブルを使用

#### 2. brains
ユーザーの知識ベース（Brain）を管理

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| content | text | Brain内容（Markdown） | NOT NULL |
| last_refactored | timestamptz | 最終リファクタリング日時 | DEFAULT now() |
| created_at | timestamptz | 作成日時 | DEFAULT now() |
| updated_at | timestamptz | 更新日時 | DEFAULT now() |

**インデックス:**
- `user_id` (ユーザーごとの高速検索)

**RLS (Row Level Security):**
```sql
-- ユーザーは自分のBrainのみアクセス可能
CREATE POLICY "Users can CRUD their own brain"
ON brains FOR ALL
USING (auth.uid() = user_id);
```

#### 3. articles
記事情報を管理

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| title | text | 記事タイトル | NOT NULL |
| url | text | 元記事URL | NOT NULL |
| content | text | 記事本文 | NOT NULL |
| summary | text | AI生成要約 | NOT NULL |
| tags | text[] | タグ配列 | DEFAULT '{}' |
| status | text | 学習ステータス | CHECK (status IN ('new', 'reading', 'practice', 'mastered')) |
| practice_guide | text | 実践ガイド | |
| frequent_words | jsonb | 頻出単語（JSON配列） | |
| is_test_passed | boolean | テスト合格フラグ | DEFAULT false |
| added_at | timestamptz | 追加日時 | DEFAULT now() |
| created_at | timestamptz | 作成日時 | DEFAULT now() |
| updated_at | timestamptz | 更新日時 | DEFAULT now() |

**インデックス:**
- `user_id` (ユーザーごとの記事検索)
- `status` (ステータス別フィルタリング)
- `added_at DESC` (新しい順ソート)

**RLS:**
```sql
CREATE POLICY "Users can CRUD their own articles"
ON articles FOR ALL
USING (auth.uid() = user_id);
```

#### 4. documents
PDFドキュメント情報を管理

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| name | text | ファイル名 | NOT NULL |
| type | text | ドキュメントタイプ | CHECK (type IN ('pdf', 'markdown', 'text')) |
| content | text | 抽出テキスト | NOT NULL |
| summary | text | AI生成要約 | NOT NULL |
| key_points | text[] | 重要ポイント配列 | DEFAULT '{}' |
| chapters | jsonb | 章ごとの情報（JSON） | |
| file_size | integer | ファイルサイズ（バイト） | |
| added_at | timestamptz | 追加日時 | DEFAULT now() |
| created_at | timestamptz | 作成日時 | DEFAULT now() |
| updated_at | timestamptz | 更新日時 | DEFAULT now() |

**インデックス:**
- `user_id` (ユーザーごとのドキュメント検索)
- `added_at DESC` (新しい順ソート)

**RLS:**
```sql
CREATE POLICY "Users can CRUD their own documents"
ON documents FOR ALL
USING (auth.uid() = user_id);
```

#### 5. diary_entries
学習ダイアリーエントリを管理

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| content | text | ダイアリー内容 | NOT NULL |
| created_at | timestamptz | 作成日時 | DEFAULT now() |

**インデックス:**
- `user_id, created_at DESC` (ユーザーごとの時系列表示)

**RLS:**
```sql
CREATE POLICY "Users can CRUD their own diary entries"
ON diary_entries FOR ALL
USING (auth.uid() = user_id);
```

#### 6. learning_tweets
学習ツイート（140文字要約）を管理

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| content | text | ツイート内容 | NOT NULL, CHECK (length(content) <= 140) |
| created_at | timestamptz | 作成日時 | DEFAULT now() |

**インデックス:**
- `user_id, created_at DESC` (ユーザーごとの時系列表示)

**RLS:**
```sql
CREATE POLICY "Users can CRUD their own tweets"
ON learning_tweets FOR ALL
USING (auth.uid() = user_id);
```

#### 7. bookmarks
ブックマークURL管理

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| url | text | ブックマークURL | NOT NULL |
| created_at | timestamptz | 作成日時 | DEFAULT now() |

**インデックス:**
- `user_id` (ユーザーごとのブックマーク検索)

**RLS:**
```sql
CREATE POLICY "Users can CRUD their own bookmarks"
ON bookmarks FOR ALL
USING (auth.uid() = user_id);
```

#### 8. activity_logs
アクティビティログ（学習継続記録）

| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | uuid | プライマリキー | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| user_id | uuid | ユーザーID | FOREIGN KEY → auth.users(id), NOT NULL |
| date | date | アクティビティ日付 | NOT NULL |
| created_at | timestamptz | 作成日時 | DEFAULT now() |

**インデックス:**
- `user_id, date DESC` (ユーザーごとの日付検索)
- UNIQUE制約: `(user_id, date)` (1日1レコード)

**RLS:**
```sql
CREATE POLICY "Users can CRUD their own activity logs"
ON activity_logs FOR ALL
USING (auth.uid() = user_id);
```

### データベースセットアップ用SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Brains table
CREATE TABLE brains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  last_refactored TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brains_user_id ON brains(user_id);

ALTER TABLE brains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own brain"
ON brains FOR ALL
USING (auth.uid() = user_id);

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('new', 'reading', 'practice', 'mastered')) DEFAULT 'new',
  practice_guide TEXT,
  frequent_words JSONB,
  is_test_passed BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_added_at ON articles(added_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own articles"
ON articles FOR ALL
USING (auth.uid() = user_id);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf', 'markdown', 'text')) DEFAULT 'pdf',
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  chapters JSONB,
  file_size INTEGER,
  added_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_added_at ON documents(added_at DESC);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own documents"
ON documents FOR ALL
USING (auth.uid() = user_id);

-- Diary entries table
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_diary_entries_user_created ON diary_entries(user_id, created_at DESC);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own diary entries"
ON diary_entries FOR ALL
USING (auth.uid() = user_id);

-- Learning tweets table
CREATE TABLE learning_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 140),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_learning_tweets_user_created ON learning_tweets(user_id, created_at DESC);

ALTER TABLE learning_tweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tweets"
ON learning_tweets FOR ALL
USING (auth.uid() = user_id);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own bookmarks"
ON bookmarks FOR ALL
USING (auth.uid() = user_id);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, date DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own activity logs"
ON activity_logs FOR ALL
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brains_updated_at BEFORE UPDATE ON brains
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🎨 主要コンポーネント

### ArticleDetail / DocumentDetail
- **スプリットペインレイアウト**: リサイズ可能な左右分割
- **左ペイン**: コンテンツ表示（要約、キーワード、本文）
- **右ペイン上部**: 能動的学習エリア（メモ、クイズ、教えるモード）
- **右ペイン下部**: AIチャット（記事チャット / アドバイザーモード）

### ArticleList
- **タブ切り替え**: URLから追加 / PDFから追加
- **ドラッグ&ドロップ**: PDFファイルのアップロード
- **グリッド表示**: 記事とPDFを統合表示

### KnowledgeGraph
- **Force-directed graph**: 知識の関連性を力学シミュレーションで可視化
- **インタラクティブ**: ノードクリックで詳細表示

---

## ❓ トラブルシューティング

### OAuth認証がうまくいかない

1. **Supabase Anon Key の形式を確認**: `eyJhbGciOi...` で始まるJWT形式である必要があります
2. **環境変数のプレフィックス確認**: Viteでは `VITE_` プレフィックスが必須です
3. **Supabase で OAuth Provider が有効化されているか確認**
4. **リダイレクト URI が正しいか確認**

### PDFアップロードエラー

1. **PDF.js Worker のロード確認**: コンソールに404エラーがないか確認
2. **ファイルサイズ制限**: 大きすぎるPDFはブラウザでタイムアウトする可能性があります
3. **APIキー確認**: Gemini APIキーが正しく設定されているか確認

### 「Initialization failed」エラー

1. Gemini API Key が正しく設定されているか確認（`VITE_GEMINI_API_KEY`）
2. `.env.local` ファイルが存在するか確認
3. 開発サーバーを再起動: `npm run dev`

### データが表示されない

1. Supabaseのテーブルが作成されているか確認
2. RLSポリシーが正しく設定されているか確認
3. ブラウザの開発者ツールでネットワークエラーを確認

---

## 📄 ライセンス

MIT License

---

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

---

## 📧 お問い合わせ

- GitHub: [@KaitoS828](https://github.com/KaitoS828)
- Repository: [Knowledge-Nexus](https://github.com/KaitoS828/Knowledge-Nexus)

---

## 🔗 参考リンク

- [Google AI Studio](https://aistudio.google.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Firecrawl API](https://firecrawl.dev/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [Tailwind CSS](https://tailwindcss.com/)
