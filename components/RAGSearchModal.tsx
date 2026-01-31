import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { localRag, SearchResult } from '@/services/localRagService';
import { Search, Loader2, Sparkles, X, FileText, BookOpen, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RAGSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RAGSearchModal: React.FC<RAGSearchModalProps> = ({ isOpen, onClose }) => {
  const { articles, documents } = useAppStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Index on mount (or open)
  useEffect(() => {
    if (isOpen && articles.length + documents.length > 0) {
      const init = async () => {
        setIsIndexing(true);
        try {
          await localRag.indexItems(articles, documents);
        } catch (e) {
          console.error("Indexing failed", e);
          setError("インデックス作成に失敗しました");
        } finally {
          setIsIndexing(false);
        }
      };
      // Delay slightly to allow UI open animation
      setTimeout(init, 500);
    }
  }, [isOpen]); // Re-index if strictly needed, or just once per session. For prototype, index on open is safe.

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setAnswer(null);

    try {
      // 1. Vector Search
      const searchResults = await localRag.search(query);
      setResults(searchResults);

      if (searchResults.length === 0) {
        setAnswer("関連する情報が見つかりませんでした。");
        setIsSearching(false);
        return;
      }

      // 2. Generate Answer
      const generatedAnswer = await localRag.generateAnswer(query, searchResults);
      setAnswer(generatedAnswer);

    } catch (err: any) {
      console.error(err);
      setError("検索中にエラーが発生しました: " + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-nexus-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-nexus-200 dark:border-nexus-700 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-nexus-200 dark:border-nexus-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-nexus-900 dark:text-nexus-100">
            <Sparkles className="text-nexus-accent" size={20} />
            <h2 className="font-black text-lg">AIナレッジ検索 (Local RAG)</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-nexus-100 dark:hover:bg-nexus-800 rounded-full transition-colors">
            <X size={20} className="text-nexus-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6 relative">
             <input
                type="text"
                placeholder="あなたのナレッジベースに質問..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-nexus-50 dark:bg-nexus-800 border-2 border-nexus-200 dark:border-nexus-700 rounded-xl text-lg focus:outline-none focus:border-nexus-accent transition-colors text-nexus-900 dark:text-nexus-100 placeholder-nexus-400"
                autoFocus
             />
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-400" size={24} />
             
             <button
                type="submit"
                disabled={isSearching || isIndexing || !query.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-nexus-900 dark:bg-nexus-100 text-white dark:text-nexus-900 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
             >
                {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
             </button>
          </form>

          {/* Status Messages */}
          {isIndexing && (
            <div className="flex items-center gap-2 text-sm text-nexus-500 mb-4 justify-center">
               <Loader2 size={14} className="animate-spin" />
               <span>インデックスを構築中... (初回のみ時間がかかります)</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 text-sm font-bold">
              {error}
            </div>
          )}

          {/* Results Area */}
          {(answer || results.length > 0) && (
             <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-300">
                
                {answer && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                     <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-300 font-bold">
                        <MessageSquare size={18} />
                        <h3>AIの回答</h3>
                     </div>
                     <div className="prose prose-sm dark:prose-invert max-w-none text-nexus-800 dark:text-nexus-200">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                     </div>
                  </div>
                )}

                <div>
                   <h3 className="text-sm font-bold text-nexus-500 uppercase tracking-wider mb-3">参照した情報</h3>
                   <div className="space-y-3">
                      {results.map((res, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-nexus-800 border border-nexus-100 dark:border-nexus-700 rounded-lg hover:border-nexus-300 transition-colors">
                           <div className="mt-1 text-nexus-400">
                              {res.type === 'article' ? <BookOpen size={16} /> : <FileText size={16} />}
                           </div>
                           <div>
                              <h4 className="font-bold text-sm text-nexus-900 dark:text-nexus-100 mb-1">
                                 {'title' in res.item ? (res.item as any).title : (res.item as any).name}
                              </h4>
                              <p className="text-xs text-nexus-500 line-clamp-2">
                                 {res.item.summary}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                 <span className="text-[10px] bg-nexus-100 dark:bg-nexus-700 px-1.5 py-0.5 rounded text-nexus-600 dark:text-nexus-300">
                                    スコア: {res.score.toFixed(3)}
                                 </span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

             </div>
          )}

          {/* Empty State / Intro */}
          {!answer && !results.length && !isSearching && !isIndexing && !error && (
             <div className="text-center py-10 text-nexus-400">
                <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                <p>「Reactの状態管理について教えて」<br/>「先週読んだDockerの記事は？」</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
