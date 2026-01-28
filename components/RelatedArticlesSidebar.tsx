import React, { useState, useEffect } from 'react';
<parameter name="useAppStore } from '../store';
import { Article } from '../types';
import { Sparkles, BookOpen, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RelatedArticlesSidebarProps {
  currentText: string;
}

export const RelatedArticlesSidebar: React.FC<RelatedArticlesSidebarProps> = ({ currentText }) => {
  const { articles } = useAppStore();
  const navigate = useNavigate();
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!currentText || currentText.length < 20) {
      setRelatedArticles([]);
      return;
    }

    // シンプルなキーワードマッチングで関連記事を検索
    const keywords = extractKeywords(currentText);
    const scored = articles
      .filter(a => a.analysisStatus === 'completed')
      .map(article => ({
        article,
        score: calculateRelevanceScore(article, keywords)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ article }) => article);

    setRelatedArticles(scored);
  }, [currentText, articles]);

  const extractKeywords = (text: string): string[] => {
    // 簡易的なキーワード抽出（日本語対応）
    const words = text
      .toLowerCase()
      .replace(/[、。！？\n]/g, ' ')
      .split(' ')
      .filter(w => w.length > 2);
    
    // ユニークにして返す
    return [...new Set(words)];
  };

  const calculateRelevanceScore = (article: Article, keywords: string[]): number => {
    let score = 0;
    const searchText = `${article.title} ${article.summary} ${article.tags?.join(' ')}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (searchText.includes(keyword)) {
        score += 1;
      }
    });

    // タグマッチングにボーナス
    article.tags?.forEach(tag => {
      keywords.forEach(keyword => {
        if (tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase())) {
          score += 2;
        }
      });
    });

    return score;
  };

  if (relatedArticles.length === 0) {
    return (
      <aside className="w-80 border-l border-nexus-200 bg-white p-6 hidden xl:block">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={18} />
          </div>
          <h3 className="text-lg font-black text-nexus-900">関連する記事</h3>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 text-center">
          <Sparkles className="mx-auto mb-3 text-purple-400" size={32} />
          <p className="text-sm text-purple-900 font-medium mb-2">
            もっと書いてみましょう！
          </p>
          <p className="text-xs text-purple-600">
            日記を書き進めると、関連する過去の記事が自動的に表示されます
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-nexus-200 bg-white p-6 overflow-y-auto hidden xl:block">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Sparkles className="text-white" size={18} />
        </div>
        <h3 className="text-lg font-black text-nexus-900">関連する記事</h3>
      </div>

      <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
        <p className="text-xs text-purple-900 font-medium">
          💡 今書いている内容と関連性の高い記事を自動的に表示しています
        </p>
      </div>

      <div className="space-y-3">
        {relatedArticles.map(article => (
          <div
            key={article.id}
            onClick={() => navigate(`/article/${article.id}`)}
            className="bg-white hover:bg-purple-50 border border-nexus-200 hover:border-purple-300 rounded-xl p-4 cursor-pointer transition-all group"
          >
            <div className="flex items-start gap-2 mb-2">
              <BookOpen size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <h4 className="text-sm font-bold text-nexus-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                {article.title}
              </h4>
            </div>

            <p className="text-xs text-nexus-600 line-clamp-2 mb-3">
              {article.summary}
            </p>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {article.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-nexus-500">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(article.addedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-600 font-bold group-hover:gap-2 transition-all">
                詳細を見る
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {relatedArticles.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
          <p className="text-xs text-purple-900 font-medium text-center">
            ✨ これらの記事を参考にすると、より深い振り返りができます
          </p>
        </div>
      )}
    </aside>
  );
};
