import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, BookOpen, Brain, Activity, Settings, PenTool, LogOut, CreditCard, User } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { AuthOptionsModal } from './AuthOptionsModal';

export const Sidebar: React.FC = () => {
  const { signOut, user } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: Layout, label: 'ダッシュボード' },
    { id: 'diary', path: '/diary', icon: PenTool, label: '学習日記' },
    { id: 'brain', path: '/brain', icon: Brain, label: 'ブレイン (Markdown)' },
    { id: 'graph', path: '/graph', icon: Activity, label: 'ナレッジグラフ' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-20 lg:w-64 h-screen bg-white border-r border-nexus-200 flex flex-col flex-shrink-0 sticky top-0 z-20 transition-all">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-10 h-10 bg-nexus-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
          N
        </div>
        <span className="hidden lg:block text-xl font-bold text-nexus-900 tracking-tight">Nexus</span>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-nexus-50 text-nexus-900 font-bold border border-nexus-200 shadow-sm'
                  : 'text-nexus-500 hover:bg-nexus-50 hover:text-nexus-900 font-medium'
              }`}
            >
              <Icon size={20} className={active ? 'text-nexus-900' : 'text-nexus-400 group-hover:text-nexus-600'} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-nexus-100 space-y-2">
          {/* User Profile / Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-nexus-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-nexus-100 flex items-center justify-center text-nexus-600 overflow-hidden shadow-inner flex-shrink-0 border-2 border-white">
                {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <User size={20} />
                )}
            </div>
            <div className="hidden lg:block text-left overflow-hidden">
                <p className="text-xs font-black text-nexus-900 truncate leading-none mb-1">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'}
                </p>
                <div className="flex items-center gap-1">
                    <Settings size={10} className="text-nexus-400" />
                    <span className="text-[10px] font-bold text-nexus-400 uppercase tracking-widest">Settings</span>
                </div>
            </div>
          </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};