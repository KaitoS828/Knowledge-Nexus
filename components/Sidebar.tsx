'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, BookOpen, Brain, Activity, Settings, PenTool, LogOut, CreditCard, User, X, MessageCircle } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
    onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { signOut, user } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', path: '/dashboard', icon: Layout, label: 'ダッシュボード' },
    { id: 'diary', path: '/diary', icon: PenTool, label: '学習日記' },
    { id: 'reflection', path: '/reflection', icon: MessageCircle, label: '内省 (Reflection)' },
    { id: 'brain', path: '/brain', icon: Brain, label: 'ブレイン (Markdown)' },
    { id: 'graph', path: '/graph', icon: Activity, label: 'ナレッジグラフ' },
    { id: 'settings', path: '/settings', icon: Settings, label: '設定' },
  ];


  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 h-screen bg-white dark:bg-nexus-800 border-r border-nexus-200 dark:border-nexus-700 flex flex-col flex-shrink-0 sticky top-0 z-20 transition-all shadow-xl lg:shadow-none">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nexus-900 dark:bg-nexus-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            N
            </div>
            <span className="text-xl font-bold text-nexus-900 dark:text-nexus-50 tracking-tight">Nexus</span>
        </div>
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden p-2 text-nexus-400 dark:text-nexus-500 hover:text-nexus-900 dark:hover:text-nexus-100 rounded-full hover:bg-nexus-50 dark:hover:bg-nexus-700 transition-colors">
            <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => {
                  router.push(item.path);
                  if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-nexus-50 dark:bg-nexus-700 text-nexus-900 dark:text-nexus-50 font-bold border border-nexus-200 dark:border-nexus-600 shadow-sm'
                  : 'text-nexus-500 dark:text-nexus-400 hover:bg-nexus-50 dark:hover:bg-nexus-700 hover:text-nexus-900 dark:hover:text-nexus-100 font-medium'
              }`}
            >
              <Icon size={20} className={active ? 'text-nexus-900 dark:text-nexus-100' : 'text-nexus-400 dark:text-nexus-500 group-hover:text-nexus-600 dark:group-hover:text-nexus-300'} />
              <span className="">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-nexus-100 dark:border-nexus-700 space-y-2">
          {/* User Profile / Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-nexus-50 dark:hover:bg-nexus-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-nexus-100 dark:bg-nexus-700 flex items-center justify-center text-nexus-600 dark:text-nexus-300 overflow-hidden shadow-inner flex-shrink-0 border-2 border-white dark:border-nexus-600">
                {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                    <User size={20} />
                )}
            </div>
            <div className="text-left overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-black text-nexus-900 dark:text-nexus-100 truncate leading-none mb-1">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'}
                </p>
                <div className="flex items-center gap-1">
                    <Settings size={10} className="text-nexus-400 dark:text-nexus-500" />
                    <span className="text-[10px] font-bold text-nexus-400 dark:text-nexus-500 uppercase tracking-widest">Settings</span>
                </div>
            </div>
          </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};