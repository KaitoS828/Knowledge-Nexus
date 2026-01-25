import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Loader2, ExternalLink, Sparkles, BookOpen, X } from 'lucide-react';
import { discoverTechArticles } from '../services/geminiService';

interface RightSidebarProps {
  onAnalyzeUrl: (url: string) => void;
  onClose?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onAnalyzeUrl, onClose }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{title: string, url: string, reason: string}[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
        const results = await discoverTechArticles(searchInput);
        setSearchResults(results);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSearching(false);
    }
  };

  return (
    <div className="w-80 border-l border-nexus-200 bg-white flex flex-col h-full overflow-hidden shrink-0 shadow-xl lg:shadow-none">
      
      {/* Header */}
      <div className="p-4 border-b border-nexus-100 bg-nexus-50/50">
          <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-nexus-800 flex items-center gap-2 text-sm">
                <Search size={14} /> 技術情報を探す
              </h3>
              {/* Mobile Close Button */}
              <button onClick={onClose} className="lg:hidden p-1.5 text-nexus-400 hover:text-nexus-900 rounded-full hover:bg-nexus-100 transition-colors">
                  <X size={16} />
              </button>
          </div>
          <form onSubmit={handleSearch} className="relative">
             <input 
               type="text"
               value={searchInput}
               onChange={e => setSearchInput(e.target.value)}
               placeholder="キーワード (例: React Hooks)"
               className="w-full bg-white border border-nexus-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-nexus-accent focus:outline-none pr-9 shadow-sm"
               disabled={isSearching}
             />
             <button 
                type="submit" 
                disabled={!searchInput.trim() || isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-nexus-400 hover:text-nexus-900 transition-colors disabled:opacity-50"
             >
                 {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
             </button>
          </form>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-nexus-50/30">
           {!hasSearched && (
               <div className="flex flex-col items-center justify-center text-center py-10 opacity-50 space-y-2">
                   <Sparkles size={32} className="text-nexus-300" />
                   <p className="text-xs text-nexus-500 font-medium">
                       学びたいキーワードを入力して<br/>
                       良質な技術記事を見つけましょう
                   </p>
               </div>
           )}

            {hasSearched && !isSearching && searchResults.length === 0 && (
                <div className="text-center py-10 text-nexus-400 text-xs">
                    記事が見つかりませんでした。
                </div>
            )}

           {searchResults.map((result, i) => (
             <div key={i} className="bg-white p-4 rounded-xl border border-nexus-100 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-bottom-2 duration-300" style={{animationDelay: `${i * 100}ms`}}>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="text-sm font-bold text-nexus-900 leading-snug line-clamp-2">
                        {result.title}
                    </h4>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-nexus-400 hover:text-nexus-600 shrink-0">
                        <ExternalLink size={14} />
                    </a>
                </div>
                
                <p className="text-[10px] text-nexus-500 mb-3 bg-nexus-50 p-2 rounded border border-nexus-50 line-clamp-3">
                    <span className="font-bold text-nexus-400 mr-1">推薦理由:</span>
                    {result.reason}
                </p>

                <button 
                  onClick={() => onAnalyzeUrl(result.url)}
                  className="w-full flex items-center justify-center gap-2 bg-nexus-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-nexus-800 transition-all shadow-sm group-hover:shadow group-hover:-translate-y-0.5"
                >
                    <Plus size={12} /> これを追加して読む
                </button>
             </div>
           ))}
        </div>
    </div>
  );
};