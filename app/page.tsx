import type { Metadata } from 'next';
import { LandingPageClient } from './LandingPageClient';

export const metadata: Metadata = {
  title: 'Knowledge Nexus - AI-Powered Learning Platform',
  description: 'AIがあなたの学習をパーソナライズ。記事分析、知識グラフ、クイズ生成で効率的な知識習得を実現。技術記事を保存し、AIが要約・分析。あなただけの外部脳を構築しましょう。',
  openGraph: {
    title: 'Knowledge Nexus - AI-Powered Learning Platform',
    description: 'AIがあなたの学習をパーソナライズ。記事分析、知識グラフ、クイズ生成で効率的な知識習得を実現。',
    type: 'website',
  },
};

// Static generation for SEO
export const dynamic = 'force-static';

export default function HomePage() {
  return <LandingPageClient />;
}
