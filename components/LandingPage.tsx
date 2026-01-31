import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Zap, Share2, ArrowRight, Layout, TrendingUp, User, Github, Mail, Shield, CheckCircle2, ChevronRight, Search, GraduationCap } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, signInWithGitHub, signInAsGuest } = useAppStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-slide features (optional visual flair)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-nexus-900 font-sans selection:bg-nexus-900 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-nexus-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-nexus-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-nexus-900/20 group-hover:scale-105 transition-transform duration-300">N</div>
                <span className="text-xl font-black tracking-tighter uppercase">Knowledge Nexus</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
                {['プロダクト', 'ソリューション', '料金', 'リソース'].map((item) => (
                    <a key={item} href="#" className="text-sm font-bold text-nexus-500 hover:text-nexus-900 transition-colors uppercase tracking-widest">{item}</a>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hidden sm:block text-sm font-black text-nexus-500 hover:text-nexus-900 transition-colors uppercase tracking-widest"
                >
                    ログイン
                </button>
                <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-6 py-3 bg-nexus-900 text-white font-black text-sm rounded-xl hover:bg-black transition-all hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-widest"
                >
                    無料で始める
                </button>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 md:pt-60 md:pb-40 px-6 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 rounded-full blur-[120px] -z-10 opacity-70 pointer-events-none"></div>
         
         <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-nexus-100 shadow-xl shadow-indigo-500/5 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">AI-Powered Tech Knowledge Management</span>
            </div>

            <h1 className="text-6xl md:text-[100px] font-black tracking-tighter text-nexus-900 mb-10 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
               最速の<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-900 via-indigo-800 to-nexus-700 underline decoration-indigo-500/30">エンジニア成長</span>を。
            </h1>

            <p className="text-xl md:text-2xl text-nexus-500 max-w-3xl mx-auto mb-16 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                AIが記事やPDFから瞬時にナレッジを抽出。<br/>
                あなたの「第2の脳」が、昨日までの断片的な知識を、明日からの強力な武器へと変えます。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="group relative px-12 py-6 bg-nexus-900 text-white rounded-[24px] font-black text-xl hover:bg-black transition-all hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98] w-full sm:w-auto overflow-hidden"
                >
                    <div className="relative z-10 flex items-center gap-3">
                        無料で今すぐ始める
                        <ArrowRight className="transition-transform group-hover:translate-x-2" size={24} />
                    </div>
                </button>
                <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                        </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-nexus-100 flex items-center justify-center text-[10px] font-black text-nexus-900">+1.2k</div>
                </div>
            </div>
         </div>
      </section>

      {/* Numerical Impact Section (New Hybrid Element) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-10 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-4">
                    <p className="text-sm font-black text-indigo-500 uppercase tracking-widest">Efficiency</p>
                    <h3 className="text-5xl font-black text-nexus-900">15% <span className="text-2xl text-nexus-400">Time Saved</span></h3>
                    <p className="text-nexus-500 font-medium leading-relaxed">記事の構造化と要約により、毎日の情報収集に必要な時間を劇的に短縮します。</p>
                </div>
                <div className="p-10 bg-purple-50 rounded-[40px] border border-purple-100 space-y-4">
                    <p className="text-sm font-black text-purple-500 uppercase tracking-widest">Retention</p>
                    <h3 className="text-5xl font-black text-nexus-900">92% <span className="text-2xl text-nexus-400">Accuracy</span></h3>
                    <p className="text-nexus-500 font-medium leading-relaxed">AIによる定着度クイズとフィードバックで、学んだ知識を確実に自分のものにします。</p>
                </div>
                <div className="p-10 bg-yellow-50 rounded-[40px] border border-yellow-100 space-y-4">
                    <p className="text-sm font-black text-yellow-600 uppercase tracking-widest">Output</p>
                    <h3 className="text-5xl font-black text-nexus-900">3x <span className="text-2xl text-nexus-400">Faster Draft</span></h3>
                    <p className="text-nexus-500 font-medium leading-relaxed">蓄積したログからZenn/Qiita用ドラフトを生成し、アウトプットのハードルを最小化します。</p>
                </div>
            </div>
        </div>
      </section>

      {/* Step-by-Step Learning Timeline (New Hybrid Element) */}
      <section className="py-40 bg-nexus-50/30">
        <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-24">
                <h2 className="text-4xl md:text-5xl font-black text-nexus-900 tracking-tight mb-6">Knowledge Nexusが選ばれる理由は？</h2>
                <div className="w-24 h-2 bg-nexus-900 mx-auto rounded-full"></div>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-nexus-100 -translate-x-1/2 hidden md:block"></div>

                <div className="space-y-32">
                    {[
                        { 
                            step: '01', 
                            title: '読んだものを忘れない、消さない', 
                            desc: '気になる技術記事やPDFを保存するだけ。AIがその瞬間に内容を解析し、構造化されたMarkdownとして永久保存します。',
                            img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800'
                        },
                        { 
                            step: '02', 
                            title: '自分だけの「外部脳」との対話', 
                            desc: '保存した知識は、いつでもチャット形式で取り出せます。過去に学んだ技術の要点をAIが即座に答え、あなたの記憶を補完します。',
                            img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800'
                        },
                        { 
                            step: '03', 
                            title: '知識の空白をAIがレコメンド', 
                            desc: '「今のあなたが次に何を学ぶべきか」をAIが分析。Brainの内容に基づいたパーソナライズされた学習ロードマップを提示します。',
                            img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
                        },
                        { 
                            step: '04', 
                            title: 'アウトプットへの最短ルート', 
                            desc: 'アウトプットが最大のインプット。蓄積したデータを元に、公開用のブログ記事をAIがアシストして書き上げます。',
                            img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'
                        }
                    ].map((item, i) => (
                        <div key={item.step} className={`relative flex flex-col md:flex-row items-center gap-12 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            {/* Circle Indicator */}
                            <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-4 border-nexus-900 rounded-full z-10 flex items-center justify-center font-black text-nexus-900 hidden md:flex">
                                {item.step}
                            </div>
                            
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <span className="md:hidden text-4xl font-black text-nexus-200">{item.step}</span>
                                <h3 className="text-3xl font-black text-nexus-900 tracking-tight">{item.title}</h3>
                                <p className="text-nexus-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="flex-1 w-full">
                                <img src={item.img} className="rounded-3xl shadow-xl border border-nexus-100 w-full aspect-video object-cover" alt={item.title} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* FAQ Section (New Hybrid Element) */}
      <section className="py-40 bg-white">
        <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black text-nexus-900 tracking-tight">よくあるご質問</h2>
            </div>
            <div className="space-y-4">
                {[
                    { q: 'どのようなファイル形式に対応していますか？', a: '現在はURL（Web記事）とPDFに対応しています。YouTube動画の文字起こし解析も可能です。' },
                    { q: 'データは安全に保存されますか？', a: 'はい。あなたの知識データはSupabase上に暗号化して保存され、他者に公開されることはありません。' },
                    { q: '無料でどこまで使えますか？', a: '無料プランでは月間10回のAI解析と、最大2件のナレッジ保存が可能です。' },
                    { q: 'スマホでも利用できますか？', a: 'はい。ブラウザからのWebアプリ版として、スマホでも最適化された UIでご利用いただけます。' }
                ].map((faq, i) => (
                    <details key={i} className="group bg-nexus-50 rounded-2xl border border-nexus-100 overflow-hidden">
                        <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-nexus-900 list-none">
                            {faq.q}
                            <span className="group-open:rotate-180 transition-transform"><ChevronRight /></span>
                        </summary>
                        <div className="px-6 pb-6 text-nexus-500 font-medium leading-relaxed">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>
        </div>
      </section>

      {/* Final CTA Redesign */}
      <section className="py-40 px-6 bg-[#0A0A0A] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(63,94,251,0.2),transparent)]"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                エンジニアの<br/>「忘却」を終わらせる。
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-12 py-6 bg-white text-black rounded-2xl font-black text-xl hover:bg-nexus-100 transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                    無料で体験する
                </button>
                <div className="text-left text-nexus-500 text-sm font-bold uppercase tracking-widest leading-none">
                    NO CREDIT CARD<br/>REQUIRED.
                </div>
            </div>
        </div>
      </section>

      {/* App Installation/Preview Section 2 */}
      <section className="pb-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { title: 'PCブラウザ', desc: 'フル機能のダッシュボードインターフェース', icon: <Layout className="text-gray-400"/> },
                { title: 'モバイルアプリ', desc: '外出先でのクイック保存と振り返り (Coming Soon)', icon: <User className="text-gray-400"/> },
                { title: 'VSC Extension', desc: 'エディタから直接知識にアクセス (Coming Soon)', icon: <Github className="text-gray-400"/> }
            ].map((app, i) => (
                <div key={i} className="p-10 rounded-[40px] bg-nexus-50 border border-nexus-100 flex flex-col items-center text-center group hover:bg-white transition-colors duration-500">
                    <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-nexus-50 group-hover:scale-110 transition-transform">{app.icon}</div>
                    <h3 className="text-xl font-bold text-nexus-900 mb-2">{app.title}</h3>
                    <p className="text-sm text-nexus-500 font-medium">{app.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 bg-white border-t border-nexus-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-24">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-nexus-900 rounded-xl flex items-center justify-center text-white font-black">N</div>
                        <span className="text-xl font-black tracking-tighter uppercase">Knowledge Nexus</span>
                    </div>
                    <p className="text-sm text-nexus-400 font-medium leading-relaxed">
                        エンジニアのインプットを資産に変える、<br/>次世代の学習記録プラットフォーム。
                    </p>
                </div>
                <div className="grid grid-cols-2 col-span-1 md:col-span-3 gap-12 md:gap-24">
                    {['プロダクト', 'リソース', 'コミュニティ', 'サポート'].map(title => (
                        <div key={title} className="space-y-6">
                            <h4 className="text-xs font-black text-nexus-900 uppercase tracking-[0.2em]">{title}</h4>
                            <ul className="space-y-4">
                                {['リンク 1', 'リンク 2', 'リンク 3'].map(link => (
                                    <li key={link}><a href="#" className="text-sm text-nexus-400 hover:text-nexus-900 font-bold transition-colors">{link}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pt-12 border-t border-nexus-50 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-xs text-nexus-400 font-bold uppercase tracking-widest">&copy; 2024 Knowledge Nexus. All rights reserved.</p>
                <div className="flex items-center gap-8">
                    <Shield size={16} className="text-nexus-200" />
                    <a href="#" className="text-xs text-nexus-300 font-black hover:text-nexus-900 uppercase tracking-widest transition-colors">Privacy</a>
                    <a href="#" className="text-xs text-nexus-300 font-black hover:text-nexus-900 uppercase tracking-widest transition-colors">Terms</a>
                </div>
            </div>
        </div>
      </footer>

      {/* Unified Auth Flow Modal */}
      <AuthModal
         isOpen={isAuthModalOpen}
         onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
