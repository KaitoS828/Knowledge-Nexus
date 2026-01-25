import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, AlertCircle, Check, Github, User, X } from 'lucide-react';
import { useAppStore } from '../store';

interface AuthOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowEmailAuth: () => void;
}

export const AuthOptionsModal: React.FC<AuthOptionsModalProps> = ({ isOpen, onClose, onShowEmailAuth }) => {
  const { signInWithGoogle, signInWithGitHub, signInAsGuest } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-nexus-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 relative">
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-nexus-400 hover:text-nexus-900 hover:bg-nexus-50 rounded-full transition-all"
        >
            <X size={20} />
        </button>

        <div className="p-10">
            <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-nexus-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-nexus-900/20">
                    <span className="text-3xl font-black text-white">N</span>
                </div>
                <h2 className="text-3xl font-black text-nexus-900 tracking-tight mb-2">Knowledge Nexus</h2>
                <p className="text-nexus-500 font-medium leading-relaxed">
                    ログイン方法を選択して、<br/>
                    あなたの「第2の脳」を今すぐ始めましょう。
                </p>
            </div>

            <div className="space-y-4">
                {/* Google */}
                <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-nexus-100 hover:border-nexus-900 hover:shadow-lg transition-all rounded-2xl font-bold text-nexus-700 group"
                >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Googleで続ける
                </button>

                {/* GitHub */}
                <button
                    onClick={signInWithGitHub}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 border-2 border-gray-900 hover:bg-gray-800 hover:shadow-lg transition-all rounded-2xl font-bold text-white group"
                >
                    <Github size={20} className="group-hover:scale-110 transition-transform" />
                    GitHubで続ける
                </button>

                {/* Email OTP */}
                <button
                    onClick={() => {
                        onClose();
                        onShowEmailAuth();
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 hover:shadow-lg transition-all rounded-2xl font-bold text-white group"
                >
                    <Mail size={20} className="group-hover:scale-110 transition-transform" />
                    メールアドレスで続ける
                </button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-nexus-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-nexus-300 font-bold tracking-widest">または</span></div>
                </div>

                {/* Guest */}
                <button
                    onClick={signInAsGuest}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-nexus-50 border-2 border-transparent hover:bg-nexus-100 transition-all rounded-2xl font-bold text-nexus-600 group"
                >
                    <User size={20} className="group-hover:scale-110 transition-transform" />
                    ゲストとして試す
                </button>
            </div>

            <p className="mt-8 text-[11px] text-center text-nexus-400 font-medium leading-relaxed uppercase tracking-wider">
                ログインすることで、弊社の<br/>
                利用規約およびプライバシーポリシーに同意したものとみなされます。
            </p>
        </div>
      </div>
    </div>
  );
};
