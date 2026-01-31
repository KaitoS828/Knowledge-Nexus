import React, { useState } from 'react';
import { X, FileText, Check, Copy, RefreshCw, PenTool, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { generatePublicArticle } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DraftGeneratorModalProps {
  onClose: () => void;
}

export const DraftGeneratorModal: React.FC<DraftGeneratorModalProps> = ({ onClose }) => {
  const { user, articles, diaryEntries } = useAppStore();
  const [selectedArticleIds, setSelectedArticleIds] = useState<Set<string>>(new Set());
  const [selectedDiaryIds, setSelectedDiaryIds] = useState<Set<string>>(new Set());
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'select' | 'preview'>('select');

  // Filter valid items
  const validArticles = articles.filter(a => a.content && a.content.length > 50);
  const validDiaries = diaryEntries.filter(d => d.content && d.content.length > 10);

  const toggleArticle = (id: string) => {
    const next = new Set(selectedArticleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedArticleIds(next);
  };

  const toggleDiary = (id: string) => {
    const next = new Set(selectedDiaryIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDiaryIds(next);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Gather content
      let combinedContent = "## Selected Articles\n";
      selectedArticleIds.forEach(id => {
        const art = validArticles.find(a => a.id === id);
        if (art) combinedContent += `### ${art.title}\n${art.summary}\n${art.content.substring(0, 2000)}\n\n`;
      });

      combinedContent += "\n## Learning Diary entries\n";
      selectedDiaryIds.forEach(id => {
        const dia = validDiaries.find(d => d.id === id);
        if (dia) combinedContent += `- ${dia.date}: ${dia.content}\n`;
      });

      const draft = await generatePublicArticle(combinedContent);
      setGeneratedDraft(draft);
      setStep('preview');
    } catch (e) {
      console.error(e);
      alert("生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-nexus-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-nexus-200 dark:border-nexus-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nexus-200 dark:border-nexus-700 bg-nexus-50/50 dark:bg-nexus-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
              <PenTool size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-nexus-900 dark:text-nexus-50">執筆スタジオ</h2>
              <p className="text-xs text-nexus-500 dark:text-nexus-400">インプットを技術記事（Qiita/Zenn形式）に変換</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-nexus-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'select' ? (
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Articles Selection */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-nexus-800 dark:text-nexus-200">
                  <FileText size={18} />
                  参照する記事 ({selectedArticleIds.size})
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {validArticles.map(article => (
                    <div 
                      key={article.id}
                      onClick={() => toggleArticle(article.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                        ${selectedArticleIds.has(article.id) 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500' 
                          : 'bg-white dark:bg-nexus-800 border-nexus-200 dark:border-nexus-700 hover:border-nexus-300'
                        }
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-none transition-colors
                        ${selectedArticleIds.has(article.id) ? 'bg-blue-500 border-blue-500' : 'border-nexus-300 dark:border-nexus-600'}
                      `}>
                        {selectedArticleIds.has(article.id) && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-nexus-900 dark:text-nexus-100 line-clamp-1">{article.title}</p>
                        <p className="text-xs text-nexus-500 dark:text-nexus-400 mt-1 line-clamp-2">{article.summary}</p>
                      </div>
                    </div>
                  ))}
                  {validArticles.length === 0 && (
                    <p className="text-sm text-nexus-400 text-center py-8">記事がありません</p>
                  )}
                </div>
              </div>

              {/* Diary Selection */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-nexus-800 dark:text-nexus-200">
                  <PenTool size={18} />
                  参照する学習日記 ({selectedDiaryIds.size})
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {validDiaries.map(diary => (
                    <div 
                      key={diary.id}
                      onClick={() => toggleDiary(diary.id)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                        ${selectedDiaryIds.has(diary.id) 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500' 
                          : 'bg-white dark:bg-nexus-800 border-nexus-200 dark:border-nexus-700 hover:border-nexus-300'
                        }
                      `}
                    >
                       <div className={`
                        w-5 h-5 rounded border mt-0.5 flex items-center justify-center flex-none transition-colors
                        ${selectedDiaryIds.has(diary.id) ? 'bg-green-500 border-green-500' : 'border-nexus-300 dark:border-nexus-600'}
                      `}>
                        {selectedDiaryIds.has(diary.id) && <Check size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-nexus-900 dark:text-nexus-100">{diary.date}</p>
                        <p className="text-xs text-nexus-500 dark:text-nexus-400 mt-1 line-clamp-2">{diary.content}</p>
                      </div>
                    </div>
                  ))}
                  {validDiaries.length === 0 && (
                    <p className="text-sm text-nexus-400 text-center py-8">日記がありません</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-nexus-50 dark:bg-black/20">
              <div className="flex-1 overflow-y-auto p-8 font-mono text-sm">
                <div className="max-w-3xl mx-auto bg-white dark:bg-nexus-800 p-8 rounded-xl shadow-sm border border-nexus-200 dark:border-nexus-700 prose dark:prose-invert">
                  <ReactMarkdown>{generatedDraft}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-nexus-200 dark:border-nexus-700 bg-white dark:bg-nexus-800 flex justify-between items-center">
            {step === 'select' ? (
                <>
                    <span className="text-sm text-nexus-500">
                        {selectedArticleIds.size + selectedDiaryIds.size} 件のソースを選択中
                    </span>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (selectedArticleIds.size === 0 && selectedDiaryIds.size === 0)}
                        className={`
                            px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white transition-all
                            ${isGenerating || (selectedArticleIds.size === 0 && selectedDiaryIds.size === 0)
                                ? 'bg-nexus-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:scale-105'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                AIが執筆中...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                ドラフトを生成する
                            </>
                        )}
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => setStep('select')}
                        className="px-4 py-2 text-nexus-600 dark:text-nexus-400 hover:bg-nexus-100 dark:hover:bg-nexus-700 rounded-lg transition-colors"
                    >
                        ← 選び直す
                    </button>
                    <div className="flex gap-3">
                         <button
                            onClick={handleGenerate}
                            className="px-4 py-2 border border-nexus-300 dark:border-nexus-600 text-nexus-700 dark:text-nexus-300 rounded-lg hover:bg-nexus-50 dark:hover:bg-nexus-700 flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            再生成
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generatedDraft);
                                alert("コピーしました！");
                            }}
                            className="px-6 py-3 bg-nexus-900 dark:bg-white text-white dark:text-nexus-900 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Copy size={18} />
                            Markdownをコピー
                        </button>
                    </div>
                </>
            )}
        </div>

      </div>
    </div>
  );
};
