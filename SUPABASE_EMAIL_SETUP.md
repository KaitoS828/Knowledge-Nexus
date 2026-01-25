# Supabase メール設定ガイド (Custom SMTP)

"Error sending confirmation email" エラーが発生する場合、Supabaseのデフォルトメールサーバーの送信制限（時間あたり数通）に達している可能性が高いです。
安定したメール送信を行うには、**Custom SMTP** の設定が必須です。

このガイドでは、開発者向けの無料枠が充実している **Resend** を使用した設定手順を説明します。

## 手順 1: Resend アカウントの作成とAPIキー取得

1.  [Resend](https://resend.com/) にアクセスし、アカウントを作成します。
2.  ログイン後、ダッシュボードから **API Keys** に移動します。
3.  **Create API Key** をクリックします。
    - **Name**: `Supabase` (任意の名前)
    - **Permission**: `Full Access` または `Sending Access`
4.  生成された **API Key** (`re_` から始まる文字列) をコピーし、安全な場所に保存します。

## 手順 2: ドメイン認証 (推奨)

本番環境で確実にメールを届けるためには、ドメイン認証が必要です。
（開発中は `onboarding@resend.dev` などのテスト用アドレスを使用できますが、送信先が自分のメールアドレスに限定されます）

1.  Resend ダッシュボードの **Domains** に移動します。
2.  **Add Domain** をクリックし、所有しているドメイン（例: `your-app.com`）を入力します。
    - ※ Vercelの無料ドメイン（`.vercel.app`）はメール送信には使用できません。独自ドメインがない場合は、手順3に進みテスト送信を行ってください。
3.  表示されたDNSレコード（TXT, MX, CNAME等）を、ドメイン管理画面（Vercel, Google Domains, お名前.com等）に追加します。
4.  **Verify DNS Records** をクリックし、ステータスが `Verified` になるのを待ちます。

## 手順 3: Supabase での SMTP 設定

1.  [Supabase Dashboard](https://supabase.com/dashboard) にログインし、プロジェクトを開きます。
2.  **Authentication** > **Providers** > **Email** を展開します。
3.  **Enable Custom SMTP** を有効にします。
4.  以下の情報を入力します：

| 項目 | 設定値 (Resendの場合) |
| :--- | :--- |
| **Sender Email** | `onboarding@resend.dev` (独自ドメイン未設定時) <br> または `noreply@your-domain.com` (独自ドメイン設定時) |
| **Sender Name** | `Knowledge Nexus` (任意のアプリ名) |
| **SMTP Host** | `smtp.resend.com` |
| **SMTP Port** | `465` |
| **SMTP User** | `resend` |
| **SMTP Password** | Resendで取得した **API Key** (`re_...`) |
| **Minimum Interval** | `60` (デフォルトのまま) |

5.  **Save** をクリックして保存します。

## 手順 4: 動作確認

1.  アプリケーションのログイン画面から、メールアドレスを入力してサインアップ/ログインを試みます。
2.  メールが即座に届くことを確認します。
3.  Resendダッシュボードの **Emails** タブで、メールの送信ログを確認できます。

## トラブルシューティング

### "Rate limit exceeded" が出る場合
Supabase側の `Rate Limit` 設定を確認してください。
- **Authentication** > **Rate Limits**
- `Email OTP` などの制限緩和を検討してください（ただし、セキュリティリスクに注意）。

### メールが届かない場合 (Resend Logs)
Resendのログを確認してください。
- `Delivered`: 送信成功。迷惑メールフォルダを確認してください。
- `Bounced`: 宛先不明など。メールアドレスを確認してください。
- `Complained`: ユーザーが迷惑メール報告をした場合。

### 独自ドメインがない場合
Resendのテストモードでは、**Resendアカウントに登録したメールアドレスにしかメールを送れません**。
他のユーザーにテストしてもらう場合は、そのユーザーのメールアドレスをResendのテスト送信許可リストに追加するか、独自ドメインを取得して認証する必要があります。
