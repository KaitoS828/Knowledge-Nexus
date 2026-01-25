import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentStoredUpload, QuizQuestion } from '../types';
import { ArrowLeft, FileText, ChevronDown, ChevronUp, BookOpen, Lightbulb, Brain, Sparkles, Target, Loader2, CheckCircle, XCircle, Trophy, GripVertical, Hash, ArrowRight, Check, X, AlertCircle, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';
import { generateQuiz } from '../services/geminiService';

export const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { documents, brain, updateBrain } = useAppStore();

  const document = documents.find(d => d.id === id);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-nexus-500 mb-4">ドキュメントが見つかりません</p>
        <button onClick={() => navigate(-1)} className="text-nexus-600 hover:text-nexus-900 underline">
          戻る
        </button>
      </div>
    );
  }
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  // Layout State
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Learning Actions State
  const [learningActions, setLearningActions] = useState<string | null>(null);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);

  // Brain Integration State
  const [brainProposal, setBrainProposal] = useState<string | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Quiz State
  const [quizState, setQuizState] = useState<'idle' | 'generating' | 'active' | 'review' | 'passed'>('idle');
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [quizQueue, setQuizQueue] = useState<number[]>([]);
  const [failedQueue, setFailedQueue] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Learning Mode
  const [learningMode, setLearningMode] = useState<'none' | 'actions' | 'brain'>('none');

  // Resizing Logic
  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newLeftWidth > 20 && newLeftWidth < 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleGenerateLearningActions = async () => {
    setLearningMode('actions');
    setIsGeneratingActions(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
以下のPDFドキュメントの内容を分析し、具体的な学習アクションを3つ提案してください。

ドキュメント: ${document.name}
概要: ${document.summary}
重要ポイント: ${document.keyPoints?.join(', ')}

各アクションについて：
- タイトル: 何をするのか
- 説明: なぜ重要か
- 具体的ステップ: 明日から実践できる手順

Markdown形式で出力してください。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setLearningActions(response.text || '生成に失敗しました');
    } catch (e) {
      console.error(e);
      setLearningActions('エラーが発生しました');
    } finally {
      setIsGeneratingActions(false);
    }
  };

  const handleGenerateBrainProposal = async () => {
    setLearningMode('brain');
    setIsGeneratingProposal(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
現在の知識ベース（Brain）:
${brain.content.substring(0, 5000)}

新しいPDFドキュメント:
タイトル: ${document.name}
概要: ${document.summary}
重要ポイント: ${document.keyPoints?.join('\n- ')}

このPDFの内容を、既存のBrainにどのように統合すべきか提案してください。
- どのセクションに追加すべきか
- どのような構造で追加すべきか
- 具体的なMarkdown例

Markdown形式で出力してください。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setBrainProposal(response.text || '生成に失敗しました');
    } catch (e) {
      console.error(e);
      setBrainProposal('エラーが発生しました');
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  // Quiz Logic
  const handleStartQuiz = async () => {
    setQuizState('generating');
    try {
      const content = `${document.summary}\n\n${document.keyPoints?.join('\n')}`;
      const questions = await generateQuiz(content);

      if (questions.length === 0) {
        alert('問題の生成に失敗しました。もう一度お試しください。');
        setQuizState('idle');
        return;
      }

      setAllQuestions(questions);
      setQuizQueue(questions.map((_, i) => i));
      setFailedQueue([]);
      setCurrentQuestionIndex(0);
      setFeedback(null);
      setSelectedOption(null);
      setQuizState('active');
    } catch (e) {
      console.error(e);
      alert('クイズの生成に失敗しました');
      setQuizState('idle');
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (feedback !== null) return;

    const currentGlobalIndex = quizQueue[currentQuestionIndex];
    const currentQuestion = allQuestions[currentGlobalIndex];
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    setSelectedOption(optionIndex);
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      setFailedQueue(prev => [...prev, currentGlobalIndex]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex >= quizQueue.length - 1) {
      if (failedQueue.length === 0) {
        setQuizState('passed');
      } else {
        setQuizState('review');
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setFeedback(null);
      setSelectedOption(null);
    }
  };

  const handleRetryIncorrect = () => {
    setQuizQueue([...failedQueue]);
    setFailedQueue([]);
    setCurrentQuestionIndex(0);
    setFeedback(null);
    setSelectedOption(null);
    setQuizState('active');
  };

  // Markdown Components
  const MarkdownComponents = {
    code(props: any) {
      const { children, className, node, ...rest } = props;
      return (
        <code {...rest} className={`${className} bg-purple-200 px-1.5 py-0.5 rounded text-purple-800 font-mono text-sm font-bold border border-purple-300`}>
          {children}
        </code>
      );
    },
    pre(props: any) {
      return (
        <div className="relative group">
          <pre {...props} className="bg-[#1e1e1e] text-[#d4d4d4] p-5 rounded-xl overflow-x-auto my-6 text-sm leading-relaxed border border-purple-700 shadow-lg font-mono" />
        </div>
      );
    },
    strong(props: any) {
      return (
        <span className="bg-purple-200/60 px-0.5 rounded text-purple-900 font-semibold box-decoration-clone shadow-[0_1px_0_rgba(0,0,0,0.1)]">
          {props.children}
        </span>
      );
    },
    p(props: any) {
      return <p {...props} className="mb-6 leading-loose text-purple-800 text-[16px]" />;
    },
    h1: ({ node, ...props }: any) => <h1 className="text-3xl font-bold mt-12 mb-6 text-purple-900 border-b pb-4" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold mt-10 mb-5 text-purple-900" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl font-bold mt-8 mb-4 text-purple-800" {...props} />,
  };

  // Helper to render current question
  const renderCurrentQuestion = () => {
    if (quizQueue.length === 0) return null;
    const globalIndex = quizQueue[currentQuestionIndex];
    const q = allQuestions[globalIndex];

    return (
      <div className="flex flex-col h-full">
        <div className="flex-none mb-4 flex justify-between items-center text-xs font-bold text-purple-400 uppercase tracking-widest">
          <span>Question {currentQuestionIndex + 1} / {quizQueue.length}</span>
          {failedQueue.length > 0 && <span className="text-red-500">ミス: {failedQueue.length}</span>}
        </div>

        <h3 className="text-lg font-bold text-purple-900 mb-6 leading-relaxed">
          {q.question}
        </h3>

        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
          {q.options.map((opt, i) => {
            let btnClass = "bg-white text-purple-600 hover:bg-purple-50 border-purple-200";
            if (feedback) {
              if (i === q.correctIndex) btnClass = "bg-green-100 text-green-800 border-green-300 ring-2 ring-green-200";
              else if (i === selectedOption) btnClass = "bg-red-100 text-red-800 border-red-300";
              else btnClass = "opacity-50 bg-white border-purple-100";
            } else if (selectedOption === i) {
              btnClass = "bg-purple-900 text-white ring-2 ring-purple-400";
            }
            return (
              <button key={i} onClick={() => handleQuizAnswer(i)} disabled={feedback !== null} className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${btnClass}`}>{opt}</button>
            );
          })}
        </div>
        {feedback && (
          <div className="flex-none mt-4 pt-4 border-t border-purple-100 animate-in slide-in-from-bottom-2 fade-in">
            <div className={`p-4 rounded-xl flex justify-between items-center ${feedback === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex items-center gap-2 font-bold">{feedback === 'correct' ? <Check size={20} /> : <X size={20} />}{feedback === 'correct' ? '正解です！' : '不正解...'}</div>
              <button onClick={handleNextQuestion} className="px-6 py-2 bg-purple-900 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2">次へ <ArrowRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-purple-50 text-purple-900 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-purple-200 gap-4 bg-white/80 backdrop-blur z-10 justify-between shrink-0">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-purple-100 rounded-lg text-purple-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="text-purple-600" size={18} />
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">PDF</span>
          </div>
          <h2 className="font-bold truncate text-lg text-purple-900">{document.name}</h2>
        </div>
      </div>

      {/* Resizable Container */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">

        {/* LEFT PANE */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col border-r border-purple-200 bg-white overflow-hidden relative min-w-[20%] max-w-[80%]">
          <div className="flex-1 overflow-y-auto p-8 relative selection:bg-purple-200 selection:text-purple-900">
            <div className="max-w-3xl mx-auto">

              {/* Summary */}
              <div className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-3xl mb-10 border border-purple-200 relative shadow-lg">
                <h3 className="text-purple-600 font-bold flex items-center gap-2 text-xl mb-4">
                  <Sparkles size={20} /> AI要約
                </h3>
                <div className="text-lg text-purple-700 leading-8 font-medium">
                  <ReactMarkdown components={MarkdownComponents}>{document.summary}</ReactMarkdown>
                </div>
              </div>

              {/* Key Points */}
              {document.keyPoints && document.keyPoints.length > 0 && (
                <div className="mb-12">
                  <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-purple-900 border-l-4 border-purple-600 pl-4">
                    <Lightbulb size={28} className="text-yellow-500 fill-yellow-500" /> 重要ポイント
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {document.keyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200 shadow-sm">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-purple-800 leading-relaxed flex-1 pt-1">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters */}
              {document.chapters && document.chapters.length > 0 && (
                <div className="mb-12">
                  <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-purple-900 border-l-4 border-purple-600 pl-4">
                    <BookOpen size={28} className="text-purple-600" /> 章ごとの詳細
                  </h3>
                  <div className="space-y-4">
                    {document.chapters.map((chapter, i) => (
                      <div key={i} onClick={() => setExpandedChapter(expandedChapter === i ? null : i)} className={`bg-white rounded-2xl border transition-all cursor-pointer ${expandedChapter === i ? 'border-purple-600 ring-1 ring-purple-600 shadow-lg' : 'border-purple-200 shadow-md hover:shadow-lg'}`}>
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-purple-900 leading-tight mb-1">{chapter.title}</h4>
                              <p className="text-sm text-purple-500 leading-snug">{chapter.summary}</p>
                            </div>
                            <div className="text-purple-400">
                              {expandedChapter === i ? <ChevronUp /> : <ChevronDown />}
                            </div>
                          </div>
                        </div>
                        {expandedChapter === i && (
                          <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="border-t border-purple-100 pt-4 mt-2">
                              <div className="prose prose-sm prose-purple max-w-none bg-purple-50 p-6 rounded-xl border border-purple-100">
                                <ReactMarkdown components={MarkdownComponents}>{chapter.content}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Content (Collapsible) */}
              <div className="border-t border-purple-200 pt-12 mt-12 pb-12">
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="w-full flex items-center justify-between text-left mb-6"
                >
                  <h3 className="font-bold text-xl text-purple-500 flex items-center gap-2">
                    <FileText size={20} /> 全文テキスト
                  </h3>
                  {showFullContent ? (
                    <ChevronUp className="text-purple-600" size={24} />
                  ) : (
                    <ChevronDown className="text-purple-600" size={24} />
                  )}
                </button>
                {showFullContent && (
                  <div className="text-purple-800 font-normal bg-white p-8 rounded-2xl border border-purple-100 shadow-inner max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {document.content}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* DRAG HANDLE */}
        <div
          onMouseDown={startResizing}
          className="w-4 bg-purple-50 hover:bg-purple-200 cursor-col-resize flex items-center justify-center z-20 hover:shadow-inner transition-colors border-l border-r border-purple-200/50"
        >
          <GripVertical size={16} className="text-purple-300" />
        </div>

        {/* RIGHT PANE */}
        <div className="flex-1 flex flex-col bg-purple-50 min-w-[20%]">
          {/* Top Half: Learning Actions & Brain Integration */}
          <div className="h-1/2 flex flex-col border-b border-purple-200 bg-white relative">
            <div className="flex-none p-4 border-b border-purple-100 flex justify-between items-center bg-purple-50/50">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Target className="text-purple-600" size={18} />
                学習＆統合
              </h3>
              <div className="flex gap-2">
                {learningMode !== 'actions' && (
                  <button onClick={handleGenerateLearningActions} className="text-xs font-bold text-purple-500 flex items-center gap-1 hover:text-purple-900 transition-colors p-1.5 hover:bg-purple-200 rounded">
                    <Lightbulb size={14} /> アクション
                  </button>
                )}
                {learningMode !== 'brain' && (
                  <button onClick={handleGenerateBrainProposal} className="text-xs font-bold text-purple-500 flex items-center gap-1 hover:text-purple-900 transition-colors p-1.5 hover:bg-purple-200 rounded">
                    <Brain size={14} /> Brain
                  </button>
                )}
                {learningMode !== 'none' && (
                  <button onClick={() => setLearningMode('none')} className="text-xs font-bold text-purple-400 hover:text-purple-900 p-1.5">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
              {/* Default View */}
              {learningMode === 'none' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="bg-purple-100 p-4 rounded-full"><Target size={32} className="text-purple-500" /></div>
                  <div>
                    <h4 className="font-bold text-lg text-purple-900">学習を深める</h4>
                    <p className="text-sm text-purple-500 mt-2">
                      AIが具体的な学習アクションと<br />Brain統合の提案を生成します
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button onClick={handleGenerateLearningActions} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md flex items-center justify-center gap-2">
                      <Lightbulb size={16} /> 学習アクション
                    </button>
                    <button onClick={handleGenerateBrainProposal} className="px-6 py-3 bg-white border border-purple-200 text-purple-700 font-bold rounded-xl hover:bg-purple-50 shadow-sm flex items-center justify-center gap-2">
                      <Brain size={16} /> Brain統合案
                    </button>
                  </div>
                </div>
              )}

              {/* Learning Actions View */}
              {learningMode === 'actions' && (
                <div className="h-full flex flex-col">
                  {isGeneratingActions ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <Loader2 className="animate-spin text-purple-600" size={32} />
                      <p className="text-purple-500 animate-pulse">学習アクションを生成中...</p>
                    </div>
                  ) : learningActions ? (
                    <div className="prose prose-sm prose-purple max-w-none">
                      <ReactMarkdown components={MarkdownComponents}>{learningActions}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-purple-500 text-center">生成に失敗しました</p>
                  )}
                </div>
              )}

              {/* Brain Integration View */}
              {learningMode === 'brain' && (
                <div className="h-full flex flex-col">
                  {isGeneratingProposal ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <Loader2 className="animate-spin text-purple-600" size={32} />
                      <p className="text-purple-500 animate-pulse">統合案を生成中...</p>
                    </div>
                  ) : brainProposal ? (
                    <div className="prose prose-sm prose-purple max-w-none">
                      <ReactMarkdown components={MarkdownComponents}>{brainProposal}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-purple-500 text-center">生成に失敗しました</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Half: Quiz Interface */}
          <div className="h-1/2 flex flex-col bg-white">
            <div className="flex-none p-4 border-b border-purple-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Sparkles className="text-purple-600" size={18} />
                理解度クイズ
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-purple-50 relative">
              {/* Idle State */}
              {quizState === 'idle' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="bg-purple-100 p-4 rounded-full"><CheckCircle size={32} className="text-purple-500" /></div>
                  <div>
                    <h4 className="font-bold text-lg text-purple-900">知識を確認</h4>
                    <p className="text-sm text-purple-500 mt-2">クイズでドキュメントの<br />理解度をチェックしましょう</p>
                  </div>
                  <button onClick={handleStartQuiz} className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                    <CheckCircle size={20} /> テストを開始
                  </button>
                </div>
              )}

              {/* Generating State */}
              {quizState === 'generating' && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="animate-spin text-purple-600" size={32} />
                  <p className="text-purple-500 animate-pulse">問題を生成中...</p>
                </div>
              )}

              {/* Active Quiz */}
              {quizState === 'active' && (
                <div className="h-full">{renderCurrentQuestion()}</div>
              )}

              {/* Review State */}
              {quizState === 'review' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle size={40} className="text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl text-purple-900">惜しい！</h4>
                    <p className="text-purple-500 mt-2">{failedQueue.length}問ミス。リトライしましょう。</p>
                  </div>
                  <button onClick={handleRetryIncorrect} className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500 shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                    <RefreshCcw size={20} /> リトライ
                  </button>
                </div>
              )}

              {/* Passed State */}
              {quizState === 'passed' && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                    <Trophy size={40} className="text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl text-purple-900">完璧です！</h4>
                    <p className="text-purple-500 mt-2">全問正解！知識が定着しました。</p>
                  </div>
                  <button onClick={() => setQuizState('idle')} className="px-8 py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                    <RefreshCcw size={20} /> もう一度挑戦
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
