import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Bookmark as BookmarkIcon, Link, Trash2 } from 'lucide-react';

interface RightSidebarProps {
  onAnalyzeUrl: (url: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onAnalyzeUrl }) => {
  const { bookmarks, addBookmark, removeBookmark } = useAppStore();
  const [bookmarkInput, setBookmarkInput] = useState('');

  const handleAddBookmark = () => {
    if (!bookmarkInput.trim()) return;
    addBookmark(bookmarkInput);
    setBookmarkInput('');
  };

  const handleAnalyzeFromBookmark = (id: string, url: string) => {
    onAnalyzeUrl(url);
    removeBookmark(id);
  };

  return (
    <div className="w-80 border-l border-nexus-200 bg-white flex flex-col h-full overflow-hidden shrink-0">
      
      {/* Header */}
      <div className="p-4 border-b border-nexus-100 bg-nexus-50/50 flex justify-between items-center">
          <h3 className="font-bold text-nexus-800 flex items-center gap-2 text-sm">
            <BookmarkIcon size={14} /> あとで読む (URL)
          </h3>
          <span className="bg-nexus-200 text-nexus-600 text-xs px-2 py-0.5 rounded-full font-bold">{bookmarks.length}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
           {bookmarks.length === 0 && (
               <div className="text-center text-nexus-400 text-xs py-10 px-4">
                   時間がない時は<br/>とりあえずここにURLを保存
               </div>
           )}
           {bookmarks.map(bm => (
             <div key={bm.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-nexus-50 group border border-transparent hover:border-nexus-100 transition-all">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                   <div className="p-1.5 bg-white border border-nexus-200 rounded text-nexus-400">
                     <Link size={12} />
                   </div>
                   <a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-xs text-nexus-600 truncate hover:text-nexus-accent block hover:underline" title={bm.url}>
                     {bm.url}
                   </a>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleAnalyzeFromBookmark(bm.id, bm.url)}
                      title="記事に追加して解析"
                      className="p-1.5 text-nexus-400 hover:text-white hover:bg-nexus-900 rounded transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={() => removeBookmark(bm.id)}
                      className="p-1.5 text-nexus-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                </div>
             </div>
           ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-nexus-100">
           <form 
             onSubmit={(e) => { e.preventDefault(); handleAddBookmark(); }}
             className="flex gap-2"
           >
             <input 
               type="url"
               value={bookmarkInput}
               onChange={e => setBookmarkInput(e.target.value)}
               placeholder="URL..."
               className="flex-1 text-xs bg-nexus-50 border border-nexus-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-nexus-accent"
             />
             <button 
               type="submit"
               disabled={!bookmarkInput.trim()}
               className="p-2 bg-nexus-200 text-nexus-600 rounded-lg hover:bg-nexus-300 disabled:opacity-50 transition-colors"
             >
               <Plus size={14} />
             </button>
           </form>
        </div>
    </div>
  );
};