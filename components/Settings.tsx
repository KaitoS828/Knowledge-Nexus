import React, { useState } from 'react';
import { useAppStore } from '../store';
import { User, Shield, Brain, Laptop, Download, Trash2, Loader2, Sparkles, Type, Globe, CheckCircle2 } from 'lucide-react';
import { AIPersona } from '../types';

export const Settings: React.FC = () => {
    const { user, preferences, updatePreferences, deleteAccount, brain, articles, diaryEntries, documents } = useAppStore();
    const [isExporting, setIsExporting] = useState(false);

    const handlePersonaChange = (persona: AIPersona) => {
        updatePreferences({ aiPersona: persona });
    };

    const handleLanguageChange = (lang: 'japanese' | 'english' | 'auto') => {
        updatePreferences({ language: lang });
    };

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        updatePreferences({ theme });
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

    return (
        <div className="h-full bg-nexus-50 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-3xl font-black text-nexus-900 tracking-tight mb-2">設定</h1>
                    <p className="text-nexus-500 font-medium text-lg">あなたの「第2の脳」をカスタマイズしましょう。</p>
                </header>

                <div className="space-y-8">
                    {/* Account Section */}
                    <section className="bg-white rounded-3xl border border-nexus-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 border-b border-nexus-100 flex items-center gap-3">
                            <div className="p-2 bg-nexus-100 rounded-xl text-nexus-900">
                                <User size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-nexus-900">アカウント管理</h2>
                        </div>
                        <div className="p-8 space-y-6">
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
                                <span className="px-3 py-1 bg-white border border-nexus-200 rounded-lg text-xs font-bold text-nexus-600">一般ユーザー</span>
                            </div>

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
                    <section className="bg-white rounded-3xl border border-nexus-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 border-b border-nexus-100 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                <Brain size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-nexus-900">AI・学習設定</h2>
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
                                            onClick={() => handlePersonaChange(p.id as AIPersona)}
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
                                        { id: 'english', label: 'English' },
                                        { id: 'auto', label: '自動 (ソース記事に従う)' }
                                    ].map((l) => (
                                        <button
                                            key={l.id}
                                            onClick={() => handleLanguageChange(l.id as any)}
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
                    <section className="bg-white rounded-3xl border border-nexus-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                        <div className="p-8 border-b border-nexus-100 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
                                <Laptop size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-nexus-900">外観とテーマ</h2>
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
