import type { Metadata } from 'next';
import { PricingPageClient } from './PricingPageClient';

export const metadata: Metadata = {
  title: '料金プラン',
  description: 'Knowledge Nexusの料金プラン。無料プランで始めて、Proプランでフル機能を解放。月額980円または年額9,800円（2ヶ月分お得）。',
  openGraph: {
    title: '料金プラン | Knowledge Nexus',
    description: 'Knowledge Nexusの料金プラン。無料プランで始めて、Proプランでフル機能を解放。',
  },
};

// Static generation for SEO
export const dynamic = 'force-static';

export default function PricingRoute() {
  return <PricingPageClient />;
}
