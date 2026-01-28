```
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { TrendArticle } from '../types';
import { fetchQiitaTrends } from '../services/rssService';
import { Sparkles, TrendingUp, BookOpen, Clock, ExternalLink, BookmarkPlus, Lightbulb, BarChart3 } from 'lucide-react';
import { cleanExcerpt } from '../utils/textUtils';

export const TrendingSidebar: React.FC = () => {
  const [trendArticles, setTrendArticles] = useState<TrendArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { articles, brain, addArticle } = useAppStore();

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const trends = await fetchQiitaTrends();
      setTrendArticles(trends.slice(0, 5));
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // AI提案記事（Brainを分析して関連記事を提案）
  const getAISuggestions = (): TrendArticle[] => {
    // TODO: 実際のAI分析を実装
    // 今は上位のトレンド記事を返す
    return trendArticles.slice(5, 8);
  };

  const handleQuickAdd = async (article: TrendArticle) => {
    try {
      await addArticle({
        id: crypto.randomUUID(),
        url: article.url,
        title: article.title,
        summary: article.excerpt || 'AI解析待ち...',
        content: '',
        practiceGuide: '',
        status: 'pending',
        frequentWords: [],
        tags: article.tags,
        addedAt: new Date().toISOString(),
        analysisStatus: 'pending',
        analysisProgress: 0,
      });
      alert('記事を保存しました！');
    } catch (error) {
      console.error('Failed to add article:', error);
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date().getTime();
    const published = new Date(dateStr).getTime();
    const diffHours = Math.floor((now - published) / (1000 * 60 * 60));
    
    if (diffHours < 1) return '1時間以内';
    if (diffHours < 24) return `${diffHours}時間前`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}日前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  // 学習状況の分析
  const getStudyingTopics = (): string[] => {
    const allTags = articles.flatMap(a => a.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
  };

  const studyingTopics = getStudyingTopics();

  return (
    <aside className="w-80 h-screen sticky top-0 overflow-y-auto bg-white dark:bg-nexus-900 border-l border-nexus-200 dark:border-nexus-700 p-6 space-y-8">
      {/* 今日のトレンド */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Flame className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-black text-nexus-900 dark:text-nexus-50">今日のトレンド</h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-nexus-50 dark:bg-nexus-800 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {trendArticles.map(article => (
              <div
                key={article.id}
                className="bg-nexus-50 dark:bg-nexus-800 rounded-xl p-3 hover:bg-nexus-100 dark:hover:bg-nexus-700 transition-all group border border-transparent hover:border-nexus-300 dark:hover:border-nexus-600"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-nexus-900 dark:text-nexus-100 line-clamp-2 flex-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {article.title}
                  </h4>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    article.source === 'Qiita' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {article.source}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-nexus-500 dark:text-nexus-400 mb-2">
                  <Calendar size={12} />
                  <span>{getRelativeTime(article.publishedAt)}</span>
                  <span>•</span>
                  <span>❤️ {article.likes}</span>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleQuickAdd(article)}
                    className="flex-1 px-2 py-1 bg-nexus-900 dark:bg-nexus-600 text-white rounded text-xs font-bold hover:bg-nexus-800 dark:hover:bg-nexus-500 transition-colors flex items-center justify-center gap-1"
                  >
                    <BookmarkPlus size={12} />
                    保存
                  </button>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-nexus-100 dark:bg-nexus-700 text-nexus-700 dark:text-nexus-300 rounded text-xs font-bold hover:bg-nexus-200 dark:hover:bg-nexus-600 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* あなたへの提案 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-black text-nexus-900 dark:text-nexus-50">あなたへの提案</h3>
        </div>

        {studyingTopics.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-900 dark:text-purple-200 font-medium mb-2">
              <span className="font-black">#{studyingTopics[0]}</span> を学んでいるなら<br/>
              こちらもおすすめ 👇
            </p>
          </div>
        )}

        <div className="space-y-3">
          {getAISuggestions().map(article => (
            <div
              key={article.id}
              className="bg-nexus-50 dark:bg-nexus-800 rounded-xl p-3 hover:bg-nexus-100 dark:hover:bg-nexus-700 transition-all border border-transparent hover:border-purple-300 dark:hover:border-purple-600 group"
            >
              <h4 className="text-sm font-bold text-nexus-900 dark:text-nexus-100 line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {article.title}
              </h4>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleQuickAdd(article)}
                  className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
                >
                  <BookmarkPlus size={12} />
                  保存
                </button>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-nexus-100 dark:bg-nexus-700 text-nexus-700 dark:text-nexus-300 rounded text-xs font-bold hover:bg-nexus-200 dark:hover:bg-nexus-600 transition-colors flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 学習進捗 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-black text-nexus-900 dark:text-nexus-50">学習状況</h3>
        </div>

        <div className="bg-nexus-50 dark:bg-nexus-800 rounded-xl p-4 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-nexus-600 dark:text-nexus-400">総記事数</span>
              <span className="text-lg font-black text-nexus-900 dark:text-nexus-100">{articles.length}</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-nexus-600 dark:text-nexus-400">学習中のトピック</span>
              <span className="text-sm font-black text-nexus-900 dark:text-nexus-100">{studyingTopics.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {studyingTopics.map(topic => (
                <span key={topic} className="px-2 py-1 bg-nexus-200 dark:bg-nexus-700 text-nexus-800 dark:text-nexus-200 rounded text-xs font-bold">
                  #{topic}
                </span>
              ))}
            </div>
          </div>

          {/* TODO: ヒートマップを追加 */}
        </div>
      </section>
    </aside>
  );
};
