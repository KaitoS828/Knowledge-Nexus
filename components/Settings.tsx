'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { User, Shield, Brain, Laptop, Download, Trash2, Loader2, Sparkles, Type, Globe, CheckCircle2, Crown, LogOut, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Settings: React.FC = () => {
    const { user, preferences, updatePreferences, deleteAccount, brain, articles, subscription, signOut, showConfirm, showAlert } = useAppStore();
    const [isExporting, setIsExporting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const handlePersonaChange = (persona: string) => {
        updatePreferences({ aiPersona: persona });
    };

    const handleLanguageChange = (lang: 'japanese' | 'english') => {
        updatePreferences({ language: lang });
    };

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updatePreferences({ theme });
    };

    const handleLogout = async () => {
        const confirmed = await showConfirm('ログアウトしますか？', 'ログアウト');
        if (confirmed) {
            setIsLoggingOut(true);
            await signOut();
            router.push('/');
        }
    };

    const handleExportData = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let markdown = `# Knowledge Nexus Backup - ${new Date().toLocaleDateString()}\n\n`;
        markdown += `## Personal Brain\n${brain.content}\n\n`;
        markdown += `--- \n## Articles\n` + articles.map(a => `### ${a.title}\n${a.content}`).join('\n\n');
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-nexus-export-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        
        setIsExporting(false);
    };

    const isPro = subscription?.planType === 'pro';

    return (
        <div className="h-full bg-nexus-50 dark:bg-nexus-900 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-3xl font-black text-nexus-900 dark:text-nexus-50 tracking-tight mb-2">設定</h1>
                    <p className="text-nexus-500 dark:text-nexus-400 font-medium text-lg">あなたの「第2の脳」をカスタマイズしましょう。</p>
                </header>

                <div className="space-y-8">
                    {/* Account Section */}
                    <section className="bg-white dark:bg-nexus-800 rounded-3xl border border-nexus-200 dark:border-nexus-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 border-b border-nexus-100 dark:border-nexus-700 flex items-center gap-3">
                            <div className="p-2 bg-nexus-100 dark:bg-nexus-700 rounded-xl text-nexus-900 dark:text-nexus-100">
                                <User size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-nexus-900 dark:text-nexus-50">アカウント管理</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            {/* Guest User Warning */}
                            {user?.isGuest && (
                                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <Shield size={24} className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">ゲストモードでご利用中</h3>
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                                                現在、ゲストモードでご利用いただいています。データの永続化やProプランへのアップグレードには、本登録（メールアドレス・パスワード）が必要です。
                                            </p>
                                            <button
                                                onClick={() => showAlert('本登録機能は現在開発中です。しばらくお待ちください。', 'info', '開発中')}
                                                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg text-sm transition-colors"
                                            >
                                                本登録する
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-nexus-50 rounded-2xl border border-nexus-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-nexus-900 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
                                        {user?.email?.[0].toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-nexus-900">{user?.email}</p>
                                        <p className="text-xs text-nexus-400">ログイン中</p>
                                    </div>
                                </div>
                                {isPro ? (
                                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                                        <Crown size={12} />
                                        PRO
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-white border border-nexus-200 rounded-lg text-xs font-bold text-nexus-600">FREE</span>
                                )}
                            </div>

                            {/* Plan Management */}
                            {isPro ? (
                                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-orange-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Crown size={18} className="text-orange-600" />
                                        <h3 className="font-black text-orange-900">Proプラン</h3>
                                    </div>
                                    <p className="text-sm text-orange-700 mb-4">
                                        無制限の記事保存、AI分析、PDFアップロードをご利用いただけます。
                                    </p>
                                    <button
                                        onClick={() => router.push('/pricing')}
                                        className="text-xs text-orange-600 hover:text-orange-900 font-bold underline"
                                    >
                                        プラン管理 →
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 bg-gradient-to-br from-nexus-900 to-nexus-800 rounded-2xl text-white">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Crown size={18} className="text-yellow-400" />
                                        <h3 className="font-black">Proプランにアップグレード</h3>
                                    </div>
                                    <p className="text-sm text-nexus-100 mb-4">
                                        無制限の記事保存、高度なAI分析、PDFアップロードなどの機能をアンロック
                                    </p>
                                    <button
                                        onClick={() => router.push('/pricing')}
                                        className="w-full py-3 bg-white text-nexus-900 rounded-xl font-bold hover:bg-yellow-50 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Sparkles size={16} className="text-yellow-500" />
                                        プランを見る
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}

                            {/* Logout Button */}
                            <button 
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full flex items-center justify-between p-6 bg-nexus-50 text-nexus-700 rounded-2xl border border-nexus-200 hover:bg-nexus-100 transition-colors group disabled:opacity-50"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut size={20} />
                                    <div className="text-left">
                                        <p className="font-bold">ログアウト</p>
                                        <p className="text-xs opacity-80">このデバイスからログアウトします</p>
                                    </div>
                                </div>
                                {isLoggingOut && <Loader2 size={18} className="animate-spin" />}
                            </button>

                            <button 
                                onClick={deleteAccount}
                                className="w-full flex items-center justify-between p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 size={20} />
                                    <div className="text-left">
                                        <p className="font-bold">アカウントを削除（退会）</p>
                                        <p className="text-xs opacity-80">全ての知識データ、ログが完全に消去されます。</p>
                                    </div>
                                </div>
                                <Shield size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </section>

                    {/* AI & Learning Personalization */}
                    <section className="bg-white dark:bg-nexus-800 rounded-3xl border border-nexus-200 dark:border-nexus-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 border-b border-nexus-100 dark:border-nexus-700 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Brain size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-nexus-900 dark:text-nexus-50">AI・学習設定</h2>
                        </div>
                        <div className="p-8 space-y-8">
                            <div>
                                <h3 className="text-sm font-black text-nexus-400 mb-4 flex items-center gap-2 uppercase tracking-widest">AIコーチのペルソナ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'mentor', name: '優しいメンター', icon: <Sparkles className="text-yellow-500" />, desc: '褒めて伸ばすスタイル' },
                                        { id: 'coach', name: 'スパルタ教官', icon: <Type className="text-red-500" />, desc: '厳しく、的確に指摘' },
                                        { id: 'socratic', name: 'ソクラテス式', icon: <Globe className="text-blue-500" />, desc: '問いかけて考えさせる' }
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handlePersonaChange(p.id)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                                                preferences.aiPersona === p.id 
                                                ? 'border-nexus-900 bg-nexus-50/50 shadow-inner' 
                                                : 'border-nexus-100 hover:border-nexus-300 bg-white'
                                            }`}
                                        >
                                            {preferences.aiPersona === p.id && (
                                                <div className="absolute top-2 right-2"><CheckCircle2 size={16} className="text-nexus-900" /></div>
                                            )}
                                            <div className="mb-3 p-2 bg-white rounded-lg inline-block shadow-sm border border-nexus-100 group-hover:scale-110 transition-transform">{p.icon}</div>
                                            <p className="font-bold text-nexus-900 text-sm mb-1">{p.name}</p>
                                            <p className="text-[10px] text-nexus-400 font-medium leading-tight">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-nexus-100">
                                <h3 className="text-sm font-black text-nexus-400 mb-4 flex items-center gap-2 uppercase tracking-widest">出力言語設定</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { id: 'japanese', label: '日本語 (推奨)' },
                                        { id: 'english', label: 'English' }
                                    ].map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => handleLanguageChange(l.id as 'japanese' | 'english')}
                                            className={`px-5 py-3 rounded-xl border font-bold text-sm transition-all ${
                                                preferences.language === l.id
                                                ? 'bg-nexus-900 text-white border-nexus-900 shadow-lg'
                                                : 'bg-white text-nexus-600 border-nexus-200 hover:bg-nexus-50'
                                            }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Appearance */}
                    <section className="bg-white dark:bg-nexus-800 rounded-3xl border border-nexus-200 dark:border-nexus-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 border-b border-nexus-100 dark:border-nexus-700 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                                <Laptop size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-nexus-900 dark:text-nexus-50">外観とテーマ</h2>
                        </div>
                        <div className="p-8 space-y-6">
                             <div>
                                <h3 className="text-sm font-black text-nexus-400 mb-4 uppercase tracking-widest">カラーモード</h3>
                                <div className="flex gap-4">
                                    {[
                                        { id: 'light', label: 'ライト' },
                                        { id: 'dark', label: 'ダーク' },
                                        { id: 'system', label: 'システム' }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => handleThemeChange(t.id as any)}
                                            className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                                                preferences.theme === t.id
                                                ? 'bg-nexus-900 text-white border-nexus-900 shadow-lg'
                                                : 'bg-white text-nexus-50 border-nexus-100 hover:border-nexus-200 text-nexus-500'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Portability */}
                    <section className="bg-gradient-to-br from-indigo-900 to-nexus-900 rounded-3xl p-8 space-y-6 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 opacity-10"><Download size={200} /></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 rounded-xl border border-white/20"><Shield size={24} /></div>
                                    <h2 className="text-2xl font-black tracking-tight">データ所有権</h2>
                                </div>
                                <p className="text-indigo-200 font-medium">あなたの知識は、あなたのものです。いつでも一括で持ち出すことができます。</p>
                            </div>
                            <button 
                                onClick={handleExportData}
                                disabled={isExporting}
                                className="px-8 py-4 bg-white text-nexus-900 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                                全データをエクスポート
                            </button>
                        </div>
                    </section>
                </div>

                <footer className="mt-16 text-center text-nexus-400 text-xs font-medium">
                    <p>© 2024 Knowledge Nexus. Privacy-First Technology for Engineers.</p>
                </footer>
            </div>
        </div>
    );
};
