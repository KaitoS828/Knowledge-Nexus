import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';
import { PenTool, Search, Calendar, Sparkles, Send, Trash2, Loader2, MessageSquare, ArrowRight, Zap, X, Copy, Check, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { draftDiaryFromTweets, generatePublicArticle } from '../services/geminiService';
import { DiaryEntry } from '../types';

export const LearningDiary: React.FC = () => {
  const { diaryEntries, addDiaryEntry, deleteDiaryEntry, learningTweets, addTweet, deleteTweet, clearTweets } = useAppStore();
  
  // Diary State
  const [diaryInput, setDiaryInput] = useState('');
  const [search, setSearch] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  // Article Generation State
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [publicArticleDraft, setPublicArticleDraft] = useState<string | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Tweet State
  const [tweetInput, setTweetInput] = useState('');

  // Filter entries
  const filteredEntries = diaryEntries.filter(e => 
    e.content.toLowerCase().includes(search.toLowerCase())
  );

  const handlePostDiary = () => {
    if (!diaryInput.trim()) return;
    addDiaryEntry(diaryInput);
    setDiaryInput('');
  };

  const handlePostTweet = () => {
      if (!tweetInput.trim()) return;
      addTweet(tweetInput);
      setTweetInput('');
  };

  const handleDraftFromTweets = async () => {
      if (learningTweets.length === 0) return;
      setIsDrafting(true);
      const draft = await draftDiaryFromTweets(learningTweets);
      setDiaryInput(prev => prev ? prev + "\n\n" + draft : draft);
      clearTweets(); // Clear tweets after drafting
      setIsDrafting(false);
  };

  const handleGeneratePublicArticle = async () => {
      if (!diaryInput.trim()) return;
      setIsGeneratingArticle(true);
      const draft = await generatePublicArticle(diaryInput);
      setPublicArticleDraft(draft);
      setShowArticleModal(true);
      setIsGeneratingArticle(false);
  };

  const handleCopyArticle = async () => {
      if (publicArticleDraft) {
          await navigator.clipboard.writeText(publicArticleDraft);
          setHasCopied(true);
          setTimeout(() => setHasCopied(false), 2000);
      }
  };

  const handleGenerateInsight = async () => {
    if (diaryEntries.length === 0) return;
    setIsAnalyzing(true);
    setInsight(null);
    
    // AI Call (Simplified local logic to call Gemini directly here for this specific feature)
    try {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey });
        
        const logs = diaryEntries.slice(0, 10).map(e => `- ${e.date}: ${e.content}`).join('\n');
        const prompt = `
            以下の学習日記（直近10件）を分析し、ユーザーの「学習の傾向」「よくあるつまづき」「次のステップへのアドバイス」を
            Markdown形式で簡潔に（300文字程度）フィードバックしてください。励ましのトーンでお願いします。
            
            Logs:
            ${logs}
        `;

        const r = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        setInsight(r.text || "分析できませんでした。");
    } catch (e) {
        setInsight("エラーが発生しました。");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-nexus-50 overflow-hidden relative">
      {/* 1. Left Sidebar: Past Diaries List (Existing) */}
      <div className="w-64 border-r border-nexus-200 bg-white flex flex-col shrink-0 hidden lg:flex">
         <div className="p-4 border-b border-nexus-200">
            <h2 className="text-lg font-bold text-nexus-900 flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-nexus-600" /> 過去ログ
            </h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-nexus-400" size={14} />
                <input 
                    className="w-full bg-nexus-50 border border-nexus-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-nexus-accent"
                    placeholder="ログを検索..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-3 space-y-3">
             {filteredEntries.length === 0 && (
                 <div className="text-center text-nexus-400 mt-10 text-xs">
                     {search ? "見つかりませんでした" : "記録なし"}
                 </div>
             )}
             {filteredEntries.map(entry => (
                 <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="bg-white p-3 rounded-lg border border-nexus-200 hover:border-nexus-300 shadow-sm group transition-all cursor-pointer hover:bg-nexus-50">
                     <div className="flex justify-between items-start mb-1">
                         <span className="text-[10px] font-mono text-nexus-400 flex items-center gap-1 bg-nexus-50 px-1.5 py-0.5 rounded">
                            {new Date(entry.date).toLocaleDateString()}
                         </span>
                         <button onClick={(e) => { e.stopPropagation(); deleteDiaryEntry(entry.id); }} className="text-nexus-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 size={12} />
                         </button>
                     </div>
                     <p className="text-nexus-800 text-xs line-clamp-2 leading-relaxed whitespace-pre-wrap">
                         {entry.content}
                     </p>
                 </div>
             ))}
         </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* 2. Middle Column: Learning Tweets (Timeline) */}
          <div className="w-[320px] bg-nexus-50 border-r border-nexus-200 flex flex-col shrink-0">
             <div className="p-4 bg-white border-b border-nexus-200">
                 <h2 className="font-bold text-nexus-800 flex items-center gap-2 text-sm mb-1">
                     <MessageSquare size={16} className="text-nexus-500" /> 学習つぶやき
                 </h2>
                 <p className="text-[10px] text-nexus-400">思考の断片をラフに記録</p>
             </div>
             
             {/* Tweet Input */}
             <div className="p-4 bg-nexus-50/50">
                 <div className="relative">
                     <textarea
                        className="w-full bg-white border border-nexus-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-nexus-accent resize-none h-24 shadow-sm placeholder:text-xs"
                        placeholder="今考えていること、つまづいたこと..."
                        value={tweetInput}
                        onChange={e => setTweetInput(e.target.value)}
                        onKeyDown={e => {if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostTweet()}}
                     />
                     <button 
                        onClick={handlePostTweet}
                        disabled={!tweetInput.trim()}
                        className="absolute bottom-2 right-2 p-1.5 bg-nexus-900 text-white rounded-lg hover:bg-nexus-700 transition-colors shadow-sm disabled:opacity-50"
                     >
                        <Send size={12} />
                     </button>
                 </div>
             </div>

             {/* Tweet List */}
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {learningTweets.length === 0 && (
                     <div className="text-center py-10 text-nexus-400 text-xs italic">
                         まだつぶやきがありません
                     </div>
                 )}
                 {learningTweets.map(t => (
                     <div key={t.id} className="flex gap-3 group">
                         <div className="flex flex-col items-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-nexus-300 mt-1.5"></div>
                             <div className="w-0.5 flex-1 bg-nexus-200/50 my-1 group-last:hidden"></div>
                         </div>
                         <div className="flex-1 pb-2">
                             <div className="flex justify-between items-start">
                                <span className="text-[10px] text-nexus-400 font-mono mb-1 block">
                                    {new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <button onClick={() => deleteTweet(t.id)} className="text-nexus-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={10} />
                                </button>
                             </div>
                             <p className="text-xs text-nexus-700 bg-white p-2 rounded-lg border border-nexus-100 shadow-sm leading-relaxed">
                                 {t.content}
                             </p>
                         </div>
                     </div>
                 ))}
             </div>

             {/* Action: Draft from Tweets */}
             <div className="p-4 border-t border-nexus-200 bg-white">
                 <button 
                    onClick={handleDraftFromTweets}
                    disabled={isDrafting || learningTweets.length === 0}
                    className="w-full py-2.5 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 border border-indigo-100 transition-colors flex items-center justify-center gap-2"
                 >
                    {isDrafting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    つぶやきから日記を作成
                 </button>
             </div>
          </div>

          {/* 3. Right Column: Structured Diary Editor */}
          <div className="flex-1 bg-white flex flex-col overflow-y-auto">
              <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
                  
                  {/* Editor Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-nexus-900 flex items-center gap-2">
                            <PenTool className="text-nexus-900" /> 今日の学習日記
                        </h2>
                        <span className="text-xs text-nexus-500 font-mono">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="bg-white rounded-3xl border border-nexus-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-nexus-accent transition-shadow">
                        <textarea 
                            className="w-full h-[500px] bg-nexus-50/30 p-8 text-nexus-900 text-base leading-relaxed focus:outline-none resize-none font-medium"
                            placeholder="# 今日のハイライト&#13;&#10;- バグの原因が特定できた...&#13;&#10;&#13;&#10;# 学んだこと&#13;&#10;..."
                            value={diaryInput}
                            onChange={e => setDiaryInput(e.target.value)}
                            onKeyDown={e => {if(e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostDiary()}}
                        />
                        <div className="px-6 py-4 bg-nexus-50 border-t border-nexus-100 flex justify-between items-center gap-4">
                            <span className="text-xs text-nexus-400">Markdown記法が使えます</span>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleGeneratePublicArticle}
                                    disabled={!diaryInput.trim() || isGeneratingArticle}
                                    className="text-nexus-600 bg-nexus-100 px-4 py-3 rounded-xl hover:bg-nexus-200 transition-colors font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isGeneratingArticle ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                                    記事として構成 (Zenn/Qiita)
                                </button>
                                <button 
                                    onClick={handlePostDiary}
                                    disabled={!diaryInput.trim()}
                                    className="bg-nexus-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-nexus-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Send size={16} /> 日記を保存
                                </button>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Analysis Section */}
                  <div className="bg-gradient-to-r from-slate-50 to-white rounded-3xl border border-nexus-200 p-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                          <Zap size={120} className="text-nexus-900" />
                      </div>
                      
                      <div className="flex items-center justify-between mb-6 relative z-10">
                          <div>
                            <h3 className="text-lg font-bold text-nexus-900 flex items-center gap-2">
                                <Sparkles className="text-yellow-500" /> AIコーチの振り返り
                            </h3>
                            <p className="text-nexus-500 text-sm mt-1">過去の日記から、あなたの成長の軌跡を分析します。</p>
                          </div>
                          <button 
                            onClick={handleGenerateInsight}
                            disabled={isAnalyzing || diaryEntries.length === 0}
                            className="bg-white border border-nexus-300 text-nexus-700 hover:bg-nexus-50 font-bold px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2 text-xs"
                          >
                              {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                              分析開始
                          </button>
                      </div>

                      {insight ? (
                          <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-nexus-200 text-nexus-800 leading-relaxed animate-in fade-in slide-in-from-bottom-2 text-sm">
                              <ReactMarkdown>{insight}</ReactMarkdown>
                          </div>
                      ) : (
                          <div className="text-center py-6 text-nexus-400 border-2 border-dashed border-nexus-200 rounded-xl bg-nexus-50/50 text-sm">
                              継続は力なり。日記が溜まってきたら分析してみましょう。
                          </div>
                      )}
                  </div>

              </div>
          </div>
      </div>

      {/* Diary Detail Modal */}
      {selectedEntry && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-nexus-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedEntry(null)}>
            <div className="bg-white w-full max-w-3xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-nexus-200 flex justify-between items-center bg-nexus-50">
                    <div>
                        <h3 className="text-xl font-bold text-nexus-900">{new Date(selectedEntry.date).toLocaleDateString()} の日記</h3>
                        <p className="text-nexus-500 text-xs mt-1">過去の記録</p>
                    </div>
                    <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-nexus-200 rounded-full transition-colors">
                        <X size={20} className="text-nexus-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="prose prose-slate prose-lg max-w-none">
                        <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                                h2: ({node, ...props}: any) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                code(props) {
                                    const {children, className, node, ...rest} = props
                                    return (
                                        <code {...rest} className={`${className} bg-nexus-100 px-1 py-0.5 rounded text-nexus-700 font-mono text-sm`}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {selectedEntry.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Article Generation Result Modal */}
      {showArticleModal && publicArticleDraft && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-nexus-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-nexus-200 flex justify-between items-center bg-nexus-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-nexus-900">記事ドラフト生成完了</h3>
                            <p className="text-nexus-500 text-xs mt-0.5">Zenn / Qiita 投稿用フォーマット</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleCopyArticle}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                hasCopied 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-nexus-900 text-white hover:bg-nexus-700 shadow-md'
                            }`}
                        >
                            {hasCopied ? <Check size={16} /> : <Copy size={16} />}
                            {hasCopied ? 'コピーしました' : 'Markdownをコピー'}
                        </button>
                        <button onClick={() => setShowArticleModal(false)} className="p-2 hover:bg-nexus-200 rounded-full transition-colors text-nexus-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0 flex">
                    <div className="flex-1 p-8 bg-nexus-50 overflow-y-auto border-r border-nexus-200">
                        <pre className="text-xs font-mono text-nexus-700 whitespace-pre-wrap leading-relaxed">
                            {publicArticleDraft}
                        </pre>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto bg-white hidden lg:block">
                         <div className="prose prose-slate prose-sm max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b" {...props} />,
                                    code(props) {
                                        const {children, className, node, ...rest} = props
                                        return <code {...rest} className={`${className} bg-nexus-100 text-nexus-800 px-1 py-0.5 rounded text-xs font-mono`}>{children}</code>
                                    }
                                }}
                            >
                                {publicArticleDraft}
                            </ReactMarkdown>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};