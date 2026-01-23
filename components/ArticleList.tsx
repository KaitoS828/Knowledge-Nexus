import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';
import { Article } from '../types';
import { Plus, Search, BookOpen, CheckCircle, Clock, Flame, Trophy, Hash, Loader2, Trash2, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { fetchArticleContent, analyzeArticleContent, getLearningRecommendations } from '../services/geminiService';
import { RightSidebar } from './RightSidebar';

interface ArticleListProps {
  onSelectArticle: (article: Article) => void;
}

// Simple Heatmap Component
const ActivityHeatmap = () => {
    const { activityLogs } = useAppStore();
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    const getIntensity = (date: string) => {
        const log = activityLogs.find(l => l.date === date);
        if (!log) return 'bg-nexus-100 border-nexus-200'; // Empty
        if (log.count > 5) return 'bg-success border-success';
        if (log.count > 2) return 'bg-green-400 border-green-300';
        return 'bg-green-200 border-green-200';
    };

    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-nexus-600 flex items-center gap-2">
                <Flame size={14} className="text-orange-500" /> 学習ヒートマップ
            </h4>
            <div className="flex gap-1.5 flex-wrap">
                {days.map(date => (
                    <div 
                        key={date} 
                        title={`${date}`}
                        className={`w-3 h-3 lg:w-4 lg:h-4 rounded-sm border ${getIntensity(date)} transition-all`}
                    />
                ))}
            </div>
        </div>
    );
};

export const ArticleList: React.FC<ArticleListProps> = ({ onSelectArticle }) => {
  const { articles, addArticle, deleteArticle, updateArticle, activityLogs, brain } = useAppStore();
  const [urlInput, setUrlInput] = useState('');
  const [isFetching, setIsFetching] = useState(false); // Only for the initial fetch
  const [filter, setFilter] = useState<'all' | 'new' | 'reading' | 'practice'>('all');
  
  // Recommendation State
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isAnalyzingRecs, setIsAnalyzingRecs] = useState(false);

  const totalActivities = activityLogs.reduce((acc, log) => acc + log.count, 0);
  const level = Math.floor(totalActivities / 5) + 1;

  const processUrl = async (url: string) => {
    if (!url) return;
    setIsFetching(true);
    try {
      // 1. Fast Fetch (Content Only)
      const partialArticle = await fetchArticleContent(url);
      const newId = crypto.randomUUID();
      const newArticle: Article = {
        ...partialArticle as Article,
        id: newId,
        status: 'new', // Initially new
        addedAt: new Date().toISOString(),
      };
      
      addArticle(newArticle);
      setUrlInput('');
      setIsFetching(false);

      // 2. Background Analysis (Async)
      analyzeArticleContent(newArticle.content).then(analysis => {
          updateArticle(newId, analysis);
      });

    } catch (err) {
      alert("記事の取得に失敗しました");
      setIsFetching(false);
    }
  };

  const handleAddArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    await processUrl(urlInput);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('この記事を削除しますか？')) {
          deleteArticle(id);
      }
  };

  const handleGetRecommendations = async () => {
      if (articles.length === 0) return;
      setIsAnalyzingRecs(true);
      const result = await getLearningRecommendations(brain.content, articles);
      setRecommendation(result);
      setIsAnalyzingRecs(false);
  };

  const filteredArticles = articles.filter(a => filter === 'all' || a.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-nexus-600 bg-nexus-100 border-nexus-200';
      case 'reading': return 'text-nexus-accent bg-blue-50 border-nexus-accent';
      case 'practice': return 'text-warning bg-orange-50 border-warning';
      case 'mastered': return 'text-success bg-green-50 border-success';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return '未着手';
      case 'reading': return '読書中';
      case 'practice': return '実践中';
      case 'mastered': return '習得済';
      default: return status;
    }
  };

  return (
    <div className="flex h-screen bg-nexus-50 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-8 text-nexus-900">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-6 rounded-3xl border border-nexus-200 shadow-sm">
            <div>
                <h1 className="text-3xl font-bold text-nexus-900 mb-2 tracking-tight">ナレッジ・フィード</h1>
                <p className="text-nexus-500">インプットを「使える知識」へ変換する場所。</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right border-r border-nexus-200 pr-6">
                    <div className="text-xs text-nexus-500 font-bold mb-1 flex items-center justify-end gap-1">
                        <Trophy size={14} className="text-yellow-500" /> DEV LEVEL
                    </div>
                    <div className="text-3xl font-black text-nexus-900 font-mono leading-none">
                        Lv.{level}
                    </div>
                </div>
                <ActivityHeatmap />
            </div>
            </header>

            {/* Gap Analysis / Recommendations Widget */}
            <div className="mb-10 bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Compass size={140} className="text-white" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Compass size={24} className="text-indigo-300" /> ネクスト・ステップ提案
                        </h3>
                        {!recommendation && (
                            <button 
                                onClick={handleGetRecommendations}
                                disabled={isAnalyzingRecs || articles.length === 0}
                                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                            >
                                {isAnalyzingRecs ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Brainを分析して提案
                            </button>
                        )}
                    </div>
                    
                    {recommendation ? (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 text-indigo-50 leading-relaxed text-sm animate-in fade-in slide-in-from-top-2">
                            <ReactMarkdown 
                                components={{
                                    h3: ({node, ...props}: any) => <h3 className="text-lg font-bold mt-4 mb-2 text-white" {...props} />,
                                    strong: ({node, ...props}: any) => <strong className="text-indigo-200 font-bold" {...props} />,
                                    ul: ({node, ...props}: any) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                                }}
                            >
                                {recommendation}
                            </ReactMarkdown>
                            <button onClick={() => setRecommendation(null)} className="mt-4 text-xs text-indigo-300 hover:text-white underline">閉じる</button>
                        </div>
                    ) : (
                        <p className="text-indigo-200 text-sm max-w-xl">
                            あなたのBrain（知識ベース）と、最近読んだ記事のタグをAIが分析し、
                            「次に学ぶべき技術」や「知識の空白」を提案します。
                        </p>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-6 rounded-2xl border border-nexus-200 shadow-md mb-10 transition-all hover:shadow-lg">
            <form onSubmit={handleAddArticle} className="flex gap-4">
                <input
                type="url"
                placeholder="記事のURLを貼り付け (例: https://zenn.dev/...)"
                className="flex-1 bg-nexus-50 border border-nexus-200 rounded-xl px-5 py-3 text-nexus-900 focus:outline-none focus:ring-2 focus:ring-nexus-accent placeholder-nexus-400 transition-all font-medium"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                />
                <button 
                type="submit" 
                disabled={isFetching}
                className="bg-nexus-900 hover:bg-nexus-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                >
                {isFetching ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                追加して読む
                </button>
            </form>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'new', 'reading', 'practice'].map((f) => (
                <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    filter === f 
                    ? 'bg-nexus-900 text-white shadow-md' 
                    : 'bg-white text-nexus-500 border border-nexus-200 hover:bg-nexus-50'
                }`}
                >
                {f === 'all' ? 'すべて' : getStatusLabel(f)}
                </button>
            ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
            {filteredArticles.length === 0 && (
                <div className="col-span-full text-center py-20 text-nexus-400 border-2 border-dashed border-nexus-200 rounded-2xl bg-white/50">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>記事が見つかりません。URLを入力して知識を蓄えましょう。</p>
                </div>
            )}
            
            {filteredArticles.map((article) => (
                <div 
                key={article.id} 
                onClick={() => onSelectArticle(article)}
                className={`bg-white hover:bg-nexus-50 border border-nexus-200 hover:border-nexus-300 rounded-2xl p-6 cursor-pointer transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full relative overflow-hidden ${
                    article.status === 'mastered' ? 'opacity-50 hover:opacity-100 grayscale-[0.5] hover:grayscale-0' : ''
                }`}
                >
                {/* Background Analysis Indicator */}
                {article.summary === "AI解析中..." && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-nexus-100 overflow-hidden">
                        <div className="h-full bg-nexus-accent animate-indeterminate-bar"></div>
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider ${getStatusColor(article.status)}`}>
                    {getStatusLabel(article.status)}
                    </span>
                    <div className="flex items-center gap-2">
                         <span className="text-nexus-400 text-xs font-mono">{new Date(article.addedAt).toLocaleDateString()}</span>
                         <button onClick={(e) => handleDelete(e, article.id)} className="p-1.5 rounded-full text-nexus-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                             <Trash2 size={16} />
                         </button>
                    </div>
                </div>
                
                <h3 className="text-xl font-bold text-nexus-900 mb-3 line-clamp-2 group-hover:text-nexus-accent transition-colors">
                    {article.title}
                </h3>

                {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-nexus-50 border border-nexus-200 text-nexus-500 flex items-center gap-1">
                                <Hash size={10} /> {tag}
                            </span>
                        ))}
                    </div>
                )}
                
                <p className="text-nexus-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {article.summary}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto border-t border-nexus-100 pt-4">
                    {article.frequentWords && article.frequentWords.length > 0 ? (
                        <>
                            {article.frequentWords.slice(0, 3).map((fw, i) => (
                            <span key={i} className="text-xs text-nexus-500 bg-nexus-100 px-2 py-1 rounded">
                                {fw.word}
                            </span>
                            ))}
                            {article.frequentWords.length > 3 && <span className="text-xs text-nexus-400 flex items-center">+{article.frequentWords.length - 3}</span>}
                        </>
                    ) : (
                        <span className="text-xs text-nexus-400 italic">解析中...</span>
                    )}
                </div>
                </div>
            ))}
            </div>
        </div>
        <style>{`
            @keyframes indeterminate-bar {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
            .animate-indeterminate-bar {
                animation: indeterminate-bar 1.5s infinite linear;
                width: 50%;
            }
        `}</style>
      </div>

      {/* Right Sidebar */}
      <RightSidebar onAnalyzeUrl={processUrl} />
    </div>
  );
};