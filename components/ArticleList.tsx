'use client';

// Import useEffect from React
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { Article } from '@/types';
import { Plus, Search, BookOpen, CheckCircle, Clock, Flame, Trophy, Hash, Loader2, Trash2, Compass, ArrowRight, Sparkles, Upload, Link, FileText, Book, Crown } from 'lucide-react';
import { fetchArticleContent, analyzeArticleContent, getLearningRecommendations, sendChatMessage } from '@/services/geminiService';
import { processDocument } from '@/services/pdfService';
import { RightSidebar } from './RightSidebar';
import { UpgradeModal } from './UpgradeModal';
import { SearchModal } from './SearchModal';

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

export const ArticleList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { articles, addArticle, deleteArticle, updateArticle, brain, documents, addDocument, deleteDocument, subscription, preferences, updateSubscriptionStatus } = useAppStore();
  
  // Check for Stripe session_id on mount
  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    
    if (sessionId) {
      updateSubscriptionStatus(sessionId).then(() => {
        alert('Proプランへのアップグレードが完了しました！ありがとうございます。');
        window.location.href = '/dashboard';
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // searchParamsのみを監視

  const [urlInput, setUrlInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'reading' | 'practice'>('all');
  const [inputMode, setInputMode] = useState<'url' | 'pdf' | 'keyword'>('url');
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Progress State for URL and PDF processing
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>(undefined);



  const isPro = subscription?.planType === 'pro';




  const processUrl = async (url: string) => {
    if (!url) return;
    setIsFetching(true);
    setProgress(0);
    setProgressMessage('記事を取得中...');
    
    try {
      // 1. Fast Fetch (Content Only)
      setProgress(20);
      setProgressMessage('記事コンテンツを読み込み中...');
      
      const partialArticle = await fetchArticleContent(url);
      
      setProgress(40);
      setProgressMessage('記事を保存中...');
      
      const newId = crypto.randomUUID();
      const newArticle: Article = {
        ...partialArticle as Article,
        id: newId,
        status: 'new', // Initially new
        addedAt: new Date().toISOString(),
        analysisStatus: 'analyzing',
        analysisProgress: 60,
      };
      
      addArticle(newArticle);
      setUrlInput('');
      
      setProgress(60);
      setProgressMessage('AIで解析中...');
      
      // 短い遅延を入れてUIを更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsFetching(false);

      // 2. Background Analysis (Async)
      setProgress(70);
      setProgressMessage('AI解析を実行中...');
      
      analyzeArticleContent(newArticle.content, preferences).then(analysis => {
          setProgress(90);
          setProgressMessage('解析結果を保存中...');
          updateArticle(newId, {
            ...analysis,
            analysisStatus: 'completed',
            analysisProgress: 100,
          });
          setProgress(100);
          setProgressMessage('完了！');
          setTimeout(() => {
            setProgress(0);
            setProgressMessage('');
          }, 1000);
      }).catch(error => {
        console.error('Background analysis failed:', error);
        updateArticle(newId, {
          analysisStatus: 'completed',
          analysisProgress: 100,
        });
        setProgress(0);
        setProgressMessage('');
      });

    } catch (err: unknown) {
      console.error('Process URL error:', err);
      setProgressMessage('エラーが発生しました');
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
      
      if (err instanceof Error && err.message === 'Storage limit reached') {
        setShowUpgradeModal(true);
      } else {
        alert("記事の取得に失敗しました");
      }
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



  const handlePDFUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('PDFファイルのみアップロード可能です');
      return;
    }

    setIsUploadingPDF(true);
    setProgress(0);
    setProgressMessage('PDFをアップロード中...');
    
    try {
      setProgress(30);
      setProgressMessage('PDFの内容を解析中...');
      const result = await processDocument(file);

      setProgress(70);
      setProgressMessage('ドキュメントを保存中...');
      await addDocument({
        id: crypto.randomUUID(),
        name: file.name,
        type: 'pdf',
        content: result.content,
        summary: result.summary,
        keyPoints: result.keyPoints,
        chapters: result.chapters,
        addedAt: new Date().toISOString(),
        fileSize: file.size
      });

      setProgress(100);
      setProgressMessage('完了！');
      alert(`「${file.name}」の分析が完了しました`);
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 1000);
    } catch (e: unknown) {
      console.error(e);
      setProgressMessage('エラーが発生しました');
      setTimeout(() => {
        setProgress(0);
        setProgressMessage('');
      }, 2000);
      
      if (e instanceof Error && e.message === 'Storage limit reached') {
        setShowUpgradeModal(true);
      } else {
        alert('アップロードまたは分析に失敗しました。Gemini API Key設定を確認してください');
      }
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePDFUpload(e.dataTransfer.files);
    }
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
      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 text-nexus-900 pb-20 lg:pb-8">
        <div className="max-w-6xl mx-auto">
            {/* Compact Header */}
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-nexus-900 flex items-center gap-2">
                        <Book size={24} />
                        記事ライブラリ
                    </h1>
                    <p className="text-sm text-nexus-600 mt-1">
                        あなたの知識を蓄積し、AIが深く分析します
                    </p>
                </div>
                
                {!isPro && (
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="flex items-center gap-2 px-4 py-2 bg-nexus-900 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                  >
                    <Crown size={16} />
                    PROプラン
                  </button>
                )}
            </header>


            {/* Input Area with Tabs */}
            <div className="bg-white p-6 rounded-2xl border border-nexus-200 shadow-md mb-10 transition-all hover:shadow-lg">
              {/* Tab Switcher */}
              <div className="flex gap-2 mb-4 border-b border-nexus-100 pb-4">
                <button
                  onClick={() => setInputMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    inputMode === 'url'
                      ? 'bg-nexus-900 text-white shadow-md'
                      : 'bg-nexus-50 text-nexus-600 hover:bg-nexus-100'
                  }`}
                >
                  <Link size={16} />
                  URLから追加
                </button>
                <button
                  onClick={() => setInputMode('pdf')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    inputMode === 'pdf'
                      ? 'bg-nexus-900 text-white shadow-md'
                      : 'bg-nexus-50 text-nexus-600 hover:bg-nexus-100'
                  }`}
                >
                  <FileText size={16} />
                  PDFから追加
                </button>
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all bg-nexus-50 text-nexus-600 hover:bg-nexus-100"
                >
                  <Search size={16} />
                  キーワードから追加
                </button>
              </div>

              {/* URL Input Form */}
              {inputMode === 'url' && (
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
                    className="bg-nexus-900 hover:bg-nexus-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md whitespace-nowrap"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <div className="flex flex-col items-start">
                          <span className="text-xs">{progressMessage || '追加中...'}</span>
                          {progress > 0 && (
                            <span className="text-xs font-black">{progress}%</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        追加して読む
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Progress Bar (shown during URL fetch or PDF upload) */}
              {(isFetching || isUploadingPDF) && progress > 0 && (
                <div className="mt-4 p-4 bg-nexus-50 dark:bg-nexus-800 rounded-xl border border-nexus-200 dark:border-nexus-700 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-nexus-900 dark:text-nexus-100">
                      {progressMessage}
                    </span>
                    <span className="text-lg font-black text-nexus-900 dark:text-nexus-100">
                      {progress}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-nexus-200 dark:bg-nexus-700 rounded-full h-3 overflow-hidden shadow-inner mb-3">
                    <div 
                      className="bg-gradient-to-r from-nexus-900 to-nexus-700 dark:from-nexus-500 dark:to-nexus-400 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Progress Steps */}
                  <div className="text-xs text-nexus-500 dark:text-nexus-400 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={progress >= 0 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        0% → 記事を取得中
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={progress >= 20 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        20% → 記事コンテンツを読み込み中
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={progress >= 40 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        40% → 記事を保存中
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={progress >= 60 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        60% → AIで解析中
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={progress >= 70 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        70% → AI解析を実行中
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={progress >= 90 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        90% → 解析結果を保存中
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={progress >= 100 ? 'text-nexus-900 dark:text-nexus-100 font-semibold' : ''}>
                        100% → 完了！
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Upload Area */}
              {inputMode === 'pdf' && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-nexus-accent bg-nexus-50 scale-[1.02]'
                      : 'border-nexus-200 hover:border-nexus-300 hover:bg-nexus-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handlePDFUpload(e.target.files)}
                    className="hidden"
                  />
                  {isUploadingPDF ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-nexus-accent" size={40} />
                      <p className="text-nexus-600 font-bold">PDF を分析中...</p>
                      <p className="text-xs text-nexus-400 font-medium">これには数十秒かかるおそれがあります</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-4 text-nexus-400" size={48} />
                      <h3 className="font-bold text-nexus-900 mb-2">PDFファイルをドラッグ＆ドロップ</h3>
                      <p className="text-nexus-500 text-sm mb-4">または</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-nexus-900 hover:bg-nexus-800 text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-colors shadow-md"
                      >
                        <FileText size={18} />
                        ファイルを選択
                      </button>
                      <p className="text-xs text-nexus-400 mt-4">
                        技術書や論文をAIが自動分析します
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'new', 'reading', 'practice'].map((f) => (
                <button
                key={f}
                onClick={() => setFilter(f as 'all' | 'new' | 'reading' | 'practice')}
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

            {/* 続きから学ぶ */}
            {filteredArticles.filter(a => a.status === 'reading').length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-nexus-900">📌 続きから学ぶ</h2>
                    <p className="text-xs text-nexus-500">読書中の記事をここから再開</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles
                    .filter(a => a.status === 'reading')
                    .slice(0, 2)
                    .map(article => (
                      <div
                        key={article.id}
                        onClick={() => router.push(`/article/${article.id}`)}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">
                            読書中
                          </span>
                          <button
                            onClick={(e) => handleDelete(e, article.id)}
                            className="p-1.5 rounded-full text-nexus-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <h3 className="text-lg font-black text-nexus-900 dark:text-nexus-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-sm text-nexus-600 dark:text-nexus-400 line-clamp-2 mb-3">
                          {article.summary}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-nexus-500 dark:text-nexus-400">
                          <Clock size={12} />
                          <span>{new Date(article.addedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Progress indicator */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 bg-blue-200 dark:bg-blue-900 rounded-full h-1.5">
                            <div className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full w-1/2"></div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">50%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {filteredArticles.length === 0 && documents.length === 0 && (
                <div className="col-span-full text-center py-20 text-nexus-400 border-2 border-dashed border-nexus-200 rounded-2xl bg-white/50">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>コンテンツがありません。URLまたはPDFを追加して知識を蓄えましょう。</p>
                </div>
            )}

            {/* PDF Documents */}
            {documents.map((doc) => (
                <div
                key={doc.id}
                onClick={() => router.push(`/document/${doc.id}`)}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200 hover:border-purple-300 rounded-2xl p-6 cursor-pointer transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider bg-purple-100 text-purple-700 border-purple-300 flex items-center gap-1">
                      <FileText size={12} />
                      PDF
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-xs font-mono">
                        {new Date(doc.addedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('このドキュメントを削除しますか？')) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="p-1.5 rounded-full text-purple-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-purple-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors">
                    {doc.name}
                  </h3>

                  <p className="text-purple-700 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                    {doc.summary}
                  </p>

                  {doc.keyPoints && doc.keyPoints.length > 0 && (
                    <div className="border-t border-purple-200 pt-4 mt-auto">
                      <p className="text-xs font-bold text-purple-600 mb-2">重要ポイント:</p>
                      <ul className="space-y-1">
                        {doc.keyPoints.slice(0, 2).map((point, i) => (
                          <li key={i} className="text-xs text-purple-700 flex items-start gap-1">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span className="line-clamp-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                      {doc.keyPoints.length > 2 && (
                        <p className="text-xs text-purple-400 mt-2">+{doc.keyPoints.length - 2} more</p>
                      )}
                    </div>
                  )}
                </div>
            ))}

            {/* Articles */}
            {filteredArticles.map((article) => (
                <div
                key={article.id}
                onClick={() => router.push(`/article/${article.id}`)}
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

                {/* Analysis Progress Bar */}
                {article.analysisStatus === 'analyzing' && article.analysisProgress !== undefined && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" />
                        AI解析中...
                      </span>
                      <span className="text-xs font-black text-blue-900">
                        {article.analysisProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${article.analysisProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Pending Badge */}
                {article.status === 'pending' && article.analysisStatus !== 'analyzing' && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} />
                        PENDING - AI解析待ち
                      </span>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          // 解析中ステータスに変更
                          updateArticle(article.id, {
                            analysisStatus: 'analyzing',
                            analysisProgress: 10,
                          });

                          // AI解析を実行
                          const analysis = await analyzeArticleContent(article.content, preferences);
                          
                          // 解析結果を保存
                          updateArticle(article.id, {
                            ...analysis,
                            status: 'new',
                            analysisStatus: 'completed',
                            analysisProgress: 100,
                          });
                        } catch (error) {
                          console.error('Analysis failed:', error);
                          alert('AI解析に失敗しました');
                          updateArticle(article.id, {
                            analysisStatus: 'pending',
                            analysisProgress: 0,
                          });
                        }
                      }}
                      className="w-full mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles size={16} />
                      AI解析を開始
                    </button>
                  </div>
                )}

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

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />

      {/* Search Modal */}
      {isSearchModalOpen && (
        <SearchModal
          onClose={() => setIsSearchModalOpen(false)}
          onAddArticle={async (url: string) => {
            setIsSearchModalOpen(false);
            await processUrl(url);
          }}
        />
      )}
    </div>
  );
};