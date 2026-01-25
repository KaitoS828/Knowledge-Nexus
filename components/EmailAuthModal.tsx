import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';

interface EmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (email: string) => Promise<void>;
  onVerify: (email: string, otp: string) => Promise<void>;
  onResend: (email: string) => Promise<void>;
}

export const EmailAuthModal: React.FC<EmailAuthModalProps> = ({ isOpen, onClose, onSignUp, onVerify, onResend }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSignUp(email);
      setSuccessMessage('確認コードを送信しました。メールをご確認ください。');
      setTimeout(() => {
        setStep('otp');
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'サインアップに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onVerify(email, otp);
      setSuccessMessage('メール確認完了！ログインしています...');
      setTimeout(() => {
        onClose();
        setStep('email');
        setEmail('');
        setOtp('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'OTP検証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onResend(email);
      setSuccessMessage('確認コードを再送信しました。');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(err.message || '再送信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-nexus-900 rounded-xl flex items-center justify-center">
            <Mail className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-nexus-900">メールで始める</h2>
            <p className="text-sm text-nexus-500">確認コードで安全にサインイン</p>
          </div>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-nexus-900 mb-2">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-nexus-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexus-900 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                <Check size={16} />
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!email || isLoading}
              className="w-full bg-nexus-900 text-white font-bold py-3 rounded-xl hover:bg-nexus-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
              確認コードを送信
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <p className="text-sm text-nexus-600 mb-4">
                <strong>{email}</strong> に送信された確認コードを入力してください
              </p>
              <label className="block text-sm font-bold text-nexus-900 mb-2">確認コード (6桁)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-nexus-200 rounded-xl text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-nexus-900 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                <Check size={16} />
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={otp.length !== 6 || isLoading}
              className="w-full bg-nexus-900 text-white font-bold py-3 rounded-xl hover:bg-nexus-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              コードを確認
            </button>

            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-nexus-600 hover:text-nexus-900 underline disabled:opacity-50"
              >
                コードを再送信
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError(null);
                  setSuccessMessage(null);
                }}
                disabled={isLoading}
                className="text-nexus-600 hover:text-nexus-900 underline disabled:opacity-50"
              >
                メールアドレスを変更
              </button>
            </div>
          </form>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 text-nexus-600 hover:text-nexus-900 font-bold py-2 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};
