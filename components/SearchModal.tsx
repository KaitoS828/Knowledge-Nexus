import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, ExternalLink, Plus } from 'lucide-react';
import { searchArticlesByKeyword, SearchResult } from '@/services/geminiService';

interface SearchModalProps {
  onClose: () => void;
  onAddArticle: (url: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose, onAddArticle }) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || isSearching) return;

    setIsSearching(true);
    setHasSearched(true);
    setProgress(0);
    setProgressMessage('検索リクエストを送信中...');
    
    try {
      // Simulate progress for better UX
      setProgress(20);
      setProgressMessage('記事を検索中...');
      
      const searchResults = await searchArticlesByKeyword(keyword);
      
      setProgress(80);
      setProgressMessage('結果を整理中...');
      
      // Small delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 300));
      setProgress(100);
      setProgressMessage('完了！');
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setProgressMessage('エラーが発生しました');
    } finally {
      setTimeout(() => {
        setIsSearching(false);
        setProgress(0);
        setProgressMessage('');
      }, 500);
    }
  };

  const handleAddArticle = (url: string) => {
    onAddArticle(url);
    onClose();
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Zenn':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Qiita':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'note':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-nexus-800 rounded-2xl shadow-2xl max-w-3xl w-full mt-20 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nexus-200 dark:border-nexus-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-nexus-900 dark:bg-nexus-700 rounded-lg">
              <Search size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-nexus-900 dark:text-nexus-50">記事を検索</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-nexus-100 dark:hover:bg-nexus-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-nexus-400 dark:text-nexus-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-nexus-200 dark:border-nexus-700">
          <form onSubmit={handleSearch} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワードを入力（例: React, TypeScript, Next.js）"
              className="w-full pl-12 pr-4 py-4 bg-nexus-50 dark:bg-nexus-900 border border-nexus-200 dark:border-nexus-700 rounded-xl text-nexus-900 dark:text-nexus-100 font-medium focus:outline-none focus:ring-2 focus:ring-nexus-500 transition-all placeholder:text-nexus-400 dark:placeholder:text-nexus-500"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-400 dark:text-nexus-500" />
            <button
              type="submit"
              disabled={!keyword.trim() || isSearching}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-nexus-900 dark:bg-nexus-700 text-white rounded-lg hover:bg-black dark:hover:bg-nexus-600 disabled:opacity-50 transition-all font-bold text-sm"
            >
              {isSearching ? '検索中...' : '検索'}
            </button>
          </form>
          
          {/* Examples */}
          {!hasSearched && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-nexus-500 dark:text-nexus-400">💡 例:</span>
              {['React', 'TypeScript', 'Next.js', 'Tailwind'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setKeyword(example);
                    inputRef.current?.focus();
                  }}
                  className="text-xs px-3 py-1 bg-nexus-100 dark:bg-nexus-700 text-nexus-600 dark:text-nexus-300 rounded-full hover:bg-nexus-200 dark:hover:bg-nexus-600 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-6">
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="animate-spin text-nexus-900 dark:text-nexus-400" size={32} />
              
              {/* Progress Bar */}
              <div className="w-full max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-nexus-600 dark:text-nexus-400 font-medium text-sm">
                    {progressMessage}
                  </p>
                  <span className="text-nexus-900 dark:text-nexus-100 font-bold text-sm">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-nexus-100 dark:bg-nexus-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-nexus-900 dark:bg-nexus-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Search size={48} className="text-nexus-200 dark:text-nexus-700 mb-3" />
              <p className="text-nexus-500 dark:text-nexus-400 font-medium">
                記事が見つかりませんでした
              </p>
              <p className="text-nexus-400 dark:text-nexus-500 text-sm mt-1">
                別のキーワードで試してみてください
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-nexus-500 dark:text-nexus-400 font-medium mb-4">
                検索結果 ({results.length}件)
              </p>
              
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-nexus-50 dark:bg-nexus-900/50 rounded-xl border border-nexus-200 dark:border-nexus-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Source Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getSourceColor(result.source)}`}>
                          {result.source}
                        </span>
                        {result.publishedDate && (
                          <span className="text-xs text-nexus-400 dark:text-nexus-500">
                            {result.publishedDate}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-nexus-900 dark:text-nexus-100 mb-1 line-clamp-2">
                        {result.title}
                      </h3>

                      {/* Snippet */}
                      {result.snippet && (
                        <p className="text-sm text-nexus-600 dark:text-nexus-400 line-clamp-2 mb-2">
                          {result.snippet}
                        </p>
                      )}

                      {/* URL */}
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-nexus-500 dark:text-nexus-400 hover:text-nexus-900 dark:hover:text-nexus-200 flex items-center gap-1 truncate"
                      >
                        <ExternalLink size={12} />
                        <span className="truncate">{result.url}</span>
                      </a>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleAddArticle(result.url)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-nexus-900 dark:bg-nexus-700 text-white rounded-lg hover:bg-black dark:hover:bg-nexus-600 transition-all font-bold text-sm"
                    >
                      <Plus size={16} />
                      追加
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search size={48} className="text-nexus-200 dark:text-nexus-700 mb-3" />
              <p className="text-nexus-500 dark:text-nexus-400 font-medium">
                キーワードを入力して検索してください
              </p>
              <p className="text-nexus-400 dark:text-nexus-500 text-sm mt-1">
                Zenn・note・Qiitaから最新の記事を探します
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
