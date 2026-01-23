import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { completeOnboarding, isLoading } = useAppStore();
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState({
    role: '',
    techStack: '',
    goal: ''
  });

  const handleNext = () => setStep(p => p + 1);

  const handleFinish = async () => {
    setIsProcessing(true);
    const initialMarkdown = `# ${answers.role || 'エンジニア'}のブレイン
    
## 重点分野
${answers.goal ? `> 目標: ${answers.goal}` : ''}

## 技術スタック
${answers.techStack.split(',').map(t => `- [ ] ${t.trim()}`).join('\n')}

## 概念
- **基礎**: (ここに入力)
    `;
    await completeOnboarding(initialMarkdown);
    setIsProcessing(false);
  };

  if (isLoading) {
      return (
          <div className="h-screen bg-nexus-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-nexus-500" size={48} />
          </div>
      )
  }

  return (
    <div className="h-screen bg-nexus-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-nexus-200 shadow-xl">
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-nexus-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
             <Sparkles size={32} />
           </div>
        </div>

        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-nexus-900 text-center">Nexusへようこそ</h2>
            <p className="text-nexus-500 text-center leading-relaxed">読みっぱなしで忘れるのはもう終わりです。知識をひとつの成長する「外部脳」に統合し始めましょう。</p>
            <button onClick={handleNext} className="w-full py-4 bg-nexus-900 text-white font-bold rounded-xl hover:bg-nexus-800 transition-all shadow-md">
              ブレインを初期化する
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
            <div>
                <label className="block text-sm font-bold text-nexus-700 mb-2">あなたの主な役割</label>
                <input 
                value={answers.role}
                onChange={e => setAnswers({...answers, role: e.target.value})}
                className="w-full bg-nexus-50 border border-nexus-200 rounded-xl p-4 text-nexus-900 focus:ring-2 focus:ring-nexus-accent outline-none font-medium" 
                placeholder="例: フロントエンドエンジニア" 
                />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-nexus-700 mb-2">現在の技術スタック</label>
                <input 
                value={answers.techStack}
                onChange={e => setAnswers({...answers, techStack: e.target.value})}
                className="w-full bg-nexus-50 border border-nexus-200 rounded-xl p-4 text-nexus-900 focus:ring-2 focus:ring-nexus-accent outline-none font-medium" 
                placeholder="React, TypeScript, AWS..." 
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-nexus-700 mb-2">主な学習目標</label>
                <input 
                value={answers.goal}
                onChange={e => setAnswers({...answers, goal: e.target.value})}
                className="w-full bg-nexus-50 border border-nexus-200 rounded-xl p-4 text-nexus-900 focus:ring-2 focus:ring-nexus-accent outline-none font-medium" 
                placeholder="システム設計をマスターする..." 
                />
            </div>

            <button onClick={handleFinish} disabled={isProcessing} className="w-full mt-6 py-4 bg-nexus-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-nexus-800 shadow-md disabled:opacity-70">
              {isProcessing ? <Loader2 className="animate-spin" /> : <>構造を生成 <ArrowRight size={18} /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};