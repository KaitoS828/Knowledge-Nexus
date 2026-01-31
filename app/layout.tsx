import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Knowledge Nexus - AI-Powered Learning Platform',
    template: '%s | Knowledge Nexus',
  },
  description: 'AIがあなたの学習をパーソナライズ。記事分析、知識グラフ、クイズ生成で効率的な知識習得を実現。',
  keywords: ['AI学習', 'ナレッジマネジメント', '記事分析', 'パーソナル学習', 'Gemini', 'SaaS'],
  authors: [{ name: 'Knowledge Nexus Team' }],
  creator: 'Knowledge Nexus',
  metadataBase: new URL('https://knowledge-nexus.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://knowledge-nexus.vercel.app',
    siteName: 'Knowledge Nexus',
    title: 'Knowledge Nexus - AI-Powered Learning Platform',
    description: 'AIがあなたの学習をパーソナライズ。記事分析、知識グラフ、クイズ生成で効率的な知識習得を実現。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Knowledge Nexus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knowledge Nexus - AI-Powered Learning Platform',
    description: 'AIがあなたの学習をパーソナライズ',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
