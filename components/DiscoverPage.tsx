import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { TrendArticle } from '../types';
import { fetchAllTrends, fetchQiitaTrends, getPopularTags } from '../services/rssService';
import { Compass, Loader2, BookmarkPlus, Sparkles, ExternalLink, Heart, Tag as TagIcon, Clock } from 'lucide-react';

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

  // 後で読む（未解析で保存）
  const handleSaveForLater = async (article: TrendArticle) => {
    try {
      // 未解析のまま保存
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
      
      alert('記事を保存しました！記事タブで確認できます。');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('記事の保存に失敗しました');
    }
  };

  // 解析して保存（バックグラウンドで解析）
  const handleAnalyzeAndSave = async (article: TrendArticle) => {
    try {
      // 未解析で追加
      const newArticleId = crypto.randomUUID();
      await addArticle({
        id: newArticleId,
        url: article.url,
        title: article.title,
        summary: article.excerpt || 'AI解析中...',
        content: '',
        practiceGuide: '',
        status: 'pending',
        frequentWords: [],
        tags: article.tags,
        addedAt: new Date().toISOString(),
        analysisStatus: 'analyzing',
        analysisProgress: 10,
      });
      
      alert('記事を追加しました！バックグラウンドでAI解析を開始します。');
      
      // TODO: Phase 2でバックグラウンド解析を実装
      // analyzeArticleInBackground(newArticleId);
    } catch (error) {
      console.error('Failed to analyze article:', error);
      alert('記事の追加に失敗しました');
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
              {/* Source Badge */}
              <div className="p-4 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    article.source === 'Qiita'
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {article.source}
                  </span>
                  <div className="flex items-center gap-1 text-nexus-500 text-xs">
                    <Heart size={14} />
                    <span className="font-semibold">{article.likes}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-nexus-900 dark:text-nexus-50 mb-2 line-clamp-2 group-hover:text-nexus-700 dark:group-hover:text-nexus-200 transition-colors">
                  {article.title}
                </h3>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-sm text-nexus-600 dark:text-nexus-400 line-clamp-3 mb-3">
                    {article.excerpt}
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

                {/* Author & Time */}
                <div className="flex items-center gap-2 text-xs text-nexus-500 dark:text-nexus-400 mb-4">
                  <span className="font-medium">@{article.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{getRelativeTime(article.publishedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => handleSaveForLater(article)}
                  className="flex-1 px-4 py-2 bg-nexus-100 dark:bg-nexus-700 hover:bg-nexus-200 dark:hover:bg-nexus-600 text-nexus-900 dark:text-nexus-100 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <BookmarkPlus size={16} />
                  後で読む
                </button>
                <button
                  onClick={() => handleAnalyzeAndSave(article)}
                  className="flex-1 px-4 py-2 bg-nexus-900 dark:bg-nexus-600 hover:bg-nexus-800 dark:hover:bg-nexus-500 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles size={16} />
                  解析
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
