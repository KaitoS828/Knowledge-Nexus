# Stripe Payment Links クイックセットアップ

## 概要
Stripe Payment Linksを使用して、バックエンド実装なしに決済機能を追加できます。

## セットアップ手順（5分）

### ステップ 1: Stripeアカウント作成・ログイン
1. [Stripe ダッシュボード](https://dashboard.stripe.com) にログイン

### ステップ 2: 料金設定を作成
1. **商品カタログ** → **商品**
2. **+ 新しい商品** をクリック

#### 月額プラン
- **商品名**: Knowledge Nexus Pro Monthly
- **説明**: サブスクリプション利用料（月額）
- **料金**: ¥500
- **請求期間**: 月ごと
- **通貨**: JPY

#### 年額プラン
- **商品名**: Knowledge Nexus Pro Yearly
- **説明**: サブスクリプション利用料（年額）
- **料金**: ¥5,000
- **請求期間**: 年ごと
- **通貨**: JPY

### ステップ 3: Payment Linkを作成
各料金に対して Payment Link を作成します。

#### Monthly Payment Link
1. **商品** → **Knowledge Nexus Pro Monthly** をクリック
2. **月額 ¥500** の料金をクリック
3. 右上の **リンク作成** をクリック
4. **Payment Link** タブで以下を設定：
   - **リンク名**: nexus-pro-monthly
   - **成功URL**: `https://localhost:3000` (開発中) または `https://knowledge-nexus-smoky.vercel.app` (本番)
   - **キャンセルURL**: `https://localhost:3000/pricing` (開発中) または `https://knowledge-nexus-smoky.vercel.app/pricing` (本番)
5. **リンクを作成** をクリック
6. **URL をコピー**：例 `https://buy.stripe.com/test_xxx`

#### Yearly Payment Link
上記と同じ手順で年額プランの Payment Link も作成します。

### ステップ 4: 環境変数に設定
`.env.local` に以下を追加：

```env
# Stripe Payment Links (for simple implementation without backend)
VITE_STRIPE_PAYMENT_LINK=true
VITE_STRIPE_PAYMENT_LINK_MONTHLY=https://buy.stripe.com/test_xxxxx
VITE_STRIPE_PAYMENT_LINK_YEARLY=https://buy.stripe.com/test_xxxxx
```

### ステップ 5: テスト
1. 開発サーバーを再起動
2. `http://localhost:3000` でアプリを開く
3. **料金プラン** → **Proにアップグレード** をクリック
4. Stripe Payment Link に遷移確認
5. テスト用クレジットカード番号で決済テスト：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の月日
   - CVC: 任意の3桁

## 本番環境設定

### ステップ 1: 本番モードを有効化
1. **設定** → **アカウント** → **本番環境の有効化**

### ステップ 2: 本番用 Payment Links を作成
1. ダッシュボード左上のトグルで **本番モード** に切り替え
2. 同じ手順で本番用の Payment Links を作成
3. **成功URL / キャンセルURL** は本番環境のURLに変更

### ステップ 3: Vercel で環境変数を設定
1. [Vercel ダッシュボード](https://vercel.com) → プロジェクト選択
2. **Settings** → **Environment Variables**
3. 以下を追加：
   ```
   VITE_STRIPE_PAYMENT_LINK=true
   VITE_STRIPE_PAYMENT_LINK_MONTHLY=https://buy.stripe.com/live_xxxxx
   VITE_STRIPE_PAYMENT_LINK_YEARLY=https://buy.stripe.com/live_xxxxx
   ```
4. **Redeploy** をクリック

## テスト用クレジットカード

| 用途 | カード番号 | 結果 |
|------|----------|------|
| 成功 | 4242 4242 4242 4242 | 決済成功 |
| 失敗 | 4000 0000 0000 0002 | 決済失敗 |
| 認証必須 | 4000 0025 0000 3155 | 認証画面表示 |

- **有効期限**: 任意の未来の月日
- **CVC**: 任意の3桁

## 現在の実装フロー

```
ユーザーが「Proにアップグレード」クリック
  ↓
handleUpgrade関数が実行
  ↓
VITE_STRIPE_PAYMENT_LINK が設定されているかチェック
  ↓
YES → Stripe Payment Link にリダイレクト
NO  → テストモード（データベース直接更新）
  ↓
決済完了後、成功URLにリダイレクト
```

## 制限事項

### Payment Links では以下ができません
- ❌ 自動サブスクリプション管理
- ❌ Webhook 処理
- ❌ カスタム UI
- ❌ リアルタイムの状態同期

### 本格的な実装には
**Stripe SDK + Supabase Functions** を使用してください。
詳細は `STRIPE_SETUP.md` を参照。

## トラブルシューティング

### 問題: Payment Link にリダイレクトしない
**原因**: 環境変数が設定されていない
**確認**: `.env.local` の設定を確認し、開発サーバーを再起動

### 問題: Payment Link が古い
**原因**: ブラウザキャッシュ
**解決**: `Ctrl+Shift+R` (Windows) または `Cmd+Shift+R` (Mac) でハードリロード

### 問題: 本番環境で動作しない
**確認**: Vercel の Environment Variables が正しく設定されているか
**デバッグ**: Vercel Logs で環境変数が読み込まれているか確認

## 次のステップ

現在のセットアップで以下が実装されました：

✅ **完了**:
1. Supabase データベース（subscriptions テーブル）
2. 使用量表示 UI
3. Stripe Payment Links 統合

⏳ **オプション（本格的な実装）**:
1. 自動サブスクリプション管理
2. Webhook 処理
3. Stripe SDK + Supabase Functions
