import React, { useState } from 'react';
import { DocumentStoredUpload, QuizQuestion } from '../types';
import { ArrowLeft, FileText, ChevronDown, ChevronUp, BookOpen, Lightbulb, Brain, Sparkles, Target, Loader2, CheckCircle, XCircle, Trophy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '../store';
import { generateQuiz } from '../services/geminiService';

interface DocumentDetailProps {
  document: DocumentStoredUpload;
  onBack: () => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onBack }) => {
  const { brain, updateBrain } = useAppStore();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'learn' | 'quiz'>('overview');

  // Learning Actions State
  const [learningActions, setLearningActions] = useState<string | null>(null);
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);

  // Brain Integration State
  const [brainProposal, setBrainProposal] = useState<string | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleGenerateLearningActions = async () => {
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

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const content = `${document.summary}\n\n${document.keyPoints?.join('\n')}`;
      const questions = await generateQuiz(content);
      setQuizQuestions(questions);
      setCurrentQuizIndex(0);
      setQuizScore(0);
    } catch (e) {
      console.error(e);
      alert('クイズの生成に失敗しました');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === quizQuestions[currentQuizIndex].correctIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowQuizResult(true);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-purple-700"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="text-purple-600" size={20} />
                <span className="text-xs font-bold px-2 py-1 rounded bg-purple-100 text-purple-700 uppercase">
                  PDF
                </span>
              </div>
              <h1 className="text-2xl font-bold text-purple-900 line-clamp-1">{document.name}</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <BookOpen size={16} className="inline mr-2" />
              概要
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'learn'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <Target size={16} className="inline mr-2" />
              学習アクション
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'quiz'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              <Sparkles size={16} className="inline mr-2" />
              クイズ
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Summary */}
        <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-600" />
            概要
          </h2>
          <div className="text-purple-800 leading-relaxed">
            <ReactMarkdown>{document.summary}</ReactMarkdown>
          </div>
        </section>

        {/* Key Points */}
        {document.keyPoints && document.keyPoints.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
            <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-500" />
              重要ポイント
            </h2>
            <ul className="space-y-3">
              {document.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-purple-800 leading-relaxed flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Chapters */}
        {document.chapters && document.chapters.length > 0 && (
          <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
            <h2 className="text-xl font-bold text-purple-900 mb-4">章ごとの詳細</h2>
            <div className="space-y-3">
              {document.chapters.map((chapter, i) => (
                <div key={i} className="border border-purple-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedChapter(expandedChapter === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between bg-purple-50 hover:bg-purple-100 transition-colors text-left"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 mb-1">{chapter.title}</h3>
                      <p className="text-sm text-purple-600">{chapter.summary}</p>
                    </div>
                    {expandedChapter === i ? (
                      <ChevronUp className="text-purple-600 flex-shrink-0" size={20} />
                    ) : (
                      <ChevronDown className="text-purple-600 flex-shrink-0" size={20} />
                    )}
                  </button>
                  {expandedChapter === i && (
                    <div className="p-4 bg-white border-t border-purple-200">
                      <div className="text-purple-800 leading-relaxed prose prose-purple max-w-none">
                        <ReactMarkdown>{chapter.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Full Content (Collapsible) */}
        <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h2 className="text-xl font-bold text-purple-900">全文テキスト</h2>
            {showFullContent ? (
              <ChevronUp className="text-purple-600" size={24} />
            ) : (
              <ChevronDown className="text-purple-600" size={24} />
            )}
          </button>
          {showFullContent && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 max-h-96 overflow-y-auto">
              <pre className="text-sm text-purple-800 whitespace-pre-wrap font-mono leading-relaxed">
                {document.content}
              </pre>
            </div>
          )}
        </section>

        {/* Metadata */}
        <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
          <h2 className="text-xl font-bold text-purple-900 mb-4">ドキュメント情報</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-purple-600 font-bold mb-1">追加日時</dt>
              <dd className="text-purple-800">{new Date(document.addedAt).toLocaleString('ja-JP')}</dd>
            </div>
            <div>
              <dt className="text-purple-600 font-bold mb-1">ファイルサイズ</dt>
              <dd className="text-purple-800">{(document.fileSize / 1024).toFixed(2)} KB</dd>
            </div>
            <div>
              <dt className="text-purple-600 font-bold mb-1">種類</dt>
              <dd className="text-purple-800 uppercase">{document.type}</dd>
            </div>
            <div>
              <dt className="text-purple-600 font-bold mb-1">章数</dt>
              <dd className="text-purple-800">{document.chapters?.length || 0} 章</dd>
            </div>
          </dl>
        </section>
        </>
        )}

        {/* Learning Actions Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            {/* Learning Actions Section */}
            <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  <Target size={20} className="text-purple-600" />
                  学習アクション提案
                </h2>
                <button
                  onClick={handleGenerateLearningActions}
                  disabled={isGeneratingActions}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGeneratingActions ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {learningActions ? '再生成' : 'AIで生成'}
                </button>
              </div>
              {learningActions ? (
                <div className="prose prose-purple max-w-none">
                  <ReactMarkdown>{learningActions}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-purple-600 text-center py-8">
                  AIがこのドキュメントから実践的な学習アクションを生成します
                </p>
              )}
            </section>

            {/* Brain Integration Section */}
            <section className="bg-white rounded-2xl p-6 shadow-md border-2 border-purple-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                  <Brain size={20} className="text-purple-600" />
                  Brain統合提案
                </h2>
                <button
                  onClick={handleGenerateBrainProposal}
                  disabled={isGeneratingProposal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGeneratingProposal ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  統合案を生成
                </button>
              </div>
              {brainProposal ? (
                <div className="prose prose-purple max-w-none">
                  <ReactMarkdown>{brainProposal}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-purple-600 text-center py-8">
                  このドキュメントの内容を、あなたのBrain（知識ベース）にどう統合すべきかAIが提案します
                </p>
              )}
            </section>
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div>
            {quizQuestions.length === 0 ? (
              <section className="bg-white rounded-2xl p-8 shadow-md border-2 border-purple-200 text-center">
                <Sparkles className="mx-auto mb-4 text-purple-600" size={48} />
                <h2 className="text-2xl font-bold text-purple-900 mb-2">理解度テスト</h2>
                <p className="text-purple-600 mb-6">
                  このドキュメントの内容をもとにクイズを生成します
                </p>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors disabled:opacity-50"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      クイズを生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      クイズを生成
                    </>
                  )}
                </button>
              </section>
            ) : !showQuizResult ? (
              <section className="bg-white rounded-2xl p-8 shadow-md border-2 border-purple-200">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-purple-600">
                      問題 {currentQuizIndex + 1} / {quizQuestions.length}
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      スコア: {quizScore} / {currentQuizIndex + (selectedAnswer !== null ? 1 : 0)}
                    </span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2 mb-4">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-purple-900 mb-6">
                  {quizQuestions[currentQuizIndex].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {quizQuestions[currentQuizIndex].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                        selectedAnswer === null
                          ? 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-200'
                          : selectedAnswer === i
                          ? i === quizQuestions[currentQuizIndex].correctIndex
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-red-100 border-2 border-red-500'
                          : i === quizQuestions[currentQuizIndex].correctIndex
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedAnswer !== null && i === quizQuestions[currentQuizIndex].correctIndex && (
                          <CheckCircle size={20} className="text-green-600" />
                        )}
                        {selectedAnswer === i && i !== quizQuestions[currentQuizIndex].correctIndex && (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedAnswer !== null && (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                  >
                    {currentQuizIndex < quizQuestions.length - 1 ? '次の問題へ' : '結果を見る'}
                  </button>
                )}
              </section>
            ) : (
              <section className="bg-white rounded-2xl p-8 shadow-md border-2 border-purple-200 text-center">
                <Trophy className="mx-auto mb-4 text-yellow-500" size={64} />
                <h2 className="text-3xl font-bold text-purple-900 mb-2">お疲れ様でした！</h2>
                <div className="text-5xl font-black text-purple-600 my-6">
                  {quizScore} / {quizQuestions.length}
                </div>
                <p className="text-purple-600 mb-8">
                  正答率: {Math.round((quizScore / quizQuestions.length) * 100)}%
                </p>
                <button
                  onClick={() => {
                    setQuizQuestions([]);
                    setShowQuizResult(false);
                    setCurrentQuizIndex(0);
                    setQuizScore(0);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  もう一度挑戦
                </button>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
