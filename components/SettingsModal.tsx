import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { 
    X, User, Moon, Sun, Monitor, Languages, 
    Trash2, Save, LogOut, Shield, Crown, Sparkles, Check
} from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, preferences, updatePreferences, signOut, deleteAccount, subscription } = useAppStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'account'>('profile');
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isOpen) return null;

    const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
        setIsUpdating(true);
        await updatePreferences({ theme });
        setIsUpdating(false);
    };

    const handleLanguageChange = async (language: 'japanese' | 'english') => {
        setIsUpdating(true);
        await updatePreferences({ language });
        setIsUpdating(false);
    };

    const isPro = subscription?.planType === 'pro';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-nexus-900/40 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-3xl md:rounded-[40px] shadow-2xl flex flex-col md:flex-row h-full md:h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-nexus-50/50 border-r border-nexus-100 p-6 md:p-8 flex flex-col gap-2 shrink-0">
                    <h2 className="text-xl font-black text-nexus-900 mb-8 px-2">Settings</h2>
                    
                    {[
                        { id: 'profile', icon: User, label: 'プロフィール' },
                        { id: 'appearance', icon: Moon, label: '外観・テーマ' },
                        { id: 'account', icon: Shield, label: 'アカウント' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-white text-nexus-900 shadow-sm border border-nexus-100' 
                                : 'text-nexus-400 hover:text-nexus-900'
                            }`}
                        >
                            <tab.icon size={20} />
                            <span>{tab.label}</span>
                        </button>
                    ))}

                    <div className="mt-auto pt-6 border-t border-nexus-200">
                        <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-600 font-bold transition-colors w-full">
                            <LogOut size={20} />
                            <span>ログアウト</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    {/* Header */}
                    <div className="p-8 pb-4 flex justify-between items-center">
                        <h3 className="text-2xl font-black text-nexus-900 tracking-tight">
                            {activeTab === 'profile' && 'プロフィール設定'}
                            {activeTab === 'appearance' && '外観・テーマ設定'}
                            {activeTab === 'account' && 'アカウント設定'}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-nexus-50 rounded-full transition-colors text-nexus-400 hover:text-nexus-900">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-10">
                                <div className="flex items-center gap-6 p-6 bg-nexus-50/50 rounded-[32px] border border-nexus-100">
                                    <div className="w-24 h-24 bg-nexus-200 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center text-nexus-400">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-nexus-400 text-xs font-black uppercase tracking-widest mb-1">Authenticated user</p>
                                        <h4 className="text-2xl font-black text-nexus-900">{user?.user_metadata?.full_name || 'Anonymous User'}</h4>
                                        <p className="text-nexus-500 font-medium">{user?.email}</p>
                                    </div>
                                    {isPro && (
                                        <div className="ml-auto flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-amber-500/20">
                                            <Crown size={14} /> PRO
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-sm font-black text-nexus-900 uppercase tracking-widest px-2">AIパートナー設定</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'mentor', title: '優しいメンター', desc: '初心者に寄り添い、ポジティブに励まします。' },
                                            { id: 'coach', title: 'スパルタ教官', desc: '厳しく、的確に改善点を指摘します。' },
                                            { id: 'socratic', title: 'ソクラテス式', icon: <Monitor />, desc: '問いかけによってあなた自身に答えを導かせます。' }
                                        ].map(persona => (
                                            <button 
                                                key={persona.id}
                                                onClick={() => updatePreferences({ aiPersona: persona.id })}
                                                className={`p-6 rounded-[24px] text-left border-2 transition-all ${
                                                    preferences.aiPersona === persona.id 
                                                    ? 'border-nexus-900 bg-nexus-900/5 shadow-md' 
                                                    : 'border-nexus-50 hover:border-nexus-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-black text-nexus-900">{persona.title}</span>
                                                    {preferences.aiPersona === persona.id && <Check size={18} className="text-nexus-900" />}
                                                </div>
                                                <p className="text-xs text-nexus-500 font-medium">{persona.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h5 className="text-sm font-black text-nexus-900 uppercase tracking-widest px-2">カラーテーマ</h5>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'light', icon: Sun, label: 'ライト' },
                                            { id: 'dark', icon: Moon, label: 'ダーク' },
                                            { id: 'system', icon: Monitor, label: 'システム' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => handleThemeChange(t.id as any)}
                                                className={`flex flex-col items-center gap-4 p-8 rounded-[32px] border-2 transition-all ${
                                                    preferences.theme === t.id 
                                                    ? 'border-nexus-900 bg-nexus-900/5' 
                                                    : 'border-nexus-50 hover:border-nexus-100 hover:bg-nexus-50'
                                                }`}
                                            >
                                                <t.icon size={32} className={preferences.theme === t.id ? 'text-nexus-900' : 'text-nexus-300'} />
                                                <span className={`font-black text-sm ${preferences.theme === t.id ? 'text-nexus-900' : 'text-nexus-400'}`}>{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h5 className="text-sm font-black text-nexus-900 uppercase tracking-widest px-2">表示言語</h5>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'japanese', label: '日本語' },
                                            { id: 'english', label: 'English' }
                                        ].map(l => (
                                            <button
                                                key={l.id}
                                                onClick={() => handleLanguageChange(l.id as any)}
                                                className={`px-8 py-4 rounded-2xl font-black text-sm border-2 transition-all ${
                                                    preferences.language === l.id 
                                                    ? 'border-nexus-900 bg-nexus-900 text-white shadow-xl' 
                                                    : 'border-nexus-100 text-nexus-400 hover:border-nexus-200'
                                                }`}
                                            >
                                                {l.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <div className="space-y-8">
                                <div className="p-8 bg-red-50/50 rounded-[32px] border border-red-100">
                                    <div className="flex items-center gap-3 text-red-600 mb-4">
                                        <Shield size={24} />
                                        <h4 className="text-lg font-black">危険エリア</h4>
                                    </div>
                                    <p className="text-red-400 text-sm font-medium leading-relaxed mb-8">
                                        アカウントを削除すると、これまで蓄積したBrain、記事、学習日記などの全てのデータが永久に削除され、復旧することはできません。
                                    </p>
                                    <button 
                                        onClick={deleteAccount}
                                        className="inline-flex items-center gap-2 bg-white text-red-500 border border-red-200 hover:bg-red-500 hover:text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                        アカウントを完全に削除する
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
