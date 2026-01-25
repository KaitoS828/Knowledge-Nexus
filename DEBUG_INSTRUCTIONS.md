# デバッグ手順

## 問題
Stripe決済は成功しているが、画面が「Free Plan」のままになっている

## 確認手順

### 1. ブラウザでダッシュボードを開く
http://localhost:3000/dashboard

### 2. 開発者ツールを開く
- Mac: `Cmd + Option + I`
- Windows: `F12`

### 3. Consoleタブで以下のログを確認

以下のようなログが表示されるはずです：

```
[DEBUG] subscriptionData from DB: {...}
[DEBUG] subscription: {...}
[DEBUG] isPro: true/false
```

## 期待される結果

### ケース1: 正常（Proプランの場合）
```
[DEBUG] subscriptionData from DB: {plan_type: "pro", status: "active", ...}
[DEBUG] subscription: {planType: "pro", status: "active", ...}
[DEBUG] isPro: true
```

### ケース2: データがない
```
[DEBUG] subscriptionData from DB: null
[DEBUG] subscription: null
[DEBUG] isPro: false
```

### ケース3: データはあるがFree
```
[DEBUG] subscriptionData from DB: {plan_type: "free", ...}
[DEBUG] subscription: {planType: "free", ...}
[DEBUG] isPro: false
```

## 次のステップ

上記のログをコピーして、エージェントに送信してください。
ログの内容によって、適切な修正を行います。

## 追加確認: Supabaseのデータベースを直接確認

1. https://supabase.com/dashboard にアクセス
2. プロジェクト「Knowledge Nexus」を選択
3. 左メニューから「Table Editor」を選択
4. `subscriptions` テーブルを開く
5. あなたのユーザーIDのレコードを確認
6. `plan_type` カラムの値を確認（`pro` になっているべき）

もし `plan_type` が `free` や空の場合、データベース更新が失敗しています。
