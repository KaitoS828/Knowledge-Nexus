import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Article, Message, QuizQuestion, FrequentWord } from '../types';
import { useAppStore } from '../store';
import { sendChatMessage, generateMergeProposal, generateQuiz, generateStepByStepGuide, getTeachingResponse } from '../services/geminiService';
import { ArrowLeft, Send, Sparkles, Book, GitMerge, Check, CheckCircle, X, ClipboardList, AlertCircle, Tag, Info, Volume2, StopCircle, Hash, Lightbulb, Code, Rocket, Database, Layers, Target, Zap, ChevronDown, ChevronUp, Loader2, PenTool, RefreshCcw, ArrowRight, Highlighter, GripVertical, Timer, Maximize2, Minimize2, ExternalLink, GraduationCap, User, MessageCircle } from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  toggleSidebar?: () => void; // Optional prop to toggle main sidebar visibility
}

interface SkillPattern {
  icon: string;
  title: string;
  summary: string;
  action: string;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack, toggleSidebar }) => {
  const { brain, updateBrain, updateArticleStatus, updateArticle, logActivity } = useAppStore();
  
  // General State
  const [mode, setMode] = useState<'article' | 'advisor'>('article');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Layout State
  const [leftWidth, setLeftWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer & Focus State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Merge State
  const [showMerge, setShowMerge] = useState(false);
  const [mergeContent, setMergeContent] = useState('');
  const [isGeneratingMerge, setIsGeneratingMerge] = useState(false);

  // Active Learning Modes
  const [learningMode, setLearningMode] = useState<'none' | 'memo' | 'quiz' | 'teaching'>('none');

  // Active Recall Memo
  const [memo, setMemo] = useState('');

  // Quiz State
  const [quizState, setQuizState] = useState<'idle' | 'generating' | 'active' | 'review' | 'passed'>('idle');
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [quizQueue, setQuizQueue] = useState<number[]>([]); // Indices of questions to ask
  const [failedQueue, setFailedQueue] = useState<number[]>([]); // Indices of questions answered wrong in current session
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index within quizQueue, not allQuestions
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Teaching Mode State
  const [teachingHistory, setTeachingHistory] = useState<{ role: 'model' | 'user', content: string }[]>([]);
  const [teachingInput, setTeachingInput] = useState('');
  const [isTeachingLoading, setIsTeachingLoading] = useState(false);

  // Frequent Word Modal
  const [selectedWord, setSelectedWord] = useState<FrequentWord | null>(null);

  // Step by Step Guide State
  const [expandedPattern, setExpandedPattern] = useState<number | null>(null);
  const [stepGuides, setStepGuides] = useState<{[key: number]: string}>({});
  const [loadingGuide, setLoadingGuide] = useState<number | null>(null);

  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const teachingScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (teachingScrollRef.current) {
        teachingScrollRef.current.scrollTop = teachingScrollRef.current.scrollHeight;
    }
  }, [teachingHistory]);

  useEffect(() => {
      return () => { window.speechSynthesis.cancel(); }
  }, []);

  // Timer Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleFocus = () => {
    setIsFocusMode(!isFocusMode);
    if (toggleSidebar) toggleSidebar();
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

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
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    } else {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Check if test was already passed
  useEffect(() => {
      if (article.isTestPassed) {
          setQuizState('passed');
      }
  }, [article.isTestPassed]);

  // Highlighter Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // 'h' key for highlight
        if (e.key === 'h' && !isTyping) {
            handleHighlight();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article, isTyping]);

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString();
    if (text.trim().length > 0) {
        const newContent = article.content.replace(text, `**${text}**`);
        updateArticle(article.id, { content: newContent });
        selection.removeAllRanges();
    }
  };

  // Parse patterns if they are JSON
  const patterns: SkillPattern[] | null = useMemo(() => {
    try {
      if (article.practiceGuide && article.practiceGuide.startsWith('[')) {
        return JSON.parse(article.practiceGuide);
      }
    } catch (e) {
      return null;
    }
    return null;
  }, [article.practiceGuide]);

  const getIconForPattern = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'code': return <Code size={24} className="text-blue-500" />;
      case 'rocket': return <Rocket size={24} className="text-orange-500" />;
      case 'database': return <Database size={24} className="text-green-500" />;
      case 'layers': return <Layers size={24} className="text-purple-500" />;
      case 'target': return <Target size={24} className="text-red-500" />;
      case 'zap': return <Zap size={24} className="text-yellow-500" />;
      default: return <Lightbulb size={24} className="text-yellow-500" />;
    }
  };

  const handleExpandPattern = async (idx: number, pattern: SkillPattern) => {
    if (expandedPattern === idx) {
        setExpandedPattern(null);
        return;
    }
    setExpandedPattern(idx);
    
    // Generate guide if not exists
    if (!stepGuides[idx]) {
        setLoadingGuide(idx);
        const guide = await generateStepByStepGuide(article.content, pattern.title, pattern.action);
        setStepGuides(prev => ({...prev, [idx]: guide}));
        setLoadingGuide(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    const responseText = await sendChatMessage(userMsg.content, mode, article.content, brain.content);

    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: 'model',
      content: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
    
    if (article.status === 'new') {
      updateArticleStatus(article.id, 'reading');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Quiz Logic ---
  const handleStartQuiz = async () => {
    setLearningMode('quiz');
    setQuizState('generating');
    updateArticleStatus(article.id, 'practice');
    const questions = await generateQuiz(article.content);
    
    if (questions.length === 0) {
        alert("問題の生成に失敗しました。もう一度お試しください。");
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
              updateArticle(article.id, { isTestPassed: true });
              logActivity();
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

  // --- Teaching Mode Logic ---
  const handleStartTeaching = async () => {
      setLearningMode('teaching');
      setTeachingHistory([]);
      setIsTeachingLoading(true);
      // Trigger first prompt from AI
      const initialQuestion = await getTeachingResponse(article.content, []);
      setTeachingHistory([{ role: 'model', content: initialQuestion }]);
      setIsTeachingLoading(false);
  };

  const handleSendTeaching = async () => {
      if (!teachingInput.trim()) return;
      
      const userInput = teachingInput;
      setTeachingInput('');
      setTeachingHistory(prev => [...prev, { role: 'user', content: userInput }]);
      setIsTeachingLoading(true);

      const aiResponse = await getTeachingResponse(article.content, teachingHistory, userInput);
      setTeachingHistory(prev => [...prev, { role: 'model', content: aiResponse }]);
      setIsTeachingLoading(false);
  };

  // --- End Active Learning Logic ---

  const handleGenerateMerge = async () => {
    setShowMerge(true);
    setIsGeneratingMerge(true);
    const proposal = await generateMergeProposal(article, brain);
    setMergeContent(proposal);
    setIsGeneratingMerge(false);
  };

  const confirmMerge = () => {
    const newBrainContent = brain.content + "\n\n" + mergeContent;
    updateBrain(newBrainContent);
    updateArticleStatus(article.id, 'mastered');
    setShowMerge(false);
    alert("知識がBrainに正常にマージされました！");
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    } else {
        const textToRead = `${article.title}。${article.summary}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'ja-JP';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }
  };

  const MarkdownComponents = {
    code(props: any) {
        const {children, className, node, ...rest} = props
        return (
        <code {...rest} className={`${className} bg-gray-200 px-1.5 py-0.5 rounded text-pink-600 font-mono text-sm font-bold border border-gray-300`}>
            {children}
        </code>
        )
    },
    pre(props: any) {
        return (
        <div className="relative group">
            <pre {...props} className="bg-[#1e1e1e] text-[#d4d4d4] p-5 rounded-xl overflow-x-auto my-6 text-sm leading-relaxed border border-gray-700 shadow-lg font-mono" />
        </div>
        )
    },
    strong(props: any) {
        return (
            <span className="bg-yellow-200/60 px-0.5 rounded text-nexus-900 font-semibold box-decoration-clone shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                {props.children}
            </span>
        )
    },
    p(props: any) {
        return <p {...props} className="mb-6 leading-loose text-nexus-800 text-[16px]" />
    },
    h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold mt-12 mb-6 text-nexus-900 border-b pb-4" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-2xl font-bold mt-10 mb-5 text-nexus-900" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-xl font-bold mt-8 mb-4 text-nexus-800" {...props} />,
  };

  // Helper to render current question
  const renderCurrentQuestion = () => {
      if (quizQueue.length === 0) return null;
      const globalIndex = quizQueue[currentQuestionIndex];
      const q = allQuestions[globalIndex];

      return (
        <div className="flex flex-col h-full">
            <div className="flex-none mb-4 flex justify-between items-center text-xs font-bold text-nexus-400 uppercase tracking-widest">
                <span>Question {currentQuestionIndex + 1} / {quizQueue.length}</span>
                {failedQueue.length > 0 && <span className="text-red-500">ミス: {failedQueue.length}</span>}
            </div>

            <h3 className="text-lg font-bold text-nexus-900 mb-6 leading-relaxed">
                {q.question}
            </h3>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {q.options.map((opt, i) => {
                    let btnClass = "bg-white text-nexus-600 hover:bg-nexus-50 border-nexus-200";
                    if (feedback) {
                         if (i === q.correctIndex) btnClass = "bg-green-100 text-green-800 border-green-300 ring-2 ring-green-200";
                         else if (i === selectedOption) btnClass = "bg-red-100 text-red-800 border-red-300";
                         else btnClass = "opacity-50 bg-white border-nexus-100";
                    } else if (selectedOption === i) {
                        btnClass = "bg-nexus-900 text-white ring-2 ring-nexus-400";
                    }
                    return (
                        <button key={i} onClick={() => handleQuizAnswer(i)} disabled={feedback !== null} className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 ${btnClass}`}>{opt}</button>
                    );
                })}
            </div>
            {feedback && (
                <div className="flex-none mt-4 pt-4 border-t border-nexus-100 animate-in slide-in-from-bottom-2 fade-in">
                    <div className={`p-4 rounded-xl flex justify-between items-center ${feedback === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <div className="flex items-center gap-2 font-bold">{feedback === 'correct' ? <Check size={20} /> : <X size={20} />}{feedback === 'correct' ? '正解です！' : '不正解...'}</div>
                        <button onClick={handleNextQuestion} className="px-6 py-2 bg-nexus-900 text-white font-bold rounded-lg hover:bg-nexus-700 transition-colors shadow-md flex items-center gap-2">次へ <ArrowRight size={16} /></button>
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="flex flex-col h-screen bg-nexus-50 text-nexus-900 overflow-hidden font-sans">
      {/* Header */}
      <div className="h-14 flex items-center px-6 border-b border-nexus-200 gap-4 bg-white/80 backdrop-blur z-10 justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button onClick={onBack} className="p-2 hover:bg-nexus-100 rounded-lg text-nexus-500 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="font-bold truncate text-lg text-nexus-900">{article.title}</h2>
          </div>
          <div className="flex items-center gap-3">
             {/* Timer */}
             <div className="flex items-center gap-2 bg-nexus-50 px-3 py-1.5 rounded-full border border-nexus-200 text-sm font-mono text-nexus-600">
                <Timer size={14} className={elapsedSeconds > 1800 ? "text-red-500 animate-pulse" : "text-nexus-400"} />
                {formatTime(elapsedSeconds)}
             </div>

             {/* Focus Toggle */}
             {toggleSidebar && (
                 <button 
                    onClick={handleToggleFocus} 
                    className={`p-2 rounded-lg transition-colors ${isFocusMode ? 'bg-nexus-900 text-white' : 'text-nexus-500 hover:bg-nexus-100'}`}
                    title={isFocusMode ? "集中モード解除" : "集中モード (サイドバーを隠す)"}
                 >
                    {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                 </button>
             )}
          </div>
      </div>

      {/* Resizable Container */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT PANE */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col border-r border-nexus-200 bg-white overflow-hidden relative min-w-[20%] max-w-[80%]">
             <div className="flex-1 overflow-y-auto p-8 relative selection:bg-yellow-200 selection:text-nexus-900">
                <div className="max-w-3xl mx-auto">
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {article.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-nexus-50 border border-nexus-200 text-nexus-600 flex items-center gap-1 shadow-sm">
                                    <Hash size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {/* Summary */}
                    <div className="bg-gradient-to-br from-white to-nexus-50 p-8 rounded-3xl mb-10 border border-nexus-200 relative shadow-lg">
                         <div className="flex justify-between items-start mb-4">
                            <h3 className="text-nexus-accent font-bold flex items-center gap-2 text-xl">
                                <Sparkles size={20} /> AI要約
                            </h3>
                            <button onClick={toggleSpeech} className={`p-2 rounded-full transition-all ${isSpeaking ? 'bg-red-100 text-red-500' : 'bg-white text-nexus-500 hover:text-nexus-900 shadow-sm border border-nexus-100'}`}>
                                {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
                            </button>
                         </div>
                         <p className="text-lg text-nexus-700 leading-8 font-medium">
                            {article.summary === "AI解析中..." ? <span className="flex items-center gap-2 text-nexus-400 animate-pulse">解析しています...</span> : article.summary}
                         </p>
                    </div>

                    {/* Keywords */}
                    {article.frequentWords && article.frequentWords.length > 0 && (
                        <div className="mb-12">
                          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-nexus-800"><Tag size={18} /> キーワード </h3>
                          <div className="flex flex-wrap gap-2">
                            {article.frequentWords.map((fw, i) => (
                              <button key={i} onClick={() => setSelectedWord(fw)} className="bg-white hover:bg-nexus-50 border border-nexus-200 hover:border-nexus-accent hover:text-nexus-accent text-nexus-600 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 group shadow-sm">
                                {fw.word} <Info size={14} className="text-nexus-300 group-hover:text-nexus-accent" />
                              </button>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* Skill Patterns */}
                    <div className="mb-12">
                        <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 text-nexus-900 border-l-4 border-nexus-accent pl-4">
                            <Lightbulb size={28} className="text-yellow-500 fill-yellow-500" /> 技術を高める3つの提案
                        </h3>
                        {patterns ? (
                            <div className="grid grid-cols-1 gap-6">
                                {patterns.map((p, idx) => (
                                    <div key={idx} onClick={() => handleExpandPattern(idx, p)} className={`bg-white rounded-2xl border transition-all cursor-pointer ${expandedPattern === idx ? 'border-nexus-accent ring-1 ring-nexus-accent shadow-lg' : 'border-nexus-200 shadow-md hover:shadow-lg'}`}>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-nexus-50 rounded-xl border border-nexus-100">{getIconForPattern(p.icon || '')}</div>
                                                    <div><h4 className="text-lg font-bold text-nexus-900 leading-tight mb-1">{p.title}</h4><p className="text-sm text-nexus-500 leading-snug">{p.summary}</p></div>
                                                </div>
                                                <div className="text-nexus-400">{expandedPattern === idx ? <ChevronUp /> : <ChevronDown />}</div>
                                            </div>
                                            {expandedPattern !== idx && <div className="mt-4 bg-nexus-50 rounded-xl p-3 border border-nexus-100 text-xs text-nexus-500 line-clamp-2"><span className="font-bold mr-2 text-nexus-600">ACTION:</span>{p.action.replace(/`/g, '')}</div>}
                                        </div>
                                        {expandedPattern === idx && (
                                            <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="border-t border-nexus-100 pt-4 mt-2">
                                                    {loadingGuide === idx ? <div className="flex flex-col items-center py-6 text-nexus-400 gap-2"><Loader2 className="animate-spin" /><span className="text-xs">初心者向けガイドを作成中...</span></div> : stepGuides[idx] ? <div className="prose prose-sm prose-slate max-w-none bg-nexus-50 p-6 rounded-xl border border-nexus-100"><ReactMarkdown components={MarkdownComponents}>{stepGuides[idx]}</ReactMarkdown></div> : <div className="text-center py-4 text-red-400">ガイドの読み込みに失敗しました</div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="bg-white p-8 rounded-3xl border border-nexus-200 shadow-sm"><div className="prose prose-slate prose-lg max-w-none"><ReactMarkdown components={MarkdownComponents}>{article.practiceGuide}</ReactMarkdown></div></div>
                        )}
                    </div>

                    {/* Raw Text */}
                    <div className="border-t border-nexus-200 pt-12 mt-12 pb-12">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl text-nexus-500 flex items-center gap-2"><Book size={20} /> 原文テキスト</h3>
                            <button onClick={handleHighlight} className="text-xs font-bold text-nexus-500 flex items-center gap-1 bg-white hover:bg-nexus-50 px-3 py-1.5 rounded-full border border-nexus-200 shadow-sm transition-colors">
                                <Highlighter size={12} /> 選択してハイライト
                            </button>
                         </div>
                         <div className="text-nexus-800 font-normal bg-white p-8 rounded-2xl border border-nexus-100 shadow-inner">
                            <ReactMarkdown components={MarkdownComponents}>{article.content}</ReactMarkdown>
                         </div>
                         
                         {/* Source URL Footer */}
                         <div className="mt-8 flex justify-center">
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-nexus-400 hover:text-nexus-700 hover:underline transition-all">
                                <ExternalLink size={14} /> 元の記事を開く: <span className="max-w-xs truncate">{article.url}</span>
                            </a>
                         </div>
                    </div>
                </div>
             </div>
        </div>

        {/* DRAG HANDLE */}
        <div 
          onMouseDown={startResizing}
          className="w-4 bg-nexus-50 hover:bg-nexus-200 cursor-col-resize flex items-center justify-center z-20 hover:shadow-inner transition-colors border-l border-r border-nexus-200/50"
        >
           <GripVertical size={16} className="text-nexus-300" />
        </div>

        {/* RIGHT PANE */}
        <div className="flex-1 flex flex-col bg-nexus-50 min-w-[20%]">
             {/* Top Half: Active Learning Area */}
            <div className="h-1/2 flex flex-col border-b border-nexus-200 bg-white relative">
                <div className="flex-none p-4 border-b border-nexus-100 flex justify-between items-center bg-nexus-50/50">
                    <h3 className="font-bold text-nexus-900 flex items-center gap-2">
                        <ClipboardList className="text-nexus-accent" size={18} /> 
                        能動的学習
                    </h3>
                    <div className="flex gap-2">
                        {learningMode !== 'memo' && (
                            <button onClick={() => setLearningMode('memo')} className="text-xs font-bold text-nexus-500 flex items-center gap-1 hover:text-nexus-900 transition-colors p-1.5 hover:bg-nexus-200 rounded">
                                <PenTool size={14} /> メモ
                            </button>
                        )}
                         {learningMode !== 'teaching' && (
                            <button onClick={handleStartTeaching} className="text-xs font-bold text-nexus-500 flex items-center gap-1 hover:text-nexus-900 transition-colors p-1.5 hover:bg-nexus-200 rounded">
                                <GraduationCap size={14} /> 教える
                            </button>
                        )}
                        {learningMode !== 'none' && (
                             <button onClick={() => setLearningMode('none')} className="text-xs font-bold text-nexus-400 hover:text-nexus-900 p-1.5">
                                 <X size={14} />
                             </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
                    {/* Default View */}
                    {learningMode === 'none' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="bg-nexus-100 p-4 rounded-full"><ClipboardList size={32} className="text-nexus-500" /></div>
                            <div><h4 className="font-bold text-lg text-nexus-900">知識を定着させる</h4><p className="text-sm text-nexus-500 mt-2">クイズや「教える」モードで、<br/>インプットを自分の言葉に変換しましょう。</p></div>
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                <button onClick={handleStartQuiz} className="px-6 py-3 bg-nexus-900 text-white font-bold rounded-xl hover:bg-nexus-800 shadow-md flex items-center justify-center gap-2"><CheckCircle size={16} /> テストを開始</button>
                                <button onClick={handleStartTeaching} className="px-6 py-3 bg-white border border-nexus-200 text-nexus-700 font-bold rounded-xl hover:bg-nexus-50 shadow-sm flex items-center justify-center gap-2"><GraduationCap size={16} /> AIに教える</button>
                            </div>
                        </div>
                    )}

                    {/* Memo UI */}
                    {learningMode === 'memo' && (
                        <div className="h-full flex flex-col">
                            <label className="block text-xs font-bold text-nexus-500 mb-2 flex items-center gap-2"><PenTool size={12}/> 白紙勉強法 (Recall)</label>
                            <textarea className="flex-1 p-4 text-sm border border-nexus-200 rounded-xl focus:ring-2 focus:ring-nexus-accent focus:outline-none resize-none" placeholder="記事を見ずに、覚えていることを書き出してみましょう..." value={memo} onChange={e => setMemo(e.target.value)} />
                        </div>
                    )}

                    {/* Quiz UI */}
                    {learningMode === 'quiz' && (
                        <>
                            {quizState === 'generating' && <div className="flex flex-col items-center justify-center h-full gap-4"><Loader2 className="animate-spin text-nexus-accent" size={32} /><p className="text-nexus-500 animate-pulse">問題を生成中...</p></div>}
                            {quizState === 'active' && <div className="h-full">{renderCurrentQuestion()}</div>}
                            {quizState === 'review' && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center"><AlertCircle size={40} className="text-orange-500" /></div>
                                    <div><h4 className="font-bold text-2xl text-nexus-900">惜しい！</h4><p className="text-nexus-500 mt-2">{failedQueue.length}問ミス。リトライしましょう。</p></div>
                                    <button onClick={handleRetryIncorrect} className="px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500 shadow-lg transition-transform hover:scale-105 flex items-center gap-2"><RefreshCcw size={20} /> リトライ</button>
                                </div>
                            )}
                            {quizState === 'passed' && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce"><Check size={40} className="text-green-600" /></div>
                                    <div><h4 className="font-bold text-2xl text-nexus-900">合格！</h4><p className="text-nexus-500 mt-2">Brainに統合しましょう。</p></div>
                                    <button onClick={handleGenerateMerge} className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg transition-transform hover:scale-105 flex items-center gap-2"><GitMerge size={20} /> Brainにマージ</button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Teaching Mode UI */}
                    {learningMode === 'teaching' && (
                        <div className="h-full flex flex-col">
                             <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref={teachingScrollRef}>
                                 {teachingHistory.map((h, i) => (
                                     <div key={i} className={`flex gap-3 ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                         {h.role === 'model' && <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200 text-green-700 font-bold text-xs">新人</div>}
                                         <div className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${h.role === 'user' ? 'bg-nexus-900 text-white' : 'bg-white border border-nexus-200 text-nexus-800'}`}>
                                             {h.content}
                                         </div>
                                     </div>
                                 ))}
                                 {isTeachingLoading && <div className="flex gap-2 items-center text-nexus-400 text-xs italic"><Loader2 size={12} className="animate-spin" /> 新人君が考えています...</div>}
                             </div>
                             <div className="relative shrink-0">
                                 <input 
                                    className="w-full bg-white border border-nexus-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
                                    placeholder="初心者にわかりやすく説明..."
                                    value={teachingInput}
                                    onChange={e => setTeachingInput(e.target.value)}
                                    onKeyDown={e => {if(e.key === 'Enter' && !e.shiftKey) handleSendTeaching()}}
                                    disabled={isTeachingLoading}
                                 />
                                 <button onClick={handleSendTeaching} disabled={!teachingInput.trim() || isTeachingLoading} className="absolute right-2 bottom-2 p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors shadow-sm disabled:opacity-50">
                                     <Send size={14} />
                                 </button>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Half: Chat Interface */}
            <div className="h-1/2 flex flex-col bg-white">
                <div className="h-12 flex items-center justify-between px-4 border-b border-nexus-200 bg-white">
                    <div className="flex bg-nexus-50 rounded-lg p-1">
                        <button onClick={() => setMode('article')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${mode === 'article' ? 'bg-white text-nexus-900 shadow-sm' : 'text-nexus-400 hover:text-nexus-900'}`}>記事チャット</button>
                        <button onClick={() => setMode('advisor')} className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${mode === 'advisor' ? 'bg-nexus-900 text-white shadow-sm' : 'text-nexus-400 hover:text-nexus-900'}`}><Sparkles size={10} /> アドバイザー</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-nexus-50" ref={scrollRef}>
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-3 rounded-2xl shadow-sm text-sm leading-6 ${m.role === 'user' ? 'bg-nexus-600 text-white' : 'bg-white border border-nexus-200 text-nexus-800'}`}><ReactMarkdown components={MarkdownComponents}>{m.content}</ReactMarkdown></div>
                        </div>
                    ))}
                    {isTyping && <div className="flex justify-start"><div className="bg-white border border-nexus-200 p-3 rounded-2xl shadow-sm"><div className="flex gap-1"><span className="w-1.5 h-1.5 bg-nexus-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-nexus-400 rounded-full animate-bounce delay-75"></span><span className="w-1.5 h-1.5 bg-nexus-400 rounded-full animate-bounce delay-150"></span></div></div></div>}
                </div>
                <div className="p-3 border-t border-nexus-200 bg-white">
                    <div className="relative">
                        <textarea ref={textareaRef} rows={1} className="w-full bg-nexus-50 border border-nexus-200 rounded-xl pl-4 pr-10 py-3 text-sm text-nexus-900 focus:ring-2 focus:ring-nexus-accent focus:outline-none resize-none max-h-24 shadow-inner" placeholder="質問を入力..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} />
                        <button onClick={handleSend} className="absolute right-2 bottom-2 p-1.5 bg-nexus-900 text-white rounded-lg hover:bg-nexus-700 transition-colors shadow-sm"><Send size={14} /></button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Modals (Word & Merge) - Same as previous */}
      {selectedWord && <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-nexus-900/20 backdrop-blur-sm" onClick={() => setSelectedWord(null)}><div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full relative" onClick={e => e.stopPropagation()}><h4 className="text-xl font-bold">{selectedWord.word}</h4><p className="text-sm mt-2">{selectedWord.definition}</p></div></div>}
      
      {showMerge && (
          <div className="absolute inset-0 bg-nexus-50/95 backdrop-blur-sm z-50 flex flex-col p-8 animate-in fade-in duration-200">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-nexus-900 flex items-center gap-2">
                 <GitMerge className="text-green-600" /> ナレッジマージ
               </h3>
               <button onClick={() => setShowMerge(false)} className="text-nexus-400 hover:text-nexus-900">
                 <X size={24} />
               </button>
             </div>

             {isGeneratingMerge ? (
               <div className="flex-1 flex flex-col items-center justify-center gap-4">
                 <div className="w-12 h-12 border-4 border-nexus-200 border-t-nexus-900 rounded-full animate-spin"></div>
                 <p className="text-nexus-500 animate-pulse">Brainとの差分を計算中...</p>
               </div>
             ) : (
               <div className="flex-1 flex flex-col gap-4">
                  <div className="flex-1 bg-white rounded-xl border border-nexus-200 p-6 font-mono text-sm overflow-y-auto text-nexus-800 shadow-inner">
                     <ReactMarkdown components={MarkdownComponents}>{mergeContent}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setShowMerge(false)} className="px-6 py-3 rounded-xl border border-nexus-300 text-nexus-600 hover:bg-nexus-50 font-bold">キャンセル</button>
                    <button onClick={confirmMerge} className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 flex items-center gap-2 shadow-lg shadow-green-200">
                      <Check size={20} /> マージを確定
                    </button>
                  </div>
               </div>
             )}
          </div>
        )}
    </div>
  );
};