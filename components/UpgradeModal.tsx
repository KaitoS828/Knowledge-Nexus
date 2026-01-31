'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, ArrowRight, Zap, CheckCircle, Database } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, message }) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-nexus-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-300 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-nexus-900 to-nexus-800"></div>
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="relative pt-12 px-8 pb-8">
          {/* Icon */}
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-amber-50 rounded-3xl opacity-50"></div>
            <Sparkles size={40} className="text-yellow-500 relative z-10" />
            <div className="absolute -bottom-2 -right-2 bg-nexus-900 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <Zap size={16} fill="currentColor" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-nexus-900 mb-3 tracking-tight">プランの上限に達しました</h2>
            <p className="text-nexus-500 font-medium">
              {message || "Freeプランの保存容量がいっぱいです。\nProプランで制限を解除して、学びを加速させましょう。"}
            </p>
          </div>

          {/* Features Comparison */}
          <div className="bg-nexus-50 rounded-2xl p-6 mb-8 border border-nexus-100">
            <h3 className="text-xs font-bold text-nexus-400 uppercase tracking-widest mb-4 text-center">Pro Plan Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="p-1 bg-green-100 text-green-600 rounded-full">
                  <CheckCircle size={14} />
                </div>
                <span className="text-sm font-bold text-nexus-700">保存容量が無制限</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-green-100 text-green-600 rounded-full">
                  <CheckCircle size={14} />
                </div>
                <span className="text-sm font-bold text-nexus-700">AI解析の高度な機能</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-1 bg-green-100 text-green-600 rounded-full">
                  <CheckCircle size={14} />
                </div>
                <span className="text-sm font-bold text-nexus-700">優先サポート</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onClose();
              router.push('/pricing');
            }}
            className="w-full bg-gradient-to-r from-nexus-900 to-black text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles size={20} className="text-yellow-400" />
            Proにアップグレード
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button 
            onClick={onClose}
            className="w-full mt-4 text-sm font-bold text-nexus-400 hover:text-nexus-600 transition-colors"
          >
            今はまだしない
          </button>
        </div>
      </div>
    </div>
  );
};
