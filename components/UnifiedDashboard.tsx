import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Book, PenTool, MessageCircle, Brain, Activity, Plus, Search, User, Crown, Settings as SettingsIcon } from 'lucide-react';
import { ArticleList } from './ArticleList';
import { LearningDiary } from './LearningDiary';
import { ReflectionPage } from './ReflectionPage';
import { BrainEditor } from './BrainEditor';
import { KnowledgeGraph } from './KnowledgeGraph';
import { SearchModal } from './SearchModal'; 
import { DiscoverPage } from './DiscoverPage';
import { TrendingSidebar } from './TrendingSidebar';
import { fetchArticleContent } from '../services/geminiService';

type TabId = 'discover' | 'articles' | 'diary' | 'reflection' | 'brain' | 'graph';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const TABS: Tab[] = [
  { id: 'discover', label: 'ディスカバー', icon: Search },
  { id: 'articles', label: '記事', icon: Book },
  { id: 'diary', label: '学習日記', icon: PenTool },
  { id: 'reflection', label: '内省', icon: MessageCircle },
  { id: 'brain', label: 'ブレイン', icon: Brain },
  { id: 'graph', label: 'グラフ', icon: Activity },
];

export const UnifiedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('articles');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { user, subscription, addArticle } = useAppStore();
  const navigate = useNavigate();
  const isPro = subscription?.planType === 'pro';

  // Keyboard shortcut: / key to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already typing in an input
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle adding article from search
  const handleAddArticle = async (url: string) => {
    try {
      const partialArticle = await fetchArticleContent(url);
      const newArticle = {
        id: crypto.randomUUID(),
        url,
        title: partialArticle.title || '新しい記事',
        summary: partialArticle.summary || 'AI解析中...',
        content: partialArticle.content || '',
        practiceGuide: partialArticle.practiceGuide || '',
        frequentWords: partialArticle.frequentWords || [],
        tags: partialArticle.tags || [],
        status: 'new' as const,
        createdAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      };
      await addArticle(newArticle);
      // Switch to articles tab to see the newly added article
      setActiveTab('articles');
    } catch (error) {
      console.error('Failed to add article:', error);
      alert('記事の追加に失敗しました');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverPage />;
      case 'articles':
        return <ArticleList />;
      case 'diary':
        return <LearningDiary />;
      case 'reflection':
        return <ReflectionPage />;
      case 'brain':
        return <BrainEditor />;
      case 'graph':
        return <KnowledgeGraph />;
      default:
        return <ArticleList />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-nexus-50 dark:bg-nexus-900">
      {/* Top Header */}
      <header className="flex-none bg-white dark:bg-nexus-800 border-b border-nexus-200 dark:border-nexus-700 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nexus-900 dark:bg-nexus-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              N
            </div>
            <span className="text-xl font-black text-nexus-900 dark:text-nexus-50 tracking-tight">Knowledge Nexus</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nexus-400 dark:text-nexus-500" size={18} />
              <input
                type="text"
                placeholder="検索するには / を入力"
                readOnly
                className="w-full pl-10 pr-4 py-2 bg-nexus-50 dark:bg-nexus-900 border border-nexus-200 dark:border-nexus-700 rounded-lg text-sm cursor-pointer hover:border-nexus-300 dark:hover:border-nexus-600 transition-colors dark:text-nexus-100"
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            {/* Upgrade Button (if Free) */}
            {!isPro && (
              <button
                onClick={() => navigate('/pricing')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Crown size={16} />
                Upgrade
              </button>
            )}

            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-nexus-100 dark:hover:bg-nexus-700 rounded-lg transition-colors"
            >
              <SettingsIcon size={20} className="text-nexus-600 dark:text-nexus-400" />
            </button>

            {/* User Avatar */}
            <button className="flex items-center gap-2 p-2 hover:bg-nexus-100 dark:hover:bg-nexus-700 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full bg-nexus-100 dark:bg-nexus-700 flex items-center justify-center text-nexus-600 dark:text-nexus-300">
                <User size={18} />
              </div>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <nav className="flex items-center px-6 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative
                  ${isActive 
                    ? 'text-nexus-900 dark:text-nexus-50' 
                    : 'text-nexus-500 dark:text-nexus-400 hover:text-nexus-700 dark:hover:text-nexus-200'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-900 dark:bg-nexus-100" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content - 3 Column Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Center: Tab Content */}
        <div className="flex-1 overflow-auto">
          {renderTabContent()}
        </div>

        {/* Right Sidebar: Trending */}
        <TrendingSidebar />
      </main>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <SearchModal
          onClose={() => setIsSearchModalOpen(false)}
          onAddArticle={handleAddArticle}
        />
      )}
    </div>
  );
};
