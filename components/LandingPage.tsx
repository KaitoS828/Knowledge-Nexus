import React from 'react';
import { useAppStore } from '../store';
import { Sparkles, Brain, Zap, Share2, ArrowRight, Layout, TrendingUp, User, Github } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, signInWithGitHub, signInAsGuest } = useAppStore();

  return (
    <div className="min-h-screen bg-nexus-50 text-nexus-900 font-sans selection:bg-nexus-900 selection:text-white">
      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-nexus-900 rounded-lg flex items-center justify-center text-white font-bold shadow-md">N</div>
           <span className="text-xl font-bold tracking-tight">Knowledge Nexus</span>
        </div>
        <button 
          onClick={signInWithGoogle}
          className="text-sm font-bold text-nexus-600 hover:text-nexus-900 transition-colors"
        >
          ログイン
        </button>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-nexus-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Sparkles size={14} className="text-yellow-500" />
           <span className="text-xs font-bold text-nexus-600">エンジニアのための「第2の脳」</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-nexus-900 mb-8 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          さあ、<br className="md:hidden"/>知識を<span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-900 to-nexus-600">最大化</span>しよう。
        </h1>
        <p className="text-lg md:text-xl text-nexus-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          読みっぱなしの記事、散らばったメモ、忘れ去られたブックマーク。<br/>
          AIがそれらを整理・結合し、あなたの成長を加速させます。
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button
            onClick={signInWithGoogle}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-nexus-900 font-lg rounded-xl hover:bg-nexus-800 hover:shadow-lg hover:-translate-y-0.5 w-full md:w-auto"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Googleで始める
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </button>

            <button
            onClick={signInWithGitHub}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gray-800 font-lg rounded-xl hover:bg-gray-700 hover:shadow-lg hover:-translate-y-0.5 w-full md:w-auto"
            >
                <Github size={18} className="mr-3" />
                GitHubで始める
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={18} />
            </button>

            <button
                onClick={signInAsGuest}
                className="group inline-flex items-center justify-center px-8 py-4 font-bold text-nexus-600 bg-white border border-nexus-200 rounded-xl hover:bg-nexus-50 hover:text-nexus-900 transition-all w-full md:w-auto"
            >
                <User size={18} className="mr-2" />
                ゲストとして試す
            </button>
        </div>
        <p className="mt-4 text-xs text-nexus-400">※ゲストモードではデータはクラウドに保存されず、ブラウザを閉じると消えます。</p>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white border-t border-nexus-100">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
                icon={<Brain size={32} className="text-purple-500" />}
                title="知識の構造化"
                description="インプットした記事やメモをAIが解析し、あなたの「外部脳」としてMarkdown形式で自動的に整理・蓄積します。"
            />
            <FeatureCard 
                icon={<Zap size={32} className="text-yellow-500" />}
                title="ギャップ分析"
                description="現在の知識と最新トレンドの差分をAIが分析。「次に何を学ぶべきか」を具体的にレコメンドします。"
            />
            <FeatureCard 
                icon={<Share2 size={32} className="text-blue-500" />}
                title="アウトプット支援"
                description="学習ログからZennやQiitaへの投稿記事ドラフトをワンクリックで生成。発信までが学習です。"
            />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-nexus-50 text-center text-nexus-400 text-sm">
        <p>&copy; 2024 Knowledge Nexus. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-start text-left p-6 rounded-2xl hover:bg-nexus-50 transition-colors">
        <div className="mb-4 p-3 bg-white rounded-xl border border-nexus-200 shadow-sm">{icon}</div>
        <h3 className="text-xl font-bold text-nexus-900 mb-3">{title}</h3>
        <p className="text-nexus-600 leading-relaxed">{description}</p>
    </div>
);