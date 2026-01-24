import React from 'react';
import { useAppStore } from '../store';
import { Layout, BookOpen, Brain, Activity, Settings, PenTool, LogOut, CreditCard } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { signOut } = useAppStore();
  const navItems = [
    { id: 'dashboard', icon: Layout, label: 'ダッシュボード' },
    { id: 'diary', icon: PenTool, label: '学習日記' },
    { id: 'brain', icon: Brain, label: 'ブレイン (Markdown)' },
    { id: 'graph', icon: Activity, label: 'ナレッジグラフ' },
  ];

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
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-nexus-50 text-nexus-900 font-bold border border-nexus-200 shadow-sm' 
                  : 'text-nexus-500 hover:bg-nexus-50 hover:text-nexus-900 font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-nexus-900' : 'text-nexus-400 group-hover:text-nexus-600'} />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-nexus-100 space-y-1">
         <button
            onClick={() => setView('pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              currentView === 'pricing'
                ? 'text-nexus-900 bg-nexus-50 font-bold rounded-lg'
                : 'text-nexus-400 hover:text-nexus-900'
            }`}
         >
            <CreditCard size={20} />
            <span className="hidden lg:block">料金プラン</span>
         </button>
         <button className="w-full flex items-center gap-3 px-4 py-3 text-nexus-400 hover:text-nexus-900 transition-colors">
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