import React, { useState } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store';

interface PricingPageProps {
  onBack: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  const { subscription, user, upgradeToProMonthly, upgradeToProYearly } = useAppStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (cycle: 'monthly' | 'yearly') => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    setIsUpgrading(true);
    try {
      if (cycle === 'monthly') {
        await upgradeToProMonthly();
      } else {
        await upgradeToProYearly();
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('アップグレードに失敗しました');
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlan = subscription?.planType || 'free';
  const isPro = currentPlan === 'pro';

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-nexus-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-nexus-100 rounded-lg text-nexus-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-nexus-900">料金プラン</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-md border border-nexus-200 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-nexus-900 text-white shadow-md'
                  : 'text-nexus-600 hover:text-nexus-900'
              }`}
            >
              月額払い
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-nexus-900 text-white shadow-md'
                  : 'text-nexus-600 hover:text-nexus-900'
              }`}
            >
              年額払い <span className="text-green-600 ml-1">（2ヶ月無料）</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-nexus-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nexus-100 to-transparent rounded-bl-full opacity-50"></div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-nexus-500" size={24} />
                <h3 className="text-2xl font-bold text-nexus-900">Free</h3>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-black text-nexus-900">¥0</span>
                <span className="text-nexus-500 ml-2">/ 月</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-nexus-700">記事・PDF保存: <strong>合計2件まで</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-nexus-700">AI利用: <strong>月10回まで</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-nexus-700">Brain（知識ベース）</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-nexus-700">学習ダイアリー</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-nexus-700">ナレッジグラフ</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-3 px-6 rounded-xl font-bold bg-nexus-100 text-nexus-400 cursor-not-allowed"
              >
                {currentPlan === 'free' ? '現在のプラン' : '無料プラン'}
              </button>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-nexus-900 to-purple-900 rounded-3xl p-8 shadow-2xl border-2 border-nexus-600 relative overflow-hidden transform hover:scale-105 transition-transform">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full"></div>

            {/* Popular Badge */}
            <div className="absolute -top-1 -right-1">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-2xl rounded-tr-2xl shadow-lg">
                人気
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="text-yellow-400" size={28} />
                <h3 className="text-2xl font-bold text-white">Pro</h3>
              </div>

              <div className="mb-6">
                {billingCycle === 'monthly' ? (
                  <>
                    <span className="text-5xl font-black text-white">¥500</span>
                    <span className="text-white/70 ml-2">/ 月</span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl font-black text-white">¥5,000</span>
                    <span className="text-white/70 ml-2">/ 年</span>
                    <div className="mt-2 inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      月額換算 ¥417 🎉
                    </div>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Sparkles className="text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-white">記事保存: <strong>無制限</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-white">PDF保存: <strong>無制限</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-white">AI利用: <strong>無制限*</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-white">全機能アクセス</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-yellow-400 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-white">優先サポート</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade(billingCycle)}
                disabled={isPro || isUpgrading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-xl ${
                  isPro
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : isUpgrading
                    ? 'bg-white/50 text-nexus-900 cursor-wait'
                    : 'bg-white text-nexus-900 hover:bg-yellow-50 hover:shadow-2xl transform hover:-translate-y-1'
                }`}
              >
                {isPro ? '現在のプラン' : isUpgrading ? 'アップグレード中...' : 'Proにアップグレード'}
              </button>

              <p className="text-white/60 text-xs mt-4 text-center">
                * 月500AI操作で警告、月1,000操作で制限
              </p>
            </div>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg border border-nexus-200">
          <h3 className="text-2xl font-bold text-nexus-900 mb-6 text-center">機能比較</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-nexus-200">
                  <th className="text-left py-4 px-4 text-nexus-700 font-bold">機能</th>
                  <th className="text-center py-4 px-4 text-nexus-700 font-bold">Free</th>
                  <th className="text-center py-4 px-4 text-nexus-700 font-bold bg-nexus-50">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-100">
                <tr>
                  <td className="py-4 px-4 text-nexus-800">記事・PDF保存数（合計）</td>
                  <td className="text-center py-4 px-4">2件</td>
                  <td className="text-center py-4 px-4 bg-nexus-50 font-bold">無制限</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-nexus-800">AI分析・要約</td>
                  <td className="text-center py-4 px-4">月10回</td>
                  <td className="text-center py-4 px-4 bg-nexus-50 font-bold">無制限</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-nexus-800">クイズ生成</td>
                  <td className="text-center py-4 px-4">月10回</td>
                  <td className="text-center py-4 px-4 bg-nexus-50 font-bold">無制限</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-nexus-800">AIチャット</td>
                  <td className="text-center py-4 px-4">月10回</td>
                  <td className="text-center py-4 px-4 bg-nexus-50 font-bold">無制限</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-nexus-800">Brain統合提案</td>
                  <td className="text-center py-4 px-4">月10回</td>
                  <td className="text-center py-4 px-4 bg-nexus-50 font-bold">無制限</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-nexus-800">学習ダイアリー</td>
                  <td className="text-center py-4 px-4"><Check className="text-green-600 mx-auto" size={20} /></td>
                  <td className="text-center py-4 px-4 bg-nexus-50"><Check className="text-green-600 mx-auto" size={20} /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-nexus-800">ナレッジグラフ</td>
                  <td className="text-center py-4 px-4"><Check className="text-green-600 mx-auto" size={20} /></td>
                  <td className="text-center py-4 px-4 bg-nexus-50"><Check className="text-green-600 mx-auto" size={20} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center text-nexus-600 text-sm">
          <p>※ お支払いは<strong>Stripe</strong>で安全に処理されます</p>
          <p className="mt-2">※ いつでもキャンセル可能です（違約金なし）</p>
        </div>
      </div>
    </div>
  );
};
