import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';
import { Save, RefreshCw } from 'lucide-react';

export const BrainEditor: React.FC = () => {
  const { brain, updateBrain } = useAppStore();
  const [content, setContent] = useState(brain.content);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateBrain(content);
    setHasChanges(false);
  };

  return (
    <div className="flex-1 h-screen bg-nexus-50 flex flex-col">
      <header className="h-16 border-b border-nexus-200 flex items-center justify-between px-8 bg-white">
        <h2 className="text-xl font-bold text-nexus-900">シングル・ブレイン</h2>
        <div className="flex gap-4">
           <button 
             onClick={() => setContent(brain.content)}
             className="text-nexus-500 hover:text-nexus-900 flex items-center gap-2 text-sm font-medium"
           >
             <RefreshCw size={16} /> リセット
           </button>
           <button 
             onClick={handleSave}
             disabled={!hasChanges}
             className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm ${
               hasChanges 
               ? 'bg-nexus-900 text-white hover:bg-nexus-800' 
               : 'bg-nexus-100 text-nexus-400 cursor-not-allowed'
             }`}
           >
             <Save size={18} /> 保存
           </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 p-6 bg-nexus-50 flex flex-col">
          <textarea
            className="w-full h-full bg-white text-nexus-800 font-mono p-8 rounded-2xl border border-nexus-200 focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none leading-relaxed shadow-sm"
            value={content}
            onChange={handleChange}
            spellCheck={false}
          />
        </div>
        
        {/* Preview Side */}
        <div className="hidden xl:block w-1/3 border-l border-nexus-200 p-8 overflow-y-auto bg-white">
          <div className="prose prose-slate prose-sm max-w-none prose-headings:font-bold">
             <div className="opacity-40 text-xs uppercase tracking-widest mb-6 border-b border-nexus-100 pb-2 font-bold text-nexus-900">プレビュー</div>
             <ReactMarkdown 
               components={{
                 code(props) {
                   const {children, className, node, ...rest} = props
                   return (
                     <code {...rest} className={`${className} bg-nexus-100 px-1 py-0.5 rounded text-nexus-700 font-mono`}>
                       {children}
                     </code>
                   )
                 },
                 pre(props) {
                    return <pre {...props} className="bg-nexus-900 text-white p-4 rounded-lg overflow-x-auto shadow-md" />
                 }
               }}
             >
               {content}
             </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};