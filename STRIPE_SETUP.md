# Stripe 決済統合セットアップガイド

## 概要
Knowledge NexusにStripeを統合して、実際の決済処理を実装します。

## セットアップ手順

### ステップ 1: Stripeアカウント作成
1. [Stripe公式サイト](https://stripe.com) にアクセス
2. **ダッシュボード** → **新しいアカウント** でサインアップ
3. 日本をビジネス所在地として選択

### ステップ 2: APIキーを取得
1. Stripeダッシュボード → **開発者向け** → **APIキー**
2. **公開可能キー** と **シークレットキー** をコピー

### ステップ 3: 環境変数に追加
`.env.local` ファイルに以下を追加：

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### ステップ 4: 料金設定を作成
Stripeダッシュボード → **商品** → **新しい商品**

#### 商品1: Pro Monthly
- **名前**: Knowledge Nexus Pro - Monthly
- **タイプ**: サービス
- **料金**:
  - **金額**: ¥500
  - **請求期間**: 月ごと
  - **通貨**: JPY（日本円）

#### 商品2: Pro Yearly
- **名前**: Knowledge Nexus Pro - Yearly
- **タイプ**: サービス
- **料金**:
  - **金額**: ¥5,000
  - **請求期間**: 年ごと
  - **通貨**: JPY（日本円）

作成後、各料金のIDをメモしてください。
- Monthly Price ID: `price_xxxxxxxxxxxxx` (月額プランのIDも同様に確認してください)
- Yearly Price ID: `price_1StSzdRv1KVIBqGOOpbcT1EZ`

### ステップ 5: 環境変数に料金IDを追加
`.env.local` に追加：

```env
# Stripe Price IDs
VITE_STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
VITE_STRIPE_PRICE_YEARLY=price_xxxxxxxxxxxxx
```

## 実装方法

### 1. Stripe.jsをインストール（既にpackage.jsonに含まれている場合）
```bash
npm install @stripe/react-stripe-js @stripe/js
```

### 2. App.tsxでStripeをセットアップ（例）
```typescript
import { loadStripe } from '@stripe/js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <MainLayout />
    </Elements>
  );
}
```

### 3. チェックアウトセッション作成（バックエンド）
Supabase Functions または Edge Functions で実装：

```typescript
// supabase/functions/create-checkout-session/index.ts
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'POST') {
    const { userId, priceId } = await req.json();

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${Deno.env.get('APP_URL')}/pricing?success=true`,
        cancel_url: `${Deno.env.get('APP_URL')}/pricing?canceled=true`,
        customer_email: userId, // Real implementation should fetch user email
      });

      return new Response(
        JSON.stringify({ sessionId: session.id }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
});
```

### 4. PricingPageで決済フロー実装
```typescript
import { loadStripe } from '@stripe/js';

const handleUpgrade = async (cycle: 'monthly' | 'yearly') => {
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  const priceId = cycle === 'monthly'
    ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY
    : import.meta.env.VITE_STRIPE_PRICE_YEARLY;

  try {
    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        priceId: priceId,
      }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    await stripe?.redirectToCheckout({ sessionId });
  } catch (error) {
    console.error('Checkout failed:', error);
    alert('チェックアウトに失敗しました');
  }
};
```

### 5. Webhook処理（重要）
Stripeダッシュボード → **開発者向け** → **Webhook**

エンドポイント作成：
- **URL**: `https://your-app.com/api/stripe-webhook`
- **イベント**: `customer.subscription.updated`, `customer.subscription.created`

Webhook実装例（Supabase Function）：
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    if (event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;

      // Update database
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: subscription.metadata.user_id,
          plan_type: 'pro',
          status: subscription.status,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
        });

      if (error) throw error;
    }

    return new Response(JSON.stringify({ received: true }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
```

## テストモード

Stripe Test Mode で決済をテストします。

### テスト用クレジットカード番号
- **成功**: 4242 4242 4242 4242
- **失敗**: 4000 0000 0000 0002
- **認証必須**: 4000 0025 0000 3155

有効期限・CVV：任意（未来の日付）

## 本番環境への移行

1. Stripeダッシュボード → **アカウント設定** → **本番環境の有効化**
2. 本番環境の **公開可能キー** と **シークレットキー** を取得
3. `.env.production` で環境変数を設定（プレフィックスなし）
4. Vercel/Netlifyで環境変数を設定して再デプロイ

## 現在の実装状況

✅ **完了**:
- PricingPageの UI
- Store.tsx の upgrade関数（テスト用にDB直接更新）
- Supabase のsubscriptions テーブル

⏳ **実装予定**:
- Stripe API統合
- チェックアウトセッション作成
- Webhook処理
- エラーハンドリング強化

## よくある問題

### 問題: Webhook署名検証エラー
**原因**: Webhook署名シークレットが正しくない
**解決**: ダッシュボードの Webhook署名シークレット をコピーして再度設定

### 問題: 環境変数が読み込まれない
**原因**: Vite の環境変数は `VITE_` プレフィックス必須
**確認**: `import.meta.env.VITE_STRIPE_PUBLIC_KEY` で読み込みしているか確認

### 問題: 決済後にデータベースが更新されない
**原因**: Webhook が処理されていない
**解決**: Stripeダッシュボード → Webhook ログで失敗メッセージを確認
