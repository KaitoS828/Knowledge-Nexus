# Mailhog セットアップガイド

## Mailhog について

Mailhogはローカルでメールシステムをテストするためのツールです。本番環境ではなく、開発環境でメール送受信をシミュレートします。

## セットアップ手順

### 1. Mailhog を Docker で起動

```bash
docker-compose up mailhog
```

このコマンドでMailhogが起動します：
- **SMTP Server**: localhost:1025
- **Web UI**: http://localhost:8025

### 2. Supabase でメール認証を有効にする

#### 方法 1: Supabase Dashboard での設定

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. **Authentication** > **Providers** に進む
4. **Email** プロバイダーが有効になっていることを確認
5. **Auth** > **URL Configuration** で、リダイレクトURLを設定：
   ```
   http://localhost:3000
   ```

#### 方法 2: SMTP 設定 (Mailhog を使用)

1. Supabase Dashboard から **Authentication** > **Email** に進む
2. 以下の SMTP 設定を入力：

| 項目 | 値 |
|------|-----|
| SMTP Host | localhost |
| SMTP Port | 1025 |
| SMTP User | (空白) |
| SMTP Password | (空白) |
| SMTP From Email | test@example.com |
| SMTP From Name | Knowledge Nexus |
| Enable "Use SSL" | オフ |

### 3. ローカル開発モードでテスト

1. 開発サーバーを起動：
   ```bash
   npm run dev
   ```

2. LandingPage で「メールで始める」をクリック
3. メールアドレス（例：test@example.com）を入力
4. Mailhog Web UI (http://localhost:8025) で確認コードを確認
5. 確認コード（6桁）をアプリに入力

### 4. Mailhog Web UI でメールを確認

Mailhog Web UIにアクセスすると、送受信されたメールがすべて表示されます：

```
http://localhost:8025
```

メールをクリックすると以下の情報が表示されます：
- 送信者
- 受取人
- 件名
- 本文
- HTML
- 確認コード（OTP）

## トラブルシューティング

### メールが到着しない場合

1. **Docker が起動しているか確認**：
   ```bash
   docker ps | grep mailhog
   ```

2. **ポートが使用されていないか確認**：
   ```bash
   lsof -i :1025   # SMTP port
   lsof -i :8025   # Web UI port
   ```

3. **Supabase SMTP 設定が正しいか確認**：
   - Host: `localhost` (または `host.docker.internal` on Docker Desktop)
   - Port: `1025`
   - SSL: オフ

### Docker コマンド

```bash
# コンテナを起動
docker-compose up mailhog

# バックグラウンドで起動
docker-compose up -d mailhog

# ログを表示
docker-compose logs -f mailhog

# コンテナを停止
docker-compose down
```

## 本番環境への移行

本番環境では、SendGridやMailgunなどのメール送信サービスに切り替えてください。

Supabase ダッシュボードで、実際のメール送信サービスのSMTP設定に変更します。

---

詳細は [Supabase 認証ドキュメント](https://supabase.com/docs/guides/auth) を参照してください。
