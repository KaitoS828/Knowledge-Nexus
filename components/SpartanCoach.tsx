import React, { useState, useEffect, useRef } from 'react';
import { Flame, X, Edit2, Check, Brain } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

const SPARTAN_QUOTES = [
  "おい、手が止まってるぞ！",
  "技術は待ってくれない。お前はどうだ？",
  "今すぐ知識を貯めろ！",
  "休憩？ バグは24時間稼働中だぞ。",
  "そのコード、来月も読める自信あるか？",
  "ドキュメント読んでるか？ 雰囲気で書くなよ。",
  "10年前の技術で満足するな。",
  "コンパイルエラーはお前の成長の種だ。",
  "AIに仕事奪われる前に、AIを使いこなせ。",
  "今日も「完全に理解した」つもりか？",
  "Netflix見てる暇あったらコミットしろ。",
  "お前の限界はそこじゃないはずだ。",
  "デプロイするまでが開発だ。",
  "エラーログは恋人からの手紙だと思って読め。",
];

const STORAGE_KEY = 'nexus_coach_name';

export const SpartanCoach: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState(SPARTAN_QUOTES[0]);
  const [isAnimate, setIsAnimate] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const { articles } = useAppStore();
  
  // Name Customization
  const [coachName, setCoachName] = useState(() => localStorage.getItem(STORAGE_KEY) || "鬼コーチ");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, coachName);
  }, [coachName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingName]);

  // Smart & Spartan Logic
  const triggerCoach = () => {
    const isSmartMode = Math.random() > 0.7 && articles.length > 0; // 30% chance to be smart

    if (isSmartMode) {
        // Pick a random article
        const article = articles[Math.floor(Math.random() * articles.length)];
        const daysAgo = Math.floor((new Date().getTime() - new Date(article.addedAt).getTime()) / (1000 * 3600 * 24));
        
        let smartMsg = "";
        if (daysAgo === 0) {
            smartMsg = `今日保存した「${article.title.substring(0, 10)}...」、もう読み終わったか？`;
        } else if (daysAgo > 7) {
            smartMsg = `おい、${daysAgo}日前の「${article.title.substring(0, 10)}...」、内容は説明できるんだろうな？`;
        } else {
            smartMsg = `「${article.title.substring(0, 10)}...」の実践は進んでるか？`;
        }
        setMessage(smartMsg);
    } else {
        // Classic Spartan
        const randomQuote = SPARTAN_QUOTES[Math.floor(Math.random() * SPARTAN_QUOTES.length)];
        setMessage(randomQuote);
    }

    setIsAnimate(true);
    setShowBubble(true);
    setTimeout(() => setIsAnimate(false), 1000);
  };

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
        triggerCoach();
    }, 20000 + Math.random() * 15000); // 20-35s interval

    return () => clearInterval(interval);
  }, [articles]); // Re-bind if articles change

  const handleSaveName = () => {
    if (tempName.trim()) {
      setCoachName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempName(coachName);
    setIsEditingName(true);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 flex items-end flex-col gap-2 pointer-events-none">
      
      {/* Speech Bubble */}
      {showBubble && (
        <div 
            className={`
                bg-nexus-900 text-white p-4 rounded-2xl rounded-tr-none shadow-2xl max-w-[250px]
                animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto
                relative border-4 border-red-500
                ${isAnimate ? 'animate-bounce' : ''}
            `}
        >
            <button 
                onClick={() => setShowBubble(false)}
                className="absolute -top-2 -left-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
            >
                <X size={12} className="text-white" />
            </button>
            
            <p className="font-bold text-sm leading-relaxed mb-1">
                {message}
            </p>
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-nexus-900 transform rotate-45 border-r border-b border-red-500 dark:border-red-500" />
        </div>
      )}

      {/* Avatar Button & Name */}
      <div className="flex flex-col items-center gap-1">
        <button
            onClick={triggerCoach}
            className={`
                w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full 
                flex items-center justify-center shadow-lg border-4 border-white dark:border-nexus-800
                hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto
                ${isAnimate ? 'animate-pulse ring-4 ring-red-400 ring-opacity-50' : ''}
            `}
        >
            {message.includes('？') ? <Brain size={32} className="text-white animate-pulse" /> : <Flame size={32} className="text-white animate-pulse" />}
        </button>
        
        {/* Name Label */}
        <div className="pointer-events-auto">
            {isEditingName ? (
                <div className="flex items-center gap-1 bg-white dark:bg-black rounded shadow p-1">
                    <input
                        ref={inputRef}
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                        onBlur={handleSaveName}
                        className="w-20 text-xs font-bold text-nexus-900 outline-none bg-transparent"
                    />
                    <button onClick={handleSaveName} className="text-green-600">
                        <Check size={12} />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={startEditing}
                    className="flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full text-white text-[10px] font-bold cursor-pointer hover:bg-black/70 transition-colors"
                >
                    {coachName}
                    <Edit2 size={8} className="opacity-50" />
                </div>
            )}
        </div>
      </div>

      {/* Close entire widget */}
      <button 
        onClick={() => setIsVisible(false)}
        className="pointer-events-auto text-xs text-nexus-400 hover:text-red-500 underline mt-1 bg-white/80 dark:bg-black/50 px-2 py-1 rounded"
      >
        解雇する
      </button>
    </div>
  );
};
