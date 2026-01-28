import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { TrendArticle } from '../types';
import { fetchAllTrends, fetchQiitaTrends, getPopularTags } from '../services/rssService';
import { Compass, Loader2, BookmarkPlus, Sparkles, ExternalLink, Heart, Tag as TagIcon, Clock } from 'lucide-react';
import { cleanExcerpt, QiitaLogo, ZennLogo } from '../utils/textUtils';

export const DiscoverPage: React.FC = () => {
  const [articles, setArticles] = useState<TrendArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { addArticle } = useAppStore();

  // トレンド記事を取得
  useEffect(() => {
    loadTrends();
  }, [selectedTag]);

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const trends = selectedTag 
        ? await fetchQiitaTrends(selectedTag)
        : await fetchAllTrends();
      setArticles(trends);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存（裏でAI解析開始）
  const handleSave = async (article: TrendArticle) => {
    try {
      const newArticleId = crypto.randomUUID();
      
      // 未解析で保存
      await addArticle({
        id: newArticleId,
        url: article.url,
        title: article.title,
        summary: cleanExcerpt(article.excerpt || ''),
        content: '',
        practiceGuide: '',
        status: 'pending',
        frequentWords: [],
        tags: article.tags,
        addedAt: new Date().toISOString(),
        analysisStatus: 'pending',
        analysisProgress: 0,
      });
      
      alert('記事を保存しました！記事タブで「AI解析を開始」ボタンから解析できます。');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('記事の保存に失敗しました');
    }
  };

  const popularTags = getPopularTags();

  // 相対時間表示
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

  return (
    <div className="min-h-screen bg-nexus-50 dark:bg-nexus-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Compass className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-nexus-900 dark:text-nexus-50">ディスカバー</h1>
            <p className="text-nexus-600 dark:text-nexus-400 text-sm">最新のトレンド記事を発見しよう</p>
          </div>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedTag === null
                ? 'bg-nexus-900 text-white shadow-md'
                : 'bg-white dark:bg-nexus-800 text-nexus-600 dark:text-nexus-300 hover:bg-nexus-100 dark:hover:bg-nexus-700'
            }`}
          >
            すべて
          </button>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5 ${
                selectedTag === tag
                  ? 'bg-nexus-900 text-white shadow-md'
                  : 'bg-white dark:bg-nexus-800 text-nexus-600 dark:text-nexus-300 hover:bg-nexus-100 dark:hover:bg-nexus-700'
              }`}
            >
              <TagIcon size={14} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-nexus-900 dark:text-nexus-400 mb-4" size={40} />
          <p className="text-nexus-600 dark:text-nexus-400 font-medium">トレンド記事を読み込み中...</p>
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <div
              key={article.id}
              className="bg-white dark:bg-nexus-800 rounded-2xl border border-nexus-200 dark:border-nexus-700 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div className="p-4 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {article.source === 'Qiita' ? (
                      <QiitaLogo size={20} />
                    ) : article.source === 'Zenn' ? (
                      <ZennLogo size={20} />
                    ) : article.source === 'note' ? (
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">n</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">B</span>
                      </div>
                    )}
                    <span className="font-bold text-sm text-nexus-700 dark:text-nexus-300">
                      {article.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-nexus-500 text-xs">
                    <Heart size={14} />
                    <span className="font-semibold">{article.likes}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-nexus-900 dark:text-nexus-50 mb-2 line-clamp-2 group-hover:text-nexus-700 dark:group-hover:text-nexus-200 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt (cleaned) */}
                {article.excerpt && (
                  <p className="text-sm text-nexus-600 dark:text-nexus-400 line-clamp-3 mb-3">
                    {cleanExcerpt(article.excerpt)}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {article.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-nexus-100 dark:bg-nexus-700 text-nexus-700 dark:text-nexus-300 rounded text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author & Time (larger) */}
                <div className="flex items-center gap-2 text-sm text-nexus-600 dark:text-nexus-400 mb-4">
                  <span className="font-medium">@{article.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 font-bold text-nexus-700 dark:text-nexus-300">
                    <Clock size={14} />
                    <span>{getRelativeTime(article.publishedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button (Save only) */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleSave(article)}
                  className="w-full px-4 py-3 bg-nexus-900 dark:bg-nexus-600 hover:bg-nexus-800 dark:hover:bg-nexus-500 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <BookmarkPlus size={18} />
                  保存
                </button>
              </div>

              {/* External Link */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-nexus-50 dark:bg-nexus-900 border-t border-nexus-100 dark:border-nexus-700 hover:bg-nexus-100 dark:hover:bg-nexus-800 transition-colors"
              >
                <div className="flex items-center justify-center gap-2 text-nexus-600 dark:text-nexus-400 text-xs font-medium">
                  <ExternalLink size={14} />
                  元の記事を開く
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Compass className="text-nexus-300 dark:text-nexus-600 mb-4" size={64} />
          <p className="text-nexus-600 dark:text-nexus-400 font-medium text-lg">記事が見つかりませんでした</p>
          <p className="text-nexus-500 dark:text-nexus-500 text-sm mt-2">別のタグを試してみてください</p>
        </div>
      )}
    </div>
  );
};
