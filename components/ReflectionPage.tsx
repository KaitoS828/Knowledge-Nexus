import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { sendChatMessage, getLearningRecommendations } from '@/services/geminiService';
import { Send, Loader2, Sparkles, User, Database, Lightbulb, ArrowRight, BookOpen, X, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

export const ReflectionPage: React.FC = () => {
    const { brain, preferences, user, articles } = useAppStore();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'intro',
            role: 'model',
            content: `こんにちは！\nあなたの「ナレッジ・パートナー」です。\n\nこれまで蓄積した知識（Brain）について、何か振り返りたいことや質問はありますか？\n「最近何を学んだ？」や「Reactについて教えて」など、何でも聞いてください。`,
            timestamp: Date.now()
        }
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendations, setRecommendations] = useState<string | null>(null);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, recommendations, showRecommendations]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isSending) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsSending(true);

        try {
            const hasBrain = brain && brain.content;
            const brainContent = hasBrain ? brain.content : "まだ知識データがありません。";

            const responseText = await sendChatMessage(
                userMsg.content,
                'brain',
                '', // No specific article
                brainContent,
                preferences
            );

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: responseText,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: "すみません、エラーが発生しました。もう一度試してみてください。",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsSending(false);
        }
    };

    const handleGetRecommendations = async () => {
        if (recommendations) {
            setShowRecommendations(true);
            return;
        }

        setIsLoadingRecs(true);
        setShowRecommendations(true); // Open the pane immediately to show loader
        try {
            const hasBrain = brain && brain.content;
            const brainContent = hasBrain ? brain.content : "";
            const recs = await getLearningRecommendations(brainContent, articles);
            setRecommendations(recs);
        } catch (error) {
            setRecommendations("レコメンデーションの生成に失敗しました。");
        } finally {
            setIsLoadingRecs(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-nexus-50 relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-100/40 to-transparent transform -skew-x-12 pointer-events-none z-0"></div>
             <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/40 to-transparent transform -skew-x-12 pointer-events-none z-0"></div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
                {/* Header */}
                <div className="flex-none p-4 border-b border-nexus-200 bg-white/80 backdrop-blur-md flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-nexus-900 tracking-tight leading-none">Reflection</h1>
                            <p className="text-[10px] text-nexus-500 font-bold">過去の記録との対話</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showRecommendations ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-nexus-200 text-nexus-600 hover:bg-nexus-50'}`}
                    >
                        <Lightbulb size={14} />
                        <span className="hidden sm:inline">次に学ぶべきこと</span>
                    </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                    {/* Max width restricted to lg (approx 512px) for "slim" feel */}
                    <div className="max-w-lg mx-auto space-y-6">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[90%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white ${
                                        msg.role === 'user' 
                                        ? 'bg-nexus-900 text-white' 
                                        : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                        {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`${
                                        msg.role === 'user' 
                                        ? 'bg-nexus-900 text-white rounded-2xl rounded-tr-none' 
                                        : 'bg-white/80 text-nexus-900 rounded-2xl rounded-tl-none border border-indigo-50/50'
                                    } p-3 shadow-sm`}>
                                        {msg.role === 'model' ? (
                                            <div className="prose prose-sm max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({children}) => <h4 className="font-black text-nexus-900 mb-2 mt-2 text-sm">{children}</h4>,
                                                        h2: ({children}) => <h5 className="font-bold text-nexus-900 mb-1 mt-2 text-xs">{children}</h5>,
                                                        ul: ({children}) => <ul className="list-disc pl-4 space-y-0.5 mb-2 text-xs">{children}</ul>,
                                                        li: ({children}) => <li className="text-nexus-700">{children}</li>,
                                                        p: ({children}) => <p className="mb-2 last:mb-0 text-xs leading-relaxed">{children}</p>,
                                                        strong: ({children}) => <span className="font-bold text-indigo-700 bg-indigo-50/50 px-0.5 rounded">{children}</span>,
                                                        code: ({children}) => <code className="bg-nexus-100 px-1 py-0.5 rounded text-nexus-700 font-mono text-xs">{children}</code>,
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-xs font-medium whitespace-pre-wrap">{msg.content}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isSending && (
                             <div className="flex w-full justify-start">
                                 <div className="flex max-w-[80%] gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600 shadow-sm border-2 border-white">
                                        <Loader2 size={14} className="animate-spin" />
                                    </div>
                                    <div className="bg-white/50 p-3 rounded-2xl rounded-tl-none border border-indigo-50/50 flex items-center gap-1.5">
                                         <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                         <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                         <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                    </div>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-none p-4 bg-white border-t border-nexus-200 z-20">
                    <form onSubmit={handleSend} className="max-w-lg mx-auto relative flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="質問を入力..."
                                disabled={isSending}
                                className="w-full pl-4 pr-10 py-3 bg-nexus-50 border border-nexus-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner font-medium text-sm disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-nexus-900 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-nexus-900 transition-all shadow-sm hover:scale-105 active:scale-95"
                            >
                                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Recommendations Side Panel (Slide-in) */}
            <div 
                className={`
                    fixed inset-y-0 right-0 z-40 w-80 bg-white border-l border-nexus-200 shadow-2xl transform transition-transform duration-300 ease-in-out
                    ${showRecommendations ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-nexus-200 flex justify-between items-center bg-indigo-50/50">
                        <h3 className="font-bold text-nexus-900 flex items-center gap-2">
                            <Lightbulb size={18} className="text-indigo-600" />
                            次に学ぶべきこと
                        </h3>
                        <button onClick={() => setShowRecommendations(false)} className="p-1 text-nexus-400 hover:text-nexus-900 rounded-full hover:bg-white transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {!recommendations && !isLoadingRecs && (
                            <div className="text-center py-8">
                                <BookOpen size={48} className="mx-auto text-nexus-200 mb-4" />
                                <p className="text-sm text-nexus-500 mb-4">あなたのBrain知識と最近の記事履歴を分析して、次に学ぶべきトピックを提案します。</p>
                                <button 
                                    onClick={handleGetRecommendations}
                                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md"
                                >
                                    提案を生成する
                                </button>
                            </div>
                        )}

                        {isLoadingRecs && (
                            <div className="text-center py-12 flex flex-col items-center">
                                <Loader2 size={32} className="animate-spin text-indigo-600 mb-3" />
                                <p className="text-xs font-bold text-nexus-500 animate-pulse">あなたの知識を分析中...</p>
                            </div>
                        )}

                        {recommendations && (
                             <div className="markdown-body text-sm leading-relaxed space-y-4">
                                <ReactMarkdown
                                    components={{
                                         h1: ({children}) => <h4 className="font-black text-nexus-900 mb-2 mt-4 text-base border-b border-indigo-100 pb-1">{children}</h4>,
                                         h2: ({children}) => <h5 className="font-bold text-nexus-900 mb-2 mt-3 text-sm">{children}</h5>,
                                         h3: ({children}) => <h6 className="font-bold text-nexus-800 mb-1 mt-2 text-sm">{children}</h6>,
                                         ul: ({children}) => <ul className="list-disc pl-4 space-y-1 mb-3">{children}</ul>,
                                         li: ({children}) => <li className="text-nexus-600">{children}</li>,
                                         strong: ({children}) => <span className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded">{children}</span>,
                                    }}
                                >
                                    {recommendations}
                                </ReactMarkdown>
                                
                                <button 
                                    onClick={handleGetRecommendations}
                                    className="w-full mt-6 py-2 border border-nexus-200 text-nexus-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                                >
                                    <RefreshCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                                    再生成する
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Overlay for mobile when recommendations open */}
            {showRecommendations && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setShowRecommendations(false)}
                />
            )}
        </div>
    );
};
