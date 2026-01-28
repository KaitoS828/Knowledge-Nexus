import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  type: 'info' | 'success' | 'error' | 'confirm';
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'キャンセル',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={48} className="text-red-500" />;
      case 'confirm':
        return <AlertCircle size={48} className="text-yellow-500" />;
      default:
        return <Info size={48} className="text-blue-500" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'success':
        return '成功';
      case 'error':
        return 'エラー';
      case 'confirm':
        return '確認';
      default:
        return '通知';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-nexus-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-nexus-100 dark:border-nexus-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <h2 className="text-xl font-bold text-nexus-900 dark:text-nexus-50">{getTitle()}</h2>
            </div>
            {type !== 'confirm' && (
              <button
                onClick={onConfirm}
                className="p-1 hover:bg-nexus-100 dark:hover:bg-nexus-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-nexus-400 dark:text-nexus-500" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-nexus-700 dark:text-nexus-300 whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 bg-nexus-50 dark:bg-nexus-900/50 border-t border-nexus-100 dark:border-nexus-700 flex gap-3 justify-end">
          {type === 'confirm' && onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-bold text-nexus-600 dark:text-nexus-400 hover:bg-nexus-100 dark:hover:bg-nexus-700 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg ${
              type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'confirm'
                ? 'bg-nexus-900 hover:bg-black text-white'
                : 'bg-nexus-900 hover:bg-black text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
