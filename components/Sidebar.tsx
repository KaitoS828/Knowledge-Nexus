import React from 'react';
import { useAppStore } from '../store';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, BookOpen, Brain, Activity, Settings, PenTool, LogOut, CreditCard } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { signOut } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

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

      <div className="p-4 border-t border-nexus-100 space-y-1">
         <button
            onClick={() => navigate('/pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              isActive('/pricing')
                ? 'text-nexus-900 bg-nexus-50 font-bold rounded-lg'
                : 'text-nexus-400 hover:text-nexus-900'
            }`}
         >
            <CreditCard size={20} />
            <span className="hidden lg:block">料金プラン</span>
         </button>
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              isActive('/settings')
                ? 'text-nexus-900 bg-nexus-50 font-bold rounded-lg'
                : 'text-nexus-400 hover:text-nexus-900'
            }`}
          >
            <Settings size={20} />
            <span className="hidden lg:block">設定</span>
          </button>
         <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-nexus-400 hover:text-red-600 transition-colors"
         >
            <LogOut size={20} />
            <span className="hidden lg:block">ログアウト</span>
         </button>
      </div>
    </div>
  );
};